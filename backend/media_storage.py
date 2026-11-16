"""Diretório único de mídia compartilhado pela API, uploads e scanner."""
import os
from pathlib import Path

def resolve_uploads_dir():
    configured = os.getenv("UPLOADS_DIR")
    docker_path = Path("/app/uploads/laudos")
    if configured:
        directory = Path(configured)
    elif os.name != "nt" and docker_path.parent.exists():
        directory = docker_path
    else:
        directory = Path(__file__).resolve().parent / "uploads" / "laudos"
    directory.mkdir(parents=True, exist_ok=True)
    return directory

UPLOADS_DIR = resolve_uploads_dir()
