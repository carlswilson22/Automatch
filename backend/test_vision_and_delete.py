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

    # -------------------------------------------------------------------------
    # TESTE 5: Diagnóstico Acústico do Motor por IA (POST /api/analise-acustica)
    # -------------------------------------------------------------------------
    print("\n[TESTE 5] Diagnóstico Acústico do Motor por IA (Automatch Engine Sound)...")
    resp5 = client.post("/api/analise-acustica", json={
        "car_context": {
            "km": 42000,
            "specs": {
                "motor": "2.0 TSI Turbo",
                "combustivel": "Gasolina"
            }
        }
    })
    assert resp5.status_code == 200, f"Falha na rota acústica: {resp5.text}"
    data5 = resp5.json()
    print(f"Score do Motor: {data5.get('score_motor')}% | Status: {data5.get('status_geral')}")
    print(f"Laudo Acústico: {data5.get('laudo_resumo')}")
    assert data5.get("status") == "success"
    assert data5.get("score_motor") >= 90
    assert len(data5.get("itens_checados")) >= 4
    assert len(data5.get("waveform_data")) > 0
    print("✅ TESTE 5 PASSOU COM SUCESSO!")

    # -------------------------------------------------------------------------
    # TESTE 6: Scanner IA de Desgaste de Pneus (POST /api/analise-pneus)
    # -------------------------------------------------------------------------
    print("\n[TESTE 6] Scanner IA de Desgaste de Pneus (Tread Depth Scanner)...")
    resp6 = client.post("/api/analise-pneus", json={
        "posicao_roda": "dianteiro_esquerdo",
        "car_context": {"km": 42000}
    })
    assert resp6.status_code == 200, f"Falha na rota de pneus: {resp6.text}"
    data6 = resp6.json()
    print(f"Posição: {data6.get('posicao_label')} | Sulco: {data6.get('profundidade_mm')}mm | CONTRAN: {data6.get('aprovado_contran')}")
    assert data6.get("status") == "success"
    assert data6.get("profundidade_mm") >= 1.6
    assert data6.get("aprovado_contran") is True
    assert data6.get("km_estimado_restante") > 0
    print("✅ TESTE 6 PASSOU COM SUCESSO!")

    # -------------------------------------------------------------------------
    # TESTE 7: Perícia 360° do Veículo (POST /api/analise-360)
    # -------------------------------------------------------------------------
    print("\n[TESTE 7] Perícia 360° Interativa do Veículo...")
    resp7 = client.post("/api/analise-360", json={
        "car_context": {"km": 42000},
        "preexisting_damages": [
            {"id": 1, "x": 35.0, "y": 55.0, "type": "arranhão", "description": "Arranhão lateral"}
        ]
    })
    assert resp7.status_code == 200, f"Falha na rota 360: {resp7.text}"
    data7 = resp7.json()
    print(f"Total Ângulos Mapeados: {data7.get('total_angulos')} | Score 360: {data7.get('score_geral_360')}%")
    assert data7.get("status") == "success"
    assert data7.get("total_angulos") == 8
    assert len(data7.get("hotspots_360")) == 1
    print("✅ TESTE 7 PASSOU COM SUCESSO!")

    # -------------------------------------------------------------------------
    # TESTE 8: Simulador 'Troca com Troco' (POST /api/troca-com-troco)
    # -------------------------------------------------------------------------
    print("\n[TESTE 8] Simulador Instantâneo 'Troca com Troco'...")
    # Caso A: Saldo a Financiar (carro de entrada de menor valor)
    resp8a = client.post("/api/troca-com-troco", json={
        "target_price": 140000.0,
        "tradein_brand": "Volkswagen",
        "tradein_model": "Polo 1.0 TSI",
        "tradein_year": 2020,
        "tradein_km": 40000,
        "tradein_fipe": 78000.0
    })
    assert resp8a.status_code == 200, f"Falha na rota troca-com-troco: {resp8a.text}"
    data8a = resp8a.json()
    print(f"Tipo: {data8a.get('tipo_operacao')} | Avaliação: R$ {data8a['veiculo_entrada']['valor_avaliacao']} | Saldo a Financiar: R$ {data8a.get('saldo_financiar')}")
    assert data8a.get("tipo_operacao") == "saldo_a_financiar"
    assert len(data8a.get("bancos")) >= 3

    # Caso B: Troco a Receber (carro de entrada de maior valor)
    resp8b = client.post("/api/troca-com-troco", json={
        "target_price": 60000.0,
        "tradein_brand": "BMW",
        "tradein_model": "320i M Sport",
        "tradein_year": 2022,
        "tradein_km": 20000,
        "tradein_fipe": 240000.0
    })
    assert resp8b.status_code == 200
    data8b = resp8b.json()
    print(f"Tipo: {data8b.get('tipo_operacao')} | Troco via Pix: R$ {data8b.get('troco_pix')}")
    assert data8b.get("tipo_operacao") == "troco_a_receber"
    assert data8b.get("troco_pix") > 0
    print("✅ TESTE 8 PASSOU COM SUCESSO!")

    # -------------------------------------------------------------------------
    # TESTE 9: Radar de Oportunidades & Alerta de Preço (POST /api/alerts)
    # -------------------------------------------------------------------------
    print("\n[TESTE 9] Radar de Oportunidades & Alertas de Preço...")
    resp9 = client.post("/api/alerts", json={
        "car_id": "1",
        "car_name": "Golf GTI 2021",
        "current_price": 142000.0,
        "target_price": 135000.0,
        "contact_type": "whatsapp",
        "contact_value": "(11) 99999-8888"
    })
    assert resp9.status_code == 200, f"Falha ao criar alerta: {resp9.text}"
    data9 = resp9.json()
    print(f"Alerta ID: {data9.get('alerta_id')} | Msg: {data9.get('mensagem')}")
    assert data9.get("status") == "success"

    resp9_list = client.get("/api/alerts")
    assert resp9_list.status_code == 200
    assert resp9_list.json().get("total_alertas") >= 1
    print("✅ TESTE 9 PASSOU COM SUCESSO!")

    # -------------------------------------------------------------------------
    # TESTE 10: Sincronizador Multicanal B2B (Webmotors, OLX, AutoCerto)
    # -------------------------------------------------------------------------
    print("\n[TESTE 10] Sincronizador Multicanal B2B (Webmotors, OLX, AutoCerto)...")
    resp10_ch = client.get("/api/integrations/channels")
    assert resp10_ch.status_code == 200, f"Falha ao listar canais: {resp10_ch.text}"
    data10_ch = resp10_ch.json()
    print(f"Canais Disponíveis: {data10_ch.get('total_canais')} parceiros integrados")
    assert data10_ch.get("total_canais") == 3, f"Esperado 3 canais, obtido {data10_ch.get('total_canais')}"
    
    # Valida presença do AutoCerto, Webmotors e OLX
    nomes_canais = [c["id"] for c in data10_ch.get("canais", [])]
    assert "autocerto" in nomes_canais, "AutoCerto deve estar presente nos canais integrados"
    assert "webmotors" in nomes_canais, "Webmotors deve estar presente nos canais integrados"
    assert "olx" in nomes_canais, "OLX deve estar presente nos canais integrados"

    resp10_sync = client.post("/api/integrations/sync", json={
        "car_id": "1",
        "car_name": "Golf GTI 2.0 TSI",
        "channels": ["webmotors", "olx", "autocerto"]
    })
    assert resp10_sync.status_code == 200, f"Falha na sincronização multicanal: {resp10_sync.text}"
    data10_sync = resp10_sync.json()
    print(f"Protocolo: {data10_sync.get('protocolo')} | Sincronizados: {data10_sync.get('total_sincronizados')} canais")
    assert data10_sync.get("status") == "success"
    assert data10_sync.get("total_sincronizados") == 3
    print("✅ TESTE 10 PASSOU COM SUCESSO!")

    print("\n" + "=" * 70)
    print("🎉 TODOS OS 10 TESTES FORAM CONCLUÍDOS COM 100% DE SUCESSO!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()


