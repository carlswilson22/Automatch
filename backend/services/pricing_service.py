from datetime import datetime
from typing import List, Dict, Any

def calcular_preco_justo(fipe_price: float, km: int, year: int, damages: List[str]) -> Dict[str, Any]:
    """
    Motor AutoPrice™: Calcula o Preço Justo Automatch baseando-se na FIPE, KM e avarias.
    """
    base_price = fipe_price
    discount = 0.0
    details = []
    
    # 1. Depreciação por KM (estimativa simples: -R$ 0,10 por KM acima de 10.000km/ano)
    current_year = datetime.now().year
    age = max(1, current_year - year)
    expected_km = age * 10000
    if km > expected_km:
        km_penalty = (km - expected_km) * 0.10
        discount += km_penalty
        details.append(f"Depreciação por alta quilometragem: -R$ {km_penalty:,.2f}")
    
    # 2. Desconto por Avarias (Mock estimation)
    damage_costs = {
        "arranhão": 300,
        "risco": 300,
        "amassado": 1200,
        "farol quebrado": 800,
        "pintura queimada": 1500
    }
    
    for damage in damages:
        cost = 500  # custo base se não encontrado
        for key, val in damage_costs.items():
            if key in damage.lower():
                cost = val
                break
        discount += cost
        details.append(f"Custo estimado de reparo ({damage}): -R$ {cost:,.2f}")

    suggested_price = max(base_price * 0.5, base_price - discount) # Floor is 50% of FIPE
    
    return {
        "fipe_price": base_price,
        "suggested_price": round(suggested_price, 2),
        "total_discount": round(discount, 2),
        "details": details
    }


def calcular_indicador_mercado(price: float, fipe_price: float, auto_price: Any = None) -> Dict[str, Any]:
    """
    Termômetro Visual de Oportunidade / Preço de Mercado.
    Calcula se o veículo está abaixo, na média ou acima do valor de referência de mercado.
    """
    ref_fipe = float(fipe_price) if fipe_price and fipe_price > 0 else float(price)
    curr_price = float(price)

    diff_amount = curr_price - ref_fipe
    diff_percent = (diff_amount / ref_fipe) * 100.0 if ref_fipe > 0 else 0.0

    if diff_percent <= -6.0:
        status_code = "EXCELLENT_DEAL"
        status_label = "Super Oportunidade"
        status_description = f"R$ {abs(diff_amount):,.2f} abaixo da Tabela FIPE"
        badge_color = "emerald"
    elif diff_percent <= 2.0:
        status_code = "FAIR_PRICE"
        status_label = "Preço Justo"
        status_description = "Alinhado à média oficial FIPE"
        badge_color = "cyan"
    elif diff_percent <= 7.0:
        status_code = "UPPER_FAIR"
        status_label = "Na Média de Mercado"
        status_description = "Faixa normal de mercado com opcionais"
        badge_color = "amber"
    else:
        status_code = "ABOVE_MARKET"
        status_label = "Acima da Média"
        status_description = "Valor acima da média de mercado"
        badge_color = "slate"

    min_market = round(ref_fipe * 0.85, 2)
    max_market = round(ref_fipe * 1.15, 2)
    
    # Percentual do ponteiro na régua (0 a 100)
    gauge_range = max(1.0, max_market - min_market)
    gauge_percent = min(100.0, max(0.0, ((curr_price - min_market) / gauge_range) * 100.0))

    return {
        "price": curr_price,
        "fipe_price": ref_fipe,
        "auto_price": float(auto_price) if auto_price else None,
        "diff_amount": round(diff_amount, 2),
        "diff_percent": round(diff_percent, 2),
        "status_code": status_code,
        "status_label": status_label,
        "status_description": status_description,
        "badge_color": badge_color,
        "is_discount": diff_amount < 0,
        "savings_amount": round(abs(diff_amount), 2) if diff_amount < 0 else 0.0,
        "range": {
            "low": min_market,
            "fair_min": round(ref_fipe * 0.94, 2),
            "fair_max": round(ref_fipe * 1.02, 2),
            "high": max_market
        },
        "gauge_percent": round(gauge_percent, 1)
    }


