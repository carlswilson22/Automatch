"""
run_e2e_docker_test.py — Teste ponta a ponta (E2E) da jornada completa contra container Docker.

Objetivo e Motivo da Criação:
  - Criado para testar todos os serviços integrados rodando dentro do container Docker oficial,
    validando comunicação de rede, persistência de banco e integridade dos endpoints HTTP.
"""
"""
test_e2e_full_user_journey.py
Teste end-to-end completo contra o backend Docker rodando em http://localhost:8000.
Simula a jornada completa de um Usuário Comum e um Lojista na plataforma Automatch.

Fluxo exercitado:
  1. Health check (liveness + readiness)
  2. Registro de Usuário Comum (perfil 'comum')
  3. Login do Usuário Comum
  4. Consulta do Perfil Autenticado
  5. Criação de Anúncio Particular (sem loja)
  6. Listagem de Veículos (confirma anúncio aparece)
  7. Busca do Veículo por ID
  8. Edição do Anúncio (preço, cor, descrição)
  9. Chat com Consultor IA (endpoint síncrono /api/chat)
  10. Chat Streaming SSE (/api/chat/stream) com verificação de protocolo
  11. Exclusão do Anúncio
  12. Confirmação de exclusão (veículo removido)
  13. Registro de Lojista (perfil 'lojista' com loja)
  14. Login do Lojista
  15. Criação de Anúncio de Loja (com store_id)
  16. Listagem por Loja
  17. Acesso ao Estoque Compartilhado B2B
  18. Limpeza final

Roda com:
  python test_e2e_full_user_journey.py
"""
import requests
import json
import time
import sys
import uuid

BASE = "http://localhost:8000"
SEPARATOR = "=" * 80
PASS = "✅ PASS"
FAIL = "❌ FAIL"
results = []
created_car_ids = []
tokens = {}


def log(step, msg, ok=True):
    status = PASS if ok else FAIL
    print(f"  {status}  [{step}] {msg}")
    results.append((step, ok, msg))


def req(method, path, **kwargs):
    """Wrapper de requests com log."""
    url = f"{BASE}{path}"
    r = getattr(requests, method)(url, **kwargs, timeout=15)
    return r


# ── 1. HEALTH CHECK ──────────────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🏥 ETAPA 1: Health Check")
print(SEPARATOR)

try:
    r = req("get", "/api/health")
    data = r.json()
    log("1a", f"GET /api/health → {r.status_code} | status={data.get('status')}", r.status_code == 200)

    r2 = req("get", "/api/health/ready")
    data2 = r2.json()
    log("1b", f"GET /api/health/ready → {r2.status_code} | db={data2.get('database')}", r2.status_code == 200)
except Exception as e:
    log("1", f"Falha no health check: {e}", False)
    print("\n⛔ Backend não está acessível em localhost:8000. Certifique-se de que 'docker compose up -d backend' está rodando.")
    sys.exit(1)


# ── 2. REGISTRO DE USUÁRIO COMUM ─────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("👤 ETAPA 2: Registro de Usuário Comum")
print(SEPARATOR)

unique_id = uuid.uuid4().hex[:8]
comum_email = f"joao.silva.{unique_id}@automatch.com"
comum_password = "SenhaSegura123!"
comum_name = "João Silva"

r = req("post", "/api/register", json={
    "name": comum_name,
    "email": comum_email,
    "password": comum_password,
    "role": "comum"
})
data = r.json()
log("2a", f"POST /api/register → {r.status_code} | name={data.get('name')} | role={data.get('role')}", r.status_code == 200 and data.get("role") == "comum")

token_comum = data.get("token")
tokens["comum"] = token_comum
log("2b", f"Token JWT recebido: {token_comum[:30]}...", bool(token_comum))


# ── 3. LOGIN DO USUÁRIO COMUM ────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🔐 ETAPA 3: Login do Usuário Comum")
print(SEPARATOR)

r = req("post", "/api/login", json={
    "email": comum_email,
    "password": comum_password
})
data = r.json()
log("3", f"POST /api/login → {r.status_code} | role={data.get('role')}", r.status_code == 200 and data.get("token"))
tokens["comum"] = data.get("token", token_comum)


# ── 4. CONSULTA DO PERFIL AUTENTICADO ─────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("📋 ETAPA 4: Consulta de Perfil (/api/users/profile)")
print(SEPARATOR)

