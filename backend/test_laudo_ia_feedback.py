"""
test_laudo_ia_feedback.py — Testes automatizados da auditoria pericial por IA para Laudos Cautelares.

Objetivo e Motivo da Criação:
  - Valida o módulo de inteligência artificial (Gemini 1.5 Flash + Fallback Heurístico),
    garantindo precisão na conferência cruzada (cross-check), categorização de matriz de riscos
    e classificação semafórica de conformidade (SEM_RESSALVAS, COM_ATENCAO, COM_RESTRICOES).
  - Assegura resiliência total (Graceful Degradation) mesmo se o serviço de IA estiver inacessível.
"""
import io
import os
import asyncio
import unittest
from services.laudo_ia_evaluator import (
    avaliar_laudo_com_ia,
    ClassificacaoGeralEnum,
    CategoriaRiscoEnum,
    GravidadeEnum,
    LaudoIAFeedbackResponse
)


def _criar_pdf_sintetico(titulo: str, linhas: list) -> bytes:
    """Gera um PDF sintético válido em memória com streams de texto formatados."""
    text_stream = [
        "BT",
        "/F1 16 Tf",
        "50 780 Td",
        f"({titulo}) Tj",
        "/F1 10 Tf",
        "0 -20 Td"
    ]
    for linha in linhas:
        safe_l = linha.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        text_stream.append(f"({safe_l}) Tj")
        text_stream.append("0 -14 Td")
    text_stream.append("ET")

    stream_content = "\n".join(text_stream)
    stream_bytes = stream_content.encode("utf-8")
    length = len(stream_bytes)

    pdf = (
        f"%PDF-1.4\n"
        f"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        f"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        f"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
        f"4 0 obj\n<< /Length {length} >>\nstream\n{stream_content}\nendstream\nendobj\n"
        f"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
        f"xref\n0 6\n"
        f"0000000000 65535 f \n"
        f"0000000009 00000 n \n"
        f"0000000058 00000 n \n"
        f"0000000115 00000 n \n"
        f"0000000242 00000 n \n"
        f"0000000300 00000 n \n"
        f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n380\n%%EOF\n"
    )
    return pdf.encode("utf-8")


