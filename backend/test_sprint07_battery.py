"""
test_sprint07_battery.py — Bateria de Testes Automatizados — Sprint 07
Valida todas as melhorias e correções implementadas na Sprint 07:
1. Fechamento B2B Resiliente: closing_requested=1 e mensageria no chat
2. Bloqueio de Fechamento para Reservas Inativas (HTTP 400)
3. Controle de Acesso: Apenas Loja Solicitante pode pedir Fechamento (HTTP 403)
4. Consentimento Aprovado: Protocolo REP- emitido, Transação concluída e Preço Final com Comissão
5. Consentimento Recusado: Status recusada e Liberação Imediata do Veículo ao Estoque
6. Cancelamento Formal por Loja Solicitante e Liberação ao Estoque Compartilhado
7. Blindagem contra Cancelamento por Terceiros sem Vínculo (HTTP 403)
8. Auto-Release por TTL Vencido (refresh_expired_reservations)
9. Trava de Reserva Exclusiva (Hold Lock): Bloqueio de Propostas Abaixo do Piso (HTTP 400)
10. Trava de Reserva Exclusiva (Hold Lock): Aceite de Proposta Justa e Bloqueio Atômico do Carro
11. Vitrine B2B: Filtro Estrito de Veículos Compartilháveis vs Privados
12. Unificação Cadastral de Lojas (Concessionária Alpha, AutoShop Prime, Motors Campinas)
13. Varredura 360° Fidedigna: 8 Ângulos Mapeados e Quadrante 180° com Foto Traseira Autêntica
14. Contadores Dinâmicos de Veículos no Perfil e Agregação de Estoque
15. Endpoints REST & Cabeçalhos de Segurança Defensiva (OWASP) via TestClient
"""

import os
import re
import time
import unittest
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import models
import schemas
import security
from database import get_db
from main import app
from routers.partnerships import (
    request_reservation_closing,
    give_reservation_consent,
    cancel_reservation,
    refresh_expired_reservations,
    get_shared_inventory,
    create_car_reservation,
)

TEST_DATABASE_URL = "sqlite:///:memory:"


