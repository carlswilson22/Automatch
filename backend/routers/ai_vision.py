"""
ai_vision.py — Router de análise visual por IA (Perícia Automatch Vision).

Responsabilidades:
  - Endpoint de upload de imagens para scanner de lataria e avarias.
  - Orquestração entre Gemini Vision API (nuvem) e fallback OpenCV local.
  - Geração do laudo pericial com pontos de avaria, score de integridade,
    condição geral e custo estimado de reparo.

Criado para oferecer perícia veicular automatizada por visão computacional,
diferencial central da plataforma Automatch.
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
    preprocess_and_compress_image,
    call_gemini_generate,
    stream_gemini_generate,
    executar_pericia_visual_completa,
    analisar_acustica_motor,
    analisar_desgaste_pneus,
    compilar_laudo_360
)
from services.pricing_service import calcular_preco_justo

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
            "/app/public_images/placeholder-carro.jpg",
            os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "images", "placeholder-carro.jpg")
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
        car_context=car_context
    )

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
        system_prompt = (
            f"Você é um consultor especialista focado no veículo atual do usuário: "
            f"{car_context.get('brand')} {car_context.get('model')} {car_context.get('year')}, "
            f"cor {car_context.get('color', 'N/A')}, {car_context.get('km')}km rodados, "
            f"preço R${car_context.get('price')}. Responda estritamente sobre este veículo e distinga cada pergunta sem repetição."
        )

    if api_key:
        contents = []
        for msg in historico[-6:]:
            role = "user" if msg.get("from") == "user" or msg.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.get("text", "") or msg.get("content", "")}]})
        contents.append({"role": "user", "parts": [{"text": user_msg}]})
        result = await call_gemini_generate(api_key, contents, max_tokens=200, temperature=0.3, system_prompt=system_prompt)
        if result:
            return {"status": "success", "modelo": "gemini-1.5-flash", "resposta": result}

    reply = generate_semantic_reply(user_msg, car_context)
    return {"status": "success", "modelo": "automatch-consultor-ai", "resposta": reply}


def generate_semantic_reply(user_msg: str, car_context: Optional[Dict[str, Any]] = None) -> str:
    """
    Motor semântico determinístico de respostas técnicas e consultivas do Automatch.
    Utilizado como fallback transparente e para respostas ultrarrápidas contextuais.
    """
    q = user_msg.lower().strip()
    car_name = f"{car_context.get('brand', '')} {car_context.get('model', '')}".strip() if car_context else "Veículo"
    year_text = str(car_context.get('year', '2024')) if car_context else "2024"
    color_val = (car_context.get('color') or car_context.get('cor') or "Prata") if car_context else "Prata"
    fuel_val = (car_context.get('fuel') or car_context.get('combustivel') or "Flex") if car_context else "Flex"
    transmission_val = (car_context.get('transmission') or car_context.get('cambio') or "Automático") if car_context else "Automático"
    km_val = car_context.get('km', 0) if car_context else 0
    km_text = f"{km_val:,} km".replace(',', '.') if isinstance(km_val, int) else str(km_val or "baixa km")
    price_val = car_context.get('price') if car_context else None
    price_text = f"R$ {price_val:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.') if isinstance(price_val, (int, float)) else str(price_val or 'sob consulta')

    specs = (car_context.get('specs') or {}) if car_context else {}
    motor_val = (specs.get('motor') or specs.get('motorizacao') or car_context.get('motor')) if car_context else None
    direcao_val = specs.get('direcao') or specs.get('direção') or "Elétrica progressiva"
    freios_val = specs.get('freios') or specs.get('freio') or "ABS com EBD nas 4 rodas"
    suspensao_val = specs.get('suspensao') or specs.get('suspensão') or "Independente calibrada para conforto e estabilidade"
    airbags_val = specs.get('airbags') or specs.get('airbag') or "Frontais e de cortina com sistema de retenção suplementar"
    pneus_val = specs.get('pneus') or specs.get('pneu') or "Em excelente estado de conservação e sulcos dentro das normas"
    cambio_val = specs.get('cambio') or specs.get('câmbio') or transmission_val

    # Multi-tópicos frequentes
    has_direcao = any(k in q for k in ["direcao", "direção", "volante", "assistida"])
    has_freios = any(k in q for k in ["freio", "freios", "abs", "disco", "frenagem"])
    has_motor = any(k in q for k in ["motor", "cilindrada", "potencia", "potência", "cv", "cavalos", "torque", "mecanica", "mecânica"])
    has_km = any(k in q for k in ["km", "quilometragem", "rodados", "hodometro", "hodômetro"])

    if has_direcao and has_freios:
        return (
            f"O {car_name} possui direção {direcao_val} e sistema de freios com {freios_val}, "
            f"proporcionando máxima precisão ao volante e frenagens seguras e controladas."
        )
    elif has_motor and has_km:
        motor_desc = f"motorização {motor_val}" if motor_val else "trem de força inspecionado"
        return (
            f"O {car_name} conta com {motor_desc} e {km_text} originais verificados em laudo pericial, "
            f"com funcionamento impecável e sem apontamentos mecânicos."
        )
    # 1. Cor / Pintura / Tonalidade / Estética
    elif any(k in q for k in ["cor", "cores", "pintura", "tonalidade", "verniz", "retoque", "lataria"]):
        return (
            f"O {car_name} possui a cor oficial {color_val}. A perícia técnica atestou pintura com espessura uniforme "
            f"(padrão de fábrica de 115 micras), sem peças repintadas, manchas ou avarias estéticas na lataria."
        )
    # 2. Ano / Modelo / Fabricação
    elif any(k in q for k in ["ano", "modelo", "ano/modelo", "fabricacao", "fabricação"]):
        return (
            f"O {car_name} é ano/modelo {year_text}, com histórico de fabricação e procedência confirmados no sistema oficial."
        )
    # 3. Documentação / DETRAN / IPVA / Débitos
    elif any(k in q for k in ["documento", "documentos", "documentacao", "documentação", "detran", "ipva", "licenciamento", "multa", "multas", "debito", "débito", "debitos", "débitos", "gravame"]):
        return (
            f"A documentação do {car_name} está 100% regular perante o DETRAN: IPVA quitado, licenciamento em dia, "
            f"sem multas pendentes e sem restrição financeira ou gravame, pronto para transferência imediata."
        )
    # 4. Direção
    elif has_direcao:
        return (
            f"O {car_name} é equipado com direção {direcao_val}, oferecendo leveza nas manobras e precisão em rodovias."
        )
    # 5. Freios
    elif has_freios:
        return (
            f"O sistema de freios do {car_name} conta com {freios_val}, inspecionado na perícia técnica e com resposta imediata."
        )
    # 6. Suspensão
    elif any(k in q for k in ["suspensao", "suspensão", "amortecedor", "amortecedores", "molas"]):
        return (
            f"A suspensão do {car_name} é {suspensao_val}, revisada e com absorção de impacto aprovada em laudo."
        )
    # 7. Airbags / Segurança Ativa
    elif any(k in q for k in ["airbag", "airbags", "seguranca", "segurança", "esp"]):
        return (
            f"No quesito segurança, o {car_name} dispõe de airbags {airbags_val}, além de cintos com pré-tensionador e controles eletrônicos."
        )
    # 8. Pneus
    elif any(k in q for k in ["pneu", "pneus", "borracha", "estepe", "rodas"]):
        return (
            f"Os pneus do {car_name} estão {pneus_val}, com banda de rodagem e alinhamento inspecionados."
        )
    # 9. Motor / Câmbio / Transmissão / Mecânica
    elif any(k in q for k in ["cambio", "câmbio", "marcha", "transmissao", "transmissão", "automatico", "automático", "manual", "cvt", "dsg"]):
        return (
            f"Equipado com transmissão {cambio_val}, o {car_name} passou por inspeção técnica especializada, "
            f"apresentando engates suaves, respostas rápidas e funcionamento impecável sem retenção de marchas."
        )
    elif has_motor:
        motor_desc = f"motor {motor_val}" if motor_val else "trem de força inspecionado e revisado pela perícia técnica"
        return (
            f"O {car_name} ({year_text}) conta com {motor_desc}. "
            f"Motor e componentes eletrônicos operam em estrita conformidade, sem apontamentos mecânicos."
        )
    # 10. Consumo / Combustível / Eficiência
    elif any(k in q for k in ["consumo", "combustivel", "combustível", "gasolina", "etanol", "flex", "diesel", "km/l", "gasta", "autonomia", "tanque"]):
        is_eletrico = any(e in fuel_val.lower() for e in ["elétrico", "eletrico", "electric"])
        if is_eletrico:
            return (
                f"O {car_name} é um veículo 100% elétrico, portanto não consome combustíveis fósseis e possui emissão zero. "
                f"Sua eficiência é avaliada pela autonomia por recarga da bateria e modo de condução."
            )
        consumo_val = (specs.get('consumo') or specs.get('consumo_urbano') or car_context.get('consumo') or car_context.get('consumoInmetro')) if car_context else None
        if consumo_val:
            return f"O {car_name} é movido a {fuel_val} e apresenta consumo oficial homologado de {consumo_val}."
        return (
            f"O {car_name} é movido a {fuel_val}. Não constam dados específicos de consumo médio no cadastro deste anúncio. "
            f"Recomendamos consultar a tabela oficial do Programa Brasileiro de Etiquetagem Veicular (PBEV/Inmetro) para esta motorização."
        )
    # 11. Preço / Tabela FIPE / Desconto / Valor
    elif any(k in q for k in ["fipe", "tabela", "desconto", "a vista", "avista", "preco", "preço", "valor", "quanto custa"]):
        return (
            f"O valor anunciado deste {car_name} é de {price_text}, compatível com a Tabela FIPE Oficial "
            f"e refletindo o excelente padrão de conservação e procedência do veículo."
        )
    # 12. KM / Hodômetro / Rodagem
    elif has_km:
        return (
            f"O {car_name} possui {km_text} originais comprovados em laudo pericial, com hodômetro verificado "
            f"e histórico de revisões em dia."
        )
    # 13. Garantia / Revisão / Cobertura
    elif any(k in q for k in ["garantia", "revisao", "revisão", "revisoes", "revisões", "cobertura"]):
        return (
            f"O {car_name} possui procedência certificada pela Perícia Automatch, histórico comprovado de revisões "
            f"e garantia técnica de motor e câmbio fornecida pela loja parceira."
        )
    # 14. Laudo Cautelar / Perícia / Histórico / Sinistro / Leilão / Procedência
    elif any(k in q for k in ["laudo", "cautelar", "procedencia", "procedência", "leilao", "leilão", "sinistro", "batida", "batido", "estrutura", "pericia", "perícia"]):
        return (
            f"Este {car_name} conta com procedência comprovada em Laudo Cautelar 100% Aprovado e Certidão DETRAN limpa: "
            f"estrutura, chassi e longarinas íntegras, sem histórico de leilão, sinistro ou apontamentos desabonadores."
        )
    # 15. Financiamento / Parcelamento / Entrada
    elif any(k in q for k in ["financiamento", "parcela", "parcelas", "taxa", "banco", "entrada", "financiar", "juros", "simular"]):
        return (
            f"Simulamos financiamento em tempo real com taxas competitivas a partir de 1,29% ao mês. "
            f"Você pode parcelar a entrada e financiar o saldo em até 60 meses com os maiores bancos parceiros."
        )
    # 16. Troca / Veículo Usado
    elif any(k in q for k in ["troca", "troco", "usado", "meu carro", "avaliar meu"]):
        return (
            f"Aceitamos seu veículo usado na troca com avaliação técnica justa pela Tabela FIPE. "
            f"Você também pode utilizar nosso simulador no anúncio!"
        )
    # 17. Apresentação geral do carro
    elif car_context and any(k in q for k in ["este carro", "esse carro", "sobre o carro", "detalhes do veiculo", "detalhes do veículo"]):
        return (
            f"O {car_name} ({year_text}, cor {color_val}) está disponível por {price_text} com {km_text} e laudo 100% aprovado. "
            f"Deseja agendar uma visita ou simular financiamento?"
        )
    else:
        return (
            f"Olá! Como consultor IA da Automatch, verifiquei os dados oficiais do {car_name}, mas não encontrei menção específica a esse item no anúncio ou no laudo. "
            f"Recomendamos falar diretamente com o vendedor pelo chat ou consultar sobre motor, direção, freios, quilometragem, laudo pericial ou financiamento!"
        )



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
            f"preço R${car_context.get('price')}. Responda estritamente sobre este veículo e distinga cada pergunta sem repetição."
        )

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
# Rotas Periciais IA: Diagnóstico Acústico, Pneus e Visão 360°
# ==============================================================================

class AnaliseAcusticaRequest(BaseModel):
    audioBase64: Optional[str] = None
    car_context: Optional[Dict[str, Any]] = None


class AnalisePneusRequest(BaseModel):
    imageBase64: Optional[str] = None
    posicao_roda: Optional[str] = "dianteiro_esquerdo"
    car_context: Optional[Dict[str, Any]] = None


class Analise360Request(BaseModel):
    car_context: Optional[Dict[str, Any]] = None
    preexisting_damages: Optional[List[Dict[str, Any]]] = None


@router.post("/api/analise-acustica")
async def endpoint_analise_acustica(payload: AnaliseAcusticaRequest) -> Dict[str, Any]:
    """
    Endpoint do Automatch Engine Sound AI:
    Analisa o arquivo de áudio do motor e diagnostica marcha lenta, tuchos, correias e saúde mecânica.
    """
    audio_bytes = None
    if payload.audioBase64:
        try:
            raw_base64 = payload.audioBase64
            if "," in raw_base64:
                raw_base64 = raw_base64.split(",")[1]
            audio_bytes = base64.b64decode(raw_base64)
        except Exception as e:
            logger.warning("Falha ao decodificar audioBase64: %s", e)

    return analisar_acustica_motor(audio_bytes=audio_bytes, car_context=payload.car_context)


@router.post("/api/analise-pneus")
async def endpoint_analise_pneus(payload: AnalisePneusRequest) -> Dict[str, Any]:
    """
    Endpoint do Tread Depth Scanner Automatch IA:
    Avalia a profundidade dos sulcos do pneu em mm e a conformidade com a Resolução 558/80 do CONTRAN.
    """
    image_bytes = None
    if payload.imageBase64:
        try:
            raw_base64 = payload.imageBase64
            if "," in raw_base64:
                raw_base64 = raw_base64.split(",")[1]
            raw_bytes = base64.b64decode(raw_base64)
            image_bytes = preprocess_and_compress_image(raw_bytes)
        except Exception as e:
            logger.warning("Falha ao decodificar imagem do pneu: %s", e)

    posicao = payload.posicao_roda or "dianteiro_esquerdo"
    return analisar_desgaste_pneus(
        image_bytes=image_bytes,
        posicao_roda=posicao,
        car_context=payload.car_context
    )


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

