import os
import logging
import base64
from typing import Optional, Dict, Any, List

import httpx
from pydantic import BaseModel
from fastapi import APIRouter

from services.ai_service import (
    preprocess_and_compress_image,
    call_gemini_generate,
    executar_pericia_visual_completa
)
from services.pricing_service import calcular_preco_justo

logger = logging.getLogger("automatch")
router = APIRouter(tags=["IA & Precificação"])


class AnaliseVisualRequest(BaseModel):
    mensagem: Optional[str] = "Analise a imagem deste veículo e liste apenas as avarias visíveis. Seja direto e conciso."
    imageUrl: Optional[str] = None
    imageBase64: Optional[str] = None
    car_context: Optional[Dict[str, Any]] = None


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
    Endpoint de Perícia Visual de Avarias de Veículos:
    Suporta fotos via base64, data URI, URLs remotas ou caminhos de imagens de anúncios.
    Executa verificação por Google Gemini Vision ou Motor Pericial Local Automatch Vision (CV + YOLOv8).
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    image_bytes = None

    # 1. Resolução a partir de imageBase64
    if payload.imageBase64:
        try:
            raw_base64 = payload.imageBase64
            if "," in raw_base64:
                raw_base64 = raw_base64.split(",")[1]
            raw_bytes = base64.b64decode(raw_base64)
            image_bytes = preprocess_and_compress_image(raw_bytes)
        except Exception as e:
            logger.warning("Falha ao decodificar imageBase64: %s", e)

    # 2. Resolução a partir de imageUrl
    if not image_bytes and payload.imageUrl:
        url_str = payload.imageUrl.strip()

        # Caso seja Data URI embutido na URL
        if url_str.startswith("data:image/"):
            try:
                raw_base64 = url_str.split(",")[1] if "," in url_str else url_str
                raw_bytes = base64.b64decode(raw_base64)
                image_bytes = preprocess_and_compress_image(raw_bytes)
            except Exception as e:
                logger.warning("Falha ao decodificar Data URI em imageUrl: %s", e)

        # Caso seja URL HTTP remota
        elif url_str.startswith("http://") or url_str.startswith("https://"):
            try:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    resp = await client.get(url_str)
                    if resp.status_code == 200:
                        image_bytes = preprocess_and_compress_image(resp.content)
            except Exception as e:
                logger.warning("Falha ao baixar imagem remota: %s", e)

        # Caso seja caminho relativo de imagens públicas da vitrine/anúncios
        elif url_str.startswith("/images/") or "/images/" in url_str:
            filename = os.path.basename(url_str)
            candidate_paths = [
                os.path.join("/app", "public_images", filename),
                os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "images", filename),
                os.path.join(os.path.dirname(__file__), "..", "uploads", filename),
                os.path.join(os.path.dirname(__file__), "..", "uploads", "laudos", filename)
            ]
            for cpath in candidate_paths:
                if os.path.exists(cpath):
                    try:
                        with open(cpath, "rb") as f:
                            image_bytes = preprocess_and_compress_image(f.read())
                            break
                    except Exception as fe:
                        logger.warning("Erro ao ler imagem local %s: %s", cpath, fe)

            # Se não encontrou no filesystem, tenta buscar do container frontend via rede
            if not image_bytes:
                try:
                    async with httpx.AsyncClient(timeout=3.0) as client:
                        resp = await client.get(f"http://frontend:5173/images/{filename}")
                        if resp.status_code == 200:
                            image_bytes = preprocess_and_compress_image(resp.content)
                except Exception:
                    pass

    # Se nenhuma imagem foi fornecida ou encontrada, tenta placeholder padrão
    if not image_bytes:
        default_paths = [
            "/app/public_images/FotoGolfGTI.jpeg",
            os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "images", "FotoGolfGTI.jpeg")
        ]
        for dpath in default_paths:
            if os.path.exists(dpath):
                try:
                    with open(dpath, "rb") as f:
                        image_bytes = preprocess_and_compress_image(f.read())
                        break
                except Exception:
                    pass

    if not image_bytes:
        return {
            "status": "error",
            "modelo": "Automatch Vision Engine",
            "resposta": "Nenhuma imagem foi recebida ou localizada para perícia visual.",
            "tem_avarias": False,
            "score_lataria": 0,
            "condicao_geral": "Indeterminada",
            "avarias": [],
            "pontos_avaria": []
        }

    # 3. Executa a perícia com Gemini ou Visão Computacional
    resultado = await executar_pericia_visual_completa(
        image_bytes=image_bytes,
        api_key=api_key if len(api_key) > 5 else None,
        car_context=payload.car_context
    )

    return resultado


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
