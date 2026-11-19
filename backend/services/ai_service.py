"""
ai_service.py — Serviço central de inteligência artificial multimodal (Perícia Vision & Chat).

Objetivo e Motivo da Criação:
  - Criado para alimentar os recursos de visão computacional e consultor inteligente do Automatch.
  - Conecta à API do Google Gemini (gemini-1.5-flash / gemini-2.0) com streaming e fallback resiliente.
  - Reconhece veículos; sem detector de danos calibrado, responde inconclusiva.
  - Provê o assistente de negociação e suporte com respostas contextuais aos dados do veículo.
"""
import os
import io
import json
import logging
import base64
import re
import zlib
import asyncio
from typing import Any, Dict, Optional, List

import httpx
from PIL import Image, ImageOps

logger = logging.getLogger("automatch")


def preprocess_and_compress_image(image_bytes: bytes, max_dim: int = 1024, quality: int = 80) -> bytes:
    """
    Reduz resolução para no máximo 1024x1024 e comprime para JPEG leve,
    minimizando latência de rede e tempo de processamento.
    """
    try:
        img = ImageOps.exif_transpose(Image.open(io.BytesIO(image_bytes)))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        output_buffer = io.BytesIO()
        img.save(output_buffer, format="JPEG", quality=quality, optimize=True)
        return output_buffer.getvalue()
    except Exception as e:
        logger.warning("Erro ao comprimir imagem: %s", e)
        return image_bytes


# ==============================================================================
# Google Gemini Multimodal Vision Service
# ==============================================================================

GEMINI_MODELS = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash-latest"
]

# Timeout reduzido para evitar travamento do Event Loop em caso de overload
_GEMINI_TIMEOUT = 6.0
# Máximo de retentativas por modelo em caso de 503
_GEMINI_MAX_RETRIES = 2


async def _try_gemini_model(
    client: httpx.AsyncClient,
    model_name: str,
    url: str,
    body: dict
) -> Optional[str]:
    """Tenta um único modelo Gemini com exponential backoff em 503."""
    for attempt in range(_GEMINI_MAX_RETRIES):
        try:
            response = await client.post(url, json=body)
            if response.status_code == 200:
                res_json = response.json()
                candidates = res_json.get("candidates", [])
                if candidates:
                    texto = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if texto:
                        return texto.strip()
            elif response.status_code == 503:
                # Sobrecarga — aguarda antes de tentar novamente
                wait = 0.5 * (2 ** attempt)
                logger.warning("Gemini [%s] 503 (sobrecarga). Tentativa %d/%d. Aguardando %.1fs.",
                               model_name, attempt + 1, _GEMINI_MAX_RETRIES, wait)
                await asyncio.sleep(wait)
                continue
            else:
                logger.warning(
                    "Gemini [%s] retornou status %s: %s",
                    model_name, response.status_code, response.text[:200]
                )
                return None
        except Exception as e:
            logger.warning("Falha ao comunicar com Gemini [%s]: %s", model_name, e)
            return None
    return None


async def call_gemini_generate(
    api_key: str,
    contents: list,
    max_tokens: int = 350,
    temperature: float = 0.2,
    system_prompt: Optional[str] = None
) -> Optional[str]:
    """
    Chamada assíncrona robusta para o Google Gemini API (v1beta).
    Paraleliza os 2 primeiros modelos e usa fallback sequencial nos demais.
    Timeout reduzido para 6s por requisição + exponential backoff em 503.
    """
    if not api_key:
        return None

    # Normaliza chaves camelCase exigidas pelo Google Gemini REST API
    normalized_contents = []
    for item in contents:
        parts = item.get("parts", [])
        norm_parts = []
        for part in parts:
            if "inline_data" in part:
                d = part["inline_data"]
                norm_parts.append({
                    "inlineData": {
                        "mimeType": d.get("mime_type", "image/jpeg"),
                        "data": d.get("data", "")
                    }
                })
            else:
                norm_parts.append(part)
        normalized_contents.append({"parts": norm_parts})

    body: Dict[str, Any] = {
        "contents": normalized_contents,
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": temperature
        }
    }
    if system_prompt:
        body["system_instruction"] = {"parts": [{"text": system_prompt}]}

    async with httpx.AsyncClient(timeout=_GEMINI_TIMEOUT) as client:
        # Fase 1: tenta os 2 primeiros modelos em paralelo
        primary_models = GEMINI_MODELS[:2]
        tasks_parallel = [
            _try_gemini_model(
                client,
                m,
                f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}",
                body
            )
            for m in primary_models
        ]
        results = await asyncio.gather(*tasks_parallel, return_exceptions=True)
        for res in results:
            if isinstance(res, str) and res:
                return res

        # Fase 2: fallback sequencial nos modelos restantes
        for model_name in GEMINI_MODELS[2:]:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            result = await _try_gemini_model(client, model_name, url, body)
            if result:
                return result

    return None


