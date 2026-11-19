from pericial_timeline import VIDEO_SUMMARY
from services.inspection_contract import inspection_summary, DISCLAIMER
"""
pdf_generator.py — Gerador de Dossiê Cautelar Oficial em PDF (ReportLab).

Objetivo e Motivo da Criação:
  - Criado para gerar dinamicamente o Dossiê Cautelar e Laudo Pericial Veicular oficial em formato PDF vetorial A4,
    incorporando dados de vistoria, pontuação pericial, checklist de lataria, histórico legal e QR Code de autenticidade.
  - Fornece documento auditável com layout profissional, tipografia institucional e padrão de segurança visual.
"""
import io
import datetime
import hashlib
from typing import Dict, Any

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm, cm
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
    from reportlab.graphics.shapes import Drawing, Rect, String
    from reportlab.graphics import renderPDF
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False
    A4 = (595.27, 841.89)
    mm = 2.83465
    cm = 28.3465
    class HexColor:
        def __init__(self, val):
            self.val = val
    Table = Any
    Paragraph = Any
    Spacer = Any
    Drawing = Any
    SimpleDocTemplate = Any
    TableStyle = Any
    ParagraphStyle = Any
    RLImage = Any

# QR Code generation
try:
    import qrcode
    from qrcode.image.pil import PilImage
    HAS_QRCODE = True
except ImportError:
    HAS_QRCODE = False


# ─── Design System Colors ────────────────────────────────────────────────────
PRIMARY = HexColor("#0f172a")
ACCENT = HexColor("#0284c7")
ACCENT_DARK = HexColor("#0369a1")
BG_LIGHT = HexColor("#f8fafc")
BORDER = HexColor("#e2e8f0")
TEXT_DARK = HexColor("#1e293b")
TEXT_MUTED = HexColor("#64748b")
SUCCESS = HexColor("#059669")
WHITE = HexColor("#ffffff")
HEADER_BG = HexColor("#0f172a")
ACCENT_BAR = HexColor("#0284c7")


# ─── Paragraph Styles ────────────────────────────────────────────────────────
def _styles():
    """Retorna os estilos de parágrafo do documento."""
    return {
        "title": ParagraphStyle(
            "title", fontName="Helvetica-Bold", fontSize=20, leading=24,
            textColor=WHITE, alignment=TA_LEFT
        ),
        "subtitle": ParagraphStyle(
            "subtitle", fontName="Helvetica", fontSize=10, leading=13,
            textColor=HexColor("#cbd5e1"), alignment=TA_LEFT
        ),
        "section_header": ParagraphStyle(
            "section_header", fontName="Helvetica-Bold", fontSize=13, leading=16,
            textColor=PRIMARY, alignment=TA_LEFT, spaceBefore=14, spaceAfter=6
        ),
        "section_note": ParagraphStyle(
            "section_note", fontName="Helvetica", fontSize=8, leading=10,
            textColor=TEXT_MUTED, alignment=TA_RIGHT
        ),
        "label": ParagraphStyle(
            "label", fontName="Helvetica", fontSize=9, leading=12,
            textColor=TEXT_MUTED, alignment=TA_LEFT
        ),
        "value": ParagraphStyle(
            "value", fontName="Helvetica-Bold", fontSize=10, leading=13,
            textColor=TEXT_DARK, alignment=TA_LEFT
        ),
        "value_accent": ParagraphStyle(
            "value_accent", fontName="Helvetica-Bold", fontSize=10, leading=13,
            textColor=ACCENT_DARK, alignment=TA_LEFT
        ),
        "value_success": ParagraphStyle(
            "value_success", fontName="Helvetica-Bold", fontSize=10, leading=13,
            textColor=SUCCESS, alignment=TA_LEFT
        ),
        "value_large": ParagraphStyle(
            "value_large", fontName="Helvetica-Bold", fontSize=18, leading=22,
            textColor=PRIMARY, alignment=TA_LEFT
        ),
        "footer": ParagraphStyle(
            "footer", fontName="Helvetica", fontSize=7, leading=9,
            textColor=TEXT_MUTED, alignment=TA_CENTER
        ),
        "term_title": ParagraphStyle(
            "term_title", fontName="Helvetica-Bold", fontSize=9, leading=12,
            textColor=PRIMARY, alignment=TA_LEFT
        ),
        "term_body": ParagraphStyle(
            "term_body", fontName="Helvetica", fontSize=7.5, leading=10,
            textColor=TEXT_MUTED, alignment=TA_LEFT
        ),
        "protocol_text": ParagraphStyle(
            "protocol_text", fontName="Helvetica-Bold", fontSize=10, leading=13,
            textColor=ACCENT_DARK, alignment=TA_LEFT
        ),
        "meta_text": ParagraphStyle(
            "meta_text", fontName="Helvetica", fontSize=7.5, leading=10,
            textColor=TEXT_MUTED, alignment=TA_LEFT
        ),
        "validation_badge": ParagraphStyle(
            "validation_badge", fontName="Helvetica-Bold", fontSize=9, leading=12,
            textColor=SUCCESS, alignment=TA_RIGHT
        ),
    }


