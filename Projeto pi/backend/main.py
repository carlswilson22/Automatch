import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
import tasks
from database import engine, get_db
from routers import auth, cars, detran, ai_vision, uploads
import security

logger = logging.getLogger("automatch")

# Diretório de uploads de laudos
UPLOADS_DIR = Path("/app/uploads/laudos")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Automatch API",
    description="API de Gestão Automotiva, Laudos Cautelares, Integração FIPE e Consulta DETRAN",
    version="2.0.0"  # Version bump após refatoração estrutural
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


@app.on_event("startup")
def on_startup():
    """Inicialização dos serviços de banco e tarefas agendadas."""
    models.Base.metadata.create_all(bind=engine)
    
    # Auto-seed admin user se não existir
    db = next(get_db())
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
