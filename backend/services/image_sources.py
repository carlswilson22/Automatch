"""Restringe downloads de imagem a provedores públicos configurados pelo operador."""
import os
from urllib.parse import urlparse

def is_allowed_image_url(value: str) -> bool:
    try:
        parsed = urlparse(value)
        allowed = {host.strip().lower() for host in os.getenv("ALLOWED_IMAGE_HOSTS", "images.unsplash.com,plus.unsplash.com,images.pexels.com").split(",") if host.strip()}
        return (parsed.scheme == "https" and parsed.hostname in allowed
                and parsed.port in (None, 443) and not parsed.username and not parsed.password)
    except (ValueError, TypeError):
        return False
