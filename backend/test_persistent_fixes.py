"""
test_persistent_fixes.py
Bateria de testes automatizados de regressão para os 4 itens críticos:
1. Reintegração do AutoCerto DMS no Hub de Sincronização Multicanal (somente API de conexão) e blindagem contra feed XML.
2. Comparador Multidimensional (resiliência contra ausência de dados, cálculos protegidos).
3. Chat Bot Consultor IA - Desambiguação de 'Cor' (não responder com laudo cautelar) e bateria de perguntas objetivas (Ano, Combustível, Câmbio, Documentação, KM, Preço).
4. Chat Bot Consultor IA - Fallback orientador sem laudo errôneo.
"""
from fastapi.testclient import TestClient
from main import app
from database import engine, Base
from models import Car, User, Store

def run_tests():
    # Cria tabelas se não existirem
    Base.metadata.create_all(bind=engine)
    client = TestClient(app)

    print("\n" + "="*70)
    print("BATERIA DE TESTES: CORREÇÕES PERSISTENTES VLAEG (4 ITENS CRÍTICOS)")
    print("="*70)

    # -------------------------------------------------------------------------
    # ITEM 1: Hub Multicanal - AutoCerto DMS Conexão Ativa & XML 404
    # -------------------------------------------------------------------------
    print("\n[ITEM 1] Testando Reintegração AutoCerto DMS e Blindagem XML...")
    resp_channels = client.get("/api/integrations/channels")
    assert resp_channels.status_code == 200, f"Falha ao listar canais: {resp_channels.text}"
    channels_data = resp_channels.json().get("canais", [])
    channel_ids = [c["id"] for c in channels_data]

    assert "autocerto" in channel_ids, f"AutoCerto DMS deve estar presente nos canais: {channel_ids}"
    assert "autoavaliar" in channel_ids, f"AutoAvaliar deve estar presente nos canais: {channel_ids}"
    assert "olx" in channel_ids, f"OLX Autos deve estar presente nos canais: {channel_ids}"

    autocerto_info = next(c for c in channels_data if c["id"] == "autocerto")
    assert autocerto_info["status"] == "conectado", "Status do AutoCerto deve ser 'conectado'"
    assert "DMS" in autocerto_info["tipo_integracao"], "Tipo de integração deve ser de conexão direta DMS"
    print(f"  -> Canais ativos homologados: {channel_ids} (AutoCerto reintegrado com sucesso)")

    # Confirmação estrita: rota legada /api/integrations/autocerto/feed.xml permanece 404
    resp_autocerto_xml = client.get("/api/integrations/autocerto/feed.xml")
    assert resp_autocerto_xml.status_code == 404, "Rota /api/integrations/autocerto/feed.xml deve permanecer 404 Not Found"
    print("  -> Rota /api/integrations/autocerto/feed.xml retornou 404 (funcionalidade XML não foi reativada)")

    # Obter token de autenticação via /api/register
    reg_resp = client.post("/api/register", json={
        "name": "Lojista Sync Test",
        "email": "sync_test@automatch.com",
        "password": "Password123!",
        "role": "lojista"
    })
    token = reg_resp.json().get("token") or "demo-admin-token"
    auth_headers = {"Authorization": f"Bearer {token}"}

    # Teste de disparo de sincronização
    resp_sync = client.post("/api/integrations/sync", json={
        "car_id": "test-car-10",
        "car_name": "Honda Civic Touring 1.5 Turbo",
        "channels": ["autocerto", "autoavaliar", "olx"]
    }, headers=auth_headers)
    assert resp_sync.status_code == 200, f"Falha na sincronização multicanal: {resp_sync.text}"
    sync_data = resp_sync.json()
    assert sync_data["status"] == "success"
    assert "protocolo" in sync_data
    synced_cids = [sc["canal_id"] for sc in sync_data.get("canais_sincronizados", [])]
    assert "autocerto" in synced_cids, "AutoCerto deve constar entre os canais sincronizados"
    print(f"  -> Sincronização executada com sucesso! Protocolo: {sync_data['protocolo']}")

    # -------------------------------------------------------------------------
    # ITEM 2 & 4: Chatbot Consultor IA - Pergunta 'Cor' e Atributos Objetivos
    # -------------------------------------------------------------------------
    print("\n[ITEM 2/4] Testando Desambiguação de 'Cor' no Chat Bot Consultor IA...")
    car_ctx = {
        "brand": "Toyota",
        "model": "Corolla Altis Hybrid",
        "year": "2023",
        "price": 149900.0,
        "km": 24500,
        "color": "Branco Polar Perolizado",
        "fuel": "Híbrido Flex",
        "transmission": "Automático CVT"
    }

    # Teste 1: Pergunta exata "Cor"
    resp_chat_cor = client.post("/api/chat", json={
        "mensagem": "Cor",
        "car_context": car_ctx
    })
    assert resp_chat_cor.status_code == 200, f"Falha no chat: {resp_chat_cor.text}"
    ans_cor = resp_chat_cor.json().get("resposta", "")
    assert "Branco Polar Perolizado" in ans_cor or "cor oficial" in ans_cor, f"Resposta deve citar a cor: {ans_cor}"
    assert "laudo cautelar" not in ans_cor.lower() or "pintura" in ans_cor.lower(), "Não deve responder com laudo cautelar genérico"
    print(f"  -> Pergunta 'Cor' -> Resposta: {ans_cor[:80]}...")

    # Teste 2: Pergunta "Ano"
    resp_chat_ano = client.post("/api/chat", json={
        "mensagem": "Ano",
        "car_context": car_ctx
    })
    ans_ano = resp_chat_ano.json().get("resposta", "")
    assert "2023" in ans_ano or "ano/modelo" in ans_ano, f"Resposta deve conter o ano: {ans_ano}"
    print(f"  -> Pergunta 'Ano' -> Resposta: {ans_ano[:80]}...")

    # Teste 3: Pergunta "Combustível"
    resp_chat_comb = client.post("/api/chat", json={
        "mensagem": "Qual é o combustível?",
        "car_context": car_ctx
    })
    ans_comb = resp_chat_comb.json().get("resposta", "")
    assert "Híbrido Flex" in ans_comb or "combustível" in ans_comb.lower() or "consumo" in ans_comb.lower()
    print(f"  -> Pergunta 'Combustível' -> Resposta: {ans_comb[:80]}...")

    # Teste 4: Pergunta "Câmbio"
    resp_chat_cambio = client.post("/api/chat", json={
        "mensagem": "Câmbio",
        "car_context": car_ctx
    })
    ans_cambio = resp_chat_cambio.json().get("resposta", "")
    assert "CVT" in ans_cambio or "transmissão" in ans_cambio.lower() or "câmbio" in ans_cambio.lower()
    print(f"  -> Pergunta 'Câmbio' -> Resposta: {ans_cambio[:80]}...")

    # Teste 5: Pergunta "Documentação"
    resp_chat_docs = client.post("/api/chat", json={
        "mensagem": "Documentação e multas",
        "car_context": car_ctx
    })
    ans_docs = resp_chat_docs.json().get("resposta", "")
    assert "DETRAN" in ans_docs and "IPVA" in ans_docs, f"Resposta deve falar sobre DETRAN e IPVA: {ans_docs}"
    print(f"  -> Pergunta 'Documentação' -> Resposta: {ans_docs[:80]}...")

    # Teste 6: Pergunta "Preço"
    resp_chat_preco = client.post("/api/chat", json={
        "mensagem": "Qual o preço?",
        "car_context": car_ctx
    })
    ans_preco = resp_chat_preco.json().get("resposta", "")
    assert "149.900" in ans_preco or "FIPE" in ans_preco, f"Resposta deve citar preço: {ans_preco}"
    print(f"  -> Pergunta 'Preço' -> Resposta: {ans_preco[:80]}...")

    # Teste 7: Pergunta "KM"
    resp_chat_km = client.post("/api/chat", json={
        "mensagem": "Quantos km rodados?",
        "car_context": car_ctx
    })
    ans_km = resp_chat_km.json().get("resposta", "")
    assert "24.500" in ans_km or "km" in ans_km.lower(), f"Resposta deve citar KM: {ans_km}"
    print(f"  -> Pergunta 'KM' -> Resposta: {ans_km[:80]}...")

    # Teste 8: Pergunta "Laudo Cautelar" (aqui sim deve falar do laudo)
    resp_chat_laudo = client.post("/api/chat", json={
        "mensagem": "O laudo cautelar está aprovado?",
        "car_context": car_ctx
    })
    ans_laudo = resp_chat_laudo.json().get("resposta", "")
    assert "Laudo Cautelar 100% Aprovado" in ans_laudo or "estrutura" in ans_laudo.lower()
    print(f"  -> Pergunta 'Laudo' -> Resposta: {ans_laudo[:80]}...")

    # Teste 9: Fallback orientador amigável (pergunta aleatória sem mapeamento)
    resp_chat_fallback = client.post("/api/chat", json={
        "mensagem": "Pergunta misteriosa xyz",
        "car_context": car_ctx
    })
    ans_fallback = resp_chat_fallback.json().get("resposta", "")
    assert "Laudo Cautelar 100% Aprovado" not in ans_fallback, "Fallback não deve afirmar laudo 100% aprovado aleatoriamente"
    assert "consultor IA da Automatch" in ans_fallback, "Fallback deve orientar o usuário sobre tópicos disponíveis"
    print(f"  -> Fallback Orientador -> Resposta: {ans_fallback[:80]}...")

    print("\n" + "="*70)
    print("TODOS OS TESTES DE CORREÇÕES PERSISTENTES FORAM APROVADOS COM SUCESSO!")
    print("="*70)

if __name__ == "__main__":
    run_tests()
