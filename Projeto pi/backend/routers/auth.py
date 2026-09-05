import logging
from typing import Dict, Any
from datetime import datetime

from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException

import models
import schemas
import security
from database import get_db

logger = logging.getLogger("automatch")
router = APIRouter(prefix="/api", tags=["Auth"])


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
def update_profile(request: schemas.UserProfileUpdate, db: Session = Depends(get_db)) -> Dict[str, Any]:
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    if request.name:
        user.name = request.name
    if request.email:
        user.email = request.email.strip().lower()
    if request.photo:
        user.photo = request.photo
        
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "memberSince": user.member_since,
        "photo": user.photo,
        "token": None
    }


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
