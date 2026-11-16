"""Executa regressões e jornadas com bancos temporários, sem carregar o .env local.

Uso: python run_tests.py
Cada roteiro recebe seu próprio banco e arquivos; nenhum dado local é reutilizado.
"""
import os
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent
JOURNEYS = (
    "test_full_system_review.py", "test_performance_and_fixes.py",
    "test_persistent_fixes.py", "test_usecases_full_battery.py", "test_vision_and_delete.py",
)

BOOTSTRAP = '''
import runpy, sys
from database import Base, engine, SessionLocal
import models, security
from seed import seed_db
Base.metadata.create_all(bind=engine)
seed_db()
runpy.run_path(sys.argv[1],run_name="__main__")
'''

def run_tests():
    failures = []
    with tempfile.TemporaryDirectory(prefix="automatch-tests-") as directory:
        temporary = Path(directory)
        commands = [("unittest", ["-m", "unittest", "discover", "-p", "test*.py"])]
        commands += [(name, ["-c", BOOTSTRAP, name]) for name in JOURNEYS]
        for index, (name, args) in enumerate(commands):
            env = {
                **os.environ, "PYTHONUTF8": "1", "PYTHON_DOTENV_DISABLED": "1",
                "ENVIRONMENT": "testing", "ALLOW_DEMO_TOKENS": "false",
                "DATABASE_MODE": "sqlite", "DATABASE_URL": "sqlite:///" + (temporary / f"test-{index}.db").as_posix(),
                "UPLOADS_DIR": str(temporary / f"uploads-{index}"), "GEMINI_API_KEY": "",
            }
            print(f"\n=== {name} (banco isolado) ===", flush=True)
            try:
                result = subprocess.run([sys.executable, *args], cwd=ROOT, env=env, capture_output=True, text=True, encoding="utf-8", timeout=180)
                print(result.stdout)
                print(result.stderr, file=sys.stderr)
                if result.returncode:
                    failures.append(name)
            except subprocess.TimeoutExpired:
                failures.append(name)
                print("Tempo de execução excedido.", file=sys.stderr)
    if failures:
        print("Falharam: " + ", ".join(failures), file=sys.stderr)
        return 1
    print("Regressões e cinco jornadas concluídas em bancos descartáveis.")
    return 0

if __name__ == "__main__":
    sys.exit(run_tests())
