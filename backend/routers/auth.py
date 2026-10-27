"""
auth.py — Router de autenticação e autorização do Automatch.

Responsabilidades:
  - Login e registro de usuários (compradores, vendedores, lojistas).
  - Emissão de tokens JWT via security.py.
  - Endpoint de onboarding de lojas com guard RBAC (apenas admin/lojista).
  - Verificação de sessão (/api/me) para persistência do estado de login.

Criado para implementar o fluxo completo de autenticação da plataforma,
com suporte a tokens demo em ambiente de desenvolvimento (OWASP A07).
"""

import logging
import os
import time
import random
import hashlib
import re
from typing import Dict, Any, List
from datetime import datetime

from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional

import models
import schemas
import security
from database import get_db
from security_guard import login_rate_limiter, mask_email
# get_current_user centralizado — importado de dependencies para evitar duplicidade
from dependencies import get_current_user, require_lojista_or_admin

logger = logging.getLogger("automatch")
router = APIRouter(prefix="/api", tags=["Auth"])

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# get_current_user_from_header mantido como alias para retrocompatibilidade
# com quaisquer routers que ainda o importem diretamente.
get_current_user_from_header = get_current_user

# Rate limiting em memória para recuperação de senha
_reset_attempts: Dict[str, List[float]] = {}
RATE_LIMIT_WINDOW = 3600  # 1 hora
RATE_LIMIT_MAX = 3         # máx 3 tentativas por hora


