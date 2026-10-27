"""
dependencies.py — Injeção de dependências e controle de sessão do FastAPI.

Objetivo e Motivo da Criação:
  - Criado para gerenciar o ciclo de vida de sessões do banco de dados (get_db),
    autenticação de usuários via JWT (get_current_user) e controle de autorização baseado em papéis.
"""
"""
dependencies.py — Guards centralizados de autenticação e autorização do Automatch.

Substitui os duplicados:
  - get_current_user_from_header em routers/auth.py
  - get_current_b2b_user em routers/partnerships.py

Decisões de design:
  - ALLOW_DEMO_TOKENS é forçado a False em ENVIRONMENT=production (R1 / OWASP A07).
  - Cada guard lança HTTPException com mensagem em PT-BR.
  - is_owner_or_admin é um helper reutilizável (sem Depends) para verificar ownership.
"""
import os
import logging
from typing import Optional

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

import models
import security
from database import get_db

logger = logging.getLogger("automatch")

_DEFAULT_JWT_SECRET = "automatch-jwt-secret-key-production-ceub-2026"


def _is_production() -> bool:
    return os.getenv("ENVIRONMENT", "").strip().lower() == "production"


def _demo_tokens_allowed() -> bool:
    """Tokens demo NUNCA são permitidos em produção (R1)."""
    if _is_production():
        return False
    return os.getenv("ALLOW_DEMO_TOKENS", "true").strip().lower() in ("true", "1")


# ==============================================================================
# Guard Principal — Extração e Validação do JWT
# ==============================================================================

def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Extrai e valida o Bearer token do cabeçalho Authorization.
    Suporta tokens demo somente fora de produção e com ALLOW_DEMO_TOKENS=true.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Token de autenticação obrigatório. Faça login para continuar.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = authorization[len("Bearer "):].strip()

    # Tokens demo — exclusivamente fora de produção
    if _demo_tokens_allowed() and token in ("demo-admin-token", "demo-lojista-token"):
        demo_user = db.query(models.User).filter(
            models.User.email == "admin@automatch.com"
        ).first()
        if demo_user:
            logger.debug("Requisição autenticada via token demo (ambiente de demonstração).")
            return demo_user
        raise HTTPException(status_code=401, detail="Token de demonstração inválido: admin não encontrado.")

    payload = security.decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Token inválido ou sessão expirada. Faça login novamente.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token malformado.")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Normalização em runtime para papéis legados
    if getattr(user, "role", None) in ("comprador", "vendedor") or not getattr(user, "role", None):
        user.role = "comum"

    return user


# ==============================================================================
# Guards de Role
# ==============================================================================

def require_lojista_or_admin(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """Guard: exige papel lojista ou admin. Usuários comuns são rejeitados (403)."""
    if getattr(current_user, "role", None) not in ("lojista", "admin"):
        raise HTTPException(
            status_code=403,
            detail="Acesso restrito a lojistas e administradores."
        )
    return current_user


def require_admin(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """Guard: exige papel admin exclusivamente."""
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(
            status_code=403,
            detail="Acesso restrito a administradores."
        )
    return current_user


def require_lojista_with_store(
    current_user: models.User = Depends(require_lojista_or_admin)
) -> models.User:
    """
    Guard: exige lojista/admin E que o usuário tenha store_id vinculado.
    Usado nas rotas de parcerias B2B onde store_id nulo é inválido (P5 Opção A).
    """
    if getattr(current_user, "role", None) != "admin" and not current_user.store_id:
        raise HTTPException(
            status_code=403,
            detail="Sua conta de lojista ainda não possui uma loja vinculada. "
                   "Conclua o cadastro da loja para acessar a rede B2B."
        )
    return current_user


# ==============================================================================
# Helper de Ownership (sem Depends — uso direto no corpo da rota)
# ==============================================================================

def is_owner_or_admin(current_user: models.User, resource_owner_id: str) -> bool:
    """Retorna True se o usuário é dono do recurso ou administrador."""
    is_admin = (
        getattr(current_user, "role", "") == "admin"
        or current_user.email == "admin@automatch.com"
    )
    return is_admin or (bool(resource_owner_id) and current_user.id == resource_owner_id)
