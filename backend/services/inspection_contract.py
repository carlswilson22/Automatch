"""Contrato da análise visual; confiança de objeto não é confiança de dano."""
from datetime import datetime, timezone
import hashlib
import json

SCHEMA_VERSION = 2
METHOD_VERSION = "visual-evidence-v2"
DISCLAIMER = "Análise automática por imagens; não substitui a vistoria presencial."

def inconclusive(image_bytes=b"", *, reason="unvalidated_method", method="Automatch",
                 vehicle_confidence=None, vehicle_detected=None, status="success"):
    return {
        "schema_version": SCHEMA_VERSION, "analysis_state": "inconclusive",
        "status": status, "modelo": method, "method_version": METHOD_VERSION,
        "reason": reason, "resposta": "Análise inconclusiva, confirme com vistoria presencial.",
        "disclaimer": DISCLAIMER, "tem_avarias": None, "score_lataria": None,
        "condicao_geral": "Inconclusiva", "avarias": [], "pontos_avaria": [],
        "damage_confidence": None, "confianca_ia": None,
        "vehicle_confidence": vehicle_confidence, "vehicle_detected": vehicle_detected,
        "image_sha256": hashlib.sha256(image_bytes).hexdigest() if image_bytes else None,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "damage_detection_validated": False,
    }

def inspection_from_feedback(value):
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except (ValueError, TypeError):
            value = None
    if isinstance(value, dict):
        value = value.get("visual_inspection", value)
    if not isinstance(value, dict) or value.get("schema_version") != SCHEMA_VERSION:
        return None
    # Nenhuma origem visual foi calibrada. Preserva rastreabilidade, não conclusões legadas.
    result = inconclusive(reason=value.get("reason", "unvalidated_result"),
        method=value.get("modelo", "Automatch"))
    for key in ("image_sha256", "analyzed_at", "car_id", "source_image", "vehicle_confidence", "vehicle_detected"):
        if key in value:
            result[key] = value[key]
    return result



GEMINI_CALIBRATION_ID = "gemini-vision-v1"


def gemini_visual_result(
    image_bytes: bytes,
    damage_points: list,
    gemini_raw_text: str,
    *,
    car_id: str = None,
    vehicle_confidence: float = None,
):
    """
    Monta contrato válido SOMENTE quando o Gemini retornou pontos de dano
    com evidência visual estruturada (damage_points não vazio).
    Caso contrário, retorna inconclusive.
    """
    if not damage_points:
        res = inconclusive(image_bytes, reason="gemini_no_damage_found",
                            method="Gemini Vision",
                            vehicle_confidence=vehicle_confidence)
        if car_id:
            res["car_id"] = str(car_id)
        return res
    result = {
        "schema_version": SCHEMA_VERSION,
        "analysis_state": "damage_detected",
        "status": "success",
        "modelo": "Gemini Vision",
        "method_version": METHOD_VERSION,
        "calibration_id": GEMINI_CALIBRATION_ID,
        "reason": "gemini_visual_evidence",
        "resposta": (
            "Possíveis avarias identificadas pela análise de imagem. "
            "Confirme com vistoria presencial."
        ),
        "disclaimer": DISCLAIMER,
        "tem_avarias": True,
        "score_lataria": None,
        "condicao_geral": "Avaria identificada (análise por imagem)",
        "avarias": [p.get("descricao", p.get("description", "")) for p in damage_points],
        "pontos_avaria": damage_points,
        "damage_confidence": None,       # Gemini não produz probabilidade calibrada
        "confianca_ia": None,
        "vehicle_confidence": vehicle_confidence,
        "vehicle_detected": True,
        "image_sha256": hashlib.sha256(image_bytes).hexdigest() if image_bytes else None,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "damage_detection_validated": True,
        "gemini_raw_response": gemini_raw_text[:2000] if gemini_raw_text else None,
    }
    if car_id:
        result["car_id"] = str(car_id)
    return result


def inspection_summary(value):
    result = inspection_from_feedback(value)
    return result.get("resposta", "Análise inconclusiva, confirme com vistoria presencial.") if result else "Análise visual não realizada."
