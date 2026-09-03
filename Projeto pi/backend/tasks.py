import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from database import SessionLocal
import models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("automatch.tasks")

scheduler = BackgroundScheduler()

# Registry mock do DETRAN para simulação de status
DETRAN_MOCK_REGISTRY = {
    "ABC1234": {"situacao": "REGULAR", "debitos_novos": False},
    "XYZ9876": {"situacao": "REGULAR", "debitos_novos": False},
    "ECO9999": {"situacao": "REGULAR", "debitos_novos": False},
}

def consultar_detran_mock(placa: str) -> dict:
    clean_plate = placa.strip().upper().replace("-", "").replace(" ", "")
    if clean_plate in DETRAN_MOCK_REGISTRY:
        return DETRAN_MOCK_REGISTRY[clean_plate]
    return {"situacao": "REGULAR", "debitos_novos": False}

def verificar_watchlist_detran():
    """
    Job periódico do APScheduler:
    Verifica no DETRAN (mockado) todos os veículos da laudo_watchlist e atualiza o status.
    """
    logger.info("🔍 [APScheduler] Iniciando verificação periódica da Watchlist DETRAN...")
    db = SessionLocal()
    try:
        watchlist_items = db.query(models.LaudoWatchlist).all()
        if not watchlist_items:
            logger.info("ℹ️ [APScheduler] Nenhum veículo cadastrado na watchlist.")
            return

        for item in watchlist_items:
            detran_data = consultar_detran_mock(item.placa)
            item.ultima_verificacao = datetime.utcnow()
            
            if detran_data.get("debitos_novos"):
                item.status = "ALERTA"
                logger.warning(f"⚠️ [APScheduler] Alerta emitido para a placa {item.placa}!")
            else:
                item.status = "ATUALIZADO"
                logger.info(f"✅ [APScheduler] Placa {item.placa} verificada no DETRAN: {detran_data.get('situacao')}")

        db.commit()
        logger.info("🎉 [APScheduler] Verificação da Watchlist concluída com sucesso.")
    except Exception as e:
        db.rollback()
        logger.error(f"❌ [APScheduler] Erro ao verificar Watchlist: {e}")
    finally:
        db.close()

def start_scheduler():
    """Inicializa e inicia o agendador de tarefas."""
    if not scheduler.running:
        # Agenda a tarefa para rodar a cada 60 segundos
        scheduler.add_job(
            verificar_watchlist_detran,
            'interval',
            seconds=60,
            id='watchlist_detran_job',
            replace_existing=True
        )
        scheduler.start()
        logger.info("🚀 [APScheduler] Agendador de tarefas iniciado com sucesso (intervalo: 60s).")

def shutdown_scheduler():
    """Encerra o agendador de tarefas."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("🛑 [APScheduler] Agendador de tarefas encerrado.")