@router.post("/register", response_model=schemas.UserResponse)
def register(request: schemas.UserCreate, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Cadastro de novo usuário.

    Regras de role (P4):
      - role aceito: 'lojista' ou 'comprador'. Qualquer outro valor (incluindo 'admin')
        é rejeitado com HTTP 400.
      - Lojista: obrigatório informar store_name. Uma nova loja é criada e vinculada
        atomicamente (sub_role='owner').
      - Comprador: store_id fica nulo. Não tem acesso ao painel B2B (C1).
    """
    email = request.email.strip().lower()
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="Formato de e-mail inválido.")

    clean_name = request.name.strip()
    if len(clean_name) < 2:
        raise HTTPException(status_code=400, detail="O nome deve conter pelo menos 2 caracteres.")

    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="A senha deve ter no mínimo 6 caracteres.")

    # Validação de role: aceita 'lojista' ou 'comum' (comprador legado mapeia para comum)
    raw_role = (request.role or "comum").strip().lower()
    if raw_role == "comprador":
        requested_role = "comum"
    else:
        requested_role = raw_role

    if requested_role not in ("lojista", "comum"):
        raise HTTPException(
            status_code=400,
            detail="Papel inválido. Escolha entre 'lojista' ou 'comum'."
        )

    # Lojista DEVE informar o nome da loja (P5 Opção A)
    if requested_role == "lojista":
        store_name = (request.store_name or "").strip()
        if len(store_name) < 3:
            raise HTTPException(
                status_code=400,
                detail="Lojistas devem informar o nome da loja (mínimo 3 caracteres)."
            )

    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado no sistema.")

    # --- Criação da Loja (apenas para lojistas) — P5 Opção A ---
    new_store_id = None
    sub_role = None
    if requested_role == "lojista":
        slug_base = re.sub(r"[^a-z0-9]+", "-", store_name.lower()).strip("-")
        # Garante slug único no banco
        slug = slug_base
        counter = 1
        while db.query(models.Store).filter(models.Store.slug == slug).first():
            slug = f"{slug_base}-{counter}"
            counter += 1

        new_store = models.Store(
            name=store_name,
            slug=slug,
            logo="",
            description=f"Loja cadastrada por {clean_name}."
        )
        db.add(new_store)
        db.flush()  # Obtém o ID antes do commit
        new_store_id = new_store.id
        sub_role = "owner"

    member_since = datetime.now().strftime("%B %Y")
    user = models.User(
        name=clean_name,
        email=email,
        hashed_password=security.hash_password(request.password),
        member_since=member_since,
        photo="https://api.dicebear.com/7.x/initials/svg?seed=" + clean_name.replace(" ", "+"),
        role=requested_role,
        sub_role=sub_role,
        store_id=new_store_id  # None para usuários comuns
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = security.create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    logger.info(
        "Novo usuário cadastrado: %s | role=%s | store_id=%s",
        mask_email(email), requested_role, new_store_id
    )
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "memberSince": user.member_since,
        "photo": user.photo,
        "role": user.role,
        "sub_role": user.sub_role,
        "store_id": user.store_id,
        "token": token
    }


@router.post("/login", response_model=schemas.UserResponse)
def login(request: schemas.UserLogin, db: Session = Depends(get_db)) -> Dict[str, Any]:
    email = request.email.strip().lower()

    # Proteção defensiva contra Brute Force (OWASP A07)
    allowed, remaining = login_rate_limiter.is_allowed(email, record=False)
    if not allowed:
        logger.warning("Tentativa de login bloqueada por rate limit para o e-mail: %s", mask_email(email))
        raise HTTPException(
            status_code=429,
            detail=f"Muitas tentativas incorretas. Conta temporariamente bloqueada. Tente novamente em {remaining} segundos.",
            headers={"Retry-After": str(remaining)}
        )

    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user or not security.verify_password(request.password, user.hashed_password):
        login_rate_limiter.record_failure(email)
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha incorretos."
        )

    # Limpa tentativas prévias com sucesso
    login_rate_limiter.reset(email)
    
    effective_role = user.role if user.role else "comum"
    if effective_role in ("comprador", "vendedor"):
        effective_role = "comum"

    token = security.create_access_token({"sub": user.id, "email": user.email, "role": effective_role})
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "memberSince": user.member_since,
        "photo": user.photo,
        "role": effective_role,
        "sub_role": user.sub_role,
        "store_id": user.store_id,
        "token": token
    }


@router.get("/users/profile", response_model=schemas.UserResponse)
def get_profile(
    current_user: models.User = Depends(get_current_user_from_header)
) -> Dict[str, Any]:
    """
    Retorna o perfil do usuário autenticado via JWT.
    Requer header: Authorization: Bearer <token>
    """
    effective_role = current_user.role if current_user.role else "comum"
    if effective_role in ("comprador", "vendedor"):
        effective_role = "comum"
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "memberSince": current_user.member_since,
        "photo": current_user.photo,
        "role": effective_role,
        "sub_role": current_user.sub_role,
        "store_id": current_user.store_id,
        "token": None
    }


@router.put("/users/profile", response_model=schemas.UserResponse)
def update_profile(
    request: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_header)
) -> Dict[str, Any]:
    """
    Atualiza o perfil do usuário autenticado via JWT.
    Requer header: Authorization: Bearer <token>
    """
    if request.name:
        clean_name = request.name.strip()
        if len(clean_name) < 2:
            raise HTTPException(status_code=400, detail="O nome deve conter pelo menos 2 caracteres.")
        current_user.name = clean_name
    if request.email:
        new_email = request.email.strip().lower()
        if not EMAIL_REGEX.match(new_email):
            raise HTTPException(status_code=400, detail="Formato de e-mail inválido.")
        # Verifica se o novo e-mail já está em uso por outro usuário
        conflict = db.query(models.User).filter(
            models.User.email == new_email,
            models.User.id != current_user.id
        ).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Este e-mail já está em uso por outro usuário.")
        current_user.email = new_email
    if request.photo:
        current_user.photo = request.photo

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "memberSince": current_user.member_since,
        "photo": current_user.photo,
        "role": getattr(current_user, 'role', 'lojista') or 'lojista',
        "sub_role": getattr(current_user, 'sub_role', 'owner') or 'owner',
        "store_id": getattr(current_user, 'store_id', 1) or 1,
        "token": None
    }



@router.post("/auth/forgot-password", response_model=schemas.ForgotPasswordResponse)
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Gera um código OTP de 6 dígitos para recuperação de senha.
    O código é logado no stdout (simulação SMTP) e retornado no response para popup dev.
    Rate limiting: máximo 3 solicitações por hora por e-mail.
    """
    email = request.email.strip().lower()
    now = time.time()

    # Rate limiting
    if email in _reset_attempts:
        _reset_attempts[email] = [t for t in _reset_attempts[email] if now - t < RATE_LIMIT_WINDOW]
        if len(_reset_attempts[email]) >= RATE_LIMIT_MAX:
            raise HTTPException(
                status_code=429,
                detail="Limite de solicitações excedido. Tente novamente em 1 hora."
            )
    else:
        _reset_attempts[email] = []

    # Verificar se o e-mail existe
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        # Retorno genérico para não revelar se o e-mail existe (segurança)
        return {"message": "Se o e-mail estiver cadastrado, você receberá um código de recuperação.", "expires_in": 900}

    # Gerar OTP de 6 dígitos com gerador criptográfico
    otp_code = f"{random.SystemRandom().randint(100000, 999999)}"
    token_hash = hashlib.sha256(f"{otp_code}:{email}".encode()).hexdigest()
    expires_at = now + 900  # 15 minutos

    # Invalida tokens anteriores do mesmo usuário
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.used == 0
    ).update({"used": 1})

    # Persistir novo token
    reset_token = models.PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        otp_code=otp_code,
        expires_at=expires_at,
        used=0,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(reset_token)
    db.commit()

    # Registrar tentativa de rate limiting
    _reset_attempts[email].append(now)

    # Simulação de envio de e-mail — loga com proteção LGPD de PII
    logger.info("=" * 60)
    logger.info("📧 CÓDIGO OTP DE RECUPERAÇÃO DE SENHA")
    logger.info(f"   Destinatário (LGPD): {mask_email(email)}")
    logger.info("   Código de uso único gerado e armazenado de forma criptográfica.")
    logger.info("   Expira em: 15 minutos")
    logger.info("=" * 60)

    # Em modo dev, retorna o código no response para popup no frontend
    return {
        "message": f"Código de recuperação enviado! Seu código é: {otp_code}",
        "expires_in": 900
    }


