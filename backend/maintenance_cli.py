"""Manutenção explícita de perfis; não executa seed nem inicia a API.

DATABASE_URL deve ser fornecida pelo ambiente. Escritas exigem backup externo.
"""
import argparse
import json
import os
from pathlib import Path
from sqlalchemy import create_engine

def run_repair_cli(repair, description):
    plan_repairs, apply_repairs, rollback_repairs = repair.plan_repairs, repair.apply_repairs, repair.rollback_repairs
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--backup", type=Path)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--rollback", type=Path)
    args = parser.parse_args()
    url = os.environ.get("DATABASE_URL")
    if not url:
        parser.error("Forneça DATABASE_URL explicitamente; .env não é carregado.")
    writing = args.apply or args.rollback
    repo = Path(__file__).resolve().parent.parent
    if writing:
        backup = args.backup.resolve() if args.backup else None
        if not backup or not backup.is_file() or backup.stat().st_size < 5 or backup.is_relative_to(repo):
            parser.error("Escritas exigem um backup existente fora do repositório.")
    engine = create_engine(url)
    try:
        with engine.begin() as connection:
            if args.rollback:
                entries = json.loads(args.rollback.read_text(encoding="utf8"))["entries"]
                changed = rollback_repairs(connection, entries)
            else:
                entries = plan_repairs(connection)
                if not args.apply:
                    print(json.dumps({"mode": "read_only", "candidates": len(entries)}))
                    return 0
                if not entries:
                    print(json.dumps({"mode": "apply", "changed": 0}))
                    return 0
                report = args.report.resolve() if args.report else None
                if not report or report.is_relative_to(repo):
                    parser.error("Forneça --report fora do repositório para permitir rollback.")
                # Exclusivo: repetir o comando não apaga um manifesto anterior.
                with report.open("x", encoding="utf8") as stream:
                    json.dump({"version": 1, "entries": entries}, stream, ensure_ascii=False, indent=2)
                changed = apply_repairs(connection, entries)
        print(json.dumps({"mode": "rollback" if args.rollback else "apply", "changed": changed}))
        return 0
    finally:
        engine.dispose()

