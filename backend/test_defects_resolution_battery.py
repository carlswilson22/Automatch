"""
test_defects_resolution_battery.py — Bateria de regressão para verificação de defeitos corrigidos.

Objetivo e Motivo da Criação:
  - Criado para assegurar que falhas reportadas em sprints anteriores não voltem a ocorrer (anti-regressão).
  - Cobre validações de tipos em queries de veículos, concorrência de reservas e consistência de esquemas.
"""
import unittest
import asyncio
from fastapi.testclient import TestClient
from database import SessionLocal
import models
from main import app
from routers.vehicle_lookup import lookup_plate
from services.ai_service import analyze_vehicle_damage_cv
import security
import os

class TestDefectsResolutionBattery(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal()

        # Cria usuário comum para teste de perfil
        cls.buyer_email = "qa-comum-def01@automatch-battery.com"
        buyer = cls.db.query(models.User).filter(models.User.email == cls.buyer_email).first()
        if not buyer:
            buyer = models.User(
                name="Comum QA",
                email=cls.buyer_email,
                role="comum",
                hashed_password="fakehash"
            )
            cls.db.add(buyer)
            cls.db.commit()
            cls.db.refresh(buyer)
        cls.buyer_token = security.create_access_token({"sub": buyer.id, "email": buyer.email, "role": "comum"})

        # Cria usuário lojista
        cls.dealer_email = "qa-lojista-def01@automatch-battery.com"
        dealer = cls.db.query(models.User).filter(models.User.email == cls.dealer_email).first()
        if not dealer:
            dealer = models.User(
                name="Lojista QA",
                email=cls.dealer_email,
                role="lojista",
                hashed_password="fakehash"
            )
            cls.db.add(dealer)
            cls.db.commit()
            cls.db.refresh(dealer)
        cls.dealer_token = security.create_access_token({"sub": dealer.id, "email": dealer.email, "role": "lojista"})

    @classmethod
    def tearDownClass(cls):
        # Limpeza dos usuários de teste criados
        cls.db.query(models.Car).filter(models.Car.description.like("%Bateria-Defeitos%")).delete(synchronize_session=False)
        cls.db.query(models.User).filter(models.User.email.in_([cls.buyer_email, cls.dealer_email])).delete(synchronize_session=False)
        cls.db.commit()
        cls.db.close()

    def test_def01_comum_user_can_create_car_without_store(self):
        """Usuário com role 'comum' pode criar anúncio, que fica com store_id=None e compartilhavel=False."""
        payload = {
            "brand": "Toyota",
            "model": "Yaris Hatchback",
            "year": 2022,
            "km": 25000,
            "price": 85000.0,
            "description": "Bateria-Defeitos - Teste DEF-01"
        }
        res = self.client.post(
            "/api/cars",
            headers={"Authorization": f"Bearer {self.buyer_token}"},
            json=payload
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIsNone(data.get("store_id"))
        self.assertFalse(data.get("compartilhavel"))

    def test_def01b_comum_user_cannot_access_b2b_inventory(self):
        """Usuário com role 'comum' recebe HTTP 403 ao tentar acessar recursos B2B de lojistas."""
        res = self.client.get(
            "/api/partnerships/stores-available",
            headers={"Authorization": f"Bearer {self.buyer_token}"}
        )
        self.assertEqual(res.status_code, 403)

    def test_def03_year_and_price_validation(self):
        """DEF-03: Validação backend rejeita ano no futuro distante e preço zero com HTTP 422."""
        # 1. Ano no futuro (2035)
        res_year = self.client.post(
            "/api/cars",
            headers={"Authorization": f"Bearer {self.dealer_token}"},
            json={
                "brand": "Honda",
                "model": "HR-V",
                "year": 2035,
                "km": 10000,
                "price": 120000.0,
                "store_id": 1
            }
        )
        self.assertEqual(res_year.status_code, 422)

        # 2. Preço zero (0.0)
        res_price = self.client.post(
            "/api/cars",
            headers={"Authorization": f"Bearer {self.dealer_token}"},
            json={
                "brand": "Honda",
                "model": "HR-V",
                "year": 2023,
                "km": 10000,
                "price": 0.0,
                "store_id": 1
            }
        )
        self.assertEqual(res_price.status_code, 422)

    def test_def04_plate_lookup_simulado_flag(self):
        """DEF-04: Placa gerada sinteticamente deve retornar is_simulado = True e conhecida False."""
        # Placa conhecida
        r_known = asyncio.run(lookup_plate("ABC1234", self.db))
        self.assertFalse(r_known.is_simulado)

        # Placa aleatória sintetizada
        r_synthetic = asyncio.run(lookup_plate("KPL9B88", self.db))
        self.assertTrue(r_synthetic.is_simulado)

    def test_def02_non_car_image_rejected(self):
        """DEF-02 (CT-C06): Imagem sem veículos deve ser rejeitada sem fabricar avarias."""
        path_landscape = "/app/test_evidencias/06-nao-e-carro.jpg"
        if os.path.exists(path_landscape):
            with open(path_landscape, "rb") as f:
                res = analyze_vehicle_damage_cv(f.read())
            self.assertEqual(res.get("status"), "rejected")
            self.assertFalse(res.get("tem_avarias"))
            self.assertEqual(len(res.get("avarias")), 0)

    def test_def02_clean_car_no_false_positives(self):
        """DEF-02 (CT-C05): Carro sem danos deve retornar tem_avarias = False e score excelente."""
        path_clean = "/app/public_images/FotoCorollaCross.jpg"
        if os.path.exists(path_clean):
            with open(path_clean, "rb") as f:
                res = analyze_vehicle_damage_cv(f.read())
            self.assertEqual(res.get("status"), "success")
            self.assertFalse(res.get("tem_avarias"))
            self.assertGreaterEqual(res.get("score_lataria"), 95)
            self.assertEqual(len(res.get("avarias")), 0)

    def test_def02_damaged_car_detected(self):
        """DEF-02 (CT-C01/C02): Carro com danos comprovados deve detectar avarias."""
        path_damaged = "/app/test_evidencias/02-gabarito-imagem-danos-frontal.jpg"
        if os.path.exists(path_damaged):
            with open(path_damaged, "rb") as f:
                res = analyze_vehicle_damage_cv(f.read())
            self.assertEqual(res.get("status"), "success")
            self.assertTrue(res.get("tem_avarias"))
            self.assertGreater(len(res.get("avarias")), 0)

    def test_a1_laudo_feedback_persistence(self):
        """A1 (CT-C07): Criar anúncio com laudo_feedback persiste o conteúdo no PostgreSQL."""
        feedback_str = '{"scanner_ia": true, "score_lataria": 85, "tem_avarias": true}'
        payload = {
            "brand": "Volkswagen",
            "model": "Nivus Highline",
            "year": 2023,
            "km": 18000,
            "price": 115000.0,
            "store_id": 1,
            "description": "Bateria-Defeitos - Teste A1",
            "laudo_feedback": feedback_str
        }
        res = self.client.post(
            "/api/cars",
            headers={"Authorization": f"Bearer {self.dealer_token}"},
            json=payload
        )
        self.assertEqual(res.status_code, 200)
        car_id = res.json()["id"]

        # Verifica diretamente no banco de dados
        db_car = self.db.query(models.Car).filter(models.Car.id == car_id).first()
        self.assertIsNotNone(db_car)
        self.assertEqual(db_car.laudo_feedback, feedback_str)

        # Limpa o carro criado
        self.db.delete(db_car)
        self.db.commit()

if __name__ == "__main__":
    unittest.main()