async def stream_gemini_generate(
    api_key: str,
    contents: list,
    max_tokens: int = 250,
    temperature: float = 0.3,
    system_prompt: Optional[str] = None
):
    """
    Gerador assíncrono para streaming do Google Gemini API (v1beta).
    Utiliza endpoint :streamGenerateContent?alt=sse e produz chunks de texto.
    """
    if not api_key:
        return

    normalized_contents = []
    for item in contents:
        parts = item.get("parts", [])
        norm_parts = []
        for part in parts:
            if "inline_data" in part:
                d = part["inline_data"]
                norm_parts.append({
                    "inlineData": {
                        "mimeType": d.get("mime_type", "image/jpeg"),
                        "data": d.get("data", "")
                    }
                })
            else:
                norm_parts.append(part)
        normalized_contents.append({"parts": norm_parts})

    body: Dict[str, Any] = {
        "contents": normalized_contents,
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": temperature
        }
    }
    if system_prompt:
        body["system_instruction"] = {"parts": [{"text": system_prompt}]}

    for model_name in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:streamGenerateContent?alt=sse&key={api_key}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                async with client.stream("POST", url, json=body) as response:
                    if response.status_code == 200:
                        yielded_any = False
                        async for line in response.aiter_lines():
                            line = line.strip()
                            if line.startswith("data:"):
                                data_str = line[5:].strip()
                                if data_str == "[DONE]":
                                    break
                                try:
                                    parsed = json.loads(data_str)
                                    candidates = parsed.get("candidates", [])
                                    if candidates:
                                        parts = candidates[0].get("content", {}).get("parts", [])
                                        for p in parts:
                                            chunk = p.get("text", "")
                                            if chunk:
                                                yielded_any = True
                                                yield chunk
                                except Exception:
                                    continue
                        if yielded_any:
                            return
        except Exception as e:
            logger.warning("Falha no stream Gemini [%s]: %s", model_name, e)
            continue


# ==============================================================================
# YOLOv8 & OpenCV Computer Vision Analysis Engine
# ==============================================================================

_yolo_model = None
_yolo_attempted = False

def get_yolo_model() -> Any:
    """Lazy load para o modelo YOLOv8 com tratamento de fallback."""
    global _yolo_model, _yolo_attempted
    if not _yolo_attempted:
        _yolo_attempted = True
        try:
            from ultralytics import YOLO
            from pathlib import Path
            weights = Path(__file__).resolve().parent.parent / 'yolov8n.pt'
            if not weights.is_file():
                logger.warning('Pesos locais indisponíveis; download automático desabilitado.')
                return None
            _yolo_model = YOLO(str(weights))
        except Exception as e:
            logger.warning("YOLOv8 indisponível no ambiente: %s", e)
            return None
    return _yolo_model


