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

from database import engine, Base
import models

def migrate():
    print("=" * 50)
    print("🔄 MIGRAÇÃO DO BANCO DE DADOS")
    print("=" * 50)
    
    # Step 1: Drop all existing tables
    print("\n🗑️  Removendo tabelas existentes...")
    Base.metadata.drop_all(bind=engine)
    print("   ✅ Tabelas removidas com sucesso.")
    
    # Step 2: Recreate tables with new schema (UUID for Car.id)
    print("\n🏗️  Recriando tabelas com novo schema (UUID)...")
    Base.metadata.create_all(bind=engine)
    print("   ✅ Tabelas recriadas com sucesso.")
    
    # Step 3: Re-seed initial data
    print("\n🌱 Re-populando dados iniciais...")
    from seed import seed_db
    seed_db()
    
    print("\n" + "=" * 50)
    print("✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
    print("   Car.id agora utiliza UUID4 como Primary Key.")
    print("=" * 50)

if __name__ == "__main__":
    migrate()
