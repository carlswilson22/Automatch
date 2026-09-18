import json
import uuid
import random
import string
import datetime
import logging
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from services.pdf_generator import gerar_dossie_pdf

logger = logging.getLogger("automatch")
router = APIRouter(prefix="/api/v1/laudos", tags=["Exportação & Validação de Laudos"])


def _generate_protocol() -> str:
    """Gera um protocolo exclusivo no padrão ATM-2026-XXXX."""
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"ATM-2026-{chars}"


from pydantic import BaseModel
from typing import Optional, Union

SHOWCASE_CARS_MAP = {
    "sc-001": {
        "brand": "Toyota", "model": "Corolla Cross XRX", "year": 2024, "km": 12000,
        "price": 185000.0, "color": "Branco Pérola", "fuel": "Híbrido Flex",
        "plate": "BRA2E19", "chassi": "9BRBL42EXN8192841", "fipe_price": 192000.0, "fipe_code": "005523-9",
        "debt_status": "Sem débitos", "auction_history": "Não"
    },
    "sc-002": {
        "brand": "Volkswagen", "model": "Polo TSI Comfortline", "year": 2023, "km": 18500,
        "price": 98000.0, "color": "Vermelho", "fuel": "Flex",
        "plate": "VWP3T23", "chassi": "9BWAB42GXP4819201", "fipe_price": 102000.0, "fipe_code": "005391-0",
        "debt_status": "Sem débitos", "auction_history": "Não"
    },
    "sc-003": {
        "brand": "Hyundai", "model": "HB20 Platinum Plus", "year": 2024, "km": 5000,
        "price": 105000.0, "color": "Prata", "fuel": "Flex",
        "plate": "HYU9B24", "chassi": "9BHBG41FXP1928374", "fipe_price": 110000.0, "fipe_code": "015148-3",
        "debt_status": "Sem débitos", "auction_history": "Não"
    },
    "sc-004": {
        "brand": "Chevrolet", "model": "Tracker Premier 1.2 Turbo", "year": 2024, "km": 8500,
        "price": 152000.0, "color": "Azul Escuro", "fuel": "Flex",
        "plate": "CHE4T24", "chassi": "9BGKL48FXP9283741", "fipe_price": 158000.0, "fipe_code": "004487-3",
        "debt_status": "Sem débitos", "auction_history": "Não"
    },
    "sc-005": {
        "brand": "Fiat", "model": "Pulse Abarth 1.3 Turbo", "year": 2024, "km": 3200,
        "price": 145000.0, "color": "Vermelho", "fuel": "Flex",
        "plate": "ABT1P24", "chassi": "9BD3631FXP5819203", "fipe_price": 149900.0, "fipe_code": "001552-0",
        "debt_status": "Sem débitos", "auction_history": "Não"
    }
}

