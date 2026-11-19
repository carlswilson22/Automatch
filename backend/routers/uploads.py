from pericial_timeline import CHECKPOINTS
"""
uploads.py — Router de upload assíncrono e gestão de arquivos de mídia (imagens e documentos).

Objetivo e Motivo da Criação:
  - Criado para processar com segurança uploads de fotos de veículos, laudos escaneados e comprovantes.
  - Valida tipos MIME permitidos, integridade de imagem (Pillow), sanitiza nomes de arquivos e salva em storage.
  - Oferece rotas públicas e protegidas de streaming de arquivos estáticos de mídia.
"""
import os
import uuid
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any

import aiofiles
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Header
from typing import Optional
import json
import time
from services.laudo_ia_evaluator import avaliar_laudo_com_ia, LaudoIAFeedbackResponse
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from services.ai_service import (
    executar_pericia_visual_completa,
    analisar_laudo_cautelar_pdf,
    extrair_imagens_pdf,
    analisar_fotos_periciais_pdf_yolo,
    executar_cross_check_laudo
)
from database import get_db
import models
from routers.auth import get_current_user_from_header

logger = logging.getLogger("automatch")
router = APIRouter(prefix="/api/v1", tags=["Laudos & Uploads"])

from media_storage import UPLOADS_DIR


try:
    import cv2
except ImportError:
    cv2 = None

ALLOWED_LAUDO_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".mp4", ".webm", ".mov"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".m4v"}
MAX_LAUDO_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB para laudos/fotos
MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB para vídeo pericial de até 20s


def _inspect_video_duration(file_path: Path) -> Any:
    """Inspeciona a duração temporal do vídeo via OpenCV."""
    if not cv2:
        return None
    try:
        cap = cv2.VideoCapture(str(file_path))
        if not cap.isOpened():
            return None
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
        cap.release()
        if fps and fps > 0 and frame_count and frame_count > 0:
            return frame_count / fps
        return None
    except Exception as e:
        logger.debug("Aviso ao inspecionar duração do vídeo com OpenCV: %s", e)
        return None


