"""Aplica migrações incrementais sem apagar tabelas ou executar seed."""
from pathlib import Path
from alembic import command
from alembic.config import Config

def migrate():
    directory = Path(__file__).resolve().parent
    config = Config(str(directory / "alembic.ini"))
    config.set_main_option("script_location", str(directory / "alembic"))
    command.upgrade(config, "head")

if __name__ == "__main__":
    migrate()
