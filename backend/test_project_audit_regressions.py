"""Regressões de execução da revisão de 16/11/2026; banco isolado por teste."""
import json
import os
import re
import unittest
from unittest.mock import patch
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from fastapi import HTTPException
import models
import security
from database import Base, get_db
from main import app
from routers.auth import _reset_attempts, reset_rate_limiter
from routers.partnerships import give_reservation_consent, cancel_reservation, create_car_reservation
import schemas

class TestProjectAudit(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        @event.listens_for(self.engine, "connect")
        def enable_fks(connection, _):
            connection.execute("PRAGMA foreign_keys=ON")
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine, autoflush=False)()
        def isolated_db():
            yield self.db
        app.dependency_overrides[get_db] = isolated_db
        self.client = TestClient(app)
        self.environment = patch.dict(os.environ, {"ENVIRONMENT": "testing", "ALLOW_DEMO_TOKENS": "false"})
        self.environment.start()
        self.user = models.User(id="audit-user", name="Cliente", email="cliente-audit@example.test", role="comum", hashed_password=security.hash_password("pass123"))
        self.other = models.User(id="audit-other", name="Outro", email="outro-audit@example.test", role="comum", hashed_password="unused")
        self.db.add_all([self.user, self.other]); self.db.commit()
        self.token = security.create_access_token({"sub": self.user.id})
        self.headers = {"Authorization": "Bearer " + self.token}
        _reset_attempts.clear()
        reset_rate_limiter.reset(self.user.email)

    def tearDown(self):
        app.dependency_overrides.pop(get_db, None)
        self.db.close(); self.engine.dispose(); self.client.close(); self.environment.stop()

    def car(self, owner=None, **extra):
        data = dict(id="audit-car", brand="Honda", model="Civic", year=2024, km=1500, price=100000, user_id=owner or self.user.id)
        data.update(extra)
        car = models.Car(**data); self.db.add(car); self.db.commit(); return car

    def test_profile_preserves_no_store_and_common_role(self):
        r = self.client.put("/api/users/profile", headers=self.headers, json={"name": "Novo Nome"})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["role"], "comum")
        self.assertIsNone(r.json()["store_id"])
        self.assertIsNone(r.json()["sub_role"])

    def test_reset_revokes_previous_jwt_and_stores_no_cleartext_otp(self):
        r = self.client.post("/api/auth/forgot-password", json={"email": self.user.email})
        code = re.search(r"\b\d{6}\b", r.json()["message"]).group()
        self.assertEqual(self.db.query(models.PasswordResetToken).one().otp_code, "")
        r = self.client.post("/api/auth/reset-password", json={"email": self.user.email, "otp": code, "new_password": "newpass123"})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(self.client.get("/api/users/profile", headers=self.headers).status_code, 401)
        login = self.client.post("/api/login", json={"email": self.user.email, "password": "newpass123"})
        self.assertEqual(login.status_code, 200)
        self.assertEqual(self.client.get("/api/users/profile", headers={"Authorization": "Bearer " + login.json()["token"]}).status_code, 200)
        self.assertEqual(self.client.post("/api/auth/reset-password", json={"email": self.user.email,"otp": code,"new_password":"again123"}).status_code, 400)

    def test_reset_brute_force_limited(self):
        payload = {"email": self.user.email, "otp": "000000", "new_password": "newpass123"}
        for _ in range(5): self.assertEqual(self.client.post("/api/auth/reset-password", json=payload).status_code, 400)
        self.assertEqual(self.client.post("/api/auth/reset-password", json=payload).status_code, 429)

    def test_production_recovery_never_exposes_otp(self):
        with patch.dict(os.environ, {"ENVIRONMENT": "production"}), patch("services.recovery_mail.is_configured", return_value=True), patch("services.recovery_mail.send_recovery_code") as mail:
            r = self.client.post("/api/auth/forgot-password", json={"email": self.user.email})
            self.assertEqual(r.status_code, 200)
            self.assertIsNone(re.search(r"\b\d{6}\b", r.json()["message"]))
            mail.assert_called_once()

    def test_deleted_account_session_rejected(self):
        self.assertEqual(self.client.delete("/api/users/me", headers=self.headers).status_code, 200)
        self.assertEqual(self.client.get("/api/users/profile", headers=self.headers).status_code, 401)

    def test_email_does_not_grant_admin_privileges(self):
        self.user.email = "admin@automatch.com"; self.db.commit()
        self.car(owner=self.other.id)
        for method, payload in (("put", {"price": 80000}), ("delete", None)):
            kwargs = {"headers": self.headers}
            if payload: kwargs["json"] = payload
            self.assertEqual(getattr(self.client, method)("/api/cars/audit-car", **kwargs).status_code, 403)

    def test_dealer_cannot_publish_into_another_store(self):
        self.db.add_all([models.Store(id=1, name="Minha",slug="minha-audit"), models.Store(id=2,name="Outra",slug="outra-audit")]); self.db.commit()
        self.user.role="lojista";self.user.store_id=1;self.db.commit()
        payload=dict(brand="Honda",model="City",year=2024,km=0,price=100000,store_id=2)
        self.assertEqual(self.client.post("/api/cars",headers=self.headers,json=payload).status_code,403)
        self.assertEqual(self.db.query(models.Car).count(),0)

    def test_common_owner_cannot_enable_b2b(self):
        self.car()
        self.assertEqual(self.client.put("/api/cars/audit-car",headers=self.headers,json={"compartilhavel":True}).status_code,403)

    def test_update_validation_and_existing_floor(self):
        self.user.role="lojista";self.db.commit();self.car(valor_minimo_repasse=90000)
        for payload in ({"price":-1},{"price":None},{"km":-5},{"year":1800}):
            self.assertEqual(self.client.put("/api/cars/audit-car",headers=self.headers,json=payload).status_code,422)
        self.assertEqual(self.client.put("/api/cars/audit-car",headers=self.headers,json={"price":80000}).status_code,400)

    def test_non_finite_payload_returns_validation_error(self):
        self.car()
        r=self.client.put("/api/cars/audit-car",headers={**self.headers,"Content-Type":"application/json"},content='{"price":NaN}')
        self.assertEqual(r.status_code,422)

    def test_unknown_protocol_is_not_certified(self):
        self.assertEqual(self.client.get("/api/v1/laudos/validar/ATM-2026-INVENTADO").status_code,404)

    def test_foreign_upload_is_rejected_before_writing(self):
        self.car(owner=self.other.id)
        r=self.client.post("/api/v1/laudos/upload",headers=self.headers,data={"car_id":"audit-car"},files={"file":("test.pdf",b"%PDF-FAKE","application/pdf")})
        self.assertEqual(r.status_code,403)

    def test_delete_cleans_references_in_foreign_key_order(self):
        self.db.add_all([models.Store(id=1,name="Loja1",slug="l1"),models.Store(id=2,name="Loja2",slug="l2")]);self.db.commit()
        self.car(store_id=1)
        reservation=models.CarReservation(id="res",car_id="audit-car",owner_store_id=1,requesting_store_id=2,seller_user_id=self.user.id,proposed_price=90000,client_markup=0,status="ativa",created_at="2026-11-16",expires_at=9999999999)
        self.db.add(reservation);self.db.commit()
        tx=models.PartnerTransaction(id="tx",protocol="tx-proto",reservation_id="res",car_id="audit-car",selling_store_id=1,buying_store_id=2,final_price=100000,repasse_piso=90000,created_at="2026-11-16")
        self.db.add(tx);self.db.commit()
        self.db.add(models.PartnerReview(transaction_id="tx",reviewer_store_id=1,reviewed_store_id=2,rating=5,created_at="2026-11-16"));self.db.commit()
        self.assertEqual(self.client.delete("/api/cars/audit-car",headers=self.headers).status_code,200)
        self.assertEqual(self.db.query(models.PartnerTransaction).count(),0)
        self.assertEqual(self.db.query(models.PartnerReview).count(),0)

    def test_seed_preserves_edits_and_private_ownership(self):
        import seed
        car=self.car(store_id=None,image="/api/v1/laudos/files/customer.jpg",price=12345)
        with patch.object(seed,"SessionLocal",side_effect=sessionmaker(bind=self.engine)):seed.seed_db()
        self.db.expire_all()
        self.assertEqual(car.store_id,None);self.assertEqual(car.user_id,self.user.id)
        self.assertEqual(float(car.price),12345);self.assertEqual(car.image,"/api/v1/laudos/files/customer.jpg")
        example=self.db.get(models.Car,"sc-001");example.price=99999;example.status_reserva="vendido";self.db.commit()
        with patch.object(seed,"SessionLocal",side_effect=sessionmaker(bind=self.engine)):seed.seed_db()
        self.db.expire_all();example=self.db.get(models.Car,"sc-001")
        self.assertEqual(float(example.price),99999);self.assertEqual(example.status_reserva,"vendido")

    def test_multiple_checkout_protocols_unique(self):
        payload={"customer_name":"Cliente","item_description":"Plano","amount":100,"payment_method":"pix"}
        protocols=[self.client.post("/api/checkout",headers=self.headers,json=payload).json()["protocol"] for _ in range(3)]
        self.assertEqual(len(set(protocols)),3)


    def test_my_ads_endpoint_isolates_accounts(self):
        self.car(owner=self.other.id)
        self.assertEqual(self.client.get("/api/cars/mine",headers=self.headers).json(),[])
        self.assertEqual(self.client.get("/api/cars/mine").status_code,401)

    def test_image_source_blocks_private_and_unconfigured_urls(self):
        from services.image_sources import is_allowed_image_url
        for url in ("http://127.0.0.1/admin", "https://169.254.169.254/", "https://images.unsplash.com@localhost/image", "https://images.unsplash.com:8000/image", "https://arbitrary.example/image"):
            self.assertFalse(is_allowed_image_url(url))
        self.assertTrue(is_allowed_image_url("https://images.unsplash.com/photo-test"))

    def test_alert_is_persisted_and_removed_with_account(self):
        response=self.client.post("/api/alerts",headers=self.headers,json={"car_id":"test","current_price":100000,"target_price":90000,"contact_value":"cliente@example.test","contact_type":"email"})
        self.assertEqual(response.status_code,200)
        self.assertEqual(self.db.query(models.PriceAlert).count(),1)
        self.assertEqual(self.client.get("/api/alerts",headers=self.headers).json()["total_alertas"],1)
        self.client.delete("/api/users/me",headers=self.headers)
        self.assertEqual(self.db.query(models.PriceAlert).count(),0)

    def test_pdf_uses_database_instead_of_untrusted_payload(self):
        from routers.laudos_export import _build_car_dict, CarDossiePayload
        self.car()
        result=_build_car_dict("audit-car",self.db,payload=CarDossiePayload(brand="Falso",model="Falso",price=1))
        self.assertEqual(result["brand"],"Honda");self.assertEqual(result["price"],100000)

    def test_unreadable_document_is_not_approved(self):
        import asyncio
        from services.laudo_ia_evaluator import avaliar_laudo_com_ia
        result=asyncio.run(avaliar_laudo_com_ia(b"unreadable", "application/octet-stream", {"plate":"ABC1234","km":1000}, api_key=""))
        self.assertEqual(result.classificacao_geral.value,"COM_ATENCAO")
        self.assertFalse(result.conferencia_dados.placa.match)

if __name__ == "__main__":unittest.main()
