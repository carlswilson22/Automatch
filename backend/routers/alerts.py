"""
alerts.py — Router de alertas de preço e watchlist do Automatch.

Objetivo e Motivo da Criação:
  - Criado para permitir que compradores configurem alertas inteligentes de preço em veículos de interesse,
    sendo notificados automaticamente quando o valor de venda atingir ou ficar abaixo do preço-alvo desejado.
  - Aumenta a conversão de vendas e o engajamento de compradores cadastrados na plataforma.

Responsabilidades:
  - CRUD de alertas de variação de preço por veículo (PriceAlert).
  - Monitoramento de quedas de preço e notificação ao usuário.
  - Gerenciamento da watchlist de veículos favoritos para acompanhamento.
"""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Session
from database import get_db

import models
from routers.auth import get_current_user_from_header

router = APIRouter(prefix="/api/alerts", tags=["Radar de Oportunidades & Alertas"])

class AlertCreateRequest(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)
    car_id: Optional[str] = None
    car_name: Optional[str] = "Veículo"
    current_price: float = Field(default=0.0, ge=0)
    target_price: Optional[float] = Field(default=None, gt=0)
    contact_type: str = "whatsapp"  # "whatsapp" | "email"
    contact_value: str = Field(min_length=1, max_length=320)
    notify_below_fipe: Optional[bool] = True


@router.get("")
async def listar_alertas(
    current_user: models.User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Lista os alertas de preço. Usuários comuns visualizam apenas seus próprios alertas; administradores visualizam todos."""
    is_admin = current_user.role == "admin"
    query = db.query(models.PriceAlert)
    if not is_admin:
        query = query.filter(models.PriceAlert.user_id == current_user.id)
    user_alerts = [_serialize_alert(alert) for alert in query.order_by(models.PriceAlert.created_at.desc()).all()]

    return {
        "status": "success",
        "total_alertas": len(user_alerts),
        "alertas": user_alerts
    }


@router.post("")
async def criar_alerta(
    payload: AlertCreateRequest,
    current_user: models.User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Cadastra um novo Alerta de Queda de Preço ou Radar de Oportunidades.
    Registra interesse; não dispara mensagens externas.
    """
    alerta_id = f"alt-{uuid.uuid4().hex[:8]}"
    target = payload.target_price or round(payload.current_price * 0.95, 2)
    sanitized_contact_type = payload.contact_type.lower().strip()
    if sanitized_contact_type not in ["whatsapp", "email"]:
        sanitized_contact_type = "email"

    novo_alerta = {
        "id": alerta_id,
        "user_id": current_user.id,
        "car_id": payload.car_id,
        "car_name": payload.car_name,
        "current_price": payload.current_price,
        "target_price": target,
        "contact_type": sanitized_contact_type,
        "contact_value": payload.contact_value,
        "notify_below_fipe": payload.notify_below_fipe,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "status": "ativo"
    }
    db.add(models.PriceAlert(**novo_alerta))
    db.commit()


    return {
        "status": "success",
        "alerta_id": alerta_id,
        "envio_externo": False,
        "mensagem": "Interesse registrado. A demonstração permite visualizar uma amostra do aviso no site.",
        "alerta": novo_alerta
    }


def _serialize_alert(alert):
    result = {column.name: getattr(alert, column.name) for column in models.PriceAlert.__table__.columns}
    for field in ("current_price", "target_price"):
        result[field] = float(result[field])
    return result