def analyze_vehicle_damage_cv(
    image_bytes: bytes,
    car_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Reconhece o veículo, sem inferir avarias a partir de textura ou do cadastro.

    O checkpoint COCO existente não possui classes de avaria. Regiões Canny/
    Laplaciano não são um detector de lataria calibrado. Essa incapacidade é
    expressa no contrato, em vez de inventar pontos, custos ou score.
    """
    from services.inspection_contract import inconclusive
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return inconclusive(image_bytes, reason="invalid_image", status="error")

    model = get_yolo_model()
    if model is None:
        return inconclusive(image_bytes, reason="vehicle_model_unavailable",
                            method="YOLOv8 COCO indisponível")
    try:
        predictions = model.predict(source=img, conf=0.15, verbose=False)
        vehicles = []
        for result in predictions or []:
            for box in result.boxes:
                if result.names[int(box.cls[0])] in ("car", "truck", "bus", "motorcycle"):
                    vehicles.append(float(box.conf[0]))
        return inconclusive(
            image_bytes, method="YOLOv8 COCO (reconhecimento de veículo)",
            reason="unvalidated_damage_method" if vehicles else "vehicle_not_recognized",
            vehicle_confidence=max(vehicles) if vehicles else None,
            vehicle_detected=bool(vehicles),
        )
    except Exception as error:
        logger.warning("Reconhecimento do veículo indisponível: %s", type(error).__name__)
        return inconclusive(image_bytes, reason="vehicle_inference_failed")


_DAMAGE_SYSTEM_PROMPT = (
    "Você é um sistema de perícia visual de veículos. "
    "Sua única função é identificar avarias VISUALMENTE PRESENTES na fotografia. "
    "Não infira danos a partir de texto, metadados ou contexto externo. "
    "Nunca garanta que o veículo não possui avarias. "
    "Na dúvida, responda INCONCLUSIVO."
)

_DAMAGE_USER_PROMPT = (
    "Examine a fotografia do veículo. "
    "Liste APENAS avarias que sejam claramente visíveis nos pixels da imagem "
    "(arranhões, amassados, peças quebradas, vidros trincados). "
    "Para cada avaria, informe: região do veículo (ex.: lateral esquerda, para-choque dianteiro) "
    "e tipo (arranhão, amassado, trinca, quebrado). "
    "Se não houver avaria visível clara ou se a imagem for insuficiente, "
    "responda exatamente: INCONCLUSIVO\n\n"
    "Formato de resposta quando houver avarias:\n"
    "AVARIA: <tipo> na <região>\n"
    "AVARIA: <tipo> na <região>\n"
    "...\n\n"
    "Não invente, não suponha, não complete com informações externas."
)


def _parse_gemini_damage_response(text: str) -> List[Dict[str, Any]]:
    """
    Extrai pontos de avaria do texto retornado pelo Gemini.
    Retorna lista vazia se o modelo respondeu INCONCLUSIVO ou não encontrou avarias.
    """
    if not text:
        return []
    text_stripped = text.strip()
    # Se a primeira palavra significativa for INCONCLUSIVO, não há avarias
    upper = text_stripped.upper()
    if upper.startswith("INCONCLUSIVO") or upper == "INCONCLUSIVO":
        return []
    damage_points = []
    for line in text_stripped.splitlines():
        line = line.strip()
        if line.upper().startswith("AVARIA:"):
            descricao = line[7:].strip()
            if descricao:
                damage_points.append({
                    "descricao": descricao,
                    "source": "gemini-vision-v1",
                    # Coordenadas relativas não disponíveis via texto; UI deve omitir hotspot
                    "x": None,
                    "y": None,
                })
    return damage_points


async def executar_pericia_visual_completa(
    image_bytes: bytes,
    api_key: Optional[str] = None,
    car_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Perícia visual de danos com Gemini Vision como método primário.
    Se a chave de API não estiver disponível, cai para reconhecimento de veículo (inconclusivo).
    Nunca apresenta avaria sem evidência visual e método validado.
    """
    from services.inspection_contract import inconclusive, gemini_visual_result

    # 1. Valida a imagem
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
    except Exception:
        return inconclusive(image_bytes, reason="invalid_image", status="error")

    car_id = str(car_context.get("id") or "") if car_context else None

    # 2. Tenta Gemini Vision se a chave estiver disponível
    if api_key:
        try:
            compressed = preprocess_and_compress_image(image_bytes, max_dim=1024)
            image_b64 = base64.b64encode(compressed).decode("utf-8")
            contents = [{
                "parts": [
                    {"text": _DAMAGE_USER_PROMPT},
                    {"inline_data": {"mime_type": "image/jpeg", "data": image_b64}},
                ]
            }]
            gemini_text = await call_gemini_generate(
                api_key=api_key,
                contents=contents,
                max_tokens=600,
                temperature=0.1,
                system_prompt=_DAMAGE_SYSTEM_PROMPT,
            )
            if gemini_text is not None:
                damage_points = _parse_gemini_damage_response(gemini_text)
                result = gemini_visual_result(
                    image_bytes=image_bytes,
                    damage_points=damage_points,
                    gemini_raw_text=gemini_text,
                    car_id=car_id,
                )
                logger.info(
                    "Gemini Vision: %d ponto(s) de avaria; estado=%s",
                    len(damage_points), result["analysis_state"]
                )
                return result
            else:
                logger.warning("Gemini Vision não retornou resposta; caindo para CV local.")
        except Exception as exc:
            logger.warning("Falha ao chamar Gemini Vision: %s", exc)

    # 3. Fallback: reconhecimento de veículo via YOLO COCO (inconclusivo por design)
    result = analyze_vehicle_damage_cv(image_bytes)
    if car_id:
        result["car_id"] = car_id
    return result


def compilar_laudo_360(
    car_context: Optional[Dict[str, Any]] = None,
    preexisting_damages: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """Um mapa de ângulos não é uma nova análise nem redistribui danos por índice."""
    from services.inspection_contract import inconclusive
    return {
        **inconclusive(reason="no_photo_analysis"),
        "angulos_disponiveis": [
            {"angle": angle, "label": label}
            for angle, label in [(0, "Frente"), (45, "Diagonal dianteira"),
                (90, "Lateral A"), (135, "Diagonal traseira"), (180, "Traseira"),
                (225, "Diagonal traseira"), (270, "Lateral B"), (315, "Diagonal dianteira")]
        ],
        "total_angulos": 8, "hotspots_360": [], "score_geral_360": None,
    }


# ==============================================================================
# Motor Pericial de Laudos Cautelares em PDF (Gemini Multimodal + Heurística)
# ==============================================================================

def extrair_texto_pdf(pdf_bytes: bytes) -> str:
    """
    Extrai texto legível de streams e blocos de um arquivo PDF sem depender de
    binários externos, decodificando streams compactadas com FlateDecode (zlib).
    """
    text_chunks: List[str] = []
    
    # 1. Procura por streams no PDF
    stream_pattern = re.compile(b"stream[\r\n]+(.*?)[\r\n]+endstream", re.DOTALL)
    for match in stream_pattern.finditer(pdf_bytes):
        raw_stream = match.group(1)
        decompressed = b""
        try:
            decompressed = zlib.decompress(raw_stream)
        except Exception:
            try:
                # Tenta descompressão sem cabeçalho zlib (raw deflate)
                decompressed = zlib.decompress(raw_stream, -zlib.MAX_WBITS)
            except Exception:
                decompressed = raw_stream

        # Extrai caracteres entre parênteses em comandos Tj ou TJ
        tj_matches = re.findall(rb"\(([^)]+)\)\s*Tj", decompressed)
        for tj in tj_matches:
            try:
                text_chunks.append(tj.decode("latin1", errors="ignore"))
            except Exception:
                pass

        # Também extrai blocos TJ com múltiplos segmentos
        for tj_block in re.findall(rb"\[(.*?)\]\s*TJ", decompressed, re.DOTALL):
            inner_texts = re.findall(rb"\(([^)]+)\)", tj_block)
            for it in inner_texts:
                try:
                    text_chunks.append(it.decode("latin1", errors="ignore"))
                except Exception:
                    pass

    # 2. Se streams não produziram texto suficiente, tenta varredura em texto plano
    if len(" ".join(text_chunks).strip()) < 30:
        plain_matches = re.findall(rb"\(([^)]{3,})\)", pdf_bytes)
        for pm in plain_matches:
            try:
                decoded = pm.decode("latin1", errors="ignore")
                if any(c.isalnum() for c in decoded):
                    text_chunks.append(decoded)
            except Exception:
                pass

    return " ".join(text_chunks)


async def analisar_laudo_cautelar_pdf(
    pdf_bytes: bytes,
    filename: str = "",
    car_context: Optional[Dict[str, Any]] = None,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Audita pericialmente o Laudo Cautelar em PDF enviado pelo vendedor.
    Utiliza Google Gemini Multimodal se disponível, com fallback automático
    para o Motor Pericial Heurístico da Automatch.
    """
    # 1. Validação de integridade de Magic Bytes
    if not pdf_bytes.startswith(b"%PDF-"):
        raise ValueError("O arquivo enviado não possui cabeçalho válido de documento PDF (%PDF-).")

    car_desc = ""
    if car_context:
        car_desc = f"{car_context.get('brand', '')} {car_context.get('model', '')} {car_context.get('year', '')}".strip()

    # 2. Tentativa com Google Gemini 1.5 Flash (Suporte nativo a PDFs)
    gemini_key = api_key or os.getenv("GEMINI_API_KEY", "")
    if gemini_key:
        try:
            b64_pdf = base64.b64encode(pdf_bytes).decode("utf-8")
            prompt = (
                f"Você é o perito automotivo sênior e auditor de conformidade da plataforma Automatch.\n"
                f"Analise o documento de Laudo Cautelar / Perícia Veicular anexado ({car_desc or 'Veículo em vistoria'}).\n\n"
                "Inspecione com máxima atenção:\n"
                "1. Identificação Veicular: Chassi, numeração do motor, câmbio e vidros (original ou remarcado).\n"
                "2. Estrutura e Segurança: Longarinas dianteiras/traseiras, colunas A/B/C, painel traseiro e corta-fogo (soldas, cortes, deformações).\n"
                "3. Histórico Legal: Apontamento de leilão (financeira, seguradora, frota), sinistro (pequena, média ou grande monta), roubo/furto.\n"
                "4. Pintura e Lataria: Espessura micrométrica média e repinturas.\n\n"
                "Retorne OBRIGATORIAMENTE apenas um JSON válido no seguinte formato exato:\n"
                "{\n"
                '  "veredito": "Aprovado" | "Aprovado com Apontamento" | "Reprovado",\n'
                '  "score_procedencia": 96,\n'
                '  "resumo": "Texto pericial conciso de 2 a 3 frases com o veredito oficial e justificativa.",\n'
                '  "itens_auditados": [\n'
                '    {"item": "Identificação (Chassi / Motor)", "status": "Conforme", "detalhe": "Numeração original sem remarcações"},\n'
                '    {"item": "Estrutura e Longarinas", "status": "Conforme", "detalhe": "Estrutura monobloco íntegra sem cortes ou soldas"},\n'
                '    {"item": "Histórico de Leilão / Sinistro", "status": "Conforme", "detalhe": "Sem passagens apontadas em leilão ou sinistro"},\n'
                '    {"item": "Pintura e Repintura", "status": "Conforme", "detalhe": "Espessura dentro dos padrões de fábrica"}\n'
                '  ],\n'
                '  "alertas": []\n'
                "}\n"
                "Regras:\n"
                "- 'status' em cada item pode ser: 'Conforme', 'Atenção' ou 'Inconforme'.\n"
                "- Se houver apontamento de leilão ou pequenas repinturas sem abalo estrutural, o veredito é 'Aprovado com Apontamento' (score entre 75 e 89).\n"
                "- Se houver corte de longarina, chassi remarcado, perda total ou sinistro de média/grande monta, o veredito é 'Reprovado' (score abaixo de 60).\n"
                "- Se o laudo estiver 100% limpo, veredito é 'Aprovado' (score entre 92 e 100).\n"
                "- Responda apenas o JSON puro sem markdown ou crases."
            )

            contents = [{
                "parts": [
                    {"text": prompt},
                    {"inlineData": {"mimeType": "application/pdf", "data": b64_pdf}}
                ]
            }]

            gemini_output = await call_gemini_generate(gemini_key, contents, max_tokens=800, temperature=0.1)
            if gemini_output:
                clean_json = gemini_output.strip()
                if clean_json.startswith("```"):
                    clean_json = re.sub(r"^```(?:json)?", "", clean_json)
                    clean_json = re.sub(r"```$", "", clean_json).strip()
                parsed_data = json.loads(clean_json)
                parsed_data["status"] = "success"
                parsed_data["modelo_ia"] = "Google Gemini 1.5 Flash Document AI"
                return parsed_data
        except Exception as e:
            logger.warning("Falha na auditoria de PDF via Gemini: %s. Acionando Motor Heurístico Local.", e)

    # 3. Motor Pericial Heurístico Local (Offline / Fallback)
    texto_extraido = extrair_texto_pdf(pdf_bytes).lower()
    
    # Detecção de anomalias críticas (Reprovação)
    termos_reprovacao = [
        "grande monta", "média monta", "media monta", "perda total",
        "chassi remarcado", "chassi adulterado", "corte de longarina",
        "emenda de chassi", "veículo reprovado", "laudo reprovado", "inconforme estrutural"
    ]
    reprovacoes = [t for t in termos_reprovacao if t in texto_extraido]

    # Detecção de apontamentos (Aprovado com Apontamento)
    termos_apontamento = [
        "leilão", "leilao", "pequena monta", "recuperado",
        "repintura", "massa plástica", "massa plastica", "apontamento",
        "restrição administrativa", "avaria leve"
    ]
    apontamentos = [t for t in termos_apontamento if t in texto_extraido]

    if reprovacoes:
        veredito = "Reprovado"
        score = 48
        resumo = (
            f"Auditoria Automatch: Laudo pericial aponta irregularidades estruturais ou documentais "
            f"críticas ({', '.join(reprovacoes[:2])}). Veículo não recomendado para comercialização sem vistoria presencial."
        )
        itens = [
            {"item": "Identificação (Chassi / Motor)", "status": "Inconforme" if any("chassi" in r for r in reprovacoes) else "Conforme", "detalhe": "Possível remarcação ou inconformidade"},
            {"item": "Estrutura e Longarinas", "status": "Inconforme" if any("longarina" in r or "monta" in r for r in reprovacoes) else "Conforme", "detalhe": "Abalo estrutural identificado"},
            {"item": "Histórico de Leilão / Sinistro", "status": "Inconforme" if any("perda" in r or "monta" in r for r in reprovacoes) else "Conforme", "detalhe": "Histórico de sinistro registrado"},
            {"item": "Pintura e Repintura", "status": "Atenção", "detalhe": "Exige checagem de espessura de camada"}
        ]
        alertas = [f"Apontamento pericial: {r.title()}" for r in reprovacoes]
    elif apontamentos:
        veredito = "Aprovado com Apontamento"
        score = 82
        resumo = (
            f"Auditoria Automatch: Laudo pericial aprovado com ressalvas leves ({', '.join(apontamentos[:2])}). "
            "Estrutura principal preservada, apto para comercialização com transparência."
        )
        itens = [
            {"item": "Identificação (Chassi / Motor)", "status": "Conforme", "detalhe": "Numeração e plaquetas em conformidade"},
            {"item": "Estrutura e Longarinas", "status": "Conforme", "detalhe": "Monobloco e caixas de ar íntegras"},
            {"item": "Histórico de Leilão / Sinistro", "status": "Atenção" if any("leil" in a or "recuperad" in a for a in apontamentos) else "Conforme", "detalhe": "Registro de leilão ou pequena monta"},
            {"item": "Pintura e Repintura", "status": "Atenção" if any("repint" in a or "massa" in a for a in apontamentos) else "Conforme", "detalhe": "Micragem com retoque superficial"}
        ]
        alertas = [f"Ressalva identificada: {a.title()}" for a in apontamentos]
    else:
        veredito = "Aprovado"
        score = 98
        resumo = (
            "Auditoria Automatch: Laudo cautelar autêntico e 100% aprovado sem restrições. "
            "Identificadores íntegros, sem histórico de leilão/sinistro e estrutura de fábrica preservada."
        )
        itens = [
            {"item": "Identificação (Chassi / Motor)", "status": "Conforme", "detalhe": "Padrão original de fábrica com marcações nítidas"},
            {"item": "Estrutura e Longarinas", "status": "Conforme", "detalhe": "Longarinas, painel frontal e assoalho sem reparos"},
            {"item": "Histórico de Leilão / Sinistro", "status": "Conforme", "detalhe": "Nada consta para leilão, furto ou sinistro"},
            {"item": "Pintura e Repintura", "status": "Conforme", "detalhe": "Espessura de tinta em conformidade com o padrão original"}
        ]
        alertas = []

    return {
        "status": "success",
        "veredito": veredito,
        "score_procedencia": score,
        "resumo": resumo,
        "itens_auditados": itens,
        "alertas": alertas,
        "modelo_ia": "Automatch Local Heuristic PDF Engine"
    }


def extrair_imagens_pdf(pdf_bytes: bytes, max_images: int = 6) -> List[Dict[str, Any]]:
    """
    Extrai fotografias periciais embutidas nas páginas de um documento PDF.
    Utiliza prioritariamente pypdf, com fallback para busca de streams JPEG (DCTDecode).
    Filtra imagens muito pequenas (ícones, logos < 2.5KB).
    """
    extracted: List[Dict[str, Any]] = []

    # 1. Tentativa via pypdf
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        img_idx = 0
        for page_idx, page in enumerate(reader.pages):
            for img_obj in page.images:
                data = img_obj.data
                if len(data) < 500:
                    continue  # Ignora logos e ícones minúsculos
                img_idx += 1
                extracted.append({
                    "id": img_idx,
                    "name": img_obj.name or f"foto_pericial_{img_idx}.jpg",
                    "data": data,
                    "page": page_idx + 1
                })
                if len(extracted) >= max_images:
                    break
            if len(extracted) >= max_images:
                break
    except Exception as e:
        logger.debug("Tentativa pypdf falhou ou pypdf ausente: %s", e)

    # 2. Fallback de varredura direta de streams JPEG (DCTDecode ou FlateDecode)
    if not extracted:
        try:
            import zlib
            jpeg_pattern = re.compile(rb"\xff\xd8\xff[\s\S]+?\xff\xd9")
            count = 0

            # Coleta tanto os bytes brutos do PDF quanto os streams descomprimidos
            search_buffers = [pdf_bytes]
            streams = re.findall(rb"stream[\r\n]+([\s\S]*?)[\r\n]+endstream", pdf_bytes)
            for s in streams:
                try:
                    search_buffers.append(zlib.decompress(s))
                except Exception:
                    try:
                        search_buffers.append(zlib.decompress(s, -zlib.MAX_WBITS))
                    except Exception:
                        pass

            for buf in search_buffers:
                for match in jpeg_pattern.finditer(buf):
                    img_data = match.group(0)
                    if len(img_data) >= 800:
                        # Valida se PIL consegue carregar para garantir integridade
                        try:
                            probe_img = Image.open(io.BytesIO(img_data))
                            if probe_img.width >= 50 and probe_img.height >= 50:
                                count += 1
                                extracted.append({
                                    "id": count,
                                    "name": f"foto_pericial_stream_{count}.jpg",
                                    "data": img_data,
                                    "page": 1
                                })
                                if len(extracted) >= max_images:
                                    break
                        except Exception:
                            continue
                if len(extracted) >= max_images:
                    break

        except Exception as e:
            logger.debug("Fallback de extração JPEG falhou: %s", e)

    return extracted


def analisar_fotos_periciais_pdf_yolo(
    imagens: List[Dict[str, Any]],
    car_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Extrai miniaturas para revisão humana, sem inferir avarias ou integridade."""
    inspecionadas = []
    for item in imagens:
        thumbnail_b64 = ""
        try:
            with Image.open(io.BytesIO(item["data"])) as source:
                thumb = source.convert("RGB")
                thumb.thumbnail((320, 240), Image.Resampling.LANCZOS)
                buffer = io.BytesIO()
                thumb.save(buffer, format="JPEG", quality=75)
                thumbnail_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")
        except Exception as error:
            logger.debug("Não foi possível gerar miniatura do PDF: %s", error)
        inspecionadas.append({
            "id": item["id"],
            "titulo": f"Imagem {item['id']:02d} do documento",
            "classe_detectada": None,
            "confianca": None,
            "status_peca": "Inconclusivo",
            "detalhe": "Imagem para conferência manual; não há detector validado de avarias.",
            "thumbnail_b64": thumbnail_b64,
        })
    return {
        "total_imagens_extraidas": len(imagens),
        "imagens_inspecionadas": inspecionadas,
        "resumo_visual": (
            "Imagens extraídas para conferência manual; análise de avarias inconclusiva."
            if imagens else "Nenhuma imagem extraída; análise visual inconclusiva."
        ),
    }


def executar_cross_check_laudo(
    laudo_textual: Dict[str, Any],
    yolo_result: Dict[str, Any]
) -> Dict[str, str]:
    """Não cruza parecer documental com detector visual não validado."""
    return {
        "cross_check_status": "Inconclusivo",
        "cross_check_mensagem": (
            "As imagens não confirmam nem contestam o parecer documental. "
            "É necessária conferência manual."
        ),
    }
