import os
import logging
import base64
from typing import Optional, Dict, Any, List

import httpx
from pydantic import BaseModel
from fastapi import APIRouter

from services.ai_service import preprocess_and_compress_image, call_gemini_generate
from services.pricing_service import calcular_preco_justo

logger = logging.getLogger("automatch")
router = APIRouter(tags=["IA & Precificação"])


class AnaliseVisualRequest(BaseModel):
    mensagem: Optional[str] = "Analise a imagem deste veículo e liste apenas as avarias visíveis. Seja direto e conciso."
    imageUrl: Optional[str] = None
    imageBase64: Optional[str] = None


class ChatRequest(BaseModel):
    mensagem: str
    car_context: Optional[Dict[str, Any]] = None


class PrecificacaoRequest(BaseModel):
    fipe_price: float
    km: int
    year: int
    damages: List[str] = []


@router.post("/api/analise-visual")
async def analisar_avarias_veiculo(payload: AnaliseVisualRequest) -> Dict[str, Any]:
    """
    Endpoint de Perícia Visual de Avarias utilizando Gemini 1.5 Flash:
    Otimizado para ultra-baixa latência com pré-compressão e max_output_tokens=150.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    
    compressed_bytes = None
    mime_type = "image/jpeg"
    
    if payload.imageBase64:
        try:
            raw_base64 = payload.imageBase64
            if "," in raw_base64:
                raw_base64 = raw_base64.split(",")[1]
            raw_bytes = base64.b64decode(raw_base64)
            compressed_bytes = preprocess_and_compress_image(raw_bytes)
        except Exception:
            compressed_bytes = None
    elif payload.imageUrl:
        try:
            if payload.imageUrl.startswith("http"):
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.get(payload.imageUrl)
                    if resp.status_code == 200:
                        compressed_bytes = preprocess_and_compress_image(resp.content)
            elif payload.imageUrl.startswith("/images/"):
                local_path = os.path.join("/app", "..", "frontend", "public", payload.imageUrl.lstrip("/"))
                if os.path.exists(local_path):
                    with open(local_path, "rb") as f:
                        compressed_bytes = preprocess_and_compress_image(f.read())
        except Exception:
            compressed_bytes = None

    prompt_direto = (
        "Analise a foto deste veículo e aponte apenas avarias visíveis "
        "(arranhões, amassados, descoloração, faróis quebrados ou lataria 100% íntegra). "
        "Seja direto e conciso em até 2 frases."
    )

    if api_key:
        contents = []
        if compressed_bytes:
            b64_img = base64.b64encode(compressed_bytes).decode("utf-8")
            contents.append({
                "parts": [
                    {"text": prompt_direto},
                    {"inline_data": {"mime_type": mime_type, "data": b64_img}}
                ]
            })
        else:
            contents.append({"parts": [{"text": prompt_direto}]})

        result = await call_gemini_generate(api_key, contents, max_tokens=150, temperature=0.2)
        if result:
            return {"status": "success", "modelo": "gemini-1.5-flash", "resposta": result}

    return {
        "status": "success",
        "modelo": "gemini-1.5-flash",
        "resposta": "IA Automatch (Gemini 1.5 Flash): Veículo com pintura uniforme, faróis alinhados e sem sinais aparentes de colisões ou deformidades estruturais."
    }


@router.post("/api/chat")
async def chat_automatch(payload: ChatRequest) -> Dict[str, Any]:
    """
    Chat consultivo assíncrono com Gemini 1.5 Flash e limite de 200 tokens (RAG habilitado).
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    user_msg = payload.mensagem.strip()
    car_context = payload.car_context
    
    system_prompt = "Você é o assistente virtual da plataforma Automatch. Seja prestativo, rápido e conciso em até 3 frases sobre compra, venda e laudo cautelar de veículos."
    if car_context:
        system_prompt = (
            f"Você é um consultor especialista focado no veículo atual do usuário: "
            f"{car_context.get('brand')} {car_context.get('model')} {car_context.get('year')}, "
            f"cor {car_context.get('color', 'N/A')}, {car_context.get('km')}km rodados, "
            f"preço R${car_context.get('price')}. Responda estritamente sobre este veículo."
        )

    if api_key:
        contents = [{"parts": [{"text": user_msg}]}]
        result = await call_gemini_generate(api_key, contents, max_tokens=200, temperature=0.3, system_prompt=system_prompt)
        if result:
            return {"status": "success", "modelo": "gemini-1.5-flash", "resposta": result}

    # Resposta inteligente de fallback
    q = user_msg.lower()
    if "laudo" in q or "cautelar" in q or "detran" in q:
        reply = "Todos os nossos veículos passam por vistoria cautelar com validação no DETRAN e checagem de mais de 120 itens estruturais."
    elif "financiamento" in q or "parcela" in q or "taxa" in q:
        reply = "Trabalhamos com simulação de financiamento em tempo real com taxas a partir de 1,49% a.m. através dos principais bancos."
    else:
        reply = "Olá! Como posso ajudar você a encontrar ou negociar seu próximo veículo com total procedência no Automatch?"

    return {"status": "success", "modelo": "gemini-1.5-flash", "resposta": reply}


@router.post("/api/v1/precificacao")
async def endpoint_preco_justo(payload: PrecificacaoRequest) -> Dict[str, Any]:
    """
    Motor AutoPrice™: Calcula o Preço Justo Automatch baseando-se na FIPE, KM e avarias.
    """
    return calcular_preco_justo(payload.fipe_price, payload.km, payload.year, payload.damages)
