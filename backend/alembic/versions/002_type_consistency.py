"""Type consistency for financial amounts and boolean flags

Revision ID: 002_type_consistency
Revises: 001_initial_schema
Create Date: 2026-10-10 12:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_type_consistency'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. cars.compartilhavel: Integer -> Boolean
    # No PostgreSQL, deve-se remover o default numérico anterior antes de converter para booleano
    op.execute("ALTER TABLE cars ALTER COLUMN compartilhavel DROP DEFAULT")
    op.alter_column(
        'cars',
        'compartilhavel',
        existing_type=sa.Integer(),
        type_=sa.Boolean(),
        existing_nullable=True,
        postgresql_using='(compartilhavel = 1)',
        server_default=sa.text('false')
    )

    # 2. cars: Float -> Numeric(12, 2) para valores monetários de precisão financeira
    op.alter_column(
        'cars',
        'price',
        existing_type=sa.Float(),
        type_=sa.Numeric(precision=12, scale=2),
        existing_nullable=True,
        postgresql_using='price::numeric(12,2)'
    )
    op.alter_column(
        'cars',
        'original_price',
        existing_type=sa.Float(),
        type_=sa.Numeric(precision=12, scale=2),
        existing_nullable=True,
        postgresql_using='original_price::numeric(12,2)'
    )
    op.alter_column(
        'cars',
        'fipe_price',
        existing_type=sa.Float(),
        type_=sa.Numeric(precision=12, scale=2),
        existing_nullable=True,
        postgresql_using='fipe_price::numeric(12,2)'
    )
    op.alter_column(
        'cars',
        'auto_price',
        existing_type=sa.Float(),
        type_=sa.Numeric(precision=12, scale=2),
        existing_nullable=True,
        postgresql_using='auto_price::numeric(12,2)'
    )
    op.alter_column(
        'cars',
        'valor_minimo_repasse',
        existing_type=sa.Float(),
        type_=sa.Numeric(precision=12, scale=2),
        existing_nullable=True,
        postgresql_using='valor_minimo_repasse::numeric(12,2)'
    )
    op.alter_column(
        'cars',
        'comissao_fixa',
        existing_type=sa.Float(),
        type_=sa.Numeric(precision=12, scale=2),
        existing_nullable=True,
        postgresql_using='comissao_fixa::numeric(12,2)'
    )


def downgrade() -> None:
    op.alter_column(
        'cars',
        'comissao_fixa',
        existing_type=sa.Numeric(precision=12, scale=2),
        type_=sa.Float(),
        existing_nullable=True,
        postgresql_using='comissao_fixa::double precision'
    )
    op.alter_column(
        'cars',
        'valor_minimo_repasse',
        existing_type=sa.Numeric(precision=12, scale=2),
        type_=sa.Float(),
        existing_nullable=True,
        postgresql_using='valor_minimo_repasse::double precision'
    )
    op.alter_column(
        'cars',
        'auto_price',
        existing_type=sa.Numeric(precision=12, scale=2),
        type_=sa.Float(),
        existing_nullable=True,
        postgresql_using='auto_price::double precision'
    )
    op.alter_column(
        'cars',
        'fipe_price',
        existing_type=sa.Numeric(precision=12, scale=2),
        type_=sa.Float(),
        existing_nullable=True,
        postgresql_using='fipe_price::double precision'
    )
    op.alter_column(
        'cars',
        'original_price',
        existing_type=sa.Numeric(precision=12, scale=2),
        type_=sa.Float(),
        existing_nullable=True,
        postgresql_using='original_price::double precision'
    )
    op.alter_column(
        'cars',
        'price',
        existing_type=sa.Numeric(precision=12, scale=2),
        type_=sa.Float(),
        existing_nullable=True,
        postgresql_using='price::double precision'
    )
    op.execute("ALTER TABLE cars ALTER COLUMN compartilhavel DROP DEFAULT")
    op.alter_column(
        'cars',
        'compartilhavel',
        existing_type=sa.Boolean(),
        type_=sa.Integer(),
        existing_nullable=True,
        postgresql_using='(CASE WHEN compartilhavel THEN 1 ELSE 0 END)',
        server_default=sa.text('0')
    )
