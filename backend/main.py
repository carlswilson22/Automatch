import os
import logging
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
import tasks
from database import engine, get_db, SessionLocal
from routers import auth, cars, detran, ai_vision, uploads, alerts, integrations, laudos_export
import security

logger = logging.getLogger("automatch")

# Diretório de uploads de laudos e vídeos
def _resolve_uploads_dir() -> Path:
    env_dir = os.getenv("UPLOADS_DIR")
    if env_dir:
        p = Path(env_dir)
    else:
        docker_path = Path("/app/uploads/laudos")
        if docker_path.parent.exists() and os.name != "nt":
            p = docker_path
        else:
            p = Path(__file__).resolve().parent / "uploads" / "laudos"
    p.mkdir(parents=True, exist_ok=True)
    return p

UPLOADS_DIR = _resolve_uploads_dir()


async def _prewarm_yolo():
    """Carrega o modelo YOLOv8 em background thread no startup para eliminar cold-start."""
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _load_yolo_sync)
        logger.info("YOLOv8 pré-carregado com sucesso no startup.")
    except Exception as e:
        logger.warning("Pre-warm do YOLOv8 falhou (modo sem GPU): %s", e)


def _load_yolo_sync():
    from services.ai_service import get_yolo_model
    get_yolo_model()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager (substitui @on_event deprecated do FastAPI ≥ 0.93).
    Inicializa banco, seed de admin, scheduler e pre-warm do modelo YOLO.
    """
    # ── Startup ────────────────────────────────────────────────────────────────
    models.Base.metadata.create_all(bind=engine)

    # Auto-migração idempotente de colunas adicionadas recentemente
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS video_url VARCHAR;"))
            conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS laudo_url VARCHAR;"))
            conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS laudo_feedback TEXT;"))
            conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS original_price FLOAT;"))
            conn.execute(text("ALTER TABLE cars ADD COLUMN IF NOT EXISTS price_history TEXT;"))
            conn.commit()
    except Exception as e:
        logger.warning("Auto-migração de colunas: %s", e)

    # Auto-seed admin user se não existir
    db = SessionLocal()
    try:
        admin_user = db.query(models.User).filter(models.User.email == "admin@automatch.com").first()
        if not admin_user:
            admin_user = models.User(
                id="user-1",
                name="Admin",
                email="admin@automatch.com",
                hashed_password=security.hash_password("admin123"),
                member_since="Abril 2024",
                photo="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
            )
            db.add(admin_user)
            db.commit()
            logger.info("Admin padrão cadastrado com sucesso.")
    except Exception as e:
        logger.warning("Aviso na verificação de admin: %s", e)
        db.rollback()
    finally:
        db.close()

    # Inicializa tarefas agendadas
    tasks.start_scheduler()

    # Pre-warm do YOLO em background (não bloqueia o startup)
    asyncio.create_task(_prewarm_yolo())

    yield  # Aplicação rodando

    # ── Shutdown ───────────────────────────────────────────────────────────────
    tasks.shutdown_scheduler()


app = FastAPI(
    title="Automatch API",
    description="API de Gestão Automotiva, Laudos Cautelares, Integração FIPE e Consulta DETRAN",
    version="2.2.0",
    lifespan=lifespan,
)

# ── CORS seguro: origens explícitas via variável de ambiente ───────────────────
import os

_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://frontend:5173"
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

# ── Registra as rotas ─────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(cars.router)
app.include_router(detran.router)
app.include_router(ai_vision.router)
app.include_router(uploads.router)
app.include_router(alerts.router)
app.include_router(integrations.router)
app.include_router(laudos_export.router)
