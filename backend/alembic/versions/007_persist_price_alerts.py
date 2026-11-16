"""Persistência dos alertas de preço, antes mantidos somente em memória."""
from alembic import op
import sqlalchemy as sa
revision = "007_persist_price_alerts"
down_revision = "006_session_revocation"
branch_labels = None
depends_on = None

def upgrade():
    if "price_alerts" in sa.inspect(op.get_bind()).get_table_names():
        return
    op.create_table("price_alerts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("car_id", sa.String(36)), sa.Column("car_name", sa.String()),
        sa.Column("current_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("target_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("contact_type", sa.String(16), nullable=False),
        sa.Column("contact_value", sa.String(), nullable=False),
        sa.Column("notify_below_fipe", sa.Boolean()),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("status", sa.String(16)))
    op.create_index("ix_price_alerts_user_id", "price_alerts", ["user_id"])

def downgrade():
    op.drop_table("price_alerts")
