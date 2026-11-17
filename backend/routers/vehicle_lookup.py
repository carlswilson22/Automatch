"""
vehicle_lookup.py — Router de decodificação e enriquecimento de dados de veículos por placa e chassi.

Objetivo e Motivo da Criação:
  - Criado para automatizar o preenchimento da ficha técnica do veículo ao cadastrar anúncio ou laudo.
  - Normaliza placas Mercosul e padrão antigo, consultando metadados de fabricante, modelo, ano e versão.
  - Reduz drasticamente o tempo de digitação manual de anúncios pelo lojista ou vendedor particular.
"""
import re
import time
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

logger = logging.getLogger("automatch")
router = APIRouter(prefix="/api/vehicles", tags=["Vehicle Lookup & Plate Autofill"])

# Cache em memória para consultas de placa com TTL de 24 horas (86400s)
_PLATE_CACHE: Dict[str, Dict[str, Any]] = {}
PLATE_CACHE_TTL_SECONDS = 86400

# Base de Dados Conhecida com modelos para autofill preciso
KNOWN_VEHICLES_DATABASE = {
    "ABC1234": {
        "marca": "Toyota",
        "modelo": "Corolla Altis 2.0 Flex Aut.",
        "ano_fabricacao": 2023,
        "ano_modelo": 2023,
        "cor": "Azul",
        "combustivel": "Flex",
        "chassi_parcial": "9BWZZ***1234",
        "municipio": "São Paulo",
        "uf": "SP",
        "situacao_veiculo": "Regular",
        "status_roubo_furto": "Nada Consta (Regular)",
        "restricoes_financeiras": "Sem Gravame (Quitado)",
        "historico_leilao": "Sem Registro de Leilão",
        "preco_fipe_sugerido": 142500.0,
        "codigo_fipe": "002165-2",
        "mes_referencia_fipe": "Setembro de 2024"
    },
    "BRA2E19": {
        "marca": "Volkswagen",
        "modelo": "Polo TSI Highline 1.0 Turbo Aut.",
        "ano_fabricacao": 2023,
        "ano_modelo": 2024,
        "cor": "Cinza Platinum",
        "combustivel": "Flex",
        "chassi_parcial": "9BWAB***2E19",
        "municipio": "Curitiba",
        "uf": "PR",
        "situacao_veiculo": "Regular",
        "status_roubo_furto": "Nada Consta (Regular)",
        "restricoes_financeiras": "Sem Gravame (Quitado)",
        "historico_leilao": "Sem Registro de Leilão",
        "preco_fipe_sugerido": 109800.0,
        "codigo_fipe": "005487-1",
        "mes_referencia_fipe": "Setembro de 2024"
    },
    "XYZ9876": {
        "marca": "Volkswagen",
        "modelo": "Golf GTI 2.0 TSI DSG",
        "ano_fabricacao": 2022,
        "ano_modelo": 2022,
        "cor": "Branco Cristal",
        "combustivel": "Gasolina",
        "chassi_parcial": "WVWZZ***4321",
        "municipio": "Belo Horizonte",
        "uf": "MG",
        "situacao_veiculo": "Regular",
        "status_roubo_furto": "Nada Consta (Regular)",
        "restricoes_financeiras": "Sem Gravame (Quitado)",
        "historico_leilao": "Sem Registro de Leilão",
        "preco_fipe_sugerido": 185000.0,
        "codigo_fipe": "005391-3",
        "mes_referencia_fipe": "Setembro de 2024"
    },
    "MER1C24": {
        "marca": "Hyundai",
        "modelo": "HB20 Platinum Plus 1.0 Turbo Aut.",
        "ano_fabricacao": 2024,
        "ano_modelo": 2024,
        "cor": "Prata Sand",
        "combustivel": "Flex",
        "chassi_parcial": "9BHBG***1C24",
        "municipio": "Campinas",
        "uf": "SP",
        "situacao_veiculo": "Regular",
        "status_roubo_furto": "Nada Consta (Regular)",
        "restricoes_financeiras": "Alienação Fiduciária (Ativa)",
        "historico_leilao": "Sem Registro de Leilão",
        "preco_fipe_sugerido": 104500.0,
        "codigo_fipe": "015180-8",
        "mes_referencia_fipe": "Setembro de 2024"
    },
    "AUT0M26": {
        "marca": "Chevrolet",
        "modelo": "Tracker Premier 1.2 Turbo Aut.",
        "ano_fabricacao": 2023,
        "ano_modelo": 2023,
        "cor": "Preto Ouro Negro",
        "combustivel": "Flex",
        "chassi_parcial": "9BGKL***0M26",
        "municipio": "Brasília",
        "uf": "DF",
        "situacao_veiculo": "Regular",
        "status_roubo_furto": "Nada Consta (Regular)",
        "restricoes_financeiras": "Sem Gravame (Quitado)",
        "historico_leilao": "Sem Registro de Leilão",
        "preco_fipe_sugerido": 128900.0,
        "codigo_fipe": "004499-5",
        "mes_referencia_fipe": "Setembro de 2024"
    },
    "PAR9999": {
        "marca": "Fiat",
        "modelo": "Pulse Audace 1.0 Turbo CVT",
        "ano_fabricacao": 2023,
        "ano_modelo": 2024,
        "cor": "Cinza Silverstone",
        "combustivel": "Flex",
        "chassi_parcial": "9BD36***9999",
        "municipio": "Porto Alegre",
        "uf": "RS",
        "situacao_veiculo": "Regular",
        "status_roubo_furto": "Nada Consta (Regular)",
        "restricoes_financeiras": "Sem Gravame (Quitado)",
        "historico_leilao": "Sem Registro de Leilão",
        "preco_fipe_sugerido": 112000.0,
        "codigo_fipe": "001550-4",
        "mes_referencia_fipe": "Setembro de 2024"
    }
}