headers_comum = {"Authorization": f"Bearer {tokens['comum']}"}
r = req("get", "/api/users/profile", headers=headers_comum)
data = r.json()
log("4a", f"GET /api/users/profile → {r.status_code} | email={data.get('email')} | role={data.get('role')}", r.status_code == 200)
log("4b", f"store_id={data.get('store_id')} (deve ser None para comum)", data.get("store_id") is None)
log("4c", f"Membro desde: {data.get('memberSince') or data.get('member_since')}", bool(data.get("memberSince") or data.get("member_since")))


# ── 5. CRIAÇÃO DE ANÚNCIO PARTICULAR ─────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🚗 ETAPA 5: Criação de Anúncio Particular (Usuário Comum)")
print(SEPARATOR)

car_payload = {
    "brand": "Honda",
    "model": "Civic Touring 1.5 Turbo",
    "year": 2023,
    "km": 18500,
    "price": 159900.00,
    "color": "Cinza Metálico",
    "fuel": "Flex",
    "transmission": "CVT Automático",
    "location": "São Paulo, SP",
    "description": "Único dono, revisões na concessionária, IPVA 2026 pago.",
    "laudo_status": "approved"
}

r = req("post", "/api/cars", json=car_payload, headers=headers_comum)
data = r.json()
car_id = data.get("id")
created_car_ids.append(car_id)
log("5a", f"POST /api/cars → {r.status_code} | id={car_id}", r.status_code == 200)
log("5b", f"brand={data.get('brand')} model={data.get('model')}", data.get("brand") == "Honda")
log("5c", f"store_id={data.get('store_id')} (deve ser None para particular)", data.get("store_id") is None)
log("5d", f"compartilhavel={data.get('compartilhavel')} (deve ser False)", data.get("compartilhavel") == False)
log("5e", f"user_id={data.get('user_id')} (deve estar preenchido)", bool(data.get("user_id")))


# ── 6. LISTAGEM DE VEÍCULOS ──────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("📄 ETAPA 6: Listagem de Veículos (/api/cars)")
print(SEPARATOR)

r = req("get", "/api/cars?limit=100")
data = r.json()
items = data.get("items", [])
log("6a", f"GET /api/cars?limit=100 → {r.status_code} | total={data.get('total')} veículos", r.status_code == 200)
found = any(c.get("id") == car_id for c in items)
log("6b", f"Anúncio {car_id} encontrado na vitrine: {found}", found)

# Busca textual com query param limpo
r2 = req("get", "/api/cars", params={"q": "Civic"})
data2 = r2.json()
log("6c", f"Busca 'Civic' → {data2.get('total')} resultado(s)", data2.get("total", 0) >= 1)


# ── 7. BUSCA POR ID ──────────────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🔍 ETAPA 7: Busca do Veículo por ID")
print(SEPARATOR)

r = req("get", f"/api/cars/{car_id}")
data = r.json()
log("7a", f"GET /api/cars/{car_id} → {r.status_code}", r.status_code == 200)
log("7b", f"Preço: R$ {data.get('price'):,.2f} | KM: {data.get('km')}", data.get("price") == 159900.00)


# ── 8. EDIÇÃO DO ANÚNCIO ─────────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("✏️  ETAPA 8: Edição do Anúncio (PUT)")
print(SEPARATOR)

update_payload = {
    "price": 154900.00,
    "color": "Preto Perolizado",
    "description": "Único dono, revisões na concessionária, IPVA 2026 pago. Preço negociável!"
}
r = req("put", f"/api/cars/{car_id}", json=update_payload, headers=headers_comum)
data = r.json()
log("8a", f"PUT /api/cars/{car_id} → {r.status_code}", r.status_code == 200)
log("8b", f"Novo preço: R$ {data.get('price'):,.2f} (era 159.900)", data.get("price") == 154900.00)
log("8c", f"Nova cor: {data.get('color')}", data.get("color") == "Preto Perolizado")
log("8d", f"Descrição atualizada: {data.get('description')[:50]}...", "negociável" in data.get("description", ""))

# Tentativa de edição por outro usuário (deve falhar)
fake_token = "Bearer eyJ_INVALIDO_TOKEN"
r_hack = req("put", f"/api/cars/{car_id}", json={"price": 1.0}, headers={"Authorization": fake_token})
log("8e", f"Edição com token inválido → {r_hack.status_code} (deve ser 401/403)", r_hack.status_code in [401, 403])


# ── 9. CHAT COM CONSULTOR IA (SÍNCRONO) ──────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🤖 ETAPA 9: Chat com Consultor IA (/api/chat)")
print(SEPARATOR)

