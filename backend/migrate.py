"""
Script de Migração: Recriação do banco de dados com suporte a UUID.

Este script:
1. Remove (DROP) todas as tabelas existentes do banco PostgreSQL.
2. Recria as tabelas usando os modelos SQLAlchemy atualizados (Car.id agora é UUID).
3. Re-executa o seed para popular o banco com dados iniciais.

Uso:
    python migrate.py

⚠️  ATENÇÃO: Este script APAGA todos os dados existentes. Use apenas em ambiente de desenvolvimento.
"""

import logging
from database import engine, Base
import models

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("automatch.migrate")


def migrate() -> None:
    logger.info("=" * 50)
    logger.info("MIGRACAO DO BANCO DE DADOS")
    logger.info("=" * 50)

    # Step 1: Drop all existing tables
    logger.info("Removendo tabelas existentes...")
    Base.metadata.drop_all(bind=engine)
    logger.info("Tabelas removidas com sucesso.")

    # Step 2: Recreate tables with new schema (UUID for Car.id)
    logger.info("Recriando tabelas com novo schema (UUID)...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tabelas recriadas com sucesso.")

    # Step 3: Re-seed initial data
    logger.info("Re-populando dados iniciais...")
    from seed import seed_db
    seed_db()

    logger.info("=" * 50)
    logger.info("MIGRACAO CONCLUIDA COM SUCESSO!")
    logger.info("Car.id agora utiliza UUID4 como Primary Key.")
    logger.info("=" * 50)


if __name__ == "__main__":
    migrate()

