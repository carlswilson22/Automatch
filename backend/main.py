import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
import tasks
from database import engine, get_db
from routers import auth, cars, detran, ai_vision, uploads, tradein, alerts, integrations, laudos_export
import security

logger = logging.getLogger("automatch")

# Diretório de uploads de laudos e vídeos
def _resolve_uploads_dir() -> Path:
    env_dir = os.getenv("UPLOADS_DIR")
    if env_dir:
        p = Path(env_dir)
    else:
        docker_path = Path("/app/uploads/laudos")
        if docker_path.parent.exists() and os.name != "nt":
            p = docker_path
        else:
            p = Path(__file__).resolve().parent / "uploads" / "laudos"
    p.mkdir(parents=True, exist_ok=True)
    return p

UPLOADS_DIR = _resolve_uploads_dir()

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Automatch API",
    description="API de Gestão Automotiva, Laudos Cautelares, Integração FIPE e Consulta DETRAN",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas
app.include_router(auth.router)
app.include_router(cars.router)
app.include_router(detran.router)
app.include_router(ai_vision.router)
app.include_router(uploads.router)
app.include_router(tradein.router)
app.include_router(alerts.router)
app.include_router(integrations.router)
app.include_router(laudos_export.router)


@app.on_event("startup")
def on_startup():
    """Inicialização dos serviços de banco e tarefas agendadas."""
    # Auto-seed admin user se não existir
    db = SessionLocal()
    try:
        admin_user = db.query(models.User).filter(models.User.email == "admin@automatch.com").first()
        if not admin_user:
            admin_user = models.User(
                id="user-1",
                name="Admin",
                email="admin@automatch.com",
                hashed_password=security.hash_password("admin123"),
                member_since="Abril 2024",
                photo="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
            )
            db.add(admin_user)
            db.commit()
            logger.info("Admin padrão cadastrado com sucesso.")
    except Exception as e:
        logger.warning(f"Aviso na verificação de admin: {e}")
        db.rollback()
    finally:
        db.close()
        
    tasks.start_scheduler()

@app.on_event("shutdown")
def on_shutdown():
    tasks.shutdown_scheduler()
