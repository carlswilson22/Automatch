"""Regressões de evidência, não de pontuação simulada."""
import asyncio
import hashlib
import io
import unittest
from pathlib import Path
from unittest.mock import patch, AsyncMock
from PIL import Image
from fastapi.testclient import TestClient
from main import app
from services.ai_service import (
    analyze_vehicle_damage_cv, executar_pericia_visual_completa,
    compilar_laudo_360, _parse_gemini_damage_response,
)
from services.inspection_contract import (
    inconclusive, inspection_from_feedback,
    gemini_visual_result, GEMINI_CALIBRATION_ID,
    SCHEMA_VERSION, METHOD_VERSION,
)
from routers.ai_vision import generate_semantic_reply

class VisualEvidenceTests(unittest.TestCase):
    def test_tracker_context_cannot_create_damage_or_confidence(self):
        image = Path(__file__).resolve().parent / "public_images/FotoChevroletTracker.jpg"
        raw = image.read_bytes()
        with patch("services.ai_service.get_yolo_model", return_value=None):
            for context in [None, {"id":"sc-004","damages":["Pequeno Risco Superficial"]}]:
                result = asyncio.run(executar_pericia_visual_completa(raw,car_context=context))
                self.assertEqual(result["analysis_state"],"inconclusive")
                self.assertEqual(result["pontos_avaria"],[])
                self.assertIsNone(result["score_lataria"])
                self.assertIsNone(result["confianca_ia"])
                self.assertEqual(result["image_sha256"],hashlib.sha256(raw).hexdigest())

    def test_invalid_bytes_missing_photo_and_low_quality_never_approve(self):
        self.assertEqual(analyze_vehicle_damage_cv(b"invalid")["status"],"error")
        client=TestClient(app)
        for payload in [{},{"imageBase64":"bm90LWFuLWltYWdl"},{"imageUrl":"/images/absent.jpg"}]:
            response=client.post("/api/analise-visual",json=payload)
            self.assertEqual(response.status_code,422)
            self.assertNotIn("score_lataria",response.json())
        data=io.BytesIO();Image.new("RGB",(4,4),"gray").save(data,format="JPEG")
        with patch("services.ai_service.get_yolo_model",return_value=None):
            result=analyze_vehicle_damage_cv(data.getvalue())
        self.assertEqual(result["analysis_state"],"inconclusive")
        self.assertIsNot(result["tem_avarias"],False)

    def test_legacy_and_client_assertions_do_not_certify_pdf_or_chat(self):
        self.assertIsNone(inspection_from_feedback({"score_lataria":98,"tem_avarias":False}))
        forged={**inconclusive(),"analysis_state":"damage_detected","damage_detection_validated":True,"resposta":"RISCO INVENTADO","pontos_avaria":[{"x":35,"y":55}]}
        result=inspection_from_feedback(forged)
        self.assertEqual(result["analysis_state"],"inconclusive")
        self.assertNotIn("RISCO INVENTADO",result["resposta"])
        answer=generate_semantic_reply("avarias",{"damagePoints":[{"desc":"RISCO INVENTADO"}],"visual_inspection":forged})
        self.assertNotIn("RISCO INVENTADO",answer)
        self.assertIn("inconclusiva",answer)

    def test_360_does_not_project_a_single_photo_onto_eight_angles(self):
        result=compilar_laudo_360({"damages":["risco"]})
        self.assertEqual(result["hotspots_360"],[])
        self.assertIsNone(result["score_geral_360"])


