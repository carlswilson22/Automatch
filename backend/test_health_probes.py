"""
test_health_probes.py — Testes das sondas de integridade (health checks) e telemetria.

Objetivo e Motivo da Criação:
  - Criado para garantir que os endpoints de monitoramento (/health, /live, /ready) respondam
    com precisão o status do banco de dados, scheduler e serviços de background para o Docker e Kubernetes.
"""
"""
test_health_probes.py
Testes unitários dos endpoints de healthcheck (Liveness e Readiness)
Implementação do Problema 5 da Auditoria de Infraestrutura DevOps.
"""

import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from database import engine, Base
from main import app

Base.metadata.create_all(bind=engine)
client = TestClient(app)


class TestHealthProbes(unittest.TestCase):

    def test_liveness_probe_returns_200(self):
        """GET /api/health deve sempre responder 200 OK com status: ok."""
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "ok")

    def test_readiness_probe_healthy(self):
        """GET /api/health/ready com banco e diretórios íntegros deve responder 200 OK."""
        response = client.get("/api/health/ready")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "ok")
        self.assertIn("checks", data)
        self.assertEqual(data["checks"].get("database"), "ok")
        self.assertEqual(data["checks"].get("uploads_dir"), "ok")

    def test_readiness_probe_database_failure_degrades_gracefully(self):
        """
        GET /api/health/ready quando o banco falha:
        - Deve retornar HTTP 503 Service Unavailable
        - Deve indicar 'degraded' e 'database': 'error'
        - NÃO deve vazar credenciais, connection strings ou stack traces no JSON
        """
        with patch.object(engine, "connect", side_effect=Exception("Connection refused to postgresql://user:secret@db:5432")):
            response = client.get("/api/health/ready")
            self.assertEqual(response.status_code, 503)
            data = response.json()
            self.assertEqual(data.get("status"), "degraded")
            self.assertEqual(data["checks"].get("database"), "error")
            # Validação defensiva: nenhuma string sensível ou stack trace
            body_text = response.text
            self.assertNotIn("secret", body_text)
            self.assertNotIn("Traceback", body_text)
            self.assertNotIn("Connection refused", body_text)

    def test_health_endpoints_include_security_headers(self):
        """Os endpoints de healthcheck devem herdar os headers de segurança OWASP."""
        for endpoint in ["/api/health", "/api/health/ready"]:
            response = client.get(endpoint)
            self.assertEqual(response.headers.get("x-content-type-options"), "nosniff")
            self.assertEqual(response.headers.get("x-frame-options"), "DENY")


if __name__ == "__main__":
    unittest.main()
