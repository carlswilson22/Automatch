"""
security.py — Módulo de criptografia e gestão de tokens JWT/HMAC do Automatch.

Objetivo e Motivo da Criação:
  - Criado para centralizar as operações criptográficas críticas do Automatch: hashing seguro de senhas
    com bcrypt, assinatura e validação de tokens JWT (HMAC-SHA256) e verificação de expiração.
  - Implementa proteção defensiva alinhada aos padrões OWASP Top 10 (A01 - Broken Access Control e A07 - Identification Failures).

Responsabilidades:
  - Geração e verificação de tokens JWT assinados com HMAC-SHA256.
  - Hashing seguro de senhas com bcrypt (ou fallback HMAC para ambientes sem bcrypt).
  - Configuração de chave secreta via variável de ambiente JWT_SECRET_KEY.
  - Funções auxiliares de codificação/decodificação Base64 para payloads.
"""

import os
import json
import hmac
import hashlib
import base64
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from dotenv import load_dotenv

load_dotenv()

# Chave secreta: OBRIGATÓRIA em produção via JWT_SECRET no ambiente.
# Em desenvolvimento, o valor padrão é aceito com aviso em log.
_DEFAULT_SECRET = "automatch-jwt-secret-key-production-ceub-2026"
SECRET_KEY = os.getenv("JWT_SECRET") or _DEFAULT_SECRET

ALGORITHM = "HS256"

# Duração do token: lida do ambiente (padrão 1440 min = 24 horas).
# Defina ACCESS_TOKEN_EXPIRE_MINUTES no .env para alterar.
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
)


def check_production_secrets() -> None:
    """
    Guard de inicialização: levanta RuntimeError se o ambiente for 'production'
    e o JWT_SECRET ainda estiver com o valor padrão do repositório (R2).
    Chame esta função em main.py durante o lifespan, ANTES de aceitar tráfego.
    """
    env = os.getenv("ENVIRONMENT", "").strip().lower()
    if env == "production" and SECRET_KEY == _DEFAULT_SECRET:
        raise RuntimeError(
            "[SEGURANÇA CRÍTICA] JWT_SECRET não definido no ambiente de produção. "
            "Defina a variável JWT_SECRET com um valor secreto exclusivo antes de iniciar."
        )
    if env == "production" and os.getenv("ALLOW_DEMO_TOKENS", "false").lower() in ("true", "1"):
        raise RuntimeError(
            "[SEGURANÇA CRÍTICA] ALLOW_DEMO_TOKENS=true não é permitido em ENVIRONMENT=production. "
            "Remova ou defina ALLOW_DEMO_TOKENS=false."
        )

def hash_password(password: str) -> str:
    """Gera hash seguro de senha utilizando PBKDF2-HMAC-SHA256 com salt aleatório."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        iterations=100_000
    )
    return f"{salt.hex()}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha em texto plano confere com o hash salvo."""
    try:
        salt_hex, key_hex = hashed_password.split('$')
        salt = bytes.fromhex(salt_hex)
        key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt,
            iterations=100_000
        )
        return hmac.compare_digest(key.hex(), key_hex)
    except Exception:
        return False

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Cria um token JWT compatível RFC 7519 assinado com HMAC-SHA256."""
    to_encode = data.copy()
    now = int(time.time())
    if expires_delta:
        expire = now + int(expires_delta.total_seconds())
    else:
        expire = now + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        
    to_encode.update({"exp": expire, "iat": now})
    
    header = {"alg": ALGORITHM, "typ": "JWT"}
    
    header_b64 = _b64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = _b64url_encode(json.dumps(to_encode, separators=(',', ':')).encode('utf-8'))
    
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = _b64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodifica e valida a assinatura e expiração de um token JWT."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts
        
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        
        if not hmac.compare_digest(_b64url_encode(expected_sig), signature_b64):
            return None
            
        payload = json.loads(_b64url_decode(payload_b64).decode('utf-8'))
        
        # Validar expiração
        if "exp" in payload and payload["exp"] < int(time.time()):
            return None
            
        return payload
    except Exception:
        return None

# Alias canônico para compatibilidade com rotas de autenticação B2B
def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Valida assinatura e expiração do token JWT. Alias de decode_access_token."""
    return decode_access_token(token)

