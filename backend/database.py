import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()
DATABASE_MODE = os.getenv("DATABASE_MODE", "").strip().lower()

if DATABASE_MODE == "sqlite":
    if ENVIRONMENT == "production":
        raise RuntimeError(
            "[SEGURANÇA CRÍTICA] DATABASE_MODE=sqlite não é permitido em ambiente de produção (ENVIRONMENT=production). "
            "Configure um banco PostgreSQL resiliente através da variável DATABASE_URL."
        )
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./automatch_dev.db")
else:
    DATABASE_URL = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@db:5432/automatch"
    )
    # Fail-fast: se nenhuma DATABASE_URL foi explicitamente definida e o hostname 'db'
    # não resolve (estamos fora da rede Docker), aborta com instruções claras
    if not os.getenv("DATABASE_URL") and "db:5432" in DATABASE_URL:
        import socket
        try:
            socket.getaddrinfo("db", 5432)
        except socket.gaierror:
            raise RuntimeError(
                "\n" + "="*80 + "\n"
                "[CONFIGURAÇÃO AUSENTE] Backend executando fora do Docker sem DATABASE_URL.\n"
                "O hostname 'db' (rede interna do Docker Compose) não é acessível.\n\n"
                "  Opção 1 (PostgreSQL via Docker exposto na porta 5433):\n"
                "    export DATABASE_URL=postgresql://postgres:postgres@localhost:5433/automatch\n\n"
                "  Opção 2 (SQLite para desenvolvimento rápido):\n"
                "    export DATABASE_MODE=sqlite\n"
                + "="*80 + "\n"
            )

# SQLAlchemy 2.0: Assegura compatibilidade com psycopg2 quando a URL inicia com postgresql:// ou postgres://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# Engine setup com Pool de Conexões Industrial e Healthcheck automático
engine_kwargs = {}
if "sqlite" in DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,
        "pool_recycle": 1800,
        "pool_timeout": 30
    })

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