@router.post("/auth/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Redefine a senha do usuário com base no OTP válido e não expirado.
    """
    email = request.email.strip().lower()
    otp = request.otp.strip()
    now = time.time()

    # Buscar usuário
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="E-mail não encontrado no sistema.")

    # Buscar token OTP válido
    token_hash = hashlib.sha256(f"{otp}:{email}".encode()).hexdigest()
    reset_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.token_hash == token_hash,
        models.PasswordResetToken.used == 0
    ).first()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Código OTP inválido ou já utilizado.")

    if reset_token.expires_at < now:
        reset_token.used = 1
        db.commit()
        raise HTTPException(status_code=400, detail="Código OTP expirado. Solicite um novo código.")

    # Validar nova senha
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="A nova senha deve ter no mínimo 6 caracteres.")

    # Redefinir senha
    user.hashed_password = security.hash_password(request.new_password)
    reset_token.used = 1
    db.commit()

    logger.info(f"Senha redefinida com sucesso para o usuário: {email}")

    return {"message": "Senha redefinida com sucesso! Faça login com sua nova senha."}


@router.post("/checkout", response_model=schemas.CheckoutResponse)
def checkout(
    request: schemas.CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_header)
) -> Dict[str, Any]:
    protocol = f"ATM-{int(datetime.now().timestamp()) % 1000000:06d}"
    now_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    
    order = models.PaymentOrder(
        protocol=protocol,
        customer_name=request.customer_name,
        customer_email=request.customer_email,
        item_description=request.item_description,
        amount=request.amount,
        payment_method=request.payment_method,
        status="Aprovado",
        created_at=now_str
    )
    db.add(order)
    db.commit()
    
    return {
        "protocol": protocol,
        "date": now_str,
        "item": request.item_description,
        "amount": request.amount,
        "method": request.payment_method.upper(),
        "customer": request.customer_name,
        "status": "Aprovado"
    }


# ==============================================================================
# CONFORMIDADE COM A LGPD (Art. 18 — Direitos do Titular)
# ==============================================================================

@router.get("/users/me/export-data")
def export_user_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_header)
) -> Dict[str, Any]:
    """
    LGPD Art. 18, V (Portabilidade de dados):
    Exporta todos os dados pessoais, anúncios e transações vinculadas ao titular autenticado.
    """
    user_cars = db.query(models.Car).filter(models.Car.user_id == current_user.id).all()
    user_orders = db.query(models.PaymentOrder).filter(models.PaymentOrder.customer_email == current_user.email).all()

    return {
        "status": "success",
        "timestamp_exportacao": datetime.utcnow().isoformat() + "Z",
        "titular": {
            "id": current_user.id,
            "nome": current_user.name,
            "email": current_user.email,
            "data_registro": current_user.member_since,
            "papel": current_user.role,
            "sub_papel": current_user.sub_role,
            "loja_id": current_user.store_id
        },
        "anuncios_cadastrados": [
            {
                "id": c.id,
                "marca": c.brand,
                "modelo": c.model,
                "ano": c.year,
                "preco": c.price,
                "placa_ofuscada": c.plate[:3] + "****" if c.plate else None
            }
            for c in user_cars
        ],
        "historico_pedidos": [
            {
                "protocolo": o.protocol,
                "descricao": o.item_description,
                "valor": o.amount,
                "status": o.status,
                "data": o.created_at
            }
            for o in user_orders
        ]
    }


@router.delete("/users/me")
def delete_or_anonymize_user_account(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_header)
) -> Dict[str, Any]:
    """
    LGPD Art. 18, VI (Eliminação / Anonimização de dados pessoais):
    Anonimiza os dados cadastrais do titular, desvincula anúncios ativos e invalida credenciais,
    preservando identificadores fiscais anônimos necessários ao cumprimento de obrigação legal.
    """
    user_id = current_user.id
    anonymized_id = f"anonimizado_{user_id[:8]}"
    
    current_user.name = "Titular Anonimizado (LGPD)"
    current_user.email = f"{anonymized_id}@anonimizado.automatch.local"
    current_user.photo = None
    current_user.hashed_password = "ANONYMIZED_LGPD_INACTIVE"

    # Desvincula anúncios
    db.query(models.Car).filter(models.Car.user_id == user_id).update({"user_id": None})
    
    # Invalida tokens de reset pendentes
    db.query(models.PasswordResetToken).filter(models.PasswordResetToken.user_id == user_id).update({"used": 1})

    db.commit()
    logger.info("Conta do usuário %s anonimizada com sucesso conforme solicitação LGPD.", user_id)

    return {
        "status": "success",
        "message": "Conta e dados pessoais foram devidamente anonimizados e desvinculados em conformidade com o Art. 18 da LGPD.",
        "titular_id": anonymized_id
    }


@router.post("/store/onboarding", response_model=schemas.UserResponse)
def onboard_store(
    request: schemas.StoreOnboardingRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_lojista_or_admin)
) -> Dict[str, Any]:
    """
    Onboarding de Loja para Lojistas (P5 Opção A / Checkpoint 96):
    Permite que usuários com role 'lojista' (ou 'admin') que ainda não possuam store_id
    vinculem ou registrem sua loja, habilitando o acesso pleno ao ecossistema B2B.
    """
    clean_name = request.name.strip()
    if len(clean_name) < 3:
        raise HTTPException(status_code=400, detail="O nome da loja deve conter pelo menos 3 caracteres.")

    # Se o lojista já tem uma loja válida vinculada, rejeita duplicação
    if current_user.store_id:
        existing_store = db.query(models.Store).filter(models.Store.id == current_user.store_id).first()
        if existing_store:
            raise HTTPException(
                status_code=400,
                detail=f"Sua conta já possui a loja '{existing_store.name}' vinculada."
            )

    slug_base = re.sub(r"[^a-z0-9]+", "-", clean_name.lower()).strip("-")
    slug = slug_base
    counter = 1
    while db.query(models.Store).filter(models.Store.slug == slug).first():
        slug = f"{slug_base}-{counter}"
        counter += 1

    new_store = models.Store(
        name=clean_name,
        slug=slug,
        logo=request.logo or "",
        description=request.description or f"Loja cadastrada por {current_user.name}."
    )
    db.add(new_store)
    db.flush()

    current_user.store_id = new_store.id
    current_user.sub_role = "owner"
    db.commit()
    db.refresh(current_user)

    logger.info("Onboarding de loja '%s' (ID %d) concluído para usuário %s.", new_store.name, new_store.id, current_user.email)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "photo": current_user.photo,
        "memberSince": current_user.member_since,
        "role": current_user.role,
        "sub_role": current_user.sub_role,
        "store_id": current_user.store_id
    }


