"""Retirada do legado sem remover a API de lataria/360; executor usa dados temporários."""
import unittest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from main import app

class CleanupRegressionsTests(unittest.TestCase):
    def test_excluded_features_are_not_exposed(self):
        client = TestClient(app)  # No lifespan: do not run startup/seed.
        try:
            for route in ['/api/analise-acustica', '/api/analise-pneus']:
                self.assertNotIn(route, app.openapi()['paths'])
                self.assertEqual(client.post(route, json={}).status_code, 404)
            for route in ['/api/analise-visual', '/api/analise-360']:
                self.assertIn(route, app.openapi()['paths'])
        finally:
            client.close()

    def test_active_visual_analysis_preserves_context_and_response(self):
        expected = {'status': 'success', 'tem_avarias': True, 'pontos_avaria': [{'desc': 'Dano de teste'}]}
        analysis = AsyncMock(return_value=expected)
        with patch('routers.ai_vision.preprocess_and_compress_image', return_value=b'test-image'), patch('routers.ai_vision.executar_pericia_visual_completa', analysis):
            client = TestClient(app)
            try:
                response = client.post('/api/analise-visual', json={'imageBase64':'dGVzdA==', 'car_context':{'id':'cleanup-car','km':0}})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json(), expected)
                self.assertEqual(analysis.await_args.kwargs['image_bytes'], b'test-image')
                self.assertEqual(analysis.await_args.kwargs['car_context']['km'], 0)
            finally:
                client.close()
