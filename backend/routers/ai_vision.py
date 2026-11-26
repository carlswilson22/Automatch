from services.inspection_contract import inspection_summary
"""
ai_vision.py — Router de análise visual por IA (Perícia Automatch Vision).

Objetivo e Motivo da Criação:
  - Criado para orquestrar os endpoints de perícia veicular por visão computacional: recebimento de imagens,
    execução de inferência de avarias na lataria (via YOLOv8 / Gemini Vision) e geração de laudos técnicos automatizados.
  - Permite a emissão de pontuações de integridade, cálculo estimado de custos de reparo e descrições automáticas com IA.

Responsabilidades:
  - Endpoint de upload de imagens para scanner de lataria e avarias.
  - Orquestração entre Gemini Vision API (nuvem) e fallback OpenCV local.
  - Geração do laudo pericial com pontos de avaria, score de integridade,
    condição geral e custo estimado de reparo.
"""

import os
import logging
import base64
import json
import asyncio
from typing import Optional, Dict, Any, List

import httpx
from pydantic import BaseModel
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from security_guard import RateLimiter

from services.ai_service import (
    GEMINI_MODELS,
    preprocess_and_compress_image,
    call_gemini_generate,
    stream_gemini_generate,
    executar_pericia_visual_completa,
    compilar_laudo_360
)
from services.pricing_service import calcular_preco_justo
from services.image_sources import is_allowed_image_url
from media_storage import UPLOADS_DIR
from pathlib import Path

logger = logging.getLogger("automatch")
router = APIRouter(tags=["IA & Precificação"])

# Instância de rate limiting para o chat do consultor IA (30 req / min por IP)
chat_rate_limiter = RateLimiter(max_requests=30, window_seconds=60, block_duration_seconds=60)


class AnaliseVisualRequest(BaseModel):
    mensagem: Optional[str] = "Analise a imagem deste veículo e liste apenas as avarias visíveis. Seja direto e conciso."
    imageUrl: Optional[str] = None
    imageBase64: Optional[str] = None
    car_context: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    mensagem: str
    historico: Optional[List[Dict[str, Any]]] = []
    car_context: Optional[Dict[str, Any]] = None


class PrecificacaoRequest(BaseModel):
    fipe_price: float
    km: int
    year: int
    damages: List[str] = []


