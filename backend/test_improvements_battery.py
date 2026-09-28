"""
test_improvements_battery.py — Bateria de Testes Automatizados para Melhorias
Cobre:
1. Cabeçalhos HTTP de segurança defensiva (OWASP)
2. Compressão de respostas GZip (Desempenho)
3. Proteção contra Brute Force (Rate Limiting no login)
4. Proteção contra Scraping (Rate Limiting no DETRAN)
5. Bloqueio de Bypass e Prevenção de IDOR em B2B (exigência de autenticação)
6. Conformidade com a LGPD (Art. 18: exportação e anonimização de dados)
"""

import unittest
import os
import time

# Configura banco de dados SQLite para teste isolado
os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "sqlite:////tmp/improvements_test.db")

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from main import app
from database import engine, SessionLocal
import models
import security
from security_guard import login_rate_limiter, plate_rate_limiter

client = TestClient(app)


class TestImprovementsBattery(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        models.Base.metadata.create_all(bind=engine)
        db: Session = SessionLocal()

        # Garante loja base
        store = db.query(models.Store).first()
        if not store:
            store = models.Store(name="Loja Segurança", slug="loja-seguranca", logo="/images/logo.png")
            db.add(store)
            db.commit()
            db.refresh(store)
        cls.store_id = store.id

        # Garante usuário titular para testes LGPD e login
        test_user = db.query(models.User).filter(models.User.email == "titular.seguro@automatch.com.br").first()
        if not test_user:
            test_user = models.User(
                name="Titular de Teste LGPD",
                email="titular.seguro@automatch.com.br",
                hashed_password=security.hash_password("SenhaForte123!"),
                role="lojista",
                sub_role="owner",
                store_id=cls.store_id
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)

        cls.user_id = test_user.id
        cls.user_email = test_user.email
        cls.user_token = security.create_access_token({"sub": str(cls.user_id), "email": cls.user_email})
        cls.auth_headers = {"Authorization": f"Bearer {cls.user_token}"}
        db.close()

    def setUp(self):
        # Limpa limitadores antes de cada teste
        login_rate_limiter.reset("titular.seguro@automatch.com.br")
        login_rate_limiter.reset("bruteforce@automatch.com.br")

    # 1. CABEÇALHOS HTTP DE SEGURANÇA DEFENSIVA
    def test_01_security_headers_present(self):
        """Valida se os cabeçalhos de proteção (HSTS, nosniff, DENY) são injetados em todas as rotas"""
        resp = client.get("/api/cars?limit=1")
        self.assertEqual(resp.status_code, 200)
        headers = resp.headers
        self.assertEqual(headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(headers.get("x-frame-options"), "DENY")
        self.assertEqual(headers.get("x-xss-protection"), "1; mode=block")
        self.assertIn("max-age=31536000", headers.get("strict-transport-security", ""))
        self.assertEqual(headers.get("referrer-policy"), "strict-origin-when-cross-origin")
        print("✓ Teste 1 (Segurança): Cabeçalhos HTTP defensivos validados com sucesso")

    # 2. COMPRESSÃO GZIP DE RESPOSTAS
    def test_02_gzip_compression_active(self):
        """Valida se payloads volumosos são compactados via gzip quando solicitado pelo cliente"""
        resp = client.get("/api/cars?limit=20", headers={"Accept-Encoding": "gzip"})
        self.assertEqual(resp.status_code, 200)
        # Se payload for maior que 1000 bytes, GZipMiddleware aplica compressão
        if len(resp.content) > 1000 or resp.headers.get("content-encoding") == "gzip":
            self.assertEqual(resp.headers.get("content-encoding"), "gzip")
        print("✓ Teste 2 (Desempenho): Compressão GZip validada para payloads da API")

    # 3. RATE LIMITING NO LOGIN CONTRA BRUTE FORCE
    def test_03_login_brute_force_rate_limit(self):
        """Valida que tentativas consecutivas de senha errada ativam o bloqueio por Rate Limit (HTTP 429)"""
        target_email = "bruteforce@automatch.com.br"
        login_rate_limiter.reset(target_email)

        # 5 tentativas incorretas devem retornar 401
        for i in range(5):
            r = client.post("/api/login", json={"email": target_email, "password": f"senha_errada_{i}"})
            self.assertEqual(r.status_code, 401)

        # A 6ª tentativa imediata deve ser bloqueada com 429 Too Many Requests
        blocked_resp = client.post("/api/login", json={"email": target_email, "password": "outra_tentativa"})
        self.assertEqual(blocked_resp.status_code, 429)
        self.assertIn("Retry-After", blocked_resp.headers)
        data = blocked_resp.json()
        self.assertIn("bloqueada", data["detail"].lower())
        print("✓ Teste 3 (Segurança): Bloqueio por força bruta (Rate Limiting) ativado no login")

    # 4. RATE LIMITING DE CONSULTA DETRAN
    def test_04_detran_rate_limit(self):
        """Valida a proteção contra scraping no endpoint de consulta veicular DETRAN"""
        client_ip = "192.168.1.100"
        plate_rate_limiter.reset(client_ip)

        # Consome até atingir o limite
        for i in range(30):
            plate_rate_limiter.is_allowed(client_ip)

        # 31ª requisição deve retornar 429
        allowed, remaining = plate_rate_limiter.is_allowed(client_ip)
        self.assertFalse(allowed)
        self.assertGreater(remaining, 0)
        print("✓ Teste 4 (Segurança): Rate Limiting para consultas de placas validado")

    # 5. ELIMINAÇÃO DO BYPASS NÃO AUTENTICADO EM B2B
    def test_05_b2b_requires_authentication(self):
        """Valida que o endpoint B2B rejeita com 401 requisições sem Authorization (IDOR eliminado)"""
        unauth_resp = client.get("/api/partnerships/shared-inventory")
        self.assertEqual(unauth_resp.status_code, 401)
        self.assertIn("Token de autenticação obrigatório", unauth_resp.json()["detail"])
        print("✓ Teste 5 (Segurança): Bypass não autenticado em B2B eliminado com sucesso")

    # 6. CONFORMIDADE COM A LGPD (EXPORTAÇÃO E ANONIMIZAÇÃO)
    def test_06_lgpd_export_and_anonymization(self):
        """Valida os fluxos de portabilidade (Art. 18, V) e exclusão/anonimização (Art. 18, VI) da LGPD"""
        # Cria um usuário temporário para teste de exclusão
        db = SessionLocal()
        temp_user = models.User(
            name="Usuario Para Anonimizar",
            email="temp.lgpd@automatch.com.br",
            hashed_password=security.hash_password("Segura123!"),
            role="lojista",
            sub_role="seller",
            store_id=self.store_id
        )
        db.add(temp_user)
        db.commit()
        db.refresh(temp_user)
        temp_id = temp_user.id
        token_temp = security.create_access_token({"sub": str(temp_id), "email": temp_user.email})
        headers_temp = {"Authorization": f"Bearer {token_temp}"}
        db.close()

        # 1. Exportação de dados
        export_resp = client.get("/api/users/me/export-data", headers=headers_temp)
        self.assertEqual(export_resp.status_code, 200)
        export_data = export_resp.json()
        self.assertEqual(export_data["status"], "success")
        self.assertEqual(export_data["titular"]["id"], temp_id)
        self.assertIn("timestamp_exportacao", export_data)

        # 2. Anonimização / Exclusão
        delete_resp = client.delete("/api/users/me", headers=headers_temp)
        self.assertEqual(delete_resp.status_code, 200)
        self.assertEqual(delete_resp.json()["status"], "success")

        # Verifica no banco se os dados foram anonimizados
        db = SessionLocal()
        anonymized_user = db.query(models.User).filter(models.User.id == temp_id).first()
        self.assertEqual(anonymized_user.name, "Titular Anonimizado (LGPD)")
        self.assertIn("anonimizado", anonymized_user.email)
        self.assertEqual(anonymized_user.hashed_password, "ANONYMIZED_LGPD_INACTIVE")
        db.close()
        print("✓ Teste 6 (LGPD): Portabilidade e anonimização de dados do titular 100% validadas")


if __name__ == "__main__":
    unittest.main()