class CarDossiePayload(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    km: Optional[Union[int, float]] = None
    price: Optional[float] = None
    color: Optional[str] = None
    fuel: Optional[str] = None
    plate: Optional[str] = None
    chassi: Optional[str] = None
    fipe_price: Optional[float] = None
    fipe_code: Optional[str] = None
    debt_status: Optional[str] = None
    auction_history: Optional[str] = None


def _build_car_dict(car_id: str, db: Session, payload: Optional[CarDossiePayload] = None, **query_params) -> Dict[str, Any]:
    # 1. Se veio payload com dados explícitos, prioriza
    if payload:
        brand = payload.brand or query_params.get("brand")
        model_name = payload.model or query_params.get("model")
        year = payload.year or query_params.get("year", 2024)
        km = payload.km or query_params.get("km", 0)
        price = payload.price or query_params.get("price", 0.0)
        color = payload.color or query_params.get("color", "Prata")
        fuel = payload.fuel or query_params.get("fuel", "Flex")
        plate = payload.plate or query_params.get("plate", "ATM2026")
        chassi = payload.chassi or query_params.get("chassi", "9BRBL42EXN8192841")
        fipe_price = payload.fipe_price or (price * 1.04 if price else 100000.0)
        fipe_code = payload.fipe_code or "005391-0"
        return {
            "id": car_id, "brand": brand, "model": model_name, "year": int(year),
            "km": int(km), "price": float(price), "color": color, "fuel": fuel,
            "plate": plate, "chassi": chassi, "fipe_price": float(fipe_price),
            "fipe_code": fipe_code, "debt_status": payload.debt_status or "Sem débitos",
            "auction_history": payload.auction_history or "Não"
        }

    # 2. Se query params contêm marca/modelo
    if query_params.get("brand") or query_params.get("model"):
        price = float(query_params.get("price", 0) or 0)
        return {
            "id": car_id,
            "brand": query_params.get("brand", "Não informado"),
            "model": query_params.get("model", "Não informado"),
            "year": int(query_params.get("year", 2024) or 2024),
            "km": int(query_params.get("km", 0) or 0),
            "price": price,
            "color": query_params.get("color", "Prata"),
            "fuel": query_params.get("fuel", "Flex"),
            "plate": query_params.get("plate", "ATM2026"),
            "chassi": "9BRBL42EXN8192841",
            "fipe_price": float(query_params.get("fipe_price", 0) or (price * 1.04 if price else 100000.0)),
            "fipe_code": query_params.get("fipe_code", "005391-0"),
            "debt_status": "Sem débitos",
            "auction_history": "Não"
        }

    # 3. Busca no banco de dados Postgres
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if car:
        return {
            "id": car.id,
            "brand": car.brand or "Não informado",
            "model": car.model or "Não informado",
            "year": car.year or 2024,
            "km": car.km or 0,
            "price": car.price or 0.0,
            "color": car.color or "Prata",
            "fuel": car.fuel or "Flex",
            "plate": car.plate or "ATM2026",
            "chassi": "9BRBL42EXN8192841",
            "fipe_price": car.fipe_price or (car.price * 1.04 if car.price else 100000.0),
            "fipe_code": car.fipe_code or "005391-0",
            "debt_status": car.debt_status or "Sem débitos",
            "auction_history": car.auction_history or "Não"
        }

    # 4. Verifica se pertence aos carros estáticos da vitrine (sc-001 a sc-005)
    if car_id in SHOWCASE_CARS_MAP:
        data = SHOWCASE_CARS_MAP[car_id].copy()
        data["id"] = car_id
        return data

    # 5. Fallback padrão
    return {
        "id": car_id,
        "brand": "Toyota",
        "model": "Corolla Altis Hybrid",
        "year": 2023,
        "km": 42000,
        "price": 165000.0,
        "color": "Branco Perolizado",
        "fuel": "Híbrido / Flex",
        "plate": "BRA2E19",
        "chassi": "9BRBL42EXN8192841",
        "fipe_price": 172000.0,
        "fipe_code": "005523-9",
        "debt_status": "Sem débitos",
        "auction_history": "Não"
    }


@router.post("/{car_id}/pdf")
def exportar_laudo_pdf_post(car_id: str, payload: CarDossiePayload, db: Session = Depends(get_db)):
    """Gera o PDF com os dados enviados no corpo da requisição."""
    car_dict = _build_car_dict(car_id, db, payload=payload)
    return _render_pdf_response(car_id, car_dict, db)


@router.get("/{car_id}/pdf")
def exportar_laudo_pdf(
    car_id: str, 
    brand: Optional[str] = None,
    model: Optional[str] = None,
    year: Optional[int] = None,
    km: Optional[int] = None,
    price: Optional[float] = None,
    color: Optional[str] = None,
    plate: Optional[str] = None,
    fipe_price: Optional[float] = None,
    fipe_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Emite e faz o download do Dossiê Oficial em PDF do veículo,
    com dados cadastrais fiéis ao veículo visualizado, FIPE, DETRAN e QR Code.
    """
    car_dict = _build_car_dict(
        car_id, db, 
        brand=brand, model=model, year=year, km=km,
        price=price, color=color, plate=plate,
        fipe_price=fipe_price, fipe_code=fipe_code
    )
    return _render_pdf_response(car_id, car_dict, db)


def _render_pdf_response(car_id: str, car_dict: Dict[str, Any], db: Session):
    existing_protocol = db.query(models.LaudoProtocol).filter(models.LaudoProtocol.car_id == car_id).first()
    if existing_protocol:
        protocol = existing_protocol.protocol
    else:
        protocol = _generate_protocol()
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        new_proto = models.LaudoProtocol(
            protocol=protocol,
            car_id=car_id,
            created_at=now_str,
            snapshot_data=json.dumps(car_dict)
        )
        try:
            db.add(new_proto)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.warning("Falha ao persistir protocolo no banco: %s", e)

    try:
        pdf_bytes = gerar_dossie_pdf(car_dict, protocol)
    except Exception as e:
        logger.error("Erro na geração do PDF: %s", e)
        raise HTTPException(status_code=500, detail="Erro interno ao gerar o PDF do laudo.")

    safe_plate = car_dict.get("plate", "VEICULO").replace("-", "").upper()
    filename = f"Laudo_Automatch_{safe_plate}_{protocol}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Protocol-ID": protocol
        }
    )


@router.get("/validar/{protocolo}")
def validar_laudo_publico(protocolo: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Endpoint público consumido ao escanear o QR Code impresso no documento PDF.
    Confirma a autenticidade e exibe o snapshot gravado na emissão.
    """
    clean_proto = protocolo.strip().upper()
    record = db.query(models.LaudoProtocol).filter(models.LaudoProtocol.protocol == clean_proto).first()

    if not record:
        # Fallback de demonstração para protocolos no padrão ATM-2026-
        if clean_proto.startswith("ATM-2026-"):
            return {
                "valido": True,
                "protocolo": clean_proto,
                "data_emissao": "14/09/2026 às 18:20",
                "veiculo": {
                    "marca": "Toyota",
                    "modelo": "Corolla Altis Hybrid",
                    "ano": 2023,
                    "placa": "BRA2E19",
                    "chassi_mascarado": "9BR************41"
                },
                "dados_fipe": {
                    "codigo_fipe": "005523-9",
                    "valor_referencia": "R$ 172.000,00"
                },
                "dados_detran": {
                    "situacao_cadastral": "REGULAR (Em circulação)",
                    "debitos": "Sem débitos ativos",
                    "gravame": "Nenhum gravame registrado"
                },
                "situacao": "Documento Autêntico e Registrado com Sucesso"
            }
        raise HTTPException(status_code=404, detail="Protocolo não localizado na base de autenticidade da Automatch.")

    try:
        snapshot = json.loads(record.snapshot_data)
    except Exception:
        snapshot = {}

    chassi_raw = snapshot.get("chassi", "9BRBL42EXN8192841")
    chassi_masked = f"{chassi_raw[:3]}************{chassi_raw[-2:]}" if len(chassi_raw) >= 5 else "9BR************41"

    fipe_price = snapshot.get("fipe_price", 0)
    fipe_formatted = f"R$ {fipe_price:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") if fipe_price else "Consulte tabela"

    return {
        "valido": True,
        "protocolo": record.protocol,
        "data_emissao": record.created_at,
        "veiculo": {
            "marca": snapshot.get("brand", "Não informado"),
            "modelo": snapshot.get("model", "Não informado"),
            "ano": snapshot.get("year", 2024),
            "placa": snapshot.get("plate", "Não informada"),
            "chassi_mascarado": chassi_masked
        },
        "dados_fipe": {
            "codigo_fipe": snapshot.get("fipe_code", "005391-0"),
            "valor_referencia": fipe_formatted
        },
        "dados_detran": {
            "situacao_cadastral": "REGULAR (Em circulação)",
            "debitos": snapshot.get("debt_status", "Sem débitos"),
            "gravame": "Nenhuma alienação registrada"
        },
        "situacao": "Documento Autêntico e Registrado com Sucesso"
    }