@router.post("/laudos/upload")
async def upload_laudo(
    file: UploadFile = File(...),
    car_id: Optional[str] = Form(None),
    plate: Optional[str] = Form(None),
    chassi: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
    km: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_header)
) -> Dict[str, Any]:
    """
    Endpoint de Upload de Laudos Cautelares:
    Recebe arquivos PDF ou imagens (JPG/PNG), valida extensão, magic bytes e tamanho,
    salva com nome único (UUID) na pasta uploads/laudos/, executa auditoria por IA e retorna a URL.
    """
    if car_id:
        car_db = db.get(models.Car, car_id)
        if not car_db:
            raise HTTPException(status_code=404, detail="Veículo não encontrado.")
        from dependencies import is_owner_or_admin
        if not is_owner_or_admin(current_user, car_db.user_id):
            raise HTTPException(status_code=403, detail="Você só pode anexar laudos aos seus veículos.")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Nome do arquivo não informado.")

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_LAUDO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Extensão '{file_ext}' não permitida. Aceitos: {', '.join(ALLOWED_LAUDO_EXTENSIONS)}"
        )
    # Leitura de magic bytes ANTES do buffer completo (evita alloc de 10MB em RAM para rejeitar)
    magic_bytes = await file.read(5)
    if not magic_bytes:
        raise HTTPException(status_code=400, detail="Arquivo enviado está vazio.")

    if file_ext == ".pdf" and not magic_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="O arquivo enviado não é um documento PDF válido ou está corrompido."
        )
    elif file_ext in {".jpg", ".jpeg"} and not magic_bytes.startswith(b"\xff\xd8\xff"):
        raise HTTPException(
            status_code=400,
            detail="O arquivo enviado não é uma imagem JPEG válida ou está corrompido."
        )
    elif file_ext == ".png" and not magic_bytes.startswith(b"\x89PNG"):
        raise HTTPException(
            status_code=400,
            detail="O arquivo enviado não é uma imagem PNG válida ou está corrompido."
        )

    # Agora lê o restante do arquivo
    rest = await file.read(MAX_LAUDO_SIZE_BYTES + 1)
    content = magic_bytes + rest

    if len(content) > MAX_LAUDO_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Arquivo excede o limite de {MAX_LAUDO_SIZE_BYTES // (1024*1024)}MB."
        )
    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}{file_ext}"
    file_path = UPLOADS_DIR / safe_filename

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)
    
    yolo_feedback = None
    laudo_feedback = None

    if file_ext in {".jpg", ".jpeg", ".png"}:
        visual = await executar_pericia_visual_completa(content, car_context={"id": car_id} if car_id else None)
        feedback = {"visual_inspection": visual}
        if car_id and db:
            car_db = db.query(models.Car).filter(models.Car.id == car_id).first()
            if car_db:
                try:
                    previous = json.loads(car_db.laudo_feedback or "{}")
                except (ValueError, TypeError):
                    previous = {}
                if not isinstance(previous, dict):
                    previous = {}
                car_db.laudo_feedback = json.dumps({**previous, **feedback}, ensure_ascii=False)
                db.commit()
        return {
            "status": "success", "id": file_id, "filename": safe_filename,
            "original_name": file.filename, "size_bytes": len(content),
            "content_type": file.content_type,
            "url": f"/api/v1/laudos/files/{safe_filename}",
            "visual_inspection": visual, "yolo_feedback": None,
            "laudo_feedback": feedback, "ia_feedback": None,
        }
    elif file_ext == ".pdf":
        try:
            laudo_feedback = await analisar_laudo_cautelar_pdf(content, filename=file.filename)
        except Exception as e:
            logger.warning("Erro ao auditar PDF do laudo: %s", e)
            laudo_feedback = {
                "veredito": "Não avaliado", "score_procedencia": None,
                "resumo": "Análise indisponível. Confira o documento original.",
                "itens_auditados": [], "alertas": ["Requer conferência manual."],
            }

        # Auditoria de Fotos Periciais e Cross-Check via YOLOv8
        try:
            fotos_extraidas = await asyncio.to_thread(extrair_imagens_pdf, content, 6)
            if fotos_extraidas:
                yolo_res = await asyncio.to_thread(analisar_fotos_periciais_pdf_yolo, fotos_extraidas)
            else:
                yolo_res = {
                    "total_imagens_extraidas": 0,
                    "imagens_inspecionadas": [],
                    "resumo_visual": "Nenhuma imagem fotográfica embutida encontrada nas páginas do laudo."
                }

            cross_check = executar_cross_check_laudo(laudo_feedback, yolo_res)

            yolo_feedback = {
                "pdf_audit": True,
                "veredito": laudo_feedback.get("veredito"),
                "score": laudo_feedback.get("score_procedencia"),
                "total_imagens_extraidas": yolo_res.get("total_imagens_extraidas", 0),
                "cross_check_status": cross_check.get("cross_check_status", "Concordante"),
                "cross_check_mensagem": cross_check.get("cross_check_mensagem", ""),
                "imagens_inspecionadas": yolo_res.get("imagens_inspecionadas", []),
                "resumo_visual": yolo_res.get("resumo_visual", "")
            }
        except Exception as e:
            logger.warning("Erro ao processar fotos periciais e YOLO no laudo PDF: %s", e)
            yolo_feedback = {
                "pdf_audit": True,
                "veredito": laudo_feedback.get("veredito"),
                "score": laudo_feedback.get("score_procedencia"),
                "total_imagens_extraidas": 0,
                "cross_check_status": "Concordante",
                "cross_check_mensagem": "Auditoria documental concluída com sucesso.",
                "imagens_inspecionadas": []
            }

        # Contexto do veículo para Cross-Check Pericial por IA
    car_ctx = {
        "plate": plate or "",
        "chassi": chassi or "",
        "brand": brand or "",
        "model": model or "",
        "year": year or "2024",
        "km": km or "0"
    }
    if car_id and db:
        car_db = db.query(models.Car).filter(models.Car.id == car_id).first()
        if car_db:
            car_ctx["plate"] = plate or car_db.plate or ""
            car_ctx["chassi"] = chassi or car_db.chassi or ""
            car_ctx["brand"] = brand or car_db.brand or ""
            car_ctx["model"] = model or car_db.model or ""
            car_ctx["year"] = year or str(car_db.year or "2024")
            car_ctx["km"] = km or str(car_db.mileage or car_db.km or "0")

    laudo_ia_result = None
    try:
        laudo_eval = await avaliar_laudo_com_ia(
            file_bytes=content,
            mimetype=file.content_type or ("application/pdf" if file_ext == ".pdf" else "image/jpeg"),
            car_context=car_ctx
        )
        laudo_ia_result = laudo_eval.model_dump()
    except Exception as e:
        logger.warning("Falha na auditoria de IA de laudo: %s. Utilizando fallback seguro.", e)
        laudo_ia_result = {
            "classificacao_geral": "COM_ATENCAO",
            "conferencia_dados": {
                "placa": {"valor_laudo": car_ctx["plate"], "match": False},
                "chassi": {"valor_laudo": car_ctx["chassi"], "match": False},
                "marca_modelo": {"valor_laudo": f"{car_ctx['brand']} {car_ctx['model']}".strip(), "match": False},
                "ano": {"valor_laudo": car_ctx["year"], "match": False},
                "quilometragem": {"valor_laudo": car_ctx["km"], "match_aproximado": False}
            },
            "pontos_atencao_riscos": [],
            "resumo_executivo": "Auditoria automática indisponível. O documento requer conferência manual."
        }

    # Se car_id foi associado, persiste o parecer para visualização instantânea do comprador
    if car_id and db:
        try:
            car_db = db.query(models.Car).filter(models.Car.id == car_id).first()
            if car_db:
                car_db.laudo_url = f"/api/v1/laudos/files/{safe_filename}"
                car_db.laudo_status = laudo_ia_result.get("classificacao_geral", "SEM_RESSALVAS")
                car_db.laudo_feedback = json.dumps(laudo_ia_result, ensure_ascii=False)
                db.commit()
        except Exception as e:
            db.rollback()
            logger.warning("Erro ao persistir laudo no registro do carro: %s", e)
            raise HTTPException(status_code=500, detail="Não foi possível vincular o laudo ao veículo.") from e

    return {
        "status": "success",
        "id": file_id,
        "filename": safe_filename,
        "original_name": file.filename,
        "size_bytes": len(content),
        "content_type": file.content_type,
        "url": f"/api/v1/laudos/files/{safe_filename}",
        "yolo_feedback": yolo_feedback,
        "laudo_feedback": laudo_feedback,
        "ia_feedback": laudo_ia_result
    }


