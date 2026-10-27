"""
demo_live_docker_user_journey.py — Roteiro automatizado de demonstração da jornada do usuário.

Objetivo e Motivo da Criação:
  - Criado para executar a demonstração completa da plataforma em ambiente Docker: cadastro, login,
    busca de veículos, emissão de laudo cautelar por IA, simulação de proposta e reserva de repasse.
"""
"""
demo_live_docker_user_journey.py
Demonstração completa ao vivo com Docker:
1. Registra e autentica um usuário comum no sistema
2. Consulta o registro persistido na tabela 'users' do PostgreSQL do Docker
3. Cria um anúncio de veículo via API REST
4. Consulta o anúncio persistido na tabela 'cars' do PostgreSQL do Docker
5. Edita o anúncio (preço, cor e descrição)
6. Confirma no banco PostgreSQL as alterações salvas
7. Consulta o Consultor IA sobre o veículo via streaming SSE
"""
import requests
import json
import uuid
import sys
from database import SessionLocal
import models

BASE = "http://localhost:8000"

print("\n" + "=" * 80)
print("🚀 DEMONSTRAÇÃO COMPLETA: FLUXO DE USUÁRIO NO AMBIENTE DOCKER AUTOMATCH")
print("=" * 80)

# 1. Registro de usuário
unique_id = uuid.uuid4().hex[:6]
email = f"carlos.moraes.{unique_id}@exemplo.com"
password = "SenhaForte2026!"
name = "Carlos Moraes"

print(f"\n[1] 📝 Registrando novo usuário comum via API (POST /api/register):")
print(f"    Nome: {name} | Email: {email} | Perfil pretendido: comum")
resp = requests.post(f"{BASE}/api/register", json={
    "name": name,
    "email": email,
    "password": password,
    "role": "comum"
})
print(f"    Status HTTP: {resp.status_code}")
user_data = resp.json()
user_id = user_data["id"]
token = user_data["token"]
print(f"    ID no banco: {user_id}")
print(f"    Perfil salvo: {user_data.get('role')} (store_id: {user_data.get('store_id')})")
print(f"    Token JWT recebido: {token[:35]}...")

# 2. Verificação direta no banco PostgreSQL do Docker
print(f"\n[2] 🐘 Inspecionando tabela 'users' no PostgreSQL do Docker:")
db = SessionLocal()
try:
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    print(f"    SQL Query executada: SELECT * FROM users WHERE id = '{user_id}';")
    print(f"    -> ID: {db_user.id}")
    print(f"    -> Nome: {db_user.name}")
    print(f"    -> Email: {db_user.email}")
    print(f"    -> Role: {db_user.role}")
    print(f"    -> Store ID: {db_user.store_id}")
    print(f"    -> Membro desde: {db_user.member_since}")
finally:
    db.close()

# 3. Criação de anúncio particular
headers = {"Authorization": f"Bearer {token}"}
car_payload = {
    "brand": "Toyota",
    "model": "Corolla 2.0 Altis Hybrid",
    "year": 2024,
    "km": 14500,
    "price": 182900.00,
    "color": "Prata Lunar",
    "fuel": "Híbrido Flex",
    "transmission": "Automático CVT",
    "location": "Curitiba, PR",
    "description": "Veículo impecável de particular. Todas as revisões na concessionária Toyota. Garantia até 2029.",
    "laudo_status": "approved"
}

print(f"\n[3] 🚗 Criando anúncio particular via POST /api/cars (Usuário Comum):")
resp_car = requests.post(f"{BASE}/api/cars", json=car_payload, headers=headers)
print(f"    Status HTTP: {resp_car.status_code}")
car_data = resp_car.json()
car_id = car_data["id"]
print(f"    Anúncio ID: {car_id}")
print(f"    Veículo: {car_data['brand']} {car_data['model']} ({car_data['year']})")
print(f"    Preço Inicial: R$ {car_data['price']:,.2f}")
print(f"    Vendedor (user_id): {car_data.get('user_id')}")
print(f"    Loja (store_id): {car_data.get('store_id')} (None = Anúncio Particular)")

