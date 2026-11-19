"""Regressões dos reparos do banco, exclusivamente em SQLite descartável."""
import tempfile
from pathlib import Path
import unittest
from unittest.mock import patch
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text, inspect
from profile_repair import plan_repairs, apply_repairs, rollback_repairs

ROOT = Path(__file__).resolve().parent

class DatabaseRepairTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="automatch-db-repair-")
        self.url = "sqlite:///" + (Path(self.temporary.name) / "copy.db").as_posix()
        self.engine = create_engine(self.url)
        self.config = Config(str(ROOT / "alembic.ini"))
        self.config.set_main_option("script_location", str(ROOT / "alembic"))

    def tearDown(self):
        self.engine.dispose()
        self.temporary.cleanup()

    def migrate(self, revision):
        with patch("database.DATABASE_URL", self.url):
            command.upgrade(self.config, revision)

    def test_upgrade_existing_database_is_repeatable_and_preserves_accounts(self):
        self.migrate("005_fix_b2b_financial_types")
        with self.engine.begin() as connection:
            connection.execute(text("INSERT INTO users(id,name,email,hashed_password,role,sub_role) VALUES "
                "('[TESTE] comum','[TESTE] Cliente','repair@example.test','unused','comum','owner')"))
        self.migrate("head")
        self.migrate("head")
        inspector = inspect(self.engine)
        self.assertIn("price_alerts", inspector.get_table_names())
        self.assertIn("token_version", {c["name"] for c in inspector.get_columns("users")})
        with self.engine.begin() as connection:
            account = connection.execute(text("SELECT role,sub_role,token_version FROM users")).one()
            self.assertEqual(tuple(account), ("comum", "owner", 0))
            connection.execute(text("INSERT INTO users(id,name,email,hashed_password) VALUES "
                "('[TESTE] novo','[TESTE] Novo','new-repair@example.test','unused')"))
            self.assertEqual(tuple(connection.execute(text(
                "SELECT role,sub_role FROM users WHERE id='[TESTE] novo'")).one()), ("comum", None))

    def test_profile_repair_is_idempotent_reversible_and_preserves_store_roles(self):
        self.migrate("head")
        with self.engine.begin() as connection:
            connection.execute(text("INSERT INTO users(id,name,email,hashed_password,role,sub_role) VALUES "
                "('[TESTE] comum','[TESTE] Cliente','c@example.test','unused','comum','owner'),"
                "('[TESTE] loja','[TESTE] Loja','l@example.test','unused','lojista','manager')"))
            entries = plan_repairs(connection)
            self.assertEqual(len(entries), 1)
            self.assertEqual(apply_repairs(connection, entries), 1)
            self.assertEqual(plan_repairs(connection), [])
            self.assertEqual(connection.execute(text(
                "SELECT sub_role FROM users WHERE role='lojista'")).scalar_one(), "manager")
            self.assertEqual(rollback_repairs(connection, entries), 1)
            self.assertEqual(connection.execute(text(
                "SELECT sub_role FROM users WHERE role='comum'")).scalar_one(), "owner")

    def test_profile_change_cancels_atomic_repair(self):
        self.migrate("head")
        with self.engine.begin() as connection:
            connection.execute(text("INSERT INTO users(id,name,email,hashed_password,role,sub_role) VALUES "
                "('[TESTE] comum','[TESTE] Cliente','guard@example.test','unused','comum','owner')"))
            entries = plan_repairs(connection)
            connection.execute(text("UPDATE users SET role='lojista'"))
            with self.assertRaisesRegex(RuntimeError, "perfil mudou"):
                apply_repairs(connection, entries)
            self.assertEqual(connection.execute(text("SELECT sub_role FROM users")).scalar_one(), "owner")

if __name__ == "__main__":
    unittest.main()
