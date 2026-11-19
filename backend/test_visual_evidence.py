"""Regressões de evidência, não de pontuação simulada."""
import asyncio
import hashlib
import io
import unittest
from pathlib import Path
from unittest.mock import patch
from PIL import Image
from fastapi.testclient import TestClient
from main import app
from services.ai_service import analyze_vehicle_damage_cv, executar_pericia_visual_completa, compilar_laudo_360
from services.inspection_contract import inconclusive, inspection_from_feedback
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
