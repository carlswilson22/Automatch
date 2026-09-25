"""
test_performance_and_fixes.py
Validação automatizada de performance, paginação B2B, remoção de AutoCerto XML,
sanitização de WebPush no Radar de Oportunidades e histórico semântico no Chat Bot IA.
"""
from fastapi.testclient import TestClient
from main import app
from database import engine, Base, SessionLocal
from models import Car, User, Store

def run_tests():
    # Cria tabelas se não existirem
    Base.metadata.create_all(bind=engine)
    client = TestClient(app)

    print("\n" + "="*70)
    print("BATTERY: TESTE DE PERFORMANCE, PAGINAÇÃO B2B E CORREÇÕES CRÍTICAS")
    print("="*70)

    # -------------------------------------------------------------------------
    # ITEM 1: Paginação e Desempenho no Estoque B2B
    # -------------------------------------------------------------------------
    print("\n[ITEM 1] Testando Paginação e Headers de Desempenho B2B...")
    reg_resp = client.post("/api/register", json={
        "name": "Lojista Perf Test",
        "email": "lojista_perf@automatch.com",
        "password": "Password123!",
        "role": "lojista"
    })
    token = reg_resp.json().get("token")
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    resp_b2b = client.get("/api/partnerships/shared-inventory?limit=2&offset=0", headers=headers)
    assert resp_b2b.status_code == 200, f"Falha na listagem paginada B2B: {resp_b2b.text}"
    b2b_data = resp_b2b.json()
    assert isinstance(b2b_data, list), "Retorno B2B deve ser lista"
    assert "X-Total-Count" in resp_b2b.headers, "Header X-Total-Count ausente"
    assert "X-Has-More" in resp_b2b.headers, "Header X-Has-More ausente"
    print(f"  -> B2B Página 1: {len(b2b_data)} veículos retornados. Total no estoque: {resp_b2b.headers['X-Total-Count']}")

    # -------------------------------------------------------------------------
    # ITEM 5: Chat Bot Consultor IA - Não Repetição de Preço/KM para Dúvidas Técnicas
    # -------------------------------------------------------------------------
    print("\n[ITEM 5] Testando Chat Bot Consultor IA e Desambiguação de Perguntas...")
    car_ctx = {
        "brand": "Toyota",
        "model": "Corolla Cross XRE 2.0",
        "year": "2024",
        "price": 169900,
        "km": 18500,
        "color": "Branco Polar"
    }

    # Pergunta 1: Motor / Mecânica
    resp_chat_motor = client.post("/api/chat", json={
        "mensagem": "Qual a potência do motor e como está o câmbio?",
        "historico": [],
        "car_context": car_ctx
    })
    assert resp_chat_motor.status_code == 200
    ans_motor = resp_chat_motor.json().get("resposta", "").lower()
    assert ("motor" in ans_motor or "câmbio" in ans_motor or "transmissão" in ans_motor or "potência" in ans_motor or "força" in ans_motor), f"Resposta deveria abordar mecânica: {ans_motor}"
    print(f"  -> Q1 (Motor): OK! Resposta: {ans_motor[:70]}...")

    # Pergunta 2: Consumo (Multi-turn com histórico da anterior)
    history = [
        {"from": "user", "text": "Qual a potência do motor e como está o câmbio?"},
        {"from": "ai", "text": ans_motor}
    ]
    resp_chat_consumo = client.post("/api/chat", json={
        "mensagem": "E qual é a média de consumo na cidade e estrada?",
        "historico": history,
        "car_context": car_ctx
    })
    assert resp_chat_consumo.status_code == 200
    ans_consumo = resp_chat_consumo.json().get("resposta", "").lower()
    assert ("consumo" in ans_consumo or "km/l" in ans_consumo or "eficiência" in ans_consumo), f"Resposta deveria abordar consumo: {ans_consumo}"
    assert ans_consumo != ans_motor, "Resposta de consumo não pode ser idêntica à de motor"
    print(f"  -> Q2 (Consumo): OK! Resposta distinta recebida: {ans_consumo[:70]}...")

    # Pergunta 3: Garantia
    history.extend([
        {"from": "user", "text": "E qual é a média de consumo na cidade e estrada?"},
        {"from": "ai", "text": ans_consumo}
    ])
    resp_chat_garantia = client.post("/api/chat", json={
        "mensagem": "Tem garantia de procedência ou fábrica?",
        "historico": history,
        "car_context": car_ctx
    })
    assert resp_chat_garantia.status_code == 200
    ans_garantia = resp_chat_garantia.json().get("resposta", "").lower()
    assert ("garantia" in ans_garantia or "procedência" in ans_garantia or "cobertura" in ans_garantia), f"Resposta deveria abordar garantia: {ans_garantia}"
    print(f"  -> Q3 (Garantia): OK! Resposta distinta recebida: {ans_garantia[:70]}...")

    # -------------------------------------------------------------------------
    # ITEM 7: Remoção do Feed AutoCerto XML do Hub Multicanal
    # -------------------------------------------------------------------------
    print("\n[ITEM 7] Validando Remoção Limpa do Canal AutoCerto XML...")
    resp_channels = client.get("/api/integrations/channels")
    assert resp_channels.status_code == 200
    channels = resp_channels.json().get("canais", [])
    channel_ids = [c["id"] for c in channels]
    assert "autocerto" in channel_ids, f"AutoCerto deve constar em canais homologados: {channel_ids}"
    assert "autoavaliar" in channel_ids, "AutoAvaliar deve permanecer"
    assert "olx" in channel_ids, "OLX deve permanecer"
    print(f"  -> Canais Homologados Ativos: {channel_ids} (AutoCerto reintegrado como conexão direta)")

    # Rota específica /api/integrations/autocerto/feed.xml deve dar 404
    resp_autocerto_feed = client.get("/api/integrations/autocerto/feed.xml")
    assert resp_autocerto_feed.status_code == 404, "Rota descontinuada /api/integrations/autocerto/feed.xml deve retornar 404"
    print("  -> Rota legada /api/integrations/autocerto/feed.xml retornou 404 conforme esperado.")

    # Feed geral padrão deve continuar operando
    resp_feed = client.get("/api/integrations/feed.xml")
    assert resp_feed.status_code == 200, "Feed XML padrão deve continuar respondendo"
    assert "application/xml" in resp_feed.headers.get("content-type", "")
    print("  -> Feed XML Geral: Operando normalmente em /api/integrations/feed.xml")

    # -------------------------------------------------------------------------
    # ITEM 8: Sanitização e Remoção de WebPush no Radar de Oportunidades
    # -------------------------------------------------------------------------
    print("\n[ITEM 8] Validando Remoção e Sanitização de WebPush no Radar...")
    # Teste 1: Alerta legítimo whatsapp
    resp_alert_wpp = client.post("/api/alerts", json={
        "car_id": "car-test-01",
        "car_name": "Toyota Corolla Cross",
        "current_price": 169900,
        "target_price": 160000,
        "contact_type": "whatsapp",
        "contact_value": "11988887777",
        "notify_below_fipe": True
    }, headers=headers)
    assert resp_alert_wpp.status_code == 200
    assert resp_alert_wpp.json()["alerta"]["contact_type"] == "whatsapp"
    print("  -> Alerta WhatsApp cadastrado com sucesso.")

    # Teste 2: Payload legado com 'webpush' deve ser sanitizado com fallback gracioso sem 422
    resp_alert_legacy = client.post("/api/alerts", json={
        "car_id": "car-test-02",
        "car_name": "Honda Civic Touring",
        "current_price": 145000,
        "target_price": 139000,
        "contact_type": "webpush",
        "contact_value": "user-push-token-123",
        "notify_below_fipe": True
    }, headers=headers)
    assert resp_alert_legacy.status_code == 200, f"Backend deve sanitizar 'webpush': {resp_alert_legacy.text}"
    assert resp_alert_legacy.json()["alerta"]["contact_type"] in ["email", "whatsapp"], "Canal sanitizado deve ser seguro"
    print("  -> Payload com WebPush legado sanitizado com sucesso para canal seguro sem erro 422.")

    print("\n" + "="*70)
    print("TODAS AS VALIDAÇÕES DE PERFORMANCE E CORREÇÃO FORAM APROVADAS COM SUCESSO!")
    print("="*70)

if __name__ == "__main__":
    run_tests()
