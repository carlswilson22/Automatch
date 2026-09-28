"""
security_guard.py — Módulo Central de Segurança e Conformidade (OWASP / LGPD)
Implementa:
- RateLimiter com janela deslizante (Sliding Window Counter) e bloqueio temporário
- Mascaramento de dados pessoais (PII) para conformidade com a LGPD
"""

import time
import re
from typing import Dict, List, Tuple, Optional


class RateLimiter:
    """
    Guarda em memória com algoritmo de Janela Deslizante (Sliding Window Counter).
    Permite limitar requisições e aplicar bloqueio temporário (cooldown) quando o limite é excedido.
    """
    def __init__(self, max_requests: int, window_seconds: int, block_duration_seconds: int = 0):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.block_duration = block_duration_seconds
        self._history: Dict[str, List[float]] = {}
        self._blocked_until: Dict[str, float] = {}

    def is_allowed(self, key: str) -> Tuple[bool, int]:
        """
        Verifica se a chave (IP ou e-mail) pode efetuar a requisição.
        Retorna (permitido: bool, tempo_restante_bloqueio_segundos: int).
        """
        now = time.time()

        # Verifica se a chave está em período de bloqueio temporário
        if key in self._blocked_until:
            blocked_until = self._blocked_until[key]
            if now < blocked_until:
                remaining = int(blocked_until - now) + 1
                return False, remaining
            else:
                del self._blocked_until[key]
                self._history[key] = []

        # Limpa registros fora da janela deslizante
        timestamps = self._history.get(key, [])
        valid_timestamps = [t for t in timestamps if now - t < self.window_seconds]
        self._history[key] = valid_timestamps

        # Verifica se excedeu o limite
        if len(valid_timestamps) >= self.max_requests:
            if self.block_duration > 0:
                self._blocked_until[key] = now + self.block_duration
                return False, self.block_duration
            return False, int(self.window_seconds - (now - valid_timestamps[0])) + 1

        # Registra a tentativa
        self._history[key].append(now)
        return True, 0

    def record_failure(self, key: str) -> Tuple[bool, int]:
        """
        Registra especificamente uma falha (ex: senha incorreta).
        Se atingir max_requests, bloqueia.
        """
        return self.is_allowed(key)

    def reset(self, key: str):
        """Limpa o histórico de uma chave (ex: após login bem-sucedido)."""
        if key in self._history:
            del self._history[key]
        if key in self._blocked_until:
            del self._blocked_until[key]


# Instâncias globais de proteção
login_rate_limiter = RateLimiter(max_requests=5, window_seconds=300, block_duration_seconds=300) # 5 falhas em 5 min -> bloqueia 5 min
plate_rate_limiter = RateLimiter(max_requests=30, window_seconds=60, block_duration_seconds=60)   # 30 consultas por min


def mask_email(email: str) -> str:
    """
    Mascara um endereço de e-mail para exibição segura em logs e telas.
    Exemplo: carlos.wilsong@sempreceub.com -> c***g@sempreceub.com
    """
    if not email or "@" not in email:
        return "***"
    parts = email.split("@")
    user, domain = parts[0], parts[1]
    if len(user) <= 2:
        masked_user = user[0] + "***"
    else:
        masked_user = user[0] + "***" + user[-1]
    return f"{masked_user}@{domain}"


def mask_pii(text: str) -> str:
    """
    Mascara ocorrências de CPFs, telefones e e-mails em strings de log.
    """
    if not text:
        return text
    # Mascara e-mails
    text = re.sub(r'([a-zA-Z0-9_.+-])[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', r'\1***@\2', text)
    # Mascara CPFs (ex: 123.456.789-00 -> 123.***.***-00)
    text = re.sub(r'\b(\d{3})\.\d{3}\.\d{3}-(\d{2})\b', r'\1.***.***-\2', text)
    # Mascara telefones (ex: 61999998888 -> 619****8888)
    text = re.sub(r'\b(\d{3})\d{4}(\d{4})\b', r'\1****\2', text)
    return text
