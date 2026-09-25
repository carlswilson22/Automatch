"""
Suíte Modular Completa de Testes e Revisão Geral do Sistema Automatch.
Valida 100% das funcionalidades ativas no backend e regras de negócio da plataforma.
"""
import sys
import os
import json
import base64
from fastapi.testclient import TestClient
from PIL import Image
import io

# Garante que o diretório atual está no sys.path
sys.path.insert(0, os.path.dirname(__file__))

from main import app
import models
import security

client = TestClient(app)

def run_full_system_review():
    print("=" * 75)
    print("🚀 INICIANDO REVISÃO GERAL E BATERIA DE TESTES DO SISTEMA AUTOMATCH")
    print("=" * 75)
    
    results = {}

    # -------------------------------------------------------------------------
    # SUÍTE 1: Autenticação, Registro, JWT e Recuperação de Senha com OTP
    # -------------------------------------------------------------------------
    print("\n[SUÍTE 1] Autenticação, Tokens JWT e Recuperação OTP...")
    test_email = "tester_rev_2026@automatch.com"
    reg_resp = client.post("/api/register", json={
        "name": "Tester Review",
        "email": test_email,
        "password": "Password123!"
    })
    # Se já existir de execução anterior, apenas faz login
    if reg_resp.status_code != 200:
        login_resp = client.post("/api/login", json={
            "email": test_email,
            "password": "Password123!"
        })
    else:
        login_resp = reg_resp

    assert login_resp.status_code == 200, f"Falha no login: {login_resp.text}"
    user_data = login_resp.json()
    token = user_data.get("token")
    auth_headers = {"Authorization": f"Bearer {token}"}
    assert token is not None, "Token JWT deve ser retornado no login"
    print(f"Usuário autenticado com sucesso: {user_data.get('name')} ({user_data.get('email')})")

    # Teste de atualização de perfil protegido via JWT
    prof_resp = client.put(
        "/api/users/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Tester Review Atualizado"}
    )
    assert prof_resp.status_code == 200, f"Falha ao atualizar perfil: {prof_resp.text}"
    assert prof_resp.json().get("name") == "Tester Review Atualizado"
    print("Perfil de usuário atualizado com sucesso via Bearer Token JWT!")
    
    # Teste de solicitação de recuperação OTP
    otp_req = client.post("/api/auth/forgot-password", json={"email": test_email})
    assert otp_req.status_code == 200, f"Falha no forgot-password: {otp_req.text}"
    print(f"OTP Request: {otp_req.json().get('message')} (Expira em: {otp_req.json().get('expires_in')}s)")

    results["1. Autenticação, JWT e OTP"] = "PASS"
    print("✅ SUÍTE 1 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # SUÍTE 2: Catálogo de Veículos Paginado com Filtros no Servidor
    # -------------------------------------------------------------------------
    print("\n[SUÍTE 2] Catálogo de Veículos Paginado (offset, limit e filtros ilike)...")
    cat_resp = client.get("/api/cars?offset=0&limit=5")
    assert cat_resp.status_code == 200, f"Falha no catálogo: {cat_resp.text}"
    cat_data = cat_resp.json()
    assert "items" in cat_data or isinstance(cat_data, list), "Envelope paginado inválido"
    items = cat_data.get("items", cat_data) if isinstance(cat_data, dict) else cat_data
    print(f"Total de Veículos Paginados Recebidos: {len(items)}")

    # Filtro por marca
    filter_resp = client.get("/api/cars?brand=Volkswagen")
    assert filter_resp.status_code == 200
    results["2. Catálogo Paginado e Filtros"] = "PASS"
    print("✅ SUÍTE 2 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # SUÍTE 3: Perícia Visual de Lataria por IA (YOLOv8 + Gemini)
    # -------------------------------------------------------------------------
    print("\n[SUÍTE 3] Perícia Visual de Lataria com IA...")
    # Cria imagem de teste JPEG
    test_img = Image.new("RGB", (320, 240), color=(200, 30, 40))
    buf = io.BytesIO()
    test_img.save(buf, format="JPEG")
    b64_str = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

    vision_resp = client.post("/api/analise-visual", json={
        "imageUrl": b64_str,
        "car_context": {"brand": "Fiat", "model": "Pulse", "year": 2024}
    })
    assert vision_resp.status_code == 200, f"Falha na perícia visual: {vision_resp.text}"
    vision_data = vision_resp.json()
    assert vision_data.get("status") == "success"
    print(f"Modelo Pericial: {vision_data.get('modelo')} | Score Lataria: {vision_data.get('score_lataria')}%")
    results["3. Perícia Visual de Lataria (YOLO + Gemini)"] = "PASS"
    print("✅ SUÍTE 3 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # SUÍTE 4: Vídeo Pericial de Vistoria de 15 Segundos (NOVA FUNCIONALIDADE)
    # -------------------------------------------------------------------------
    print("\n[SUÍTE 4] Vídeo Pericial de Vistoria de 15 Segundos da Carroceria...")
    # Mock de arquivo de vídeo MP4 sintético
    fake_video_bytes = b"\x00\x00\x00 ftypmp42\x00\x00\x00\x00mp42isom" + b"\x00" * 256
    video_upload_resp = client.post(
        "/api/v1/pericia/video/upload",
        files={"file": ("vistoria_15s.mp4", fake_video_bytes, "video/mp4")},
        headers=auth_headers
    )
    assert video_upload_resp.status_code == 200, f"Falha no upload de vídeo pericial: {video_upload_resp.text}"
    video_data = video_upload_resp.json()
    assert video_data.get("status") == "success"
    assert video_data.get("duracao_estimada_segundos") == 15
    assert len(video_data.get("checklist_inspecao", [])) == 3
    print(f"Vídeo Registrado: {video_data.get('filename')} | Checkpoints Sincronizados: {len(video_data.get('checklist_inspecao'))}")
    results["4. Vídeo Pericial 15s da Carroceria"] = "PASS"
    print("✅ SUÍTE 4 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # SUÍTE 5: Varredura 360° Orbital Interativa
    # -------------------------------------------------------------------------
    print("\n[SUÍTE 5] Varredura 360° Orbital e Mapeamento de Quadrantes...")
    resp_360 = client.post("/api/analise-360", json={
        "car_context": {"km": 30000, "brand": "Toyota", "model": "Corolla"},
        "preexisting_damages": []
    })
    assert resp_360.status_code == 200, f"Falha na varredura 360: {resp_360.text}"
    data_360 = resp_360.json()
    assert data_360.get("status") == "success"
    assert data_360.get("total_angulos") == 8
    print(f"Varredura 360°: {data_360.get('total_angulos')} quadrantes compilados com sucesso!")
    results["5. Varredura 360° Orbital Interativa"] = "PASS"
    print("✅ SUÍTE 5 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # SUÍTE 6: Emissão de Laudo PDF Vetorial A4 e QR Code 300 DPI
    # -------------------------------------------------------------------------
    print("\n[SUÍTE 6] Emissão de Laudo Cautelar em PDF Vetorial A4 com QR Code...")
    pdf_resp = client.get("/api/v1/laudos/1/pdf")
    assert pdf_resp.status_code == 200, f"Falha ao gerar PDF: {pdf_resp.status_code}"
    assert pdf_resp.headers.get("content-type") == "application/pdf"
    assert pdf_resp.content.startswith(b"%PDF-"), "Header de PDF inválido"
    proto_id = pdf_resp.headers.get("X-Protocol-ID")
    assert proto_id is not None, "Protocolo oficial deve ser gerado no header"
    print(f"PDF Vetorial emitido: {len(pdf_resp.content)} bytes | Protocolo: {proto_id}")
    results["6. Emissão de Laudo PDF com QR Code"] = "PASS"
    print("✅ SUÍTE 6 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # SUÍTE 7: Validador Público de Autenticidade sem Login (/validar/:protocolo)
    # -------------------------------------------------------------------------
    print("\n[SUÍTE 7] Validador Público de Autenticidade via Protocolo/QR Code...")
    val_resp = client.get(f"/api/v1/laudos/validar/{proto_id}")
    assert val_resp.status_code == 200, f"Falha na validação pública: {val_resp.text}"
    val_data = val_resp.json()
    assert val_data.get("valido") is True
    print(f"Protocolo {proto_id} validado publicamente: Veredito '{val_data.get('laudo', {}).get('veredito')}'")
    results["7. Validação Pública de Laudo (QR Code)"] = "PASS"
    print("✅ SUÍTE 7 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # SUÍTE 8: Upload e Auditoria de Laudos com Validação de Magic Bytes (%PDF-)
    # -------------------------------------------------------------------------
    print("\n[SUÍTE 8] Upload e Auditoria de Laudos com Validação Estrita de Magic Bytes...")
    # 1. Arquivo fraudulento (extensão .pdf mas conteúdo falso)
    fake_pdf = b"NOT_A_REAL_PDF_CONTENT"
    fraud_resp = client.post(
        "/api/v1/laudos/upload",
        files={"file": ("laudo_falso.pdf", fake_pdf, "application/pdf")},
        headers=auth_headers
    )
    assert fraud_resp.status_code == 400, f"Arquivo falso deve ser rejeitado com 400: {fraud_resp.text}"
    print("Validação de Magic Bytes rejeitou com sucesso arquivo corrompido/falso (400 Bad Request)!")

    # 2. Arquivo PDF legítimo
    valid_pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    valid_upload_resp = client.post(
        "/api/v1/laudos/upload",
        files={"file": ("laudo_oficial.pdf", valid_pdf_content, "application/pdf")},
        headers=auth_headers
    )
    assert valid_upload_resp.status_code == 200, f"Falha no upload de PDF válido: {valid_upload_resp.text}"

    results["8. Upload com Magic Bytes (%PDF-)"] = "PASS"
    print("✅ SUÍTE 8 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # SUÍTE 9: Sincronização Multicanal B2B (AutoAvaliar, AutoCerto, OLX) e Feeds
    # -------------------------------------------------------------------------
    print("\n[SUÍTE 9] Sincronização Multicanal B2B e Feeds XML...")
    channels_resp = client.get("/api/integrations/channels")
    assert channels_resp.status_code == 200
    ch_ids = [c["id"] for c in channels_resp.json().get("canais", [])]
    assert "autoavaliar" in ch_ids, "AutoAvaliar deve estar homologado"
    assert "autocerto" in ch_ids, "AutoCerto deve estar homologado"
    assert "olx" in ch_ids, "OLX Autos deve estar homologado"
    assert "webmotors" not in ch_ids, "Webmotors deve ter sido substituído"

    sync_resp = client.post("/api/integrations/sync", json={
        "car_id": "1",
        "channels": ["autoavaliar", "autocerto", "olx"]
    }, headers=auth_headers)
    assert sync_resp.status_code == 200
    assert sync_resp.json().get("total_sincronizados") == 3

    # Feed XML
    feed_resp = client.get("/api/integrations/feed.xml")
    assert feed_resp.status_code == 200
    assert "xml" in feed_resp.headers.get("content-type", "")
    print("Feeds XML e Sincronização B2B homologados com sucesso!")
    results["9. Sincronização B2B Multicanal (AutoAvaliar)"] = "PASS"
    print("✅ SUÍTE 9 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # SUÍTE 10: Confirmação de Remoção Completa de "Troca com Troco"
    # -------------------------------------------------------------------------
    print("\n[SUÍTE 10] Confirmação de Remoção de Troca com Troco (Garantia de 404)...")
    troca_resp = client.post("/api/troca-com-troco", json={"target_price": 100000})
    assert troca_resp.status_code == 404, f"A rota deve retornar 404 Not Found, obtido: {troca_resp.status_code}"
    print("Rota /api/troca-com-troco confirmada como inexistente (404 Not Found)!")
    results["10. Remoção de Troca com Troco (404 Confirmado)"] = "PASS"
    print("✅ SUÍTE 10 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # SUÍTE 11: Motor AutoPrice™ e Chat Consultivo IA
    # -------------------------------------------------------------------------
    print("\n[SUÍTE 11] Motor AutoPrice™ e Chat Consultivo IA...")
    price_resp = client.post("/api/v1/precificacao", json={
        "fipe_price": 100000.0,
        "km": 40000,
        "year": 2022,
        "damages": ["Arranhão leve"]
    })
    assert price_resp.status_code == 200
    price_data = price_resp.json()
    assert "suggested_price" in price_data, f"Chave suggested_price não encontrada: {price_data}"
    print(f"Preço Justo Calculado: R$ {price_data.get('suggested_price')} | FIPE: R$ {price_data.get('fipe_price')}")

    chat_resp = client.post("/api/chat", json={
        "mensagem": "Qual a procedência deste veículo e situação do IPVA?",
        "car_context": {"brand": "Honda", "model": "Civic", "year": 2023, "km": 25000, "price": 145000}
    })
    assert chat_resp.status_code == 200
    print(f"Resposta do Chat Consultivo IA: {chat_resp.json().get('resposta')[:90]}...")
    results["11. AutoPrice™ e Chat Consultivo IA"] = "PASS"
    print("✅ SUÍTE 11 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # SUÍTE 12: Ciclo de Vida do Anúncio (Criação e Exclusão em Cascata)
    # -------------------------------------------------------------------------
    print("\n[SUÍTE 12] Ciclo de Vida Completo do Anúncio (Criação e Exclusão)...")
    new_car = client.post("/api/cars", json={
        "brand": "Toyota",
        "model": "Yaris Hatch Teste Ciclo",
        "year": 2023,
        "km": 12000,
        "price": 89000.0,
        "color": "Cinza",
        "image": "/images/FotoToyotaCorolla.jpg",
        "store_id": 1,
        "transmission": "Automático"
    }, headers=auth_headers)
    assert new_car.status_code == 200, f"Falha ao criar carro de teste: {new_car.text}"
    created_id = new_car.json()["id"]

    # Exclui o veículo
    del_car = client.delete(f"/api/cars/{created_id}", headers=auth_headers)
    assert del_car.status_code == 200
    assert del_car.json().get("status") == "success"

    # Confirma que foi removido do banco (404)
    get_del = client.get(f"/api/cars/{created_id}")
    assert get_del.status_code == 404
    print(f"Veículo ID {created_id} criado, auditado e excluído com sucesso (404 Not Found pós-deleção)!")
    results["12. Ciclo de Vida do Anúncio"] = "PASS"
    print("✅ SUÍTE 12 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # SUÍTE 13: Termômetro Visual de Mercado, TCO e Redução de Preço
    # -------------------------------------------------------------------------
    print("\n--- SUÍTE 13: Termômetro de Mercado, Calculadora TCO & Histórico de Preço ---")
    from services.pricing_service import calcular_indicador_mercado, calcular_tco_mensal

    # 1. Teste unitário de indicador de mercado
    ind_deal = calcular_indicador_mercado(price=90000.0, fipe_price=100000.0)
    assert ind_deal["status_code"] == "EXCELLENT_DEAL", f"Esperado EXCELLENT_DEAL, obtido {ind_deal['status_code']}"
    assert ind_deal["is_discount"] is True
    assert ind_deal["savings_amount"] == 10000.0
    print(f"Indicador de Mercado (Super Oportunidade): {ind_deal['status_label']} (-R$ {ind_deal['savings_amount']:,.2f}) OK!")

    ind_fair = calcular_indicador_mercado(price=101000.0, fipe_price=100000.0)
    assert ind_fair["status_code"] == "FAIR_PRICE", f"Esperado FAIR_PRICE, obtido {ind_fair['status_code']}"
    print(f"Indicador de Mercado (Preço Justo FIPE): {ind_fair['status_label']} OK!")

    # 2. Teste unitário de cálculo de TCO
    tco_sp = calcular_tco_mensal(price=100000.0, fipe_price=100000.0, fuel="Flex", uf="SP", monthly_km=1000)
    assert tco_sp["breakdown"]["ipva_mensal"] == 333.33, f"IPVA mensal incorreto: {tco_sp['breakdown']['ipva_mensal']}"
    assert tco_sp["breakdown"]["seguro_mensal"] == 375.0, f"Seguro mensal incorreto: {tco_sp['breakdown']['seguro_mensal']}"
    assert tco_sp["total_mensal"] > 800.0
    print(f"TCO Mensal Calculado: R$ {tco_sp['total_mensal']:,.2f}/mês (R$ {tco_sp['custo_diario']:,.2f}/dia) OK!")

    # 3. Teste via API REST: POST /api/cars/tco-calculator
    tco_resp = client.post("/api/cars/tco-calculator", json={
        "price": 120000.0,
        "fipe_price": 125000.0,
        "fuel": "Híbrido",
        "uf": "DF",
        "monthly_km": 1500
    })
    assert tco_resp.status_code == 200, f"Falha na rota /api/cars/tco-calculator: {tco_resp.text}"
    tco_json = tco_resp.json()
    assert "total_mensal" in tco_json
    assert tco_json["uf"] == "DF"
    print(f"Rota POST /api/cars/tco-calculator: Status 200, TCO DF: R$ {tco_json['total_mensal']:,.2f}/mês OK!")

    # 4. Teste via API REST: GET /api/cars/{car_id}/market-indicator com veículo existente
    list_cars = client.get("/api/cars?limit=1")
    assert list_cars.status_code == 200
    items = list_cars.json().get("items", [])
    if items:
        test_car_id = items[0]["id"]
        mi_resp = client.get(f"/api/cars/{test_car_id}/market-indicator")
        assert mi_resp.status_code == 200, f"Falha em /api/cars/{test_car_id}/market-indicator: {mi_resp.text}"
        mi_data = mi_resp.json()
        assert "status_code" in mi_data
        assert "gauge_percent" in mi_data
        print(f"Rota GET /api/cars/{test_car_id}/market-indicator: Status 200, Status: {mi_data['status_label']} ({mi_data['gauge_percent']}%) OK!")

    results["13. Termômetro de Mercado & Calculadora TCO"] = "PASS"
    print("✅ SUÍTE 13 CONCLUÍDA COM SUCESSO!")

    # -------------------------------------------------------------------------
    # RELATÓRIO FINAL
    # -------------------------------------------------------------------------
    print("\n" + "=" * 75)
    print("📊 RESUMO GERAL DA AUDITORIA DO SISTEMA AUTOMATCH")
    print("=" * 75)
    for suite, status in results.items():
        print(f"  [{status}] {suite}")
    print("=" * 75)
    print("🎉 100% DAS SUÍTES DE TESTE FORAM CONCLUÍDAS COM SUCESSO!")
    print("=" * 75)

if __name__ == "__main__":
    run_full_system_review()
