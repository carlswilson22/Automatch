import os
import io
import logging
import base64
from typing import Any, Dict, Optional

import httpx
from PIL import Image

logger = logging.getLogger("automatch")


def preprocess_and_compress_image(image_bytes: bytes, max_dim: int = 1024, quality: int = 80) -> bytes:
    """
    Reduz resolução para no máximo 1024x1024 e comprime para JPEG leve,
    minimizando latência de rede e tempo de inferência do Gemini Flash.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        output_buffer = io.BytesIO()
        img.save(output_buffer, format="JPEG", quality=quality, optimize=True)
        return output_buffer.getvalue()
    except Exception as e:
        logger.warning("Erro ao comprimir imagem: %s", e)
        return image_bytes


async def call_gemini_generate(api_key: str, contents: list, max_tokens: int = 150, temperature: float = 0.2, system_prompt: Optional[str] = None) -> Optional[str]:
    """
    Chamada genérica assíncrona para o Gemini 1.5 Flash.
    Retorna o texto gerado ou None em caso de falha.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    body: Dict[str, Any] = {
        "contents": contents,
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": temperature
        }
    }
    if system_prompt:
        body["system_instruction"] = {"parts": [{"text": system_prompt}]}
    
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            response = await client.post(url, json=body)
            if response.status_code == 200:
                res_json = response.json()
                candidates = res_json.get("candidates", [])
                if candidates:
                    texto = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if texto:
                        return texto.strip()
    except Exception as e:
        logger.warning("Erro na chamada Gemini 1.5 Flash: %s", e)
    return None


# ==============================================================================
# YOLOv8 Model Management
# ==============================================================================

_yolo_model = None

def get_yolo_model() -> Any:
    """Lazy load para o modelo YOLOv8 para não penalizar startup."""
    global _yolo_model
    if _yolo_model is None:
        try:
            from ultralytics import YOLO
            _yolo_model = YOLO('yolov8n.pt')
        except Exception as e:
            logger.warning("Erro ao instanciar YOLO: %s", e)
            return None
    return _yolo_model


def run_yolo_inference(file_path_str: str) -> Dict[str, Any]:
    """Roda inferência e extrai classes e confidence de forma síncrona."""
    model = get_yolo_model()
    if not model:
        return {"error": "YOLOv8 não está disponível."}
    
    results = model.predict(source=file_path_str, conf=0.25, verbose=False)
    if not results or len(results) == 0:
        return {"detected_items": ["Nenhum objeto detectado"], "confidence": "0%"}
        
    result = results[0]
    detected_classes = set()
    max_conf = 0.0
    
    for box in result.boxes:
        conf = float(box.conf[0])
        cls_id = int(box.cls[0])
        cls_name = result.names[cls_id]
        detected_classes.add(cls_name)
        if conf > max_conf:
            max_conf = conf
            
    if detected_classes:
        return {
            "detected_items": list(detected_classes),
            "confidence": f"{max_conf:.2%}"
        }
    return {"detected_items": ["Nenhum objeto detectado"], "confidence": "0%"}