def _generate_qr_image(url: str, size_px: int = 120) -> io.BytesIO | None:
    """Gera QR Code como imagem PNG em buffer de memória."""
    if not HAS_QRCODE:
        return None
    try:
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=4, border=2)
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#0f172a", back_color="white")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return buf
    except Exception:
        return None


def _build_section_header(title: str, subtitle: str, styles: dict) -> Table:
    """Cria um cabeçalho de seção com barra lateral azul."""
    data = [[
        Paragraph(title, styles["section_header"]),
        Paragraph(subtitle, styles["section_note"])
    ]]
    t = Table(data, colWidths=[350, 150])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT),
        ("LEFTPADDING", (0, 0), (0, 0), 18),
        ("RIGHTPADDING", (-1, -1), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, BORDER),
        ("LINEBEFORE", (0, 0), (0, -1), 4, ACCENT),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


def _build_data_row(label: str, value: str, styles: dict, color_style: str = "value") -> Table:
    """Cria uma linha de dados no estilo label:value."""
    data = [[
        Paragraph(label, styles["label"]),
        Paragraph(value, styles[color_style])
    ]]
    t = Table(data, colWidths=[200, 300])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("LEFTPADDING", (0, 0), (0, 0), 18),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 0), (-1, -1), 0.3, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


def _build_two_col_row(l1, v1, l2, v2, styles: dict) -> Table:
    """Cria uma linha com 2 pares label/value lado a lado."""
    data = [[
        Paragraph(l1, styles["label"]),
        Paragraph(v1, styles["value"]),
        Paragraph(l2, styles["label"]),
        Paragraph(v2, styles["value"]),
    ]]
    t = Table(data, colWidths=[130, 120, 130, 120])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("LEFTPADDING", (0, 0), (0, 0), 18),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 0), (-1, -1), 0.3, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


def gerar_dossie_pdf(car_data: Dict[str, Any], protocol: str) -> bytes:
    """Relatório demonstrativo com os dados fornecidos; não certifica perícia."""
    from xml.sax.saxutils import escape
    import json
    if not HAS_REPORTLAB:
        raise RuntimeError("ReportLab indisponível para gerar o relatório.")
    def text(value):
        return escape(str(value if value is not None and value != "" else "Não informado"))
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm, topMargin=18 * mm, bottomMargin=18 * mm)
    styles = _styles()
    styles["title"].textColor = HexColor("#0f172a")
    elements = [Paragraph("AUTOMATCH - RELATÓRIO DEMONSTRATIVO", styles["title"]), Spacer(1, 12),
                Paragraph("Informações do anúncio. Não substitui vistoria, certidão ou consulta oficial.", styles["value"]), Spacer(1, 10),
                Paragraph(f"Referência do exemplo: {text(protocol)}", styles["protocol_text"]), Spacer(1, 12)]
    fields = [("Marca", "brand"), ("Modelo", "model"), ("Ano/modelo", "year"), ("Quilometragem informada", "km"), ("Cor", "color"),
              ("Combustível", "fuel"), ("Placa informada", "plate"), ("Laudo informado pelo anunciante", "laudo_status"), ("Débitos informados pelo anunciante", "debt_status"),
              ("Histórico de leilão informado", "auction_history"), ("Código FIPE informado", "fipe_code")]
    for label, key in fields:
        elements.append(Paragraph(f"<b>{label}:</b> {text(car_data.get(key))}", styles["value"]))
        elements.append(Spacer(1, 6))
    fipe = car_data.get("fipe_price")
    fipe_text = f"R$ {float(fipe):,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.') if fipe is not None and float(fipe) > 0 else "Não informado"
    elements.append(Paragraph(f"<b>Referência de preço informada:</b> {text(fipe_text)}", styles["value"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("DETRAN, gravames, multas, estrutura, micragem e mecânica: não consultados ou medidos por este relatório.", styles["value"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph("<b>Análise visual automática:</b> " + text(inspection_summary(car_data.get("visual_inspection") or car_data.get("laudo_feedback"))), styles["value"]))
    elements.append(Paragraph(text(DISCLAIMER), styles["footer"]))
    elements.append(Paragraph("<b>Sequência do vídeo demonstrativo:</b> " + text(VIDEO_SUMMARY), styles["footer"]))
    feedback = car_data.get("laudo_feedback")
    if feedback:
        try:
            feedback = json.loads(feedback) if isinstance(feedback, str) else feedback
        except (ValueError, TypeError):
            feedback = None
        if isinstance(feedback, dict):
            summary = feedback.get("resumo_executivo") or feedback.get("sintese")
            if summary:
                elements.append(Spacer(1, 12))
                elements.append(Paragraph(f"<b>Parecer assistido informado (exige conferência):</b> {text(summary)}", styles["value"]))
    qr = _generate_qr_image(json.dumps({"ambiente": "demonstracao", "protocolo": protocol}, ensure_ascii=False))
    if qr:
        elements.append(Spacer(1, 10))
        elements.append(RLImage(qr, width=24 * mm, height=24 * mm))
        elements.append(Paragraph("QR de referência do exemplo; não é validação externa ou certificação.", styles["footer"]))
    elements.append(Spacer(1, 16))
    elements.append(Paragraph("Exemplo para apresentação das ferramentas. As informações dependem dos documentos e evidências originais do veículo; não há validação pública externa certificada.", styles["footer"]))
    doc.build(elements)
    return buffer.getvalue()