r = req("post", "/api/chat", json={
    "mensagem": "Qual a média de consumo do Honda Civic Touring 2023?",
    "historico": [],
    "car_context": {
        "brand": "Honda",
        "model": "Civic Touring 1.5 Turbo",
        "year": "2023",
        "price": 154900,
        "km": 18500,
        "color": "Preto Perolizado"
    }
})
data = r.json()
log("9a", f"POST /api/chat → {r.status_code} | modelo={data.get('modelo')}", r.status_code == 200)
log("9b", f"Resposta: {data.get('resposta', '')[:80]}...", bool(data.get("resposta")))

# Pergunta 2 (multi-turn)
r2 = req("post", "/api/chat", json={
    "mensagem": "E a direção, é elétrica ou hidráulica?",
    "historico": [
        {"from": "user", "text": "Qual a média de consumo do Honda Civic Touring 2023?"},
        {"from": "ai", "text": data.get("resposta", "")}
    ],
    "car_context": {
        "brand": "Honda",
        "model": "Civic Touring 1.5 Turbo",
        "year": "2023",
        "price": 154900,
        "km": 18500,
        "color": "Preto Perolizado"
    }
})
data2 = r2.json()
log("9c", f"Multi-turn: {data2.get('resposta', '')[:80]}...", bool(data2.get("resposta")))
log("9d", f"Respostas distintas: {data.get('resposta') != data2.get('resposta')}", data.get("resposta") != data2.get("resposta"))


# ── 10. CHAT STREAMING SSE ───────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("⚡ ETAPA 10: Chat Streaming SSE (/api/chat/stream)")
print(SEPARATOR)

r = req("post", "/api/chat/stream", json={
    "mensagem": "Esse carro é econômico para uso urbano?",
    "historico": [],
    "car_context": {
        "brand": "Honda",
        "model": "Civic Touring 1.5 Turbo",
        "year": "2023",
        "price": 154900,
        "km": 18500
    }
}, stream=True)

content_type = r.headers.get("content-type", "")
x_accel = r.headers.get("x-accel-buffering", "")
log("10a", f"POST /api/chat/stream → {r.status_code} | content-type={content_type}", r.status_code == 200 and "text/event-stream" in content_type)
log("10b", f"X-Accel-Buffering: {x_accel}", x_accel == "no")

full_text = ""
token_count = 0
received_done = False
for line in r.iter_lines(decode_unicode=True):
    if not line:
        continue
    line = line.strip()
    if line.startswith("data:"):
        raw = line[5:].strip()
        if raw == "[DONE]":
            received_done = True
            break
        try:
            parsed = json.loads(raw)
            token = parsed.get("token", "")
            full_text += token
            token_count += 1
        except:
            pass

log("10c", f"Tokens recebidos: {token_count}", token_count > 0)
log("10d", f"Sinal [DONE] recebido: {received_done}", received_done)
log("10e", f"Texto completo ({len(full_text)} chars): {full_text[:80]}...", len(full_text) > 10)


# ── 11. EXCLUSÃO DO ANÚNCIO ──────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🗑️  ETAPA 11: Exclusão do Anúncio")
print(SEPARATOR)

r = req("delete", f"/api/cars/{car_id}", headers=headers_comum)
data = r.json()
log("11a", f"DELETE /api/cars/{car_id} → {r.status_code}", r.status_code == 200)
log("11b", f"Mensagem: {data.get('message')}", "sucesso" in data.get("message", "").lower())


# ── 12. CONFIRMAÇÃO DE EXCLUSÃO ──────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🔒 ETAPA 12: Confirmação de Exclusão")
print(SEPARATOR)

r = req("get", f"/api/cars/{car_id}")
log("12", f"GET /api/cars/{car_id} → {r.status_code} (deve ser 404)", r.status_code == 404)


# ── 13. REGISTRO DE LOJISTA ──────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🏪 ETAPA 13: Registro de Lojista")
print(SEPARATOR)

lojista_email = f"loja.premium.{unique_id}@automatch.com"
lojista_password = "SenhaLoja2024!"

r = req("post", "/api/register", json={
    "name": "Carlos Mendes",
    "email": lojista_email,
    "password": lojista_password,
    "role": "lojista",
    "store_name": "Auto Premium Motors"
})
data = r.json()
token_lojista = data.get("token")
tokens["lojista"] = token_lojista
store_id_lojista = data.get("store_id")
log("13a", f"POST /api/register → {r.status_code} | role={data.get('role')}", r.status_code == 200 and data.get("role") == "lojista")
log("13b", f"store_id={store_id_lojista} (deve existir)", store_id_lojista is not None)
log("13c", f"Token: {token_lojista[:30]}...", bool(token_lojista))