class GeminiVisionIntegrationTests(unittest.TestCase):
    """Testa o caminho Gemini Vision: parser, contrato e fluxo completo."""

    # --- Parser ---
    def test_parse_inconclusivo_returns_empty(self):
        for text in ["INCONCLUSIVO", "inconclusivo", "INCONCLUSIVO\nTexto extra"]:
            self.assertEqual(_parse_gemini_damage_response(text), [], text)

    def test_parse_empty_or_none_returns_empty(self):
        for val in ["", None]:
            self.assertEqual(_parse_gemini_damage_response(val), [])

    def test_parse_avaria_lines_extracted(self):
        text = (
            "AVARIA: arranhão na lateral esquerda\n"
            "AVARIA: amassado no para-choque dianteiro\n"
        )
        points = _parse_gemini_damage_response(text)
        self.assertEqual(len(points), 2)
        self.assertIn("lateral esquerda", points[0]["descricao"])
        self.assertIn("para-choque dianteiro", points[1]["descricao"])
        self.assertEqual(points[0]["source"], "gemini-vision-v1")

    def test_parse_mixed_lines_ignores_non_avaria(self):
        text = "Olhando a imagem...\nAVARIA: trinca no vidro traseiro\nObservação extra."
        points = _parse_gemini_damage_response(text)
        self.assertEqual(len(points), 1)
        self.assertIn("vidro traseiro", points[0]["descricao"])

    # --- Contrato ---
    def test_gemini_visual_result_with_damage_produces_valid_contract(self):
        img_bytes = io.BytesIO()
        Image.new("RGB", (8, 8), "blue").save(img_bytes, format="JPEG")
        raw = img_bytes.getvalue()
        points = [{"descricao": "arranhão na lateral", "source": "gemini-vision-v1", "x": None, "y": None}]
        result = gemini_visual_result(raw, points, "AVARIA: arranhão na lateral")
        self.assertEqual(result["schema_version"], SCHEMA_VERSION)
        self.assertEqual(result["analysis_state"], "damage_detected")
        self.assertTrue(result["damage_detection_validated"])
        self.assertEqual(result["calibration_id"], GEMINI_CALIBRATION_ID)
        self.assertEqual(result["modelo"], "Gemini Vision")
        self.assertEqual(result["method_version"], METHOD_VERSION)
        self.assertEqual(len(result["pontos_avaria"]), 1)
        self.assertIsNone(result["damage_confidence"])  # não inventa probabilidade
        self.assertIsNone(result["score_lataria"])
        self.assertIn("vistoria presencial", result["resposta"])

    def test_gemini_visual_result_no_damage_returns_inconclusive(self):
        img_bytes = io.BytesIO()
        Image.new("RGB", (8, 8), "white").save(img_bytes, format="JPEG")
        raw = img_bytes.getvalue()
        result = gemini_visual_result(raw, [], "INCONCLUSIVO")
        self.assertEqual(result["analysis_state"], "inconclusive")
        self.assertFalse(result["damage_detection_validated"])
        self.assertEqual(result["pontos_avaria"], [])

    # --- Fluxo completo com mock ---
    def _make_jpeg(self):
        buf = io.BytesIO()
        Image.new("RGB", (32, 32), "gray").save(buf, format="JPEG")
        return buf.getvalue()

    def test_gemini_key_present_damage_found_returns_damage_detected(self):
        """Se Gemini responde com avaria, resultado deve ser damage_detected."""
        raw = self._make_jpeg()
        gemini_resp = "AVARIA: arranhão na lateral traseira direita"
        with patch("services.ai_service.call_gemini_generate", new_callable=AsyncMock) as mock_gem:
            mock_gem.return_value = gemini_resp
            result = asyncio.run(executar_pericia_visual_completa(
                raw, api_key="FAKE_KEY_TEST", car_context={"id": "test-001"}
            ))
        self.assertEqual(result["analysis_state"], "damage_detected")
        self.assertTrue(result["damage_detection_validated"])
        self.assertEqual(result["calibration_id"], GEMINI_CALIBRATION_ID)
        self.assertEqual(result["car_id"], "test-001")
        self.assertGreater(len(result["pontos_avaria"]), 0)
        self.assertIsNone(result["damage_confidence"])  # nunca inventa probabilidade

    def test_gemini_key_present_inconclusivo_returns_inconclusive(self):
        """Se Gemini responde INCONCLUSIVO, resultado deve ser inconclusive."""
        raw = self._make_jpeg()
        with patch("services.ai_service.call_gemini_generate", new_callable=AsyncMock) as mock_gem:
            mock_gem.return_value = "INCONCLUSIVO"
            result = asyncio.run(executar_pericia_visual_completa(
                raw, api_key="FAKE_KEY_TEST"
            ))
        self.assertEqual(result["analysis_state"], "inconclusive")
        self.assertFalse(result["damage_detection_validated"])
        self.assertEqual(result["pontos_avaria"], [])

    def test_gemini_no_api_key_falls_back_to_inconclusive(self):
        """Sem chave de API, o resultado deve ser inconclusive (fallback CV local)."""
        raw = self._make_jpeg()
        with patch("services.ai_service.get_yolo_model", return_value=None):
            result = asyncio.run(executar_pericia_visual_completa(raw, api_key=None))
        self.assertEqual(result["analysis_state"], "inconclusive")
        self.assertFalse(result["damage_detection_validated"])

    def test_gemini_api_failure_falls_back_to_inconclusive(self):
        """Se Gemini falha com exceção, cai para fallback inconclusivo."""
        raw = self._make_jpeg()
        with patch("services.ai_service.call_gemini_generate", new_callable=AsyncMock) as mock_gem:
            mock_gem.side_effect = RuntimeError("timeout")
            with patch("services.ai_service.get_yolo_model", return_value=None):
                result = asyncio.run(executar_pericia_visual_completa(
                    raw, api_key="FAKE_KEY_TEST"
                ))
        self.assertEqual(result["analysis_state"], "inconclusive")

    def test_tracker_context_still_inconclusive_without_api_key(self):
        """Teste de regressão: contexto do anúncio não cria avaria sem chave."""
        image = Path(__file__).resolve().parent / "public_images/FotoChevroletTracker.jpg"
        raw = image.read_bytes()
        with patch("services.ai_service.get_yolo_model", return_value=None):
            for ctx in [None, {"id": "sc-004", "damages": ["Pequeno Risco Superficial"]}]:
                result = asyncio.run(executar_pericia_visual_completa(raw, car_context=ctx))
                self.assertEqual(result["analysis_state"], "inconclusive")
                self.assertEqual(result["pontos_avaria"], [])

