"""
detran.py — Router de consulta veicular simulada (Detran/DENATRAN).

Objetivo e Motivo da Criação:
  - Criado para simular integrações oficiais de verificação veicular (DETRAN/DENATRAN) através de consultas por placa,
    retornando histórico de multas, débitos, sinistros, restrições financeiras e histórico cadastral.
  - Fornece dados essenciais para o laudo cautelar da vitrine em ambiente de demonstração e homologação.

Responsabilidades:
  - Consulta de histórico veicular por placa (multas, sinistros, recalls).
  - Simulação de dados de procedência para ambiente de demonstração.
  - Validação de formato de placa (padrão Mercosul e antigo).
"""

import re
import copy
import time
import logging
from datetime import datetime
from typing import Dict, Any, Optional

import httpx
from fastapi import APIRouter, HTTPException, Request
from security_guard import plate_rate_limiter

logger = logging.getLogger("automatch")
router = APIRouter(tags=["DETRAN & Laudo Cautelar"])

# Cache em memória para consultas à Tabela FIPE (TTL de 24 horas = 86400s)
_FIPE_CACHE: Dict[str, Dict[str, Any]] = {}
FIPE_CACHE_TTL_SECONDS = 86400

# ==============================================================================
# Base de Dados Simulada de DETRANs Estaduais
# ==============================================================================

DETRAN_MOCK_REGISTRY = {
    "ABC1234": {
        "placa": "ABC1234",
        "chassi": "9BWZZZ377VT001234",
        "renavam": "00987654321",
        "marca_modelo": "TOYOTA/COROLLA ALTIS 2.0",
        "ano_fabricacao": 2023,
        "ano_modelo": 2023,
        "cor": "AZUL",
        "combustivel": "FLEX",
        "categoria": "PARTICULAR",
        "municipio": "SAO PAULO",
        "uf": "SP",
        "situacao_veiculo": "REGULAR",
        "restricoes": {
            "roubo_furto": "NADA CONSTA",
            "judicial": "NADA CONSTA",
            "administrativa": "NADA CONSTA",
            "tributaria": "NADA CONSTA",
            "gravame": "SEM GRAVAME (QUITADO)"
        },
        "debitos": {
            "ipva": "QUITADO",
            "licenciamento_exercicio": 2024,
            "licenciamento_status": "PAGO",
            "dpvat": "QUITADO",
            "total_multas": 0.00,
            "multas_ativas": []
        },
        "inspecao_vistoria": {
            "status": "APROVADO",
            "data_ultima_vistoria": "15/01/2024",
            "quilometragem_registrada": 18500,
            "emissao_gases": "CONFORME"
        }
    },
    "XYZ9876": {
        "placa": "XYZ9876",
        "chassi": "WVWZZZAUZLW054321",
        "renavam": "00876543210",
        "marca_modelo": "VW/GOLF GTI 2.0 TSI",
        "ano_fabricacao": 2022,
        "ano_modelo": 2022,
        "cor": "BRANCO",
        "combustivel": "GASOLINA",
        "categoria": "PARTICULAR",
        "municipio": "BELO HORIZONTE",
        "uf": "MG",
        "situacao_veiculo": "REGULAR",
        "restricoes": {
            "roubo_furto": "NADA CONSTA",
            "judicial": "NADA CONSTA",
            "administrativa": "NADA CONSTA",
            "tributaria": "NADA CONSTA",
            "gravame": "SEM GRAVAME (QUITADO)"
        },
        "debitos": {
            "ipva": "QUITADO",
            "licenciamento_exercicio": 2024,
            "licenciamento_status": "PAGO",
            "dpvat": "QUITADO",
            "total_multas": 0.00,
            "multas_ativas": []
        },
        "inspecao_vistoria": {
            "status": "APROVADO",
            "data_ultima_vistoria": "10/02/2024",
            "quilometragem_registrada": 12300,
            "emissao_gases": "CONFORME"
        }
    },
    "ECO9999": {
        "placa": "ECO9999",
        "chassi": "5YJ3E1EB8NF112233",
        "renavam": "00765432109",
        "marca_modelo": "TESLA/MODEL 3",
        "ano_fabricacao": 2024,
        "ano_modelo": 2024,
        "cor": "CINZA",
        "combustivel": "ELETRICO",
        "categoria": "PARTICULAR",
        "municipio": "SAO PAULO",
        "uf": "SP",
        "situacao_veiculo": "REGULAR",
        "restricoes": {
            "roubo_furto": "NADA CONSTA",
            "judicial": "NADA CONSTA",
            "administrativa": "NADA CONSTA",
            "tributaria": "NADA CONSTA",
            "gravame": "SEM GRAVAME (QUITADO)"
        },
        "debitos": {
            "ipva": "ISENTO (VEICULO ELETRICO - SP)",
            "licenciamento_exercicio": 2024,
            "licenciamento_status": "PAGO",
            "dpvat": "QUITADO",
            "total_multas": 0.00,
            "multas_ativas": []
        },
        "inspecao_vistoria": {
            "status": "APROVADO",
            "data_ultima_vistoria": "05/03/2024",
            "quilometragem_registrada": 5200,
            "emissao_gases": "ISENTO (ZERO EMISSOES)"
        }
    }
}