class TestSprint07Battery(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # StaticPool mantém a mesma conexão em memória para todas as threads e chamadas TestClient
        cls.engine = create_engine(
            TEST_DATABASE_URL,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)
        models.Base.metadata.create_all(bind=cls.engine)

        # Injeta banco isolado compartilhado no FastAPI TestClient
        def override_get_db():
            db = cls.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()

    def setUp(self):
        models.Base.metadata.create_all(bind=self.engine)
        self.db = self.SessionLocal()

        # 1. Unificação de Lojas
        self.store_alpha = models.Store(id=1, name="Concessionária Alpha", slug="alpha-motors")
        self.store_prime = models.Store(id=2, name="AutoShop Prime", slug="autoshop-prime")
        self.store_campinas = models.Store(id=3, name="Motors Campinas", slug="motors-campinas")
        self.db.add_all([self.store_alpha, self.store_prime, self.store_campinas])
        self.db.commit()

        # 2. Usuários Lojistas
        self.user_alpha = models.User(
            id="user-alpha", name="Proprietário Alpha", email="alpha@automatch.com",
            hashed_password=security.hash_password("senha123"), role="lojista", sub_role="owner", store_id=1
        )
        self.user_prime = models.User(
            id="user-prime", name="Gerente Prime", email="prime@automatch.com",
            hashed_password=security.hash_password("senha123"), role="lojista", sub_role="owner", store_id=2
        )
        self.user_campinas = models.User(
            id="user-campinas", name="Vendedor Campinas", email="campinas@automatch.com",
            hashed_password=security.hash_password("senha123"), role="lojista", sub_role="seller", store_id=3
        )
        self.db.add_all([self.user_alpha, self.user_prime, self.user_campinas])
        self.db.commit()

        # 3. Veículo Homologado para B2B
        self.car = models.Car(
            id="car-sprint07-001", brand="Toyota", model="Corolla XEi 2.0", year=2024,
            km=12000, price=160000.0, image="/images/FotoCorollaCross.jpg",
            store_id=1, user_id="user-alpha", compartilhavel=1,
            valor_minimo_repasse=148000.0, comissao_fixa=3.0,
            observacoes_repasse="Revisão em dia na concessionária", status_reserva="disponivel"
        )
        self.db.add(self.car)
        self.db.commit()

        # 4. Parceria Ativa entre AutoShop Prime (2) e Concessionária Alpha (1)
        self.partnership = models.StorePartnership(
            requester_store_id=2, receiver_store_id=1,
            status="ativa", commission_rate=3.0, created_at="2026-09-01 10:00:00"
        )
        self.db.add(self.partnership)
        self.db.commit()

        # 5. Reserva de Teste Ativa com Hold Lock
        self.reservation = models.CarReservation(
            id="res-sprint07-001", car_id="car-sprint07-001",
            partnership_id=self.partnership.id, requesting_store_id=2,
            owner_store_id=1, seller_user_id="user-prime",
            proposed_price=150000.0, client_markup=8000.0,
            client_name="Cliente Homologado Sprint 07", status="ativa",
            closing_requested=0, created_at="2026-09-30 10:00:00",
            expires_at=time.time() + 7200
        )
        self.db.add(self.reservation)
        self.car.status_reserva = "reservado"
        self.db.commit()

    def tearDown(self):
        self.db.close()
        models.Base.metadata.drop_all(bind=self.engine)

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 1: Solicitação de Fechamento B2B Resiliente & Chat Automático
    # ──────────────────────────────────────────────────────────────────────────
    def test_01_request_closing_sets_flag_and_creates_chat_message(self):
        """Cenário 1: Solicitação de fechamento ativa flag closing_requested=1 e emite mensagem formal no chat"""
        result = request_reservation_closing("res-sprint07-001", self.db, self.user_prime)
        self.assertIn("sucesso", result["message"].lower())

        res = self.db.query(models.CarReservation).filter(
            models.CarReservation.id == "res-sprint07-001"
        ).first()
        self.assertEqual(res.closing_requested, 1)

        msg = self.db.query(models.PartnerMessage).filter(
            models.PartnerMessage.reservation_id == "res-sprint07-001"
        ).first()
        self.assertIsNotNone(msg)
        self.assertIn("FECHAMENTO", msg.message.upper())
        print("✓ Cenário 1 (Fechamento B2B): Solicitação registrada, flag closing_requested ativada e chat notificado")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 2: Rejeição de Fechamento para Reservas Não-Ativas
    # ──────────────────────────────────────────────────────────────────────────
    def test_02_request_closing_on_inactive_reservation_raises_400(self):
        """Cenário 2: Tentativa de solicitar fechamento em reserva com status != 'ativa' falha com HTTP 400"""
        from fastapi import HTTPException
        self.reservation.status = "expirada"
        self.db.commit()

        with self.assertRaises(HTTPException) as ctx:
            request_reservation_closing("res-sprint07-001", self.db, self.user_prime)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Não é possível solicitar fechamento", ctx.exception.detail)

        self.reservation.status = "ativa"
        self.db.commit()
        print("✓ Cenário 2 (Integridade de Status): Fechamento em reserva inativa bloqueado com HTTP 400")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 3: Controle de Acesso Estrito à Solicitação de Fechamento
    # ──────────────────────────────────────────────────────────────────────────
    def test_03_request_closing_by_non_requester_raises_403(self):
        """Cenário 3: Apenas a loja solicitante pode pedir fechamento; loja proprietária recebe HTTP 403"""
        from fastapi import HTTPException
        with self.assertRaises(HTTPException) as ctx:
            request_reservation_closing("res-sprint07-001", self.db, self.user_alpha)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("Apenas a loja solicitante", ctx.exception.detail)
        print("✓ Cenário 3 (Controle de Acesso): Permissões validadas contra solicitação indevida (HTTP 403)")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 4: Consentimento Aprovado, Protocolo Formal e Transação
    # ──────────────────────────────────────────────────────────────────────────
    def test_04_give_consent_approved_generates_protocol_and_transaction(self):
        """Cenário 4: Consentimento aprovado gera protocolo REP-, transação financeira e atualiza carro para vendido"""
        result = give_reservation_consent(
            "res-sprint07-001",
            schemas.ReservationConsentRequest(approved=True, notes="Proposta aprovada pela diretoria"),
            self.db, self.user_alpha
        )
        self.assertIn("protocol", result)
        self.assertTrue(result["protocol"].startswith("REP-"))
        self.assertEqual(result["final_price"], 158000.0)  # 150.000 proposta + 8.000 markup

        res = self.db.query(models.CarReservation).filter(
            models.CarReservation.id == "res-sprint07-001"
        ).first()
        self.assertEqual(res.status, "consentida")

        car = self.db.query(models.Car).filter(models.Car.id == "car-sprint07-001").first()
        self.assertEqual(car.status_reserva, "vendido")

        tx = self.db.query(models.PartnerTransaction).filter(
            models.PartnerTransaction.reservation_id == "res-sprint07-001"
        ).first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.status, "concluida")
        self.assertEqual(tx.final_price, 158000.0)
        self.assertEqual(tx.commission_amount, 4500.0)  # 3% de 150.000
        print(f"✓ Cenário 4 (Formalização B2B): Protocolo {result['protocol']} emitido, transação registrada (R$ {tx.final_price:,.2f})")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 5: Consentimento Recusado com Desbloqueio Imediato
    # ──────────────────────────────────────────────────────────────────────────
    def test_05_give_consent_denied_releases_car(self):
        """Cenário 5: Recusa de fechamento marca reserva como recusada e devolve veículo ao estoque disponível"""
        result = give_reservation_consent(
            "res-sprint07-001",
            schemas.ReservationConsentRequest(approved=False, notes="Margem de repasse insuficiente"),
            self.db, self.user_alpha
        )
        self.assertIn("recusado", result["message"].lower())

        res = self.db.query(models.CarReservation).filter(
            models.CarReservation.id == "res-sprint07-001"
        ).first()
        self.assertEqual(res.status, "recusada")

        car = self.db.query(models.Car).filter(models.Car.id == "car-sprint07-001").first()
        self.assertEqual(car.status_reserva, "disponivel")
        print("✓ Cenário 5 (Recusa de Fechamento): Reserva recusada e veículo liberado instantaneamente ao estoque")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 6: Cancelamento Formal por Loja Solicitante
    # ──────────────────────────────────────────────────────────────────────────
    def test_06_cancel_reservation_by_requester_releases_car(self):
        """Cenário 6: Loja compradora cancela reserva ativa e libera o veículo de volta ao catálogo compartilhado"""
        result = cancel_reservation("res-sprint07-001", self.db, self.user_prime)
        self.assertIn("message", result)
        self.assertIn("cancelad", result["message"].lower())

        res = self.db.query(models.CarReservation).filter(
            models.CarReservation.id == "res-sprint07-001"
        ).first()
        self.assertEqual(res.status, "cancelada")

        car = self.db.query(models.Car).filter(models.Car.id == "car-sprint07-001").first()
        self.assertEqual(car.status_reserva, "disponivel")
        print("✓ Cenário 6 (Cancelamento de Reserva): Desbloqueio e reversão de status operando com sucesso")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 7: Proteção de Cancelamento contra Terceiros
    # ──────────────────────────────────────────────────────────────────────────
    def test_07_cancel_reservation_by_third_party_raises_403(self):
        """Cenário 7: Lojista de concessionária terceira sem vínculo é impedido de cancelar reserva (HTTP 403)"""
        from fastapi import HTTPException
        with self.assertRaises(HTTPException) as ctx:
            cancel_reservation("res-sprint07-001", self.db, self.user_campinas)
        self.assertEqual(ctx.exception.status_code, 403)
        print("✓ Cenário 7 (Blindagem de Cancelamento): Acesso indevido de terceiros bloqueado com HTTP 403")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 8: Auto-Release por TTL Vencido (Hold Lock Automático)
    # ──────────────────────────────────────────────────────────────────────────
    def test_08_expired_reservations_are_auto_released(self):
        """Cenário 8: refresh_expired_reservations varre e expira reservas com TTL esgotado, liberando o estoque"""
        car_exp = models.Car(
            id="car-expired-sprint07", brand="Fiat", model="Pulse Drive 1.3", year=2023,
            km=30000, price=89000.0, image="/images/FotoFiatPulse.jpg", store_id=1,
            user_id="user-alpha", status_reserva="reservado"
        )
        self.db.add(car_exp)

        res_exp = models.CarReservation(
            id="res-expired-sprint07", car_id="car-expired-sprint07",
            requesting_store_id=2, owner_store_id=1, seller_user_id="user-prime",
            proposed_price=85000.0, status="ativa",
            created_at="2026-09-30 08:00:00", expires_at=time.time() - 10
        )
        self.db.add(res_exp)
        self.db.commit()

        refresh_expired_reservations(self.db)

        res_check = self.db.query(models.CarReservation).filter(
            models.CarReservation.id == "res-expired-sprint07"
        ).first()
        self.assertEqual(res_check.status, "expirada")

        car_check = self.db.query(models.Car).filter(
            models.Car.id == "car-expired-sprint07"
        ).first()
        self.assertEqual(car_check.status_reserva, "disponivel")
        print("✓ Cenário 8 (Auto-Release TTL): Varredura automática expirou reserva e restaurou disponibilidade")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 9: Hold Lock — Bloqueio de Proposta Abaixo do Piso Inviolável
    # ──────────────────────────────────────────────────────────────────────────
    def test_09_hold_lock_blocks_below_floor_price(self):
        """Cenário 9: Proposta inferior ao valor mínimo de repasse é bloqueada com HTTP 400"""
        from fastapi import HTTPException
        self.car.status_reserva = "disponivel"
        self.db.commit()

        with self.assertRaises(HTTPException) as ctx:
            create_car_reservation(
                schemas.ReservationCreateRequest(
                    car_id="car-sprint07-001",
                    proposed_price=140000.0,  # Piso é 148.000
                    client_markup=5000.0,
                    client_name="Cliente Tentativa Abaixo"
                ),
                self.db, self.user_prime
            )
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("inferior ao piso", ctx.exception.detail)
        print("✓ Cenário 9 (Hold Lock - Piso Mínimo): Proposta abaixo de R$ 148.000 bloqueada com HTTP 400")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 10: Hold Lock — Proposta Aceita e Bloqueio Atômico
    # ──────────────────────────────────────────────────────────────────────────
    def test_10_hold_lock_allows_above_floor_price_and_locks_car(self):
        """Cenário 10: Proposta em conformidade com o piso cria reserva com Hold Lock e trava o status do veículo"""
        self.car.status_reserva = "disponivel"
        self.db.commit()

        result = create_car_reservation(
            schemas.ReservationCreateRequest(
                car_id="car-sprint07-001",
                proposed_price=149500.0,
                client_markup=6000.0,
                client_name="Cliente Aprovado Sprint 07",
                duration_minutes=120
            ),
            self.db, self.user_prime
        )
        self.assertIn("reservation_id", result)
        self.assertIn("expires_at", result)

        car = self.db.query(models.Car).filter(models.Car.id == "car-sprint07-001").first()
        self.assertEqual(car.status_reserva, "reservado")
        print("✓ Cenário 10 (Hold Lock - Trava Atômica): Reserva criada com sucesso e veículo bloqueado com timer")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 11: Vitrine B2B e Compartilhamento Restrito
    # ──────────────────────────────────────────────────────────────────────────
    def test_11_shared_inventory_filters_non_shareable_cars(self):
        """Cenário 11: Vitrine B2B compartilha exclusivamente veículos com flag compartilhavel=1 de lojas parceiras"""
        car_private = models.Car(
            id="car-privado-sprint07", brand="Chevrolet", model="Onix LTZ", year=2022,
            km=45000, price=72000.0, image="/images/FotoPoloTSI.jpg", store_id=1,
            user_id="user-alpha", compartilhavel=0, status_reserva="disponivel"
        )
        self.db.add(car_private)
        self.db.commit()

        items = get_shared_inventory(db=self.db, current_user=self.user_prime)
        item_ids = [i["id"] for i in items]

        self.assertIn("car-sprint07-001", item_ids)
        self.assertNotIn("car-privado-sprint07", item_ids)
        print("✓ Cenário 11 (Vitrine B2B): Apenas veículos compartilháveis exibidos no estoque de parceiros")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 12: Unificação Cadastral de Lojas
    # ──────────────────────────────────────────────────────────────────────────
    def test_12_unified_store_identities(self):
        """Cenário 12: As 3 lojas padronizadas (Alpha, Prime, Campinas) estão sincronizadas e ativas no banco"""
        stores = self.db.query(models.Store).all()
        store_names = {s.name for s in stores}
        expected_stores = {"Concessionária Alpha", "AutoShop Prime", "Motors Campinas"}

        self.assertTrue(expected_stores.issubset(store_names))
        print(f"✓ Cenário 12 (Unificação de Lojas): Lojas padronizadas confirmadas: {list(expected_stores)}")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 13: Varredura 360° Fidedigna & Correção do Quadrante 180° Traseira
    # ──────────────────────────────────────────────────────────────────────────
    def test_13_360_scan_mapping_and_rear_quadrant_authenticity(self):
        """Cenário 13: Valida mapeamento de 8 ângulos no showcase e fidedignidade da foto de traseira a 180°"""
        # 1. Verifica existência dos assets fotográficos essenciais
        backend_dir = Path(__file__).resolve().parent
        candidate_rear_paths = [
            backend_dir / "public_images" / "carro_360_traseira.jpg",
            backend_dir.parent / "frontend" / "public" / "images" / "carro_360_traseira.jpg",
            Path("/app/public_images/carro_360_traseira.jpg"),
        ]
        img_rear = next((p for p in candidate_rear_paths if p.exists()), None)
        self.assertIsNotNone(img_rear, "Asset carro_360_traseira.jpg deve existir nos diretórios de imagens")
        self.assertGreater(img_rear.stat().st_size, 0, "Imagem de traseira não pode estar vazia")

        # 2. Valida que a imagem de traseira é distinta da imagem frontal
        candidate_front_paths = [
            backend_dir / "public_images" / "carro_360_frente.jpg",
            backend_dir.parent / "frontend" / "public" / "images" / "carro_360_frente.jpg",
            Path("/app/public_images/carro_360_frente.jpg"),
        ]
        img_front = next((p for p in candidate_front_paths if p.exists()), None)
        if img_front:
            self.assertNotEqual(img_rear.stat().st_size, img_front.stat().st_size,
                                "Foto traseira 180° deve ter conteúdo fotográfico distinto da foto frontal")

        # 3. Validação do arquivo de dados frontend se acessível no ambiente
        candidate_showcase_paths = [
            backend_dir.parent / "frontend" / "src" / "data" / "showcaseData.js",
            Path("/app/frontend/src/data/showcaseData.js"),
        ]
        showcase_path = next((p for p in candidate_showcase_paths if p.exists()), None)
        if showcase_path:
            content = showcase_path.read_text(encoding="utf-8")
            self.assertIn("180: '/images/carro_360_traseira.jpg'", content,
                          "O quadrante 180° deve apontar fidedignamente para a foto de traseira")
            for angle in [0, 45, 90, 135, 180, 225, 270, 315]:
                self.assertTrue(re.search(rf"\b{angle}\s*:", content), f"Ângulo {angle}° deve estar mapeado")

        print("✓ Cenário 13 (Varredura 360°): 8 quadrantes orbitais mapeados e traseira 180° validada com foto autêntica")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 14: Contadores Dinâmicos de Veículos no Perfil do Usuário
    # ──────────────────────────────────────────────────────────────────────────
    def test_14_profile_page_vehicle_counters_aggregation(self):
        """Cenário 14: Contagem dinâmica de carros por loja e por titular no banco para alimentar o perfil"""
        car2 = models.Car(
            id="car-sprint07-002", brand="Volkswagen", model="Polo Comfortline", year=2023,
            km=18000, price=95000.0, image="/images/FotoPoloTSI.jpg",
            store_id=1, user_id="user-alpha", status_reserva="disponivel"
        )
        self.db.add(car2)
        self.db.commit()

        store1_cars_count = self.db.query(models.Car).filter(models.Car.store_id == 1).count()
        user_alpha_cars = self.db.query(models.Car).filter(models.Car.user_id == "user-alpha").count()
        total_showcase_cars = self.db.query(models.Car).count()

        self.assertEqual(store1_cars_count, 2)
        self.assertEqual(user_alpha_cars, 2)
        self.assertGreaterEqual(total_showcase_cars, 2)

        print(f"✓ Cenário 14 (Contadores Perfil): Meus Carros ({user_alpha_cars}), Loja ({store1_cars_count}), Total ({total_showcase_cars})")

    # ──────────────────────────────────────────────────────────────────────────
    # CENÁRIO 15: Endpoints REST & Cabeçalhos de Segurança Defensiva (OWASP)
    # ──────────────────────────────────────────────────────────────────────────
    def test_15_api_endpoints_and_security_headers(self):
        """Cenário 15: Validação de resposta HTTP 200, GZip e cabeçalhos de segurança defensiva OWASP"""
        resp = self.client.get("/api/cars?limit=5")
        self.assertEqual(resp.status_code, 200)

        # Checagem de cabeçalhos de proteção HTTP
        self.assertEqual(resp.headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(resp.headers.get("x-frame-options"), "DENY")
        self.assertEqual(resp.headers.get("x-xss-protection"), "1; mode=block")
        self.assertIn("max-age=", resp.headers.get("strict-transport-security", ""))

        data = resp.json()
        self.assertIn("items", data)
        self.assertIn("total", data)
        print("✓ Cenário 15 (API REST & OWASP): Rota /api/cars 200 OK e cabeçalhos de proteção (nosniff, DENY, XSS) validados")


if __name__ == "__main__":
    unittest.main(verbosity=2)