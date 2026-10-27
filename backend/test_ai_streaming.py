"""
test_ai_streaming.py — Testes do streaming de respostas da IA e resiliência de fallback.

Objetivo e Motivo da Criação:
  - Criado para validar o streaming assíncrono (Server-Sent Events) das respostas do Google Gemini,
    assegurando tolerância a falhas e ativação suave do fallback heurístico local quando a API estiver inacessível.
"""
"""
test_ai_streaming.py
Bateria de testes automatizados para o endpoint SSE de streaming do Consultor IA da Automatch.
Valida:
1. Resposta 200 OK com headers específicos (text/event-stream, X-Accel-Buffering: no, Cache-Control: no-cache).
2. Protocolo SSE com eventos 'data: {"token": "..."}' e encerramento 'data: [DONE]'.
3. Resposta semântica coerente com contexto veicular.
4. Rate limiting de proteção (429 Too Many Requests).
5. Validação de payload inválido (422 Unprocessable Entity).
"""
import unittest
import json
from fastapi.testclient import TestClient
from main import app
from routers.ai_vision import chat_rate_limiter


class TestAIStreamingChat(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        # Limpa o rate limiter para não afetar os testes
        chat_rate_limiter._history.clear()
        chat_rate_limiter._blocked_until.clear()

    def test_01_streaming_headers_and_events(self):
        payload = {
            "mensagem": "Olá, como funciona a garantia?",
            "historico": [],
            "car_context": None
        }
        with self.client.stream("POST", "/api/chat/stream", json=payload) as response:
            self.assertEqual(response.status_code, 200)
            self.assertIn("text/event-stream", response.headers.get("content-type", ""))
            self.assertEqual(response.headers.get("x-accel-buffering"), "no")
            self.assertEqual(response.headers.get("cache-control"), "no-cache")

            events = []
            full_text = ""
            received_done = False

            for line in response.iter_lines():
                if not line:
                    continue
                line_str = line.decode("utf-8") if isinstance(line, bytes) else line
                line_str = line_str.strip()
                if line_str.startswith("data:"):
                    raw_data = line_str[5:].strip()
                    if raw_data == "[DONE]":
                        received_done = True
                        break
                    parsed = json.loads(raw_data)
                    token = parsed.get("token", "")
                    events.append(token)
                    full_text += token

            self.assertTrue(received_done, "Deveria receber evento de finalização [DONE]")
            self.assertGreater(len(events), 0, "Deveria receber pelo menos um chunk de token")
            self.assertGreater(len(full_text.strip()), 5, "Texto final reconstruído deve ter conteúdo significativo")

    def test_02_streaming_with_car_context(self):
        car_ctx = {
            "brand": "Toyota",
            "model": "Corolla Altis Hybrid",
            "year": "2023",
            "price": 149900,
            "km": 28000,
            "color": "Branco Perolizado"
        }
        payload = {
            "mensagem": "Qual é a quilometragem e o valor deste carro?",
            "historico": [],
            "car_context": car_ctx
        }
        with self.client.stream("POST", "/api/chat/stream", json=payload) as response:
            self.assertEqual(response.status_code, 200)
            full_text = ""
            for line in response.iter_lines():
                if not line:
                    continue
                line_str = line.decode("utf-8") if isinstance(line, bytes) else line
                line_str = line_str.strip()
                if line_str.startswith("data:"):
                    raw_data = line_str[5:].strip()
                    if raw_data == "[DONE]":
                        break
                    parsed = json.loads(raw_data)
                    full_text += parsed.get("token", "")

            lower_text = full_text.lower()
            self.assertTrue("28.000" in lower_text or "28000" in lower_text or "km" in lower_text or "toyota" in lower_text or "149.900" in lower_text,
                            f"Resposta deveria citar dados do veículo. Obtido: {full_text}")

    def test_03_rate_limiting(self):
        payload = {
            "mensagem": "Teste de flood",
            "historico": []
        }
        # Dispara requisições até estourar o limite (30)
        hit_429 = False
        for _ in range(35):
            resp = self.client.post("/api/chat/stream", json=payload)
            if resp.status_code == 429:
                hit_429 = True
                self.assertIn("Muitas perguntas consecutivas", resp.json().get("detail", ""))
                break

        self.assertTrue(hit_429, "Rate limiter deveria disparar HTTP 429 após 30 requisições em 60s")

    def test_04_validation_error(self):
        # Payload sem campo obrigatório 'mensagem'
        resp = self.client.post("/api/chat/stream", json={})
        self.assertEqual(resp.status_code, 422)


if __name__ == "__main__":
    unittest.main()
