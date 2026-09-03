"""Add laudo_watchlist table

Revision ID: 001_add_laudo_watchlist
Revises: 
Create Date: 2026-08-31 21:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_add_laudo_watchlist'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create laudo_watchlist table if it doesn't exist
    op.create_table(
        'laudo_watchlist',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('placa', sa.String(length=10), nullable=False),
        sa.Column('codigo_fipe', sa.String(length=20), nullable=True),
        sa.Column('user_email', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True, server_default='MONITORANDO'),
        sa.Column('ultima_verificacao', sa.DateTime(), nullable=True),
        sa.Column('criado_em', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_laudo_watchlist_id'), 'laudo_watchlist', ['id'], unique=False)
    op.create_index(op.f('ix_laudo_watchlist_placa'), 'laudo_watchlist', ['placa'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_laudo_watchlist_placa'), table_name='laudo_watchlist')
    op.drop_index(op.f('ix_laudo_watchlist_id'), table_name='laudo_watchlist')
    op.drop_table('laudo_watchlist')
