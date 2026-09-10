import logging
from typing import Optional, Dict, Any, List
from fastapi import APIRouter
from pydantic import BaseModel

logger = logging.getLogger("automatch")
router = APIRouter(prefix="/api", tags=["Troca com Troco & Financiamento"])


class TradeInRequest(BaseModel):
    target_price: float
    tradein_plate: Optional[str] = None
    tradein_brand: Optional[str] = "Volkswagen"
    tradein_model: Optional[str] = "Gol 1.0 Flex"
    tradein_year: Optional[int] = 2019
    tradein_km: Optional[int] = 55000
    tradein_fipe: Optional[float] = None
    condition: Optional[str] = "bom"  # "excelente" | "bom" | "regular"


def calcular_parcela(valor: float, taxa_mensal: float, meses: int) -> float:
    if valor <= 0 or meses <= 0:
        return 0.0
    fator = (1 + taxa_mensal) ** meses
    return round((valor * (taxa_mensal * fator)) / (fator - 1), 2)


@router.post("/troca-com-troco")
async def simular_troca_com_troco(payload: TradeInRequest) -> Dict[str, Any]:
    """
    Simulador Instantâneo 'Troca com Troco':
    Avalia o seminovo do cliente, calcula o saldo líquido em relação ao carro desejado
    e determina se o comprador recebe 'Troco via Pix' ou financia a diferença em multi-bancos.
    """
    target = payload.target_price

    # Estima valor FIPE do veículo de entrada caso não informado
    fipe_base = payload.tradein_fipe
    if not fipe_base:
        idade = max(0, 2024 - (payload.tradein_year or 2019))
        fipe_base = max(25000.0, 75000.0 - (idade * 6500.0))

    # Fator de avaliação da loja por estado de conservação
    fatores_condicao = {
        "excelente": 0.90,
        "bom": 0.85,
        "regular": 0.78
    }
    fator = fatores_condicao.get((payload.condition or "bom").lower(), 0.85)

    # Ajuste por quilometragem (>15.000km/ano deduz levemente)
    km = payload.tradein_km or 55000
    km_esperado = max(1, 2024 - (payload.tradein_year or 2019)) * 15000
    if km > km_esperado:
        fator -= min(0.05, ((km - km_esperado) / 100000.0) * 0.05)

    valor_avaliacao = round(fipe_base * fator, 2)
    saldo_liquido = round(valor_avaliacao - target, 2)

    if saldo_liquido > 0:
        # Troco a Receber no Pix
        return {
            "status": "success",
            "tipo_operacao": "troco_a_receber",
            "veiculo_entrada": {
                "placa": payload.tradein_plate or "ABC-1D23",
                "modelo": f"{payload.tradein_brand} {payload.tradein_model} {payload.tradein_year}",
                "fipe_referencia": round(fipe_base, 2),
                "valor_avaliacao": valor_avaliacao,
                "percentual_fipe": f"{round(fator * 100)}%"
            },
            "veiculo_destino": {
                "valor_anunciado": target
            },
            "troco_pix": saldo_liquido,
            "saldo_financiar": 0.0,
            "mensagem": f"Parabéns! Seu veículo vale mais do que o anunciado. Você sai de carro novo e recebe R$ {saldo_liquido:,.2f} no Pix!",
            "bancos": []
        }

    # Saldo a Financiar com comparador multi-bancos
    saldo_devedor = round(abs(saldo_liquido), 2)
    bancos = [
        {
            "banco": "Itaú Auto",
            "taxa_mensal": "1,42% a.m.",
            "parcelas": {
                "24x": calcular_parcela(saldo_devedor, 0.0142, 24),
                "36x": calcular_parcela(saldo_devedor, 0.0142, 36),
                "48x": calcular_parcela(saldo_devedor, 0.0142, 48),
                "60x": calcular_parcela(saldo_devedor, 0.0142, 60),
            },
            "destaque": "Menor Taxa"
        },
        {
            "banco": "Santander Auto",
            "taxa_mensal": "1,45% a.m.",
            "parcelas": {
                "24x": calcular_parcela(saldo_devedor, 0.0145, 24),
                "36x": calcular_parcela(saldo_devedor, 0.0145, 36),
                "48x": calcular_parcela(saldo_devedor, 0.0145, 48),
                "60x": calcular_parcela(saldo_devedor, 0.0145, 60),
            },
            "destaque": "Aprovação Rápida"
        },
        {
            "banco": "BV Financeira",
            "taxa_mensal": "1,49% a.m.",
            "parcelas": {
                "24x": calcular_parcela(saldo_devedor, 0.0149, 24),
                "36x": calcular_parcela(saldo_devedor, 0.0149, 36),
                "48x": calcular_parcela(saldo_devedor, 0.0149, 48),
                "60x": calcular_parcela(saldo_devedor, 0.0149, 60),
            },
            "destaque": "Flexibilidade de Entrada"
        }
    ]

    return {
        "status": "success",
        "tipo_operacao": "saldo_a_financiar",
        "veiculo_entrada": {
            "placa": payload.tradein_plate or "ABC-1D23",
            "modelo": f"{payload.tradein_brand} {payload.tradein_model} {payload.tradein_year}",
            "fipe_referencia": round(fipe_base, 2),
            "valor_avaliacao": valor_avaliacao,
            "percentual_fipe": f"{round(fator * 100)}%"
        },
        "veiculo_destino": {
            "valor_anunciado": target
        },
        "troco_pix": 0.0,
        "saldo_financiar": saldo_devedor,
        "mensagem": f"Seu carro entra como entrada de R$ {valor_avaliacao:,.2f}. O saldo de R$ {saldo_devedor:,.2f} pode ser financiado em até 60x.",
        "bancos": bancos
    }
