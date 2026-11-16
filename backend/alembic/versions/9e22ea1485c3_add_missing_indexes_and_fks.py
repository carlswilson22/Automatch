"""Compatibilidade com bancos anteriores à consolidação da baseline 001."""
from alembic import op
import sqlalchemy as sa

revision = "9e22ea1485c3"
down_revision = "002_type_consistency"
branch_labels = None
depends_on = None

def upgrade():
    inspector = sa.inspect(op.get_bind())
    indexes = {
        "cars": [("idx_cars_brand_price", ["brand", "price"]), ("ix_cars_compartilhavel", ["compartilhavel"]), ("ix_cars_status_reserva", ["status_reserva"]), ("ix_cars_user_id", ["user_id"])],
        "users": [("ix_users_store_id", ["store_id"])],
        "partnership_audit_logs": [("ix_partnership_audit_logs_created_at", ["created_at"])],
    }
    for table, definitions in indexes.items():
        existing = {index["name"] for index in inspector.get_indexes(table)}
        for name, columns in definitions:
            if name not in existing:
                op.create_index(name, table, columns)
    for table, target, column in (("cars", "users", "user_id"), ("users", "stores", "store_id")):
        if not any(fk["constrained_columns"] == [column] for fk in inspector.get_foreign_keys(table)):
            with op.batch_alter_table(table) as batch:
                batch.create_foreign_key(f"{table}_{column}_fkey", target, [column], ["id"])

def downgrade():
    # Preserva índices e relacionamentos que também pertencem à baseline 001.
    pass