class TestLaudoIAFeedback(unittest.TestCase):
    """Bateria de Testes Unitários e de Integração para Laudos Cautelares com IA."""

    def test_laudo_aprovado_sem_ressalvas(self):
        pdf_bytes = _criar_pdf_sintetico(
            "LAUDO CAUTELAR PERICIAL - VEICULO 100% CONFORME",
            [
                "PLACA: BRA2E19",
                "CHASSI: 9BRBL42EXN8192841",
                "MARCA / MODELO: Toyota Corolla Cross XRX 2.0 Hibrido",
                "ANO FABRICACAO / MODELO: 2024 / 2024",
                "QUILOMETRAGEM NO HODOMETRO: 12.040 km",
                "LONGARINAS: ORIGINAIS DE FABRICA SEM REPAROS",
                "PASSAGEM POR LEILAO: NADA CONSTA",
                "HISTORICO DE SINISTRO: NADA CONSTA",
                "RESTRICOES JUDICIAIS OU RENAJUD: SEM APONTAMENTOS"
            ]
        )

        car_ctx = {
            "plate": "BRA2E19",
            "chassi": "9BRBL42EXN8192841",
            "brand": "Toyota",
            "model": "Corolla Cross XRX",
            "year": "2024",
            "km": 12000
        }

        res = asyncio.run(avaliar_laudo_com_ia(pdf_bytes, "application/pdf", car_ctx))
        self.assertIsInstance(res, LaudoIAFeedbackResponse)
        self.assertEqual(res.classificacao_geral, ClassificacaoGeralEnum.SEM_RESSALVAS)
        self.assertTrue(res.conferencia_dados.placa.match)
        self.assertTrue(res.conferencia_dados.chassi.match)
        self.assertTrue(res.conferencia_dados.marca_modelo.match)
        self.assertTrue(res.conferencia_dados.ano.match)
        self.assertTrue(res.conferencia_dados.quilometragem.match_aproximado)
        self.assertEqual(len(res.pontos_atencao_riscos), 0)

    def test_laudo_com_atencao_leilao_financeiro(self):
        pdf_bytes = _criar_pdf_sintetico(
            "LAUDO CAUTELAR PERICIAL - APONTAMENTO LEILAO",
            [
                "PLACA: VWP3T23",
                "CHASSI: 9BWAB42GXP4819201",
                "MARCA / MODELO: Volkswagen Polo TSI Comfortline 1.0",
                "ANO FABRICACAO / MODELO: 2023 / 2023",
                "QUILOMETRAGEM NO HODOMETRO: 18.600 km",
                "PASSAGEM POR LEILAO: APONTAMENTO DETECTADO (LEILAO DE FINANCEIRA - RECUPERACAO)",
                "HISTORICO DE SINISTRO: NADA CONSTA",
                "PINTURA: REPINTURA EM 220 MICRAS"
            ]
        )

        car_ctx = {
            "plate": "VWP3T23",
            "chassi": "9BWAB42GXP4819201",
            "brand": "Volkswagen",
            "model": "Polo TSI Comfortline",
            "year": "2023",
            "km": 18500
        }

        res = asyncio.run(avaliar_laudo_com_ia(pdf_bytes, "application/pdf", car_ctx))
        self.assertEqual(res.classificacao_geral, ClassificacaoGeralEnum.COM_ATENCAO)
        self.assertTrue(any(r.categoria == CategoriaRiscoEnum.LEILAO for r in res.pontos_atencao_riscos))

    def test_laudo_com_restricoes_e_divergencia_km(self):
        pdf_bytes = _criar_pdf_sintetico(
            "LAUDO CAUTELAR PERICIAL - REPROVADO",
            [
                "PLACA: CHE4T24",
                "CHASSI: 9BGKL48FXP9283741",
                "MARCA / MODELO: Chevrolet Tracker Premier 1.2",
                "ANO FABRICACAO / MODELO: 2024 / 2024",
                "QUILOMETRAGEM NO HODOMETRO: 45.200 km",
                "LONGARINA DIANTEIRA ESQUERDA: INCONFORME - CORTE E SOLDA MIG NAO ORIGINAL",
                "HISTORICO DE SINISTRO: REGISTRADO SINISTRO DE MEDIA MONTA",
                "RESTRICOES JUDICIAIS: BLOQUEIO JUDICIAL RENAJUD ATIVO"
            ]
        )

        car_ctx = {
            "plate": "CHE4T24",
            "chassi": "9BGKL48FXP9283741",
            "brand": "Chevrolet",
            "model": "Tracker Premier 1.2",
            "year": "2024",
            "km": 8500 # Divergência intencional (8.500 vs 45.200)
        }

        res = asyncio.run(avaliar_laudo_com_ia(pdf_bytes, "application/pdf", car_ctx))
        self.assertEqual(res.classificacao_geral, ClassificacaoGeralEnum.COM_RESTRICOES)
        self.assertFalse(res.conferencia_dados.quilometragem.match_aproximado)
        self.assertTrue(any(r.categoria == CategoriaRiscoEnum.SINISTRO for r in res.pontos_atencao_riscos))
        self.assertTrue(any(r.categoria == CategoriaRiscoEnum.ESTRUTURA for r in res.pontos_atencao_riscos))
        self.assertTrue(any(r.categoria == CategoriaRiscoEnum.RESTRICAO_JUDICIAL for r in res.pontos_atencao_riscos))

    def test_graceful_degradation_fallback(self):
        # Arquivo corrompido / ilegível não deve lançar exceção destrutiva
        corrupted_bytes = b"CABECALHO_NAO_CONFORME"
        car_ctx = {"plate": "AAA0A00", "chassi": "111222333", "brand": "Fiat", "model": "Uno", "year": "2020", "km": 10000}
        
        res = asyncio.run(avaliar_laudo_com_ia(corrupted_bytes, "application/octet-stream", car_ctx))
        self.assertIsInstance(res, LaudoIAFeedbackResponse)
        self.assertIn(res.classificacao_geral, [ClassificacaoGeralEnum.SEM_RESSALVAS, ClassificacaoGeralEnum.COM_ATENCAO, ClassificacaoGeralEnum.COM_RESTRICOES])


if __name__ == "__main__":
    unittest.main()