# ── 14. LOGIN DO LOJISTA ─────────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🔐 ETAPA 14: Login do Lojista")
print(SEPARATOR)

r = req("post", "/api/login", json={
    "email": lojista_email,
    "password": lojista_password
})
data = r.json()
log("14", f"POST /api/login → {r.status_code} | role={data.get('role')} | store_id={data.get('store_id')}", r.status_code == 200)
tokens["lojista"] = data.get("token", token_lojista)
headers_lojista = {"Authorization": f"Bearer {tokens['lojista']}"}


# ── 15. CRIAÇÃO DE ANÚNCIO DE LOJA (B2B) ─────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🚙 ETAPA 15: Criação de Anúncio de Loja")
print(SEPARATOR)

loja_car_payload = {
    "brand": "Toyota",
    "model": "Corolla Cross XRE 2.0",
    "year": 2024,
    "km": 12000,
    "price": 179900.00,
    "color": "Branco Polar",
    "fuel": "Flex",
    "transmission": "CVT",
    "location": "Campinas, SP",
    "description": "Zero de leilão, revisado em concessionária autorizada Toyota.",
    "compartilhavel": True,
    "valor_minimo_repasse": 170000.00,
    "comissao_fixa": 3500.00,
    "observacoes_repasse": "Aceita repasse para rede parceira.",
    "store_id": store_id_lojista
}

r = req("post", "/api/cars", json=loja_car_payload, headers=headers_lojista)
data = r.json()
loja_car_id = data.get("id")
created_car_ids.append(loja_car_id)
log("15a", f"POST /api/cars → {r.status_code} | id={loja_car_id}", r.status_code == 200)
log("15b", f"store_id={data.get('store_id')} (deve ser {store_id_lojista})", data.get("store_id") == store_id_lojista)
log("15c", f"compartilhavel={data.get('compartilhavel')} (deve ser True)", data.get("compartilhavel") == True)
log("15d", f"valor_minimo_repasse={data.get('valor_minimo_repasse')}", data.get("valor_minimo_repasse") == 170000.00)


# ── 16. LISTAGEM POR LOJA ────────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🏬 ETAPA 16: Listagem por Loja")
print(SEPARATOR)

r = req("get", f"/api/cars?store_id={store_id_lojista}")
data = r.json()
log("16a", f"GET /api/cars?store_id={store_id_lojista} → {r.status_code} | total={data.get('total')}", r.status_code == 200)
items = data.get("items", [])
found_loja = any(c.get("id") == loja_car_id for c in items)
log("16b", f"Anúncio da loja encontrado: {found_loja}", found_loja)


# ── 17. ESTOQUE B2B ──────────────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🔄 ETAPA 17: Estoque Compartilhado B2B")
print(SEPARATOR)

r = req("get", "/api/partnerships/shared-inventory?limit=10", headers=headers_lojista)
log("17", f"GET /api/partnerships/shared-inventory → {r.status_code}", r.status_code == 200)

# Usuário comum NÃO pode acessar B2B
r_denied = req("get", "/api/partnerships/shared-inventory", headers=headers_comum)
log("17b", f"Usuário comum acessando B2B → {r_denied.status_code} (deve ser 403)", r_denied.status_code == 403)


# ── 18. LIMPEZA ───────────────────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("🧹 ETAPA 18: Limpeza Final")
print(SEPARATOR)

# Exclui anúncio do lojista
r = req("delete", f"/api/cars/{loja_car_id}", headers=headers_lojista)
log("18", f"DELETE /api/cars/{loja_car_id} → {r.status_code}", r.status_code == 200)


# ── RELATÓRIO FINAL ──────────────────────────────────────────────────────────
print(f"\n{SEPARATOR}")
print("📊 RELATÓRIO FINAL")
print(SEPARATOR)

total_tests = len(results)
passed = sum(1 for _, ok, _ in results if ok)
failed = sum(1 for _, ok, _ in results if not ok)

print(f"\n  Total: {total_tests} testes")
print(f"  ✅ Aprovados: {passed}")
print(f"  ❌ Reprovados: {failed}")

if failed > 0:
    print(f"\n  FALHAS:")
    for step, ok, msg in results:
        if not ok:
            print(f"    [{step}] {msg}")

print(f"\n  Resultado: {'🎉 TODOS OS TESTES PASSARAM!' if failed == 0 else '⚠️  ALGUNS TESTES FALHARAM'}")
print(SEPARATOR)

sys.exit(0 if failed == 0 else 1)
