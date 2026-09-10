import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/alerts", tags=["Radar de Oportunidades & Alertas"])

# Armazenamento em memória para alertas ativos
ALERTS_DB: List[Dict[str, Any]] = [
    {
        "id": "alt-1",
        "car_id": "1",
        "car_name": "Volkswagen Golf GTI 2.0 TSI",
        "current_price": 142000.0,
        "target_price": 138000.0,
        "contact_type": "whatsapp",
        "contact_value": "(11) 98765-4321",
        "notify_below_fipe": True,
        "created_at": "2024-04-10T14:30:00Z",
        "status": "ativo"
    }
]


class AlertCreateRequest(BaseModel):
    car_id: Optional[str] = None
    car_name: Optional[str] = "Veículo"
    current_price: float
    target_price: Optional[float] = None
    contact_type: str = "whatsapp"  # "whatsapp" | "email" | "webpush"
    contact_value: str
    notify_below_fipe: Optional[bool] = True


@router.get("")
async def listar_alertas() -> Dict[str, Any]:
    """Lista todos os alertas de preço e oportunidades ativos."""
    return {
        "status": "success",
        "total_alertas": len(ALERTS_DB),
        "alertas": ALERTS_DB
    }


@router.post("")
async def criar_alerta(payload: AlertCreateRequest) -> Dict[str, Any]:
    """
    Cadastra um novo Alerta de Queda de Preço ou Radar de Oportunidades.
    Dispara notificações quando o preço cair ou entrar oferta similar abaixo da FIPE.
    """
    alerta_id = f"alt-{uuid.uuid4().hex[:8]}"
    target = payload.target_price or round(payload.current_price * 0.95, 2)

    novo_alerta = {
        "id": alerta_id,
        "car_id": payload.car_id,
        "car_name": payload.car_name,
        "current_price": payload.current_price,
        "target_price": target,
        "contact_type": payload.contact_type,
        "contact_value": payload.contact_value,
        "notify_below_fipe": payload.notify_below_fipe,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "status": "ativo"
    }
    ALERTS_DB.insert(0, novo_alerta)

    canal_formatado = "WhatsApp" if payload.contact_type == "whatsapp" else ("E-mail" if payload.contact_type == "email" else "WebPush")
    return {
        "status": "success",
        "alerta_id": alerta_id,
        "mensagem": f"Radar ativado com sucesso! Você será avisado via {canal_formatado} ({payload.contact_value}) assim que o preço atingir R$ {target:,.2f}.",
        "alerta": novo_alerta
    }
