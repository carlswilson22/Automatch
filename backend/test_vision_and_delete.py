"""
Script de Testes Automatizados da Perícia Visual IA e Exclusão de Anúncios Automatch.
Pode ser executado diretamente ou dentro do container Docker do backend.
"""
import sys
import os
import json
import base64
from fastapi.testclient import TestClient

# Garante que o diretório atual está no sys.path
sys.path.insert(0, os.path.dirname(__file__))

from main import app
from database import SessionLocal, engine
import models

client = TestClient(app)

def run_tests():
    print("=" * 70)
    print("🚀 INICIANDO TESTES DA IA DE PERÍCIA VISUAL E EXCLUSÃO DE ANÚNCIOS")
    print("=" * 70)

    # -------------------------------------------------------------------------
    # TESTE 1: Perícia Visual com Foto de Veículo (/images/FotoGolfGTI.jpeg)
    # -------------------------------------------------------------------------
    print("\n[TESTE 1] Perícia Visual IA com Foto Local do Anúncio...")
    resp = client.post("/api/analise-visual", json={
        "imageUrl": "/images/FotoGolfGTI.jpeg",
        "car_context": {
            "brand": "Volkswagen",
            "model": "Golf GTI",
            "year": 2022,
            "color": "Branco"
        }
    })
    print(f"Status Code: {resp.status_code}")
    assert resp.status_code == 200, f"Esperado 200, obtido {resp.status_code}: {resp.text}"
    data = resp.json()
    print("Resposta recebida da IA:")
    print(json.dumps(data, indent=2, ensure_ascii=False))

    assert data.get("status") == "success", "Status da resposta deve ser success"
    assert "resposta" in data and len(data["resposta"]) > 10, "Deve conter laudo pericial"
    assert "score_lataria" in data, "Deve conter score_lataria"
    assert "condicao_geral" in data, "Deve conter condicao_geral"
    assert "pontos_avaria" in data, "Deve conter lista de pontos_avaria"
    print("✅ TESTE 1 PASSOU COM SUCESSO!")

    # -------------------------------------------------------------------------
    # TESTE 2: Perícia Visual com Imagem em Base64
    # -------------------------------------------------------------------------
    print("\n[TESTE 2] Perícia Visual IA com Imagem em Base64...")
    # Cria uma imagem de teste 200x200 JPEG em memória
    from PIL import Image
    import io
    test_img = Image.new("RGB", (300, 200), color=(180, 20, 30))
    buf = io.BytesIO()
    test_img.save(buf, format="JPEG")
    b64_str = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

    resp2 = client.post("/api/analise-visual", json={
        "imageUrl": b64_str,
        "car_context": {
            "brand": "Fiat",
            "model": "Pulse",
            "year": 2024,
            "color": "Vermelho"
        }
    })
    print(f"Status Code: {resp2.status_code}")
    assert resp2.status_code == 200, f"Esperado 200, obtido {resp2.status_code}: {resp2.text}"
    data2 = resp2.json()
    assert data2.get("status") == "success"
    print(f"Laudo gerado: {data2.get('resposta')}")
    print(f"Score da lataria: {data2.get('score_lataria')}%")
    print("✅ TESTE 2 PASSOU COM SUCESSO!")

    # -------------------------------------------------------------------------
    # TESTE 3: Perícia Visual com Detecção de Avarias Pré-Registradas
    # -------------------------------------------------------------------------
    print("\n[TESTE 3] Perícia Visual IA com Detecção de Avarias Estruturais...")
    resp3 = client.post("/api/analise-visual", json={
        "imageUrl": "/images/FotoPoloTSI.jpg",
        "car_context": {
            "brand": "Volkswagen",
            "model": "Polo TSI",
            "year": 2023,
            "damages": ["Arranhão na lateral traseira", "Pequeno amassado no para-choque"]
        }
    })
    assert resp3.status_code == 200
    data3 = resp3.json()
    print("Pontos de Avaria Detectados:")
    print(json.dumps(data3.get("pontos_avaria"), indent=2, ensure_ascii=False))
    assert data3.get("tem_avarias") is True, "Deve identificar tem_avarias = True"
    assert len(data3.get("pontos_avaria")) >= 2, "Deve retornar pelo menos 2 pontos de avaria"
    print("✅ TESTE 3 PASSOU COM SUCESSO!")

    # -------------------------------------------------------------------------
    # TESTE 4: Funcionalidade de Excluir Anúncio (DELETE /api/cars/{id})
    # -------------------------------------------------------------------------
    print("\n[TESTE 4] Funcionalidade de Criar e Excluir Anúncio...")
    # 1. Cria um anúncio de teste
    create_resp = client.post("/api/cars", json={
        "brand": "Ford",
        "model": "Mustang GT Teste Exclusão",
        "year": 2024,
        "km": 1500,
        "price": 450000.0,
        "image": "/images/FotoGolfGTI.jpeg",
        "color": "Azul",
        "store_id": 1,
        "transmission": "Automático",
        "description": "Carro para teste de exclusão.",
        "location": "São Paulo, SP"
    })
    print(f"Criação Status Code: {create_resp.status_code}")
    assert create_resp.status_code == 200, f"Falha ao criar carro de teste: {create_resp.text}"
    created_car = create_resp.json()
    car_id = created_car["id"]
    print(f"Veículo de teste criado com ID: {car_id}")

    # 2. Confirma que existe no catálogo
    get_resp = client.get(f"/api/cars/{car_id}")
    assert get_resp.status_code == 200, "Veículo deve existir antes da exclusão"

    # 3. Executa exclusão (DELETE /api/cars/{id})
    del_resp = client.delete(f"/api/cars/{car_id}")
    print(f"Exclusão Status Code: {del_resp.status_code}")
    assert del_resp.status_code == 200, f"Falha na exclusão: {del_resp.text}"
    del_data = del_resp.json()
    print(f"Resposta da exclusão: {del_data}")
    assert del_data.get("status") == "success"

    # 4. Confirma que não existe mais no catálogo (404)
    check_resp = client.get(f"/api/cars/{car_id}")
    assert check_resp.status_code == 404, f"Veículo ainda existe após exclusão! Status: {check_resp.status_code}"
    print(f"Veículo com ID {car_id} confirmado como excluído (404 Not Found)!")
    print("✅ TESTE 4 PASSOU COM SUCESSO!")

    print("\n" + "=" * 70)
    print("🎉 TODOS OS TESTES FORAM CONCLUÍDOS COM 100% DE SUCESSO!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