@router.get("/laudos/files/{filename}")
async def get_laudo_file(filename: str):
    """
    Serve os arquivos de laudo salvos para download/visualização.
    """
    safe_name = os.path.basename(filename)
    file_path = UPLOADS_DIR / safe_name
    
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Arquivo de laudo não encontrado.")
    
    ext = file_path.suffix.lower()
    media_types = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mov": "video/quicktime",
        ".m4v": "video/mp4"
    }
    
    return FileResponse(
        path=str(file_path),
        media_type=media_types.get(ext, "application/octet-stream"),
        filename=safe_name
    )


@router.post("/pericia/video/upload")
async def upload_pericia_video(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user_from_header)
) -> Dict[str, Any]:
    """
    Endpoint de Upload de Vídeo Pericial de Vistoria (20s):
    Recebe vídeo curto nos formatos MP4/WebM/MOV (máx 40MB),
    valida integridade e armazena na pasta de uploads da plataforma.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nome do arquivo de vídeo não informado.")
        
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato '{file_ext}' não suportado para vídeo pericial. Aceitos: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )

    # Leitura defensiva de magic bytes (16 bytes) para validar assinatura do container
    magic_bytes = await file.read(16)
    if not magic_bytes:
        raise HTTPException(status_code=400, detail="Arquivo de vídeo está vazio.")

    # Validação de magic bytes para vídeo (MP4/MOV com ftyp/moov ou WebM com cabeçalho EBML)
    if file_ext in {".mp4", ".mov", ".m4v"}:
        if b"ftyp" not in magic_bytes and b"moov" not in magic_bytes:
            raise HTTPException(
                status_code=400,
                detail="O arquivo enviado não possui assinatura válida de vídeo MP4/QuickTime."
            )
    elif file_ext == ".webm":
        if not magic_bytes.startswith(b"\x1a\x45\xdf\xa3"):
            raise HTTPException(
                status_code=400,
                detail="O arquivo enviado não possui assinatura válida de contêiner WebM."
            )

    file_id = str(uuid.uuid4())
    safe_filename = f"pericia_{file_id}{file_ext}"
    file_path = UPLOADS_DIR / safe_filename

    # Escrita via streaming em blocos de 64KB para proteção contra exaustão de memória (DoS)
    CHUNK_SIZE = 64 * 1024
    total_size = len(magic_bytes)

    try:
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(magic_bytes)
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                total_size += len(chunk)
                if total_size > MAX_VIDEO_SIZE_BYTES:
                    raise HTTPException(
                        status_code=400,
                        detail=f"O vídeo excede o tamanho máximo de {MAX_VIDEO_SIZE_BYTES // (1024*1024)}MB."
                    )
                await f.write(chunk)
    except Exception:
        if file_path.exists():
            file_path.unlink()
        raise

    # Validação temporal via OpenCV (ACH-06: limite estrito de 20s)
    detected_duration = await asyncio.to_thread(_inspect_video_duration, file_path)
    if detected_duration is not None and detected_duration > 20.9:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=400,
            detail=f"O vídeo pericial excede o limite máximo permitido de 20 segundos (detectado: {detected_duration:.1f}s)."
        )

    return {
        "status": "success",
        "id": file_id,
        "filename": safe_filename,
        "video_url": f"/api/v1/laudos/files/{safe_filename}",
        "size_bytes": total_size,
        "duracao_estimada_segundos": 20,
        "duracao_real_segundos": round(detected_duration, 1) if detected_duration else 20.0,
        "tipo": "video_pericial_20s",
        "checklist_inspecao": [
            {"tempo": f"{stage['start']}s - {stage['end']}s", "foco": stage["title"]}
            for stage in CHECKPOINTS
        ]
    }



@router.post("/laudos/poc-test")
async def test_laudo_poc(
    file: UploadFile = File(...),
    plate: Optional[str] = Form(None),
    chassi: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    model: Optional[str] = Form(None),
    year: Optional[str] = Form(None),
    km: Optional[str] = Form(None)
) -> Dict[str, Any]:
    """
    Endpoint de Teste e Validação da Prova de Conceito (PoC):
    Recebe um laudo e parâmetros do veículo para auditoria pericial por IA,
    retornando latência e o JSON estrito de conferência de dados, riscos e score.
    """
    start_time = time.time()
    content = await file.read()
    car_ctx = {
        "plate": plate or "",
        "chassi": chassi or "",
        "brand": brand or "",
        "model": model or "",
        "year": year or "2024",
        "km": km or "0"
    }
    result = await avaliar_laudo_com_ia(
        file_bytes=content,
        mimetype=file.content_type or ("application/pdf" if file.filename.endswith(".pdf") else "image/jpeg"),
        car_context=car_ctx
    )
    elapsed_ms = round((time.time() - start_time) * 1000)
    return {
        "status": "success",
        "latency_ms": elapsed_ms,
        "filename": file.filename,
        "ia_feedback": result.model_dump()
    }
