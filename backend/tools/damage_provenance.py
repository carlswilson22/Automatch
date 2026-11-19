"""Integrity checks for experimental damage training and HTTP evaluation."""
import hashlib
import hmac
from pathlib import Path


def verify_sha256(path, expected, label):
    if not isinstance(expected, str) or len(expected) != 64:
        raise ValueError(f"Hash invalido para {label}")
    actual = hashlib.sha256(Path(path).read_bytes()).hexdigest()
    if not hmac.compare_digest(actual, expected):
        raise ValueError(f"Hash divergente para {label}")
    return actual


def verify_experiment_response(data, entry, model, image_size):
    if data.get("experimental") is not True or data.get("validated") is not False:
        raise ValueError("Resposta nao identificada como experimento")
    if data.get("experiment") != model["name"] or data.get("image_size") != image_size:
        raise ValueError("Modelo ou resolucao da resposta divergente")
    if data.get("image_sha256") != entry["sha256"]:
        raise ValueError("Imagem avaliada diverge do manifesto")
    if data.get("weight_sha256") != model["weight_sha256"]:
        raise ValueError("Checkpoint avaliado diverge dos resultados")
