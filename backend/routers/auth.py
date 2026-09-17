import logging
import time
import random
import hashlib
from typing import Dict, Any, List
from datetime import datetime

from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional

import models
import schemas
import security
from database import get_db

logger = logging.getLogger("automatch")
router = APIRouter(prefix="/api", tags=["Auth"])


def get_current_user_from_header(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Extrai e valida o JWT do header Authorization: Bearer <token>.
    Retorna o objeto User autenticado ou levanta HTTPException 401.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token de autenticação obrigatório.")
    token = authorization.removeprefix("Bearer ").strip()
    payload = security.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado.")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token malformado.")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return user

# Rate limiting em memória para recuperação de senha
_reset_attempts: Dict[str, List[float]] = {}
RATE_LIMIT_WINDOW = 3600  # 1 hora
RATE_LIMIT_MAX = 3         # máx 3 tentativas por hora


@router.post("/register", response_model=schemas.UserResponse)
def register(request: schemas.UserCreate, db: Session = Depends(get_db)) -> Dict[str, Any]:
    email = request.email.strip().lower()
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado no sistema.")
    
    user = models.User(
        name=request.name.strip(),
        email=email,
        hashed_password=security.hash_password(request.password),
        member_since="Março 2024",
        photo="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = security.create_access_token({"sub": user.id, "email": user.email})
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "memberSince": user.member_since,
        "photo": user.photo,
        "token": token
    }


@router.post("/login", response_model=schemas.UserResponse)
def login(request: schemas.UserLogin, db: Session = Depends(get_db)) -> Dict[str, Any]:
    email = request.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user or not security.verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha incorretos."
        )
    
    token = security.create_access_token({"sub": user.id, "email": user.email})
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "memberSince": user.member_since,
        "photo": user.photo,
        "token": token
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
        current_user.name = request.name.strip()
    if request.email:
        new_email = request.email.strip().lower()
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

    # Simulação de envio de e-mail — loga no stdout
    logger.info("=" * 60)
    logger.info(f"📧 CÓDIGO OTP DE RECUPERAÇÃO DE SENHA")
    logger.info(f"   E-mail: {email}")
    logger.info(f"   Código: {otp_code}")
    logger.info(f"   Expira em: 15 minutos")
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
def checkout(request: schemas.CheckoutRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
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

