import os
import uuid
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any

import aiofiles
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse

from services.ai_service import run_yolo_inference

logger = logging.getLogger("automatch")
router = APIRouter(prefix="/api/v1", tags=["Laudos & Uploads"])

UPLOADS_DIR = Path("/app/uploads/laudos")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_LAUDO_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_LAUDO_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/laudos/upload")
async def upload_laudo(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Endpoint de Upload de Laudos Cautelares:
    Recebe arquivos PDF ou imagens (JPG/PNG), valida extensão e tamanho,
    salva com nome único (UUID) na pasta uploads/laudos/ e retorna a URL.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nome do arquivo não informado.")
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_LAUDO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Extensão '{file_ext}' não permitida. Aceitos: {', '.join(ALLOWED_LAUDO_EXTENSIONS)}"
        )
    
    content = await file.read()
    if len(content) > MAX_LAUDO_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Arquivo excede o limite de {MAX_LAUDO_SIZE_BYTES // (1024*1024)}MB."
        )
    
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Arquivo enviado está vazio.")
    
    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}{file_ext}"
    file_path = UPLOADS_DIR / safe_filename
    
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)
    
    yolo_feedback = None
    if file_ext in {".jpg", ".jpeg", ".png"}:
        try:
            yolo_feedback = await asyncio.to_thread(run_yolo_inference, str(file_path))
        except Exception as e:
            logger.warning("Erro ao executar task YOLO: %s", e)
            yolo_feedback = {"error": "Falha na inferência da IA."}
    elif file_ext == ".pdf":
        yolo_feedback = {"info": "Feedback visual indisponível para arquivos PDF."}

    return {
        "status": "success",
        "id": file_id,
        "filename": safe_filename,
        "original_name": file.filename,
        "size_bytes": len(content),
        "content_type": file.content_type,
        "url": f"/api/v1/laudos/files/{safe_filename}",
        "yolo_feedback": yolo_feedback
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
        ".png": "image/png"
    }
    
    return FileResponse(
        path=str(file_path),
        media_type=media_types.get(ext, "application/octet-stream"),
        filename=safe_name
    )
