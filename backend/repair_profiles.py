"""Reparo explícito de subpapéis; exige backup externo."""
import profile_repair
from maintenance_cli import run_repair_cli

def main():
    return run_repair_cli(profile_repair, __doc__)

if __name__ == "__main__":
    raise SystemExit(main())
