"""
test_laudo_yolo_feedback.py — Testes dos fluxos de emissão pericial e feedback de detecção por IA.

Objetivo e Motivo da Criação:
  - Criado para validar a acurácia dos laudos periciais gerados pela visão computacional,
    verificando o mapeamento correto de avarias na lataria e registro de notas de inspeção.
"""
import os
import io
import unittest
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from fastapi.testclient import TestClient

from main import app
from database import SessionLocal
import models
import security
from services.ai_service import (
    extrair_imagens_pdf,
    analisar_fotos_periciais_pdf_yolo,
    executar_cross_check_laudo
)


def _gerar_pdf_com_foto_teste() -> bytes:
    """Gera um PDF sintético válido com uma imagem pericial JPEG embutida para testes."""
    img = Image.new("RGB", (300, 200), color=(30, 80, 150))
    img_buf = io.BytesIO()
    img.save(img_buf, format="JPEG", quality=90)
    jpeg_bytes = img_buf.getvalue()

    header = b"%PDF-1.4\n"
    text_content = b"LAUDO CAUTELAR PERICIAL AUTOMATCH - TESTE\nChassi: 9BWZZZ377VT004251 - APROVADO SEM APONTAMENTOS\n"
    obj1 = b"1 0 obj\n<< /Type /XObject /Subtype /Image /Width 300 /Height 200 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + str(len(jpeg_bytes)).encode() + b" >>\nstream\n" + jpeg_bytes + b"\nendstream\nendobj\n"
    trailer = b"trailer\n<< /Root 1 0 R >>\n%%EOF"
    return header + text_content + obj1 + trailer


def _gerar_pdf_apenas_texto() -> bytes:
    """Gera um PDF contendo estritamente texto documental sem imagens."""
    buffer_pdf = io.BytesIO()
    c = canvas.Canvas(buffer_pdf)
    c.drawString(100, 750, "CERTIDÃO DOCUMENTAL DE LAUDO CAUTELAR")
    c.drawString(100, 720, "Veículo inspecionado e 100% aprovado.")
    c.showPage()
    c.save()
    return buffer_pdf.getvalue()


class TestLaudoYoloFeedback(unittest.TestCase):
    """Suíte de Testes Automatizados para [ATM-AI-05]: Feedback do YOLOv8 pós-upload de laudos."""

    def test_extrair_imagens_pdf_com_foto(self):
        pdf_bytes = _gerar_pdf_com_foto_teste()
        assert pdf_bytes.startswith(b"%PDF-")

        imagens = extrair_imagens_pdf(pdf_bytes, max_images=4)
        assert isinstance(imagens, list)
        assert len(imagens) >= 1
        assert "data" in imagens[0]
        assert len(imagens[0]["data"]) > 0

    def test_extrair_imagens_pdf_apenas_texto(self):
        pdf_bytes = _gerar_pdf_apenas_texto()
        imagens = extrair_imagens_pdf(pdf_bytes, max_images=4)
        assert isinstance(imagens, list)
        assert len(imagens) == 0

    def test_analisar_fotos_periciais_pdf_yolo_com_imagens(self):
        # Gera uma imagem em memória
        img_buffer = io.BytesIO()
        img = Image.new("RGB", (250, 180), color=(120, 150, 90))
        img.save(img_buffer, format="JPEG")
        sample_bytes = img_buffer.getvalue()

        imagens = [
            {"id": 1, "name": "foto_01.jpg", "data": sample_bytes, "page": 1},
            {"id": 2, "name": "foto_02.jpg", "data": sample_bytes, "page": 1}
        ]

        resultado = analisar_fotos_periciais_pdf_yolo(imagens)
        assert resultado["total_imagens_extraidas"] == 2
        assert len(resultado["imagens_inspecionadas"]) == 2

        foto1 = resultado["imagens_inspecionadas"][0]
        assert "titulo" in foto1
        assert "classe_detectada" in foto1
        assert "confianca" in foto1
        assert "status_peca" in foto1
        assert foto1["status_peca"] in ["Conforme", "Atenção", "Inconforme"]
        assert foto1["thumbnail_b64"].startswith("data:image/jpeg;base64,")

    def test_analisar_fotos_periciais_pdf_yolo_vazio(self):
        resultado = analisar_fotos_periciais_pdf_yolo([])
        assert resultado["total_imagens_extraidas"] == 0
        assert resultado["imagens_inspecionadas"] == []

    def test_executar_cross_check_concordante(self):
        laudo_texto = {"veredito": "Aprovado", "score_procedencia": 96}
        yolo_result = {
            "total_imagens_extraidas": 1,
            "imagens_inspecionadas": [
                {"id": 1, "status_peca": "Conforme", "classe_detectada": "car"}
            ]
        }
        cross = executar_cross_check_laudo(laudo_texto, yolo_result)
        assert cross["cross_check_status"] == "Concordante"
        assert "confirmam" in cross["cross_check_mensagem"]

    def test_executar_cross_check_divergencia_detectada(self):
        laudo_texto = {"veredito": "Aprovado", "score_procedencia": 95}
        yolo_result = {
            "total_imagens_extraidas": 1,
            "imagens_inspecionadas": [
                {"id": 1, "status_peca": "Inconforme", "classe_detectada": "damaged_part"}
            ]
        }
        cross = executar_cross_check_laudo(laudo_texto, yolo_result)
        assert cross["cross_check_status"] == "Divergência Detectada"

    def test_api_upload_laudo_pdf_endpoint_integrado(self):
        client = TestClient(app)
        pdf_bytes = _gerar_pdf_com_foto_teste()

        # Obtém ou cria usuário válido para gerar token JWT
        db = SessionLocal()
        try:
            user = db.query(models.User).first()
            if not user:
                user = models.User(
                    id="test-perito-laudo",
                    name="Perito Teste",
                    email="perito@automatch.com",
                    hashed_password="hash",
                    role="lojista"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            token = security.create_access_token({"sub": user.id, "email": user.email, "role": user.role})
        finally:
            db.close()

        headers = {"Authorization": f"Bearer {token}"}
        files = {
            "file": ("laudo_cautelar_teste.pdf", pdf_bytes, "application/pdf")
        }
        response = client.post("/api/v1/laudos/upload", files=files, headers=headers)
        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "success"
        assert "yolo_feedback" in data
        assert "laudo_feedback" in data

        yolo = data["yolo_feedback"]
        assert yolo["pdf_audit"] is True
        assert "total_imagens_extraidas" in yolo
        assert "cross_check_status" in yolo
        assert yolo["total_imagens_extraidas"] >= 1
        assert len(yolo["imagens_inspecionadas"]) >= 1