def normalize_plate(plate: str) -> str:
    """Remove traços, espaços e pontuações, convertendo para maiúsculas."""
    if not plate:
        return ""
    return re.sub(r'[^A-Za-z0-9]', '', plate).upper()


def validate_brazilian_plate(clean_plate: str) -> bool:
    """
    Valida padrão de placas brasileiras:
    - Padrão tradicional: ABC1234 (3 letras + 4 números)
    - Padrão Mercosul: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)
    """
    padrao_antigo = r'^[A-Z]{3}[0-9]{4}$'
    padrao_mercosul = r'^[A-Z]{3}[0-9][A-Z][0-9]{2}$'
    return bool(re.match(padrao_antigo, clean_plate) or re.match(padrao_mercosul, clean_plate))


@router.get("/lookup-plate/{placa}", response_model=schemas.PlateLookupResponse)
async def lookup_plate(placa: str, db: Session = Depends(get_db)):
    """Preenche a partir de amostra ou cadastro, sem inferir situação oficial."""
    clean_plate = normalize_plate(placa)
    if not clean_plate or not validate_brazilian_plate(clean_plate):
        raise HTTPException(status_code=422, detail="Informe uma placa válida de 7 caracteres.")
    now = time.time()
    local_car = db.query(models.Car).filter(models.Car.plate == clean_plate).first()
    cached = _PLATE_CACHE.get(clean_plate)
    if not local_car and cached and now - cached["cached_at"] < PLATE_CACHE_TTL_SECONDS:
        return schemas.PlateLookupResponse(**{**cached["data"], "cache_hit": True})
    if not local_car and clean_plate in KNOWN_VEHICLES_DATABASE:
        data = KNOWN_VEHICLES_DATABASE[clean_plate].copy()
        data.update(is_simulado=True, origem="amostra", mensagem="Amostra cadastral de demonstração; não é consulta oficial.")
    else:
        if not local_car:
            raise HTTPException(status_code=404, detail="Placa sem amostra ou cadastro. Preencha os dados do veículo manualmente.")
        location = (local_car.location or "").split(",")
        data = {
            "marca": local_car.brand or "", "modelo": local_car.model or "",
            "ano_fabricacao": local_car.year, "ano_modelo": local_car.year,
            "cor": local_car.color or "", "combustivel": local_car.fuel or "",
            "chassi_parcial": "Não informado", "municipio": location[0].strip(),
            "uf": location[1].strip() if len(location) > 1 else "",
            "preco_fipe_sugerido": float(local_car.fipe_price) if local_car.fipe_price is not None else None,
            "codigo_fipe": local_car.fipe_code, "mes_referencia_fipe": None,
            "is_simulado": False, "origem": "cadastro",
            "mensagem": "Dados preenchidos pelo anúncio cadastrado; situação externa não consultada.",
        }
    data.update(placa=clean_plate, cache_hit=False, consulta_oficial=False,
                situacao_veiculo="Não consultado", status_roubo_furto="Não consultado",
                restricoes_financeiras="Não consultado", historico_leilao="Não consultado")
    # Cache somente de amostras imutáveis; dados editáveis são lidos do cadastro.
    if data["origem"] == "amostra":
        _PLATE_CACHE[clean_plate] = {"cached_at": now, "data": data.copy()}
    return schemas.PlateLookupResponse(**data)
