"""
004_unify_user_roles.py — Migração de unificação de papéis e permissões de usuários.

Objetivo e Motivo da Criação:
  - Criado para padronizar as roles de autenticação (buyer, seller, dealership, admin)
    e simplificar as regras de autorização nos endpoints protegidos.
"""
"""Unify user roles to comum, lojista, admin

Revision ID: 004_unify_user_roles
Revises: 9e22ea1485c3
Create Date: 2026-10-17 19:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004_unify_user_roles'
down_revision: Union[str, None] = '9e22ea1485c3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Unifica compradores e vendedores existentes para 'comum'
    op.execute("UPDATE users SET role = 'comum' WHERE role IN ('comprador', 'vendedor')")
    # Garante saneamento de roles inválidas ou não categorizadas
    op.execute("UPDATE users SET role = 'lojista' WHERE role NOT IN ('comum', 'lojista', 'admin')")


def downgrade() -> None:
    # Reverte usuários 'comum' para 'comprador' caso necessário rollback
    op.execute("UPDATE users SET role = 'comprador' WHERE role = 'comum'")
