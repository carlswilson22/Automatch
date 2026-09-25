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
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        import security
        if not db.query(models.User).filter(models.User.id == "user-1").first():
            u = models.User(
                id="user-1",
                name="Admin",
                email="admin@automatch.com",
                hashed_password=security.hash_password("admin123"),
                role="admin",
                sub_role="owner",
                store_id=1
            )
            db.add(u)
        if not db.query(models.Car).filter(models.Car.id == "1").first():
            c = models.Car(
                id="1",
                brand="Toyota",
                model="Corolla Altis",
                year=2023,
                km=15000,
                price=140000.0,
                image="/images/FotoToyotaCorolla.jpeg",
                store_id=1,
                user_id="user-1"
            )
            db.add(c)
        db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()

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
    import security
    auth_token = security.create_access_token(data={"sub": "user-1"})
    auth_headers = {"Authorization": f"Bearer {auth_token}"}

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
    }, headers=auth_headers)
    print(f"Criação Status Code: {create_resp.status_code}")
    assert create_resp.status_code == 200, f"Falha ao criar carro de teste: {create_resp.text}"
    created_car = create_resp.json()
    car_id = created_car["id"]
    print(f"Veículo de teste criado com ID: {car_id}")

    # 2. Confirma que existe no catálogo
    get_resp = client.get(f"/api/cars/{car_id}")
    assert get_resp.status_code == 200, "Veículo deve existir antes da exclusão"

    # 3. Executa exclusão (DELETE /api/cars/{id})
    del_resp = client.delete(f"/api/cars/{car_id}", headers=auth_headers)
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
    # TESTE 5: Vídeo Pericial de Vistoria de 15 Segundos (POST /api/v1/pericia/video/upload)
    # -------------------------------------------------------------------------
    print("\n[TESTE 5] Vídeo Pericial de Vistoria de 15 Segundos da Carroceria...")
    fake_video_bytes = b"\x00\x00\x00 ftypmp42\x00\x00\x00\x00mp42isom" + b"\x00" * 256
    resp5 = client.post(
        "/api/v1/pericia/video/upload",
        files={"file": ("vistoria_15s.mp4", fake_video_bytes, "video/mp4")},
        headers=auth_headers
    )
    assert resp5.status_code == 200, f"Falha no upload de vídeo pericial: {resp5.text}"
    data5 = resp5.json()
    print(f"Vídeo Gerado: {data5.get('filename')} | Duração Estimada: {data5.get('duracao_estimada_segundos')}s")
    assert data5.get("status") == "success"
    assert data5.get("duracao_estimada_segundos") == 15
    assert len(data5.get("checklist_inspecao", [])) == 3
    print("✅ TESTE 5 PASSOU COM SUCESSO!")

    # -------------------------------------------------------------------------
    # TESTE 6: Motor AutoPrice™ e Chat Consultivo IA (POST /api/v1/precificacao e /api/chat)
    # -------------------------------------------------------------------------
    print("\n[TESTE 6] Motor AutoPrice™ e Chat Consultivo IA...")
    resp6_price = client.post("/api/v1/precificacao", json={
        "fipe_price": 142000.0,
        "km": 42000,
        "year": 2022,
        "damages": ["Pequeno arranhão"]
    })
    assert resp6_price.status_code == 200, f"Falha na precificação: {resp6_price.text}"
    data6_price = resp6_price.json()
    assert "suggested_price" in data6_price
    print(f"Preço Justo Sugerido: R$ {data6_price.get('suggested_price')}")

    resp6_chat = client.post("/api/chat", json={
        "mensagem": "Qual a procedência e histórico deste carro?",
        "car_context": {"brand": "Volkswagen", "model": "Golf GTI", "year": 2022, "km": 42000, "price": 142000}
    })
    assert resp6_chat.status_code == 200, f"Falha no chat: {resp6_chat.text}"
    print(f"Chat IA Consultivo: {resp6_chat.json().get('resposta')[:80]}...")
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
    # TESTE 8: Emissão de Dossiê Oficial em PDF Vetorial com QR Code (GET /api/v1/laudos/{car_id}/pdf)
    # -------------------------------------------------------------------------
    print("\n[TESTE 8] Geração e Validação de Dossiê Cautelar em PDF Vetorial A4...")
    resp8 = client.get("/api/v1/laudos/1/pdf")
    assert resp8.status_code == 200, f"Falha na emissão de laudo PDF: {resp8.status_code}"
    assert resp8.headers.get("content-type") == "application/pdf"
    assert resp8.content.startswith(b"%PDF-"), "O arquivo gerado deve ser um PDF vetorial válido"
    print(f"Dossiê gerado com sucesso: {len(resp8.content)} bytes | Protocolo: {resp8.headers.get('X-Protocol-ID')}")

    # Validação do endpoint público do QR Code
    proto = resp8.headers.get("X-Protocol-ID", "ATM-2026-ABCD")
    resp8_val = client.get(f"/api/v1/laudos/validar/{proto}")
    assert resp8_val.status_code == 200, f"Falha na validação do protocolo {proto}"
    assert resp8_val.json().get("valido") is True
    print(f"Protocolo {proto} validado como autêntico via QR Code endpoint.")
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
    }, headers=auth_headers)
    assert resp9.status_code == 200, f"Falha ao criar alerta: {resp9.text}"
    data9 = resp9.json()
    print(f"Alerta ID: {data9.get('alerta_id')} | Msg: {data9.get('mensagem')}")
    assert data9.get("status") == "success"

    resp9_list = client.get("/api/alerts", headers=auth_headers)
    assert resp9_list.status_code == 200
    assert resp9_list.json().get("total_alertas") >= 1
    print("✅ TESTE 9 PASSOU COM SUCESSO!")

    # -------------------------------------------------------------------------
    # TESTE 10: Sincronizador Multicanal B2B (AutoAvaliar, OLX)
    # -------------------------------------------------------------------------
    print("\n[TESTE 10] Sincronizador Multicanal B2B (AutoAvaliar, OLX)...")
    resp10_ch = client.get("/api/integrations/channels")
    assert resp10_ch.status_code == 200, f"Falha ao listar canais: {resp10_ch.text}"
    data10_ch = resp10_ch.json()
    print(f"Canais Disponíveis: {data10_ch.get('total_canais')} parceiros integrados")
    assert data10_ch.get("total_canais") == 2, f"Esperado 2 canais, obtido {data10_ch.get('total_canais')}"
    
    # Valida presença do AutoAvaliar e OLX (AutoCerto removido conforme especificação)
    nomes_canais = [c["id"] for c in data10_ch.get("canais", [])]
    assert "autoavaliar" in nomes_canais, "AutoAvaliar deve estar presente nos canais integrados"
    assert "olx" in nomes_canais, "OLX deve estar presente nos canais integrados"

    resp10_sync = client.post("/api/integrations/sync", json={
        "car_id": "1",
        "car_name": "Golf GTI 2.0 TSI",
        "channels": ["autoavaliar", "olx"]
    }, headers=auth_headers)
    assert resp10_sync.status_code == 200, f"Falha na sincronização multicanal: {resp10_sync.text}"
    data10_sync = resp10_sync.json()
    print(f"Protocolo: {data10_sync.get('protocolo')} | Sincronizados: {data10_sync.get('total_sincronizados')} canais")
    assert data10_sync.get("status") == "success"
    assert data10_sync.get("total_sincronizados") == 2
    print("✅ TESTE 10 PASSOU COM SUCESSO!")

    print("\n" + "=" * 70)
    print("🎉 TODOS OS 10 TESTES FORAM CONCLUÍDOS COM 100% DE SUCESSO!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()