def calcular_tco_mensal(
    price: float,
    fipe_price: Any = None,
    fuel: Any = "Flex",
    uf: str = "SP",
    monthly_km: int = 1000,
    fuel_price: Any = None
) -> Dict[str, Any]:
    """
    Calculadora de Custo Total de Posse (TCO) / Custo Mensal Estimado.
    Calcula: IPVA mensalizado, Seguro anualizado/12, Manutenção preventiva e Combustível projetado.
    """
    curr_price = float(price) if price else 0.0
    ref_fipe = float(fipe_price) if fipe_price and fipe_price > 0 else curr_price

    # Alíquotas estaduais de IPVA
    aliquotas_uf = {
        "SP": 0.04,
        "RJ": 0.04,
        "MG": 0.04,
        "DF": 0.035,
        "PR": 0.035,
        "RS": 0.03,
        "SC": 0.02,
        "GO": 0.0345,
        "BA": 0.025,
        "PE": 0.025,
        "ES": 0.02
    }
    aliquota = aliquotas_uf.get(uf.upper() if uf else "SP", 0.035)

    ipva_anual = ref_fipe * aliquota
    ipva_mensal = round(ipva_anual / 12.0, 2)

    # Seguro médio de mercado: 4.5% a.a.
    seguro_anual = curr_price * 0.045
    seguro_mensal = round(seguro_anual / 12.0, 2)

    # Manutenção preventiva básica
    manutencao_mensal = 125.0

    # Motorização e Combustível
    fuel_str = str(fuel).lower() if fuel else "flex"
    if "elétrico" in fuel_str or "eletrico" in fuel_str:
        consumo_km_unidade = 6.5 # km/kWh
        default_fuel_price = 0.85
        unidade = "kWh"
    elif "híbrido" in fuel_str or "hibrido" in fuel_str:
        consumo_km_unidade = 18.5 # km/L
        default_fuel_price = 5.89
        unidade = "L"
    elif "diesel" in fuel_str:
        consumo_km_unidade = 12.5 # km/L
        default_fuel_price = 6.09
        unidade = "L"
    elif "etanol" in fuel_str or "álcool" in fuel_str:
        consumo_km_unidade = 8.5 # km/L
        default_fuel_price = 3.89
        unidade = "L"
    else: # Gasolina / Flex
        consumo_km_unidade = 11.5 # km/L
        default_fuel_price = 5.89
        unidade = "L"

    used_fuel_price = float(fuel_price) if fuel_price and float(fuel_price) > 0 else default_fuel_price
    safe_km = max(100, int(monthly_km))
    litros_consumidos = safe_km / consumo_km_unidade
    combustivel_mensal = round(litros_consumidos * used_fuel_price, 2)

    total_mensal = round(ipva_mensal + seguro_mensal + manutencao_mensal + combustivel_mensal, 2)
    total_anual = round(total_mensal * 12.0, 2)
    custo_diario = round(total_mensal / 30.0, 2)

    return {
        "price": curr_price,
        "fipe_price": ref_fipe,
        "uf": uf.upper() if uf else "SP",
        "aliquota_ipva": aliquota,
        "monthly_km": safe_km,
        "fuel_type": fuel or "Flex",
        "fuel_unit": unidade,
        "fuel_price": used_fuel_price,
        "breakdown": {
            "ipva_mensal": ipva_mensal,
            "ipva_anual": round(ipva_anual, 2),
            "seguro_mensal": seguro_mensal,
            "seguro_anual": round(seguro_anual, 2),
            "manutencao_mensal": manutencao_mensal,
            "combustivel_mensal": combustivel_mensal,
            "consumo_unidades_mensal": round(litros_consumidos, 1)
        },
        "total_mensal": total_mensal,
        "total_anual": total_anual,
        "custo_diario": custo_diario
    }

