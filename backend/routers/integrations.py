"""Amostra multicanal e exportação do catálogo; nenhum envio a provedores."""
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from xml.etree.ElementTree import Element, SubElement, tostring
from fastapi import APIRouter, Response, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import models
from database import get_db
from routers.auth import get_current_user_from_header

router = APIRouter(prefix="/api/integrations", tags=["Sincronizador Multicanal B2B"])
CHANNELS = [
    {"id": "autocerto", "nome": "AutoCerto DMS", "badge_cor": "#0066cc"},
    {"id": "autoavaliar", "nome": "AutoAvaliar", "badge_cor": "#ff6600"},
    {"id": "olx", "nome": "OLX Autos", "badge_cor": "#6e0ad6"},
]

class SyncRequest(BaseModel):
    car_id: Optional[str] = None
    car_name: Optional[str] = "Veículo"
    store_id: Optional[int] = None
    channels: List[str] = Field(default_factory=lambda: [channel["id"] for channel in CHANNELS])

@router.get("/channels")
async def listar_canais_integracao() -> Dict[str, Any]:
    return {"status": "success", "envio_externo": False, "total_canais": len(CHANNELS), "canais": [
        {**channel, "status": "demonstracao", "tipo_integracao": "Exemplo interativo", "anuncios_sincronizados": 0, "ultima_sincronizacao": None} for channel in CHANNELS
    ]}

@router.post("/sync")
async def sincronizar_estoque_multicanal(payload: SyncRequest, current_user: models.User = Depends(get_current_user_from_header)) -> Dict[str, Any]:
    selected = list(dict.fromkeys(payload.channels))
    if not selected or any(cid not in {channel["id"] for channel in CHANNELS} for cid in selected):
        raise HTTPException(status_code=422, detail="Selecione ao menos um canal conhecido.")
    resultados = [{"canal_id": cid, "canal_nome": next(channel["nome"] for channel in CHANNELS if channel["id"] == cid), "status": "simulado", "url_publicacao": None} for cid in selected]
    return {"status": "success", "protocolo": f"DEMO-{uuid.uuid4().hex[:8].upper()}", "veiculo": payload.car_name,
            "envio_externo": False, "total_sincronizados": 0, "total_simulados": len(resultados), "canais_sincronizados": resultados,
            "mensagem": "Amostra preparada no Automatch. Nenhum anúncio foi enviado aos portais."}

@router.get("/feed.xml")
async def gerar_feed_xml(store_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Exporta apenas campos públicos do catálogo atual, sem informações de repasse."""
    query = db.query(models.Car).filter((models.Car.status_reserva != "vendido") | models.Car.status_reserva.is_(None))
    if store_id is not None:
        query = query.filter(models.Car.store_id == store_id)
    estoque = Element("estoque", versao="2.0", ambiente="demonstracao")
    SubElement(estoque, "data_geracao").text = datetime.now(timezone.utc).isoformat()
    for car in query.order_by(models.Car.id).all():
        vehicle = SubElement(estoque, "veiculo", id=str(car.id))
        fields = {"marca": car.brand, "modelo": car.model, "ano_modelo": car.year, "preco": f"{car.price:.2f}" if car.price is not None else None,
                  "km": car.km, "cor": car.color, "transmissao": car.transmission, "combustivel": car.fuel, "store_id": car.store_id}
        for name, value in fields.items():
            if value is not None:
                SubElement(vehicle, name).text = str(value)
    return Response(content=tostring(estoque, encoding="utf-8", xml_declaration=True), media_type="application/xml")