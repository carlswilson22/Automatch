## ==============================================================================
## alembic/script.py.mako — Template Mako para geração de novos scripts de migração.
##
## Objetivo e Motivo da Criação:
##   - Criado como modelo estrutural padrão do Alembic para gerar migrações consistentes,
##     contendo funções de upgrade() e downgrade() padronizadas.
## ==============================================================================
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = ${repr(branch_labels)}
depends_on = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
