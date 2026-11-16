"""Revoga sessões após troca de senha e remove OTPs armazenados em texto puro."""
from alembic import op
import sqlalchemy as sa

revision = "006_session_revocation"
down_revision = "005_fix_b2b_financial_types"
branch_labels = None
depends_on = None

def upgrade():
    # O startup legado pode já ter adicionado a coluna de forma compatível.
    columns = {c["name"] for c in sa.inspect(op.get_bind()).get_columns("users")}
    if "token_version" not in columns:
        op.add_column("users", sa.Column("token_version", sa.Integer(), nullable=False, server_default="0"))
    op.execute("UPDATE password_reset_tokens SET otp_code = ''")

def downgrade():
    op.drop_column("users", "token_version")
