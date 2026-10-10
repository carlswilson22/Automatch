import unittest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

import models
import schemas
from main import app
from database import get_db

TEST_DATABASE_URL = "sqlite:///:memory:"

class TestQueryCountBattery(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(
            TEST_DATABASE_URL, 
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)
        models.Base.metadata.create_all(bind=cls.engine)

        # Seed 5 lojas e 10 carros para testar ausência de N+1
        db = cls.SessionLocal()
        for i in range(1, 6):
            store = models.Store(id=i, name=f"Loja Teste {i}", slug=f"loja-{i}")
            db.add(store)
            for j in range(1, 3):
                car = models.Car(
                    id=f"car-test-{i}-{j}",
                    brand="Marca",
                    model="Modelo",
                    year=2022,
                    km=10000,
                    price=50000.0,
                    image="img.jpg",
                    store_id=i
                )
                db.add(car)
        db.commit()
        db.close()

    def setUp(self):
        self.queries = []
        def count_queries(conn, cursor, statement, parameters, context, executemany):
            self.queries.append(statement)

        event.listen(self.engine, "before_cursor_execute", count_queries)
        self.addCleanup(event.remove, self.engine, "before_cursor_execute", count_queries)

        def override_get_db():
            db = self.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_get_stores_query_count_bounded(self):
        """GAR-08: /api/stores padrão não deve sofrer de N+1 (máximo 1 query para N lojas)."""
        res = self.client.get("/api/stores")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 5)
        # N=5 lojas -> sem N+1, deve executar exatamente 1 query SQL
        self.assertLessEqual(len(self.queries), 1, f"Esperado <= 1 queries, executou {len(self.queries)}")

    def test_get_stores_with_cars_eager_loaded(self):
        """GAR-08: /api/stores?include_cars=true deve usar eager load (máximo 2 queries para N lojas)."""
        res = self.client.get("/api/stores?include_cars=true")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 5)
        # N=5 lojas -> com eager load selectinload, executa no máximo 2 queries
        self.assertLessEqual(len(self.queries), 2, f"Esperado <= 2 queries com eager loading, executou {len(self.queries)}")

    def test_get_cars_query_count_bounded(self):
        """GAR-08: /api/cars com paginação deve executar exatamente 2 queries (count + slice)."""
        res = self.client.get("/api/cars?limit=10")
        self.assertEqual(res.status_code, 200)
        # 1 count + 1 offset/limit slice
        self.assertLessEqual(len(self.queries), 2, f"Esperado <= 2 queries para catálogo, executou {len(self.queries)}")

if __name__ == "__main__":
    unittest.main()
