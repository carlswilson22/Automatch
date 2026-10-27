"""
005_fix_b2b_financial_types.py — Migração de precisão financeira para repasse B2B.

Objetivo e Motivo da Criação:
  - Criado para converter tipos de dados de colunas de preço e comissões financeiras de Float para Numeric(12,2),
    prevenindo erros de arredondamento em transações e reservas B2B no PostgreSQL e SQLite.
"""
"""Fix B2B financial columns from Float to Numeric

Revision ID: 005_fix_b2b_financial_types
Revises: 004_unify_user_roles
Create Date: 2026-10-26 22:05:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '005_fix_b2b_financial_types'
down_revision: Union[str, None] = '004_unify_user_roles'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# ── Colunas a migrar: (tabela, coluna, tipo_novo, tipo_antigo) ────────────────
_MONETARY_COLUMNS = [
    ("payment_orders",      "amount",            "NUMERIC(12, 2)", "DOUBLE PRECISION"),
    ("car_reservations",    "proposed_price",    "NUMERIC(12, 2)", "DOUBLE PRECISION"),
    ("car_reservations",    "client_markup",     "NUMERIC(12, 2)", "DOUBLE PRECISION"),
    ("partner_transactions","final_price",       "NUMERIC(12, 2)", "DOUBLE PRECISION"),
    ("partner_transactions","repasse_piso",      "NUMERIC(12, 2)", "DOUBLE PRECISION"),
    ("partner_transactions","markup_amount",     "NUMERIC(12, 2)", "DOUBLE PRECISION"),
    ("partner_transactions","commission_amount", "NUMERIC(12, 2)", "DOUBLE PRECISION"),
    ("store_partnerships",  "commission_rate",   "NUMERIC(5, 2)",  "DOUBLE PRECISION"),
]


def upgrade() -> None:
    for table, column, new_type, _old_type in _MONETARY_COLUMNS:
        op.execute(
            f'ALTER TABLE {table} ALTER COLUMN {column} '
            f'TYPE {new_type} USING {column}::{new_type}'
        )


def downgrade() -> None:
    for table, column, _new_type, old_type in _MONETARY_COLUMNS:
        op.execute(
            f'ALTER TABLE {table} ALTER COLUMN {column} '
            f'TYPE {old_type} USING {column}::{old_type}'
        )
