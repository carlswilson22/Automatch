"""Defaults de contas comuns; não modifica papéis ou vínculos já existentes."""
from alembic import op
import sqlalchemy as sa

revision = "008_safe_account_defaults"
down_revision = "007_persist_price_alerts"
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table("users") as batch:
        batch.alter_column("role", existing_type=sa.String(32), server_default="comum")
        batch.alter_column("sub_role", existing_type=sa.String(32), server_default=None)

def downgrade():
    with op.batch_alter_table("users") as batch:
        batch.alter_column("role", existing_type=sa.String(32), server_default="lojista")
        batch.alter_column("sub_role", existing_type=sa.String(32), server_default="owner")
