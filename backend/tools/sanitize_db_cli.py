"""
backend/tools/sanitize_db_cli.py
Utilitário de linha de comando para auditoria e saneamento idempotente da base de dados.
Garante a integridade da vitrine digital do Automatch:
- Preserva os 5 veículos canônicos oficiais (sc-001 a sc-005)
- Preserva anúncios legítimos de usuários cadastrados
- Remove resíduos de testes temporários e registros legados órfãos
- Limpa ordenadamente as dependências filhas com FK (laudo_protocols, watchlist, etc.)
"""
import argparse
import sys
import os

# Adiciona o diretório backend ao sys.path se necessário
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from database import SessionLocal
import models
from seed import sanitize_database, seed_db


def main():
    parser = argparse.ArgumentParser(description="Auditoria e saneamento da base de dados Automatch")
    parser.add_argument("--dry-run", action="store_true", help="Apenas audita sem aplicar exclusões")
    parser.add_argument("--apply", action="store_true", help="Aplica o saneamento atômico no banco")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        canonical_ids = {"sc-001", "sc-002", "sc-003", "sc-004", "sc-005"}
        all_cars = db.query(models.Car).order_by(models.Car.id.asc()).all()

        print(f"Total de veículos no banco atual: {len(all_cars)}")
        print("\nVeículos Canônicos Oficiais:")
        for c in all_cars:
            if c.id in canonical_ids:
                print(f"  [OK] {c.id} - {c.brand} {c.model} (R$ {c.price:,.2f})")

        residuals = [c for c in all_cars if c.id not in canonical_ids]
        print(f"\nVeículos não-canônicos detectados: {len(residuals)}")
        for r in residuals:
            print(f"  [RESIDUO] {r.id} - {r.brand} {r.model} (User: {r.user_id}, Store: {r.store_id})")

        if args.apply:
            print("\nExecutando saneamento atômico e reconciliação...")
            res = sanitize_database(db)
            print(f"Saneamento concluído: {res['removed']} veículos residuais removidos com sucesso.")
            remaining = db.query(models.Car).count()
            print(f"Veículos ativos na vitrine: {remaining}")
        elif not args.dry_run:
            print("\nExecute com --apply para efetivar a remoção ou --dry-run para apenas visualizar.")

    except Exception as e:
        print(f"Erro na execução: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

