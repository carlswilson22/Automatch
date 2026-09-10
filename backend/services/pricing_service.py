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