def normalize_plate(plate: str) -> str:
    return re.sub(r'[^A-Za-z0-9]', '', plate).upper()


@router.get("/api/detran/{placa}")
@router.get("/api/v1/detran/{placa}")
@router.get("/api/v1/integracoes/detran/{placa}")
async def consultar_detran(placa: str, request: Request = None) -> Dict[str, Any]:
    """Exibe somente amostras conhecidas; não consulta órgão oficial."""
    client_ip = request.client.host if request and request.client else "127.0.0.1"
    allowed, remaining = plate_rate_limiter.is_allowed(client_ip)
    if not allowed:
        raise HTTPException(status_code=429, detail="Limite de consultas excedido.", headers={"Retry-After": str(remaining)})
    clean_plate = normalize_plate(placa)
    if not re.fullmatch(r"[A-Z]{3}[0-9][A-Z0-9][0-9]{2}", clean_plate):
        raise HTTPException(status_code=400, detail="Formato de placa inválido.")
    data = copy.deepcopy(DETRAN_MOCK_REGISTRY.get(clean_plate))
    return {
        "status": "demonstracao" if data else "indisponivel",
        "origem": "amostra" if data else "nao_consultado",
        "is_simulado": bool(data),
        "orgao_emissor": None,
        "timestamp_consulta": None,
        "consulta_valida": False,
        "mensagem": "Dados ilustrativos, sem consulta ao DETRAN." if data else "Não há amostra para esta placa. A situação cadastral não foi consultada.",
        "dados_veiculo": data or {"placa": clean_plate, "chassi": None, "uf": None, "situacao_veiculo": "Não consultado", "debitos": {"ipva": "Não consultado", "licenciamento_status": "Não consultado", "total_multas": None}, "restricoes": {"gravame": "Não consultado"}},
    }


@router.get("/api/v1/laudo-cautelar/{codigo_fipe}")
@router.get("/api/v1/integracoes/laudo-cautelar/{codigo_fipe}")
async def gerar_laudo_cautelar(codigo_fipe: str, ano: Optional[int] = None) -> Dict[str, Any]:
    """Referência de preço não certifica estrutura ou histórico do veículo."""
    clean_fipe = re.sub(r'[^0-9\-]', '', codigo_fipe)
    if not re.fullmatch(r"[0-9]{6}-[0-9]", clean_fipe):
        raise HTTPException(status_code=422, detail="Código FIPE inválido.")
    now = time.time()
    cache_key = f"{clean_fipe}:{ano or ''}"
    cached = _FIPE_CACHE.get(cache_key)
    fipe_info = cached["data"] if cached and now < cached.get("expires_at", 0) else None
    cache_hit = fipe_info is not None
    if fipe_info is None:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                response = await client.get(f"https://brasilapi.com.br/api/fipe/preco/v1/{clean_fipe}")
                if response.status_code == 200:
                    values = response.json()
                    if isinstance(values, list):
                        candidates = [item for item in values if isinstance(item, dict) and item.get("codigoFipe") == clean_fipe and (ano is None or str(item.get("anoModelo")) == str(ano))]
                        fipe_info = candidates[0] if candidates else None
        except Exception:
            logger.info("Referência de preço indisponível para o código solicitado.")
        if fipe_info:
            _FIPE_CACHE[cache_key] = {"data": fipe_info, "expires_at": now + FIPE_CACHE_TTL_SECONDS}
    return {
        "status": "success" if fipe_info else "indisponivel",
        "origem": "brasilapi" if fipe_info else "nao_consultado",
        "is_simulado": False,
        "cache_hit": cache_hit,
        "mensagem": "Referência de preço; não é uma vistoria ou laudo pericial.",
        "laudo": {
            "laudo_id": None,
            "resultado_geral": "Vistoria não realizada",
            "score_integridade": None,
            "dados_oficiais_fipe": fipe_info,
            "analise_estrutural": {"longarinas_dianteiras": "Não consultado", "espessura_media_tinta_micras": None},
            "historico_procedencia": {"passagem_leilao": "Não consultado", "historico_sinistro": "Não consultado"},
        },
    }