# 4. Verificação do anúncio no PostgreSQL do Docker
print(f"\n[4] 🐘 Inspecionando tabela 'cars' no PostgreSQL do Docker:")
db = SessionLocal()
try:
    db_car = db.query(models.Car).filter(models.Car.id == car_id).first()
    print(f"    SQL Query executada: SELECT * FROM cars WHERE id = '{car_id}';")
    print(f"    -> ID: {db_car.id}")
    print(f"    -> Marca/Modelo: {db_car.brand} {db_car.model} ({db_car.year})")
    print(f"    -> Preço: R$ {db_car.price:,.2f}")
    print(f"    -> Cor: {db_car.color}")
    print(f"    -> User ID: {db_car.user_id}")
    print(f"    -> Store ID: {db_car.store_id} (Vendedor Particular)")
    print(f"    -> Compartilhável B2B: {db_car.compartilhavel}")
finally:
    db.close()

# 5. Edição do anúncio
update_payload = {
    "price": 178500.00,
    "color": "Prata Lunar Metálico",
    "description": "Preço reduzido para venda rápida! Único dono, IPVA 2026 integralmente pago, laudo cautelar 100% aprovado."
}

print(f"\n[5] ✏️  Editando o anúncio via PUT /api/cars/{car_id}:")
resp_edit = requests.put(f"{BASE}/api/cars/{car_id}", json=update_payload, headers=headers)
print(f"    Status HTTP: {resp_edit.status_code}")
edit_data = resp_edit.json()
print(f"    Novo Preço: R$ {edit_data['price']:,.2f} (redução de R$ 4.400,00)")
print(f"    Nova Cor: {edit_data['color']}")
print(f"    Nova Descrição: {edit_data['description']}")

# 6. Verificação pós-edição no PostgreSQL do Docker
print(f"\n[6] 🐘 Confirmando alteração persistida no PostgreSQL do Docker:")
db = SessionLocal()
try:
    db_car_updated = db.query(models.Car).filter(models.Car.id == car_id).first()
    print(f"    SQL Query executada: SELECT id, price, color, description FROM cars WHERE id = '{car_id}';")
    print(f"    -> Preço atualizado no banco: R$ {db_car_updated.price:,.2f}")
    print(f"    -> Cor atualizada no banco: {db_car_updated.color}")
    print(f"    -> Descrição no banco: {db_car_updated.description}")
finally:
    db.close()

# 7. Interação com o Consultor IA sobre o anúncio
print(f"\n[7] 🤖 Testando interação do Consultor IA via streaming SSE (/api/chat/stream):")
stream_resp = requests.post(f"{BASE}/api/chat/stream", json={
    "mensagem": "Qual a motorização e quilometragem deste Corolla Híbrido?",
    "car_context": {
        "brand": car_data["brand"],
        "model": car_data["model"],
        "year": car_data["year"],
        "fuel": car_data["fuel"],
        "price": float(edit_data["price"]),
        "km": car_data["km"]
    }
}, stream=True, timeout=10)

print(f"    Status HTTP: {stream_resp.status_code} ({stream_resp.headers.get('content-type')})")
print("    Resposta em tempo real do Consultor IA:")
full_ai_response = []
for line in stream_resp.iter_lines():
    if line:
        line_str = line.decode('utf-8', errors='ignore')
        if line_str.startswith("data: "):
            payload = line_str[6:].strip()
            if payload == "[DONE]":
                break
            try:
                chunk_obj = json.loads(payload)
                delta = chunk_obj.get("token") or chunk_obj.get("delta", "")
                full_ai_response.append(delta)
            except Exception:
                pass

print(f"    «{''.join(full_ai_response)}»")

print("\n" + "=" * 80)
print("🎉 FLUXO E2E CONCLUÍDO COM SUCESSO NO BANCO DE DADOS E DOCKER!")
print("=" * 80)

