"""Desvincula vídeo inválido; exige backup externo."""
import demo_media_repair
from maintenance_cli import run_repair_cli

if __name__ == "__main__":
    raise SystemExit(run_repair_cli(demo_media_repair, __doc__))