@router.post("/api/analise-visual")
async def analisar_avarias_veiculo(request: Request) -> Dict[str, Any]:
    """
    Endpoint de Perícia Visual de Avarias de Veículos:
    Suporta fotos via JSON (base64, data URI, URLs remotas ou caminhos locais)
    ou via upload direto multipart/form-data.
    Executa verificação por Google Gemini Vision ou Motor Pericial Local Automatch Vision (CV + YOLOv8).
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    image_bytes = None
    car_context = None
    image_url = None
    image_base64 = None

    content_type = request.headers.get("content-type", "").lower()

    if "multipart/form-data" in content_type:
        try:
            form = await request.form()
            upload_file = form.get("file") or form.get("imagem") or form.get("image") or form.get("photo")
            if upload_file and hasattr(upload_file, "read"):
                raw_bytes = await upload_file.read()
                if raw_bytes and len(raw_bytes) > 0:
                    image_bytes = preprocess_and_compress_image(raw_bytes)
            if form.get("imageUrl"):
                image_url = str(form.get("imageUrl"))
            if form.get("imageBase64"):
                image_base64 = str(form.get("imageBase64"))
            if form.get("car_context"):
                raw_ctx = form.get("car_context")
                try:
                    car_context = json.loads(raw_ctx) if isinstance(raw_ctx, str) else raw_ctx
                except Exception:
                    pass
        except Exception as fe:
            logger.warning("Falha ao processar formulário multipart: %s", fe)
            raise HTTPException(status_code=422, detail="Falha ao processar dados multipart/form-data.")
    else:
        # Tenta decodificar como JSON
        try:
            raw_json = await request.json()
            payload = AnaliseVisualRequest(**raw_json)
            image_base64 = payload.imageBase64
            image_url = payload.imageUrl
            car_context = payload.car_context
        except Exception:
            # Se não for JSON válido, verifica se o payload contém bytes brutos de imagem (JPEG/PNG)
            try:
                raw_body = await request.body()
                if raw_body and len(raw_body) > 10 and (raw_body[:3] == b"\xff\xd8\xff" or raw_body[:8] == b"\x89PNG\r\n\x1a\n"):
                    image_bytes = preprocess_and_compress_image(raw_body)
                else:
                    raise HTTPException(
                        status_code=422,
                        detail="Corpo da requisição deve ser um JSON válido ou multipart/form-data."
                    )
            except HTTPException:
                raise
            except Exception:
                raise HTTPException(status_code=422, detail="Dados da requisição inválidos.")

    # 1. Resolução a partir de imageBase64
    if not image_bytes and image_base64:
        try:
            raw_base64 = image_base64
            if "," in raw_base64:
                raw_base64 = raw_base64.split(",")[1]
            raw_bytes = base64.b64decode(raw_base64)
            image_bytes = preprocess_and_compress_image(raw_bytes)
        except Exception as e:
            logger.warning("Falha ao decodificar imageBase64: %s", e)

    # 2. Resolução a partir de imageUrl
    if not image_bytes and image_url:
        url_str = image_url.strip()

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
            if not is_allowed_image_url(url_str):
                raise HTTPException(status_code=400, detail="Origem de imagem não permitida. Envie a imagem como arquivo.")
            try:
                async with httpx.AsyncClient(timeout=6.0) as client:
                    async with client.stream("GET", url_str, follow_redirects=False) as resp:
                        if resp.status_code == 200:
                            chunks = bytearray()
                            async for chunk in resp.aiter_bytes():
                                chunks.extend(chunk)
                                if len(chunks) > 15 * 1024 * 1024:
                                    raise HTTPException(status_code=413, detail="Imagem excede o limite de 15 MB.")
                            image_bytes = preprocess_and_compress_image(bytes(chunks))
            except HTTPException:
                raise
            except Exception as e:
                logger.warning("Falha ao baixar imagem remota: %s", type(e).__name__)

        elif url_str.startswith("/api/v1/laudos/files/"):
            filename = url_str.split("/api/v1/laudos/files/", 1)[1]
            if filename != os.path.basename(filename) or filename in (".", ".."):
                raise HTTPException(status_code=400, detail="Caminho de imagem inválido.")
            source = UPLOADS_DIR / filename
            if source.is_file():
                image_bytes = preprocess_and_compress_image(source.read_bytes())

        # Caso seja caminho relativo de imagens públicas da vitrine/anúncios
        elif url_str.startswith("/images/") or "/images/" in url_str:
            relative = url_str.split("/images/", 1)[1].split("?", 1)[0]
            filename = relative
            image_roots = [
                Path(__file__).resolve().parent.parent / "public_images",
                Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "images",
                Path("/app/public_images")
            ]
            candidate_paths = []
            for image_root in image_roots:
                image_root = image_root.resolve()
                candidate = (image_root / relative).resolve()
                if not candidate.is_relative_to(image_root):
                    raise HTTPException(status_code=400, detail="Caminho de imagem inválido.")
                candidate_paths.append(candidate)
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

    if not image_bytes:
        raise HTTPException(status_code=422, detail="Nenhuma imagem válida foi recebida ou localizada para análise.")

    resultado = await executar_pericia_visual_completa(
        image_bytes=image_bytes,
        api_key=api_key if len(api_key) > 5 else None,
        car_context=car_context
    )

    if resultado.get("status") == "error":
        raise HTTPException(status_code=422, detail="Imagem inválida. Envie uma foto válida e tente novamente.")
    return resultado


@router.post("/api/chat")
async def chat_automatch(payload: ChatRequest, request: Request) -> Dict[str, Any]:
    """
    Chat consultivo assíncrono com Gemini 1.5 Flash e limite de 200 tokens (RAG e histórico habilitados).
    """
    # Rate Limiting por IP para proteção contra abusos e DoS (OWASP A04)
    client_ip = request.client.host if request.client else "127.0.0.1"
    is_allowed, remaining = chat_rate_limiter.is_allowed(client_ip)
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Muitas perguntas consecutivas. Por favor, aguarde {remaining}s antes de enviar nova mensagem."
        )

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    user_msg = payload.mensagem.strip()
    historico = payload.historico or []
    car_context = payload.car_context
    
    system_prompt = "Você é o assistente virtual da plataforma Automatch. Seja prestativo, rápido e conciso em até 3 frases sobre compra, venda e laudo cautelar de veículos."
    if car_context:
        damages_str = inspection_summary(car_context.get('visual_inspection'))
        system_prompt = (
            f"Você é um consultor especialista focado no veículo atual do usuário: "
            f"Resultado visual automático: {damages_str}. Não transforme o contexto do usuário em evidência de avaria. Não afirme dano ou integridade sem método validado. "

            f"{car_context.get('brand')} {car_context.get('model')} {car_context.get('year')}, "
            f"cor {car_context.get('color', 'N/A')}, {car_context.get('km')}km rodados, "
            f"preço R${car_context.get('price')}. Responda sobre o cadastro deste veículo. Não certifique procedência, regularidade, garantia ou integridade sem evidência; informe ausência de dados. Não prometa condições bancárias ou consultas oficiais."
        )

    if api_key:
        contents = []
        for msg in historico[-6:]:
            role = "user" if msg.get("from") == "user" or msg.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.get("text", "") or msg.get("content", "")}]})
        contents.append({"role": "user", "parts": [{"text": user_msg}]})
        result = await call_gemini_generate(api_key, contents, max_tokens=200, temperature=0.3, system_prompt=system_prompt)
        if result:
            return {"status": "success", "modelo": GEMINI_MODELS[0], "resposta": result}

    reply = generate_semantic_reply(user_msg, car_context)
    return {"status": "success", "modelo": "resposta-local-cadastro", "origem": "cadastro", "is_simulado": True, "resposta": reply}


def generate_semantic_reply(user_msg: str, car_context: Optional[Dict[str, Any]] = None) -> str:
    """Resposta local apoiada somente no cadastro, sem certificar perícia."""
    import unicodedata
    q = ''.join(c for c in unicodedata.normalize('NFD', user_msg.lower()) if unicodedata.category(c) != 'Mn')
    car = car_context or {}
    specs = car.get('specs') or {}
    answers = []
    if any(word in q for word in ['avaria', 'dano', 'risco', 'amassado', 'defeito', 'sinistro', 'batida', 'batido']):
        answers.append(inspection_summary(car.get('visual_inspection')) + ' A análise automática não substitui a vistoria presencial.')
    if any(word in q for word in ['document', 'detran', 'ipva', 'licenciamento', 'multa', 'debito', 'gravame']):
        answers.append('DETRAN, IPVA, multas e gravames não foram consultados. Confira os documentos com o anunciante.')
    fields = [
        (['cor', 'pintura', 'lataria'], 'Cor', car.get('color') or car.get('cor')),
        (['ano', 'modelo', 'fabricacao'], 'Ano/modelo', car.get('year')),
        (['direcao', 'volante'], 'Direção', specs.get('direcao')),
        (['freio', 'abs', 'frenagem'], 'Freios', specs.get('freios')),
        (['motor', 'potencia', 'torque', 'cilindrada'], 'Motor', specs.get('motor') or car.get('motor')),
        (['km', 'quilometragem', 'rodado', 'hodometro'], 'Quilometragem', car.get('km', car.get('mileage'))),
        (['cambio', 'transmissao', 'marcha'], 'Transmissão', specs.get('cambio') or car.get('transmission')),
        (['combustivel', 'consumo', 'gasolina', 'flex', 'diesel', 'autonomia'], 'Combustível/consumo', specs.get('combustivel') or car.get('fuel')),
        (['airbag', 'seguranca'], 'Airbags', specs.get('airbags')),
        (['suspensao', 'amortecedor'], 'Suspensão', specs.get('suspensao')),
        (['pneu', 'estepe'], 'Pneus', specs.get('pneus')),
        (['laudo', 'cautelar', 'leilao', 'estrutura', 'procedencia', 'pericia'], 'Situação do laudo informada', car.get('laudoStatus') or car.get('laudo_status')),
    ]
    for words, label, value in fields:
        if any(word in q for word in words):
            if label == 'Quilometragem' and isinstance(value, (int, float)):
                value = f'{value:,.0f} km'.replace(',', '.')
            answers.append(f'{label}: {value if value is not None and value != "" else "não informado"}.')
    if any(word in q for word in ['preco', 'valor', 'fipe', 'quanto custa']):
        price = car.get('price')
        text = f'R$ {price:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.') if isinstance(price, (int, float)) else str(price or 'não informado')
        answers.append(f'Preço anunciado: {text}. Confira código e mês da referência FIPE, se informada.')
    if any(word in q for word in ['financ', 'parcela', 'taxa', 'banco', 'entrada', 'juros', 'simular']):
        answers.append('Experimente o simulador do anúncio. Parcelas são estimativas; taxas, condições e aprovação dependem da instituição.')
    if any(word in q for word in ['garantia', 'revisao', 'cobertura']):
        answers.append('Garantia e revisões: confira os documentos e condições com a loja; o cadastro não comprova cobertura.')
    if 'troca' in q:
        answers.append('Experimente o simulador de troca; a aceitação e o valor dependem da avaliação da loja.')
    return ('\n\n'.join(answers) if answers else 'Não há informação específica no cadastro. Consulte o vendedor para confirmar.') + '\n\nInformações do anúncio, sem certificação ou consulta oficial.'

@router.post("/api/chat/stream")
async def chat_stream(payload: ChatRequest, request: Request):
    """
    Endpoint SSE em streaming para o Consultor IA da Automatch.
    Transmite tokens em tempo real com Time to First Token (TTFT) < 350ms e X-Accel-Buffering: no.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    is_allowed, remaining = chat_rate_limiter.is_allowed(client_ip)
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Muitas perguntas consecutivas. Por favor, aguarde {remaining}s antes de enviar nova mensagem."
        )

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    user_msg = payload.mensagem.strip()
    historico = payload.historico or []
    car_context = payload.car_context

    system_prompt = "Você é o assistente virtual da plataforma Automatch. Seja prestativo, rápido e conciso em até 3 frases sobre compra, venda e laudo cautelar de veículos."
    if car_context:
        system_prompt = (
            f"Você é um consultor especialista focado no veículo atual do usuário: "
            f"{car_context.get('brand')} {car_context.get('model')} {car_context.get('year')}, "
            f"cor {car_context.get('color', 'N/A')}, {car_context.get('km')}km rodados, "
            f"preço R${car_context.get('price')}. Responda sobre o cadastro deste veículo. Não certifique procedência, regularidade, garantia ou integridade sem evidência; informe ausência de dados. Não prometa condições bancárias ou consultas oficiais."
        )

    system_prompt += " Resultado visual: " + inspection_summary((car_context or {}).get("visual_inspection")) + ". Não acuse avarias a partir de apontamentos não validados."

    async def event_generator():
        streamed_tokens = 0
        if api_key:
            contents = []
            for msg in historico[-6:]:
                role = "user" if msg.get("from") == "user" or msg.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": msg.get("text", "") or msg.get("content", "")}]})
            contents.append({"role": "user", "parts": [{"text": user_msg}]})

            try:
                async for chunk in stream_gemini_generate(api_key, contents, max_tokens=250, temperature=0.3, system_prompt=system_prompt):
                    if chunk:
                        streamed_tokens += 1
                        payload_data = json.dumps({"token": chunk})
                        yield f"data: {payload_data}\n\n"
            except Exception as e:
                logger.warning("Falha durante streaming Gemini: %s", e)

        # Fallback semântico contínuo se Gemini não produziu tokens
        if streamed_tokens == 0:
            semantic_reply = generate_semantic_reply(user_msg, car_context)
            words = semantic_reply.split(" ")
            for i, word in enumerate(words):
                chunk = word if i == 0 else " " + word
                payload_data = json.dumps({"token": chunk})
                yield f"data: {payload_data}\n\n"
                await asyncio.sleep(0.015)

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/api/v1/precificacao")
async def endpoint_preco_justo(payload: PrecificacaoRequest) -> Dict[str, Any]:
    """
    Motor AutoPrice™: Calcula o Preço Justo Automatch baseando-se na FIPE, KM e avarias.
    """
    return calcular_preco_justo(payload.fipe_price, payload.km, payload.year, payload.damages)


# ==============================================================================
# Rota de análise visual 360°
# ==============================================================================

class Analise360Request(BaseModel):
    car_context: Optional[Dict[str, Any]] = None
    preexisting_damages: Optional[List[Dict[str, Any]]] = None


@router.post("/api/analise-360")
async def endpoint_analise_360(payload: Analise360Request) -> Dict[str, Any]:
    """
    Endpoint de Perícia 360° da Automatch:
    Retorna o mapa de quadrantes angulares e hotspots tridimensionais de avaria do veículo.
    """
    return compilar_laudo_360(
        car_context=payload.car_context,
        preexisting_damages=payload.preexisting_damages
    )

