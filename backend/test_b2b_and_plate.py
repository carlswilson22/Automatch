import unittest
import time
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import models
import schemas
from routers.vehicle_lookup import normalize_plate, validate_brazilian_plate, lookup_plate, _PLATE_CACHE
from routers.partnerships import (
    create_car_reservation, 
    send_partnership_invite, 
    accept_partnership_invite,
    get_shared_inventory,
    request_reservation_closing,
    give_reservation_consent,
    send_reservation_message,
    get_reservation_messages
)

# SQLite em memória para testes isolados
TEST_DATABASE_URL = "sqlite:///:memory:"

class TestB2BAndVehicleLookup(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
        cls.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)
        models.Base.metadata.create_all(bind=cls.engine)

    def setUp(self):
        models.Base.metadata.create_all(bind=self.engine)
        self.db = self.SessionLocal()
        # Seed Lojas
        self.store1 = models.Store(id=1, name="Concessionária Alpha", slug="alpha-motors")
        self.store2 = models.Store(id=2, name="Concessionária Beta", slug="beta-motors")
        self.db.add_all([self.store1, self.store2])
        self.db.commit()

        # Seed Usuários Lojistas
        self.user_alpha = models.User(
            id="user-alpha",
            name="Vendedor Alpha",
            email="alpha@automatch.com",
            hashed_password="hash",
            role="lojista",
            sub_role="owner",
            store_id=1
        )
        self.user_beta = models.User(
            id="user-beta",
            name="Vendedor Beta",
            email="beta@automatch.com",
            hashed_password="hash",
            role="lojista",
            sub_role="owner",
            store_id=2
        )
        self.db.add_all([self.user_alpha, self.user_beta])
        self.db.commit()

        # Seed Carro Compartilhável na Loja Alpha
        self.car_alpha = models.Car(
            id="car-alpha-001",
            brand="Honda",
            model="Civic Touring 1.5 Turbo",
            year=2023,
            km=18000,
            price=145000.0,
            image="https://example.com/civic.jpg",
            store_id=1,
            user_id="user-alpha",
            compartilhavel=1,
            valor_minimo_repasse=135000.0,
            comissao_fixa=3.0,
            observacoes_repasse="Carro com manual e chave cópia",
            status_reserva="disponivel"
        )
        self.db.add(self.car_alpha)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        models.Base.metadata.drop_all(bind=self.engine)

    # ── Testes da Consulta de Placa ───────────────────────────────────────────

    def test_plate_normalization_and_validation(self):
        """Testa normalização e validação de padrões Mercosul e Antigo."""
        self.assertEqual(normalize_plate("abc-1234"), "ABC1234")
        self.assertEqual(normalize_plate("bra2e19"), "BRA2E19")
        self.assertEqual(normalize_plate("  xyz-9876  "), "XYZ9876")

        self.assertTrue(validate_brazilian_plate("ABC1234"))
        self.assertTrue(validate_brazilian_plate("BRA2E19"))
        self.assertFalse(validate_brazilian_plate("12345"))
        self.assertFalse(validate_brazilian_plate("ABC12345"))
        self.assertFalse(validate_brazilian_plate("INVALID"))

    def test_plate_lookup_and_24h_cache(self):
        """Testa busca automática e cache com TTL de 24h."""
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        # 1. Consulta inicial (cache miss)
        res1 = loop.run_until_complete(lookup_plate("ABC1234", self.db))
        self.assertEqual(res1.marca, "Toyota")
        self.assertEqual(res1.ano_fabricacao, 2023)
        self.assertFalse(res1.cache_hit)
        self.assertIsNotNone(res1.preco_fipe_sugerido)
        self.assertEqual(res1.status_roubo_furto, "Nada Consta (Regular)")

        # 2. Segunda consulta (deve ser cache hit)
        res2 = loop.run_until_complete(lookup_plate("ABC1234", self.db))
        self.assertTrue(res2.cache_hit)
        self.assertEqual(res2.modelo, res1.modelo)
        loop.close()

    # ── Testes de Parcerias B2B ───────────────────────────────────────────────

    def test_partnership_invite_and_accept(self):
        """Testa envio de convite de parceria e aceite entre concessionárias."""
        # Loja 2 convida Loja 1
        invite_res = send_partnership_invite(
            schemas.PartnershipInviteRequest(receiver_store_id=1, commission_rate=3.5),
            self.db,
            self.user_beta
        )
        p_id = invite_res["partnership_id"]
        self.assertIsNotNone(p_id)

        partnership = self.db.query(models.StorePartnership).filter(models.StorePartnership.id == p_id).first()
        self.assertEqual(partnership.status, "pendente")
        self.assertEqual(partnership.commission_rate, 3.5)

        # Loja 1 aceita
        accept_res = accept_partnership_invite(p_id, self.db, self.user_alpha)
        self.db.refresh(partnership)
        self.assertEqual(partnership.status, "ativa")
        self.assertIsNotNone(partnership.activated_at)

    def test_shared_inventory_and_floor_price(self):
        """Testa vitrine B2B exibindo apenas carros compartilháveis de lojas parceiras."""
        # Ativa parceria
        p = models.StorePartnership(
            requester_store_id=1,
            receiver_store_id=2,
            status="ativa",
            commission_rate=3.0,
            created_at="2026-09-24 10:00:00"
        )
        self.db.add(p)
        self.db.commit()

        # Loja Beta consulta vitrine compartilhada
        items = get_shared_inventory(db=self.db, current_user=self.user_beta)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["id"], "car-alpha-001")
        self.assertEqual(items[0]["valor_minimo_repasse"], 135000.0)

    def test_reservation_hold_lock_and_piso_protection(self):
        """Testa Hold Lock: proposta abaixo do piso deve ser estritamente bloqueada."""
        p = models.StorePartnership(
            requester_store_id=1,
            receiver_store_id=2,
            status="ativa",
            commission_rate=3.0,
            created_at="2026-09-24 10:00:00"
        )
        self.db.add(p)
        self.db.commit()

        # 1. Proposta abaixo do piso (R$ 130.000 < R$ 135.000) -> DEVE FALHAR (400)
        from fastapi import HTTPException
        with self.assertRaises(HTTPException) as ctx:
            create_car_reservation(
                schemas.ReservationCreateRequest(
                    car_id="car-alpha-001",
                    proposed_price=130000.0,
                    client_markup=5000.0,
                    client_name="Cliente Teste"
                ),
                self.db,
                self.user_beta
            )
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("inferior ao piso mínimo", ctx.exception.detail)

        # 2. Proposta igual ou acima do piso (R$ 136.000 >= R$ 135.000) -> SUCESSO
        res = create_car_reservation(
            schemas.ReservationCreateRequest(
                car_id="car-alpha-001",
                proposed_price=136000.0,
                client_markup=6000.0,
                client_name="Cliente Aprovado",
                duration_minutes=120
            ),
            self.db,
            self.user_beta
        )
        res_id = res["reservation_id"]
        self.assertIsNotNone(res_id)

        # Carro deve estar bloqueado como 'reservado'
        car = self.db.query(models.Car).filter(models.Car.id == "car-alpha-001").first()
        self.assertEqual(car.status_reserva, "reservado")

        # 3. Solicitação de fechamento e consentimento
        request_reservation_closing(res_id, self.db, self.user_beta)
        reservation = self.db.query(models.CarReservation).filter(models.CarReservation.id == res_id).first()
        self.assertEqual(reservation.closing_requested, 1)

        # 4. Loja Alpha concede consentimento
        consent_res = give_reservation_consent(
            res_id,
            schemas.ReservationConsentRequest(approved=True, notes="Fechamento autorizado"),
            self.db,
            self.user_alpha
        )
        self.assertIn("REP-", consent_res["protocol"])
        self.assertEqual(consent_res["final_price"], 142000.0) # 136.000 + 6.000

        # Transação gravada
        tx = self.db.query(models.PartnerTransaction).filter(models.PartnerTransaction.reservation_id == res_id).first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.protocol, consent_res["protocol"])
        self.assertEqual(tx.status, "concluida")

    def test_direct_negotiation_chat(self):
        """Testa envio e recuperação de mensagens no chat B2B."""
        p = models.StorePartnership(
            requester_store_id=1,
            receiver_store_id=2,
            status="ativa",
            created_at="2026-09-24 10:00:00"
        )
        self.db.add(p)
        self.db.commit()

        res = models.CarReservation(
            id="res-chat-test",
            car_id="car-alpha-001",
            partnership_id=p.id,
            requesting_store_id=2,
            owner_store_id=1,
            seller_user_id="user-beta",
            proposed_price=135000.0,
            status="ativa",
            created_at="2026-09-24 10:00:00",
            expires_at=time.time() + 7200
        )
        self.db.add(res)
        self.db.commit()

        # Envia mensagem
        msg = send_reservation_message(
            "res-chat-test",
            schemas.PartnerMessageCreate(message="Cliente tem R$ 50 mil de entrada e restante financiado."),
            self.db,
            self.user_beta
        )
        self.assertEqual(msg["message"], "Cliente tem R$ 50 mil de entrada e restante financiado.")

        # Recupera mensagens
        msgs = get_reservation_messages("res-chat-test", self.db, self.user_alpha)
        self.assertEqual(len(msgs), 1)
        self.assertEqual(msgs[0]["message"], "Cliente tem R$ 50 mil de entrada e restante financiado.")

    def test_security_verify_token_and_b2b_auth_dependency(self):
        """Testa decodificação e validação de token JWT real no módulo de segurança e dependência B2B."""
        import security
        from routers.partnerships import get_current_b2b_user
        from fastapi import HTTPException

        token = security.create_access_token({"sub": self.user_alpha.id, "email": self.user_alpha.email})
        
        # 1. Valida função verify_token alias
        payload = security.verify_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["sub"], self.user_alpha.id)

        # 2. Valida dependência get_current_b2b_user com header real
        auth_header = f"Bearer {token}"
        resolved_user = get_current_b2b_user(db=self.db, authorization=auth_header)
        self.assertEqual(resolved_user.id, self.user_alpha.id)
        self.assertEqual(resolved_user.role, "lojista")

        # 3. Valida rejeição de token inválido
        with self.assertRaises(HTTPException) as cm:
            get_current_b2b_user(db=self.db, authorization="Bearer token-invalido.123.456")
        self.assertEqual(cm.exception.status_code, 401)

    def test_car_update_and_floor_price_validation(self):
        """Testa PUT /api/cars/{car_id} com validação de piso e controle de acesso OWASP A01."""
        from routers.cars import update_car
        from fastapi import HTTPException

        # 1. Atualização legítima pelo proprietário do anúncio
        update_payload = schemas.CarUpdate(
            price=140000.0,
            compartilhavel=1,
            valor_minimo_repasse=132000.0,
            comissao_fixa=3.5,
            observacoes_repasse="Aceita proposta à vista"
        )
        updated = update_car("car-alpha-001", update_payload, self.db, self.user_alpha)
        self.assertEqual(updated.price, 140000.0)
        self.assertEqual(updated.valor_minimo_repasse, 132000.0)
        self.assertEqual(updated.comissao_fixa, 3.5)

        # 2. Rejeição de piso superior ao preço de venda
        invalid_payload = schemas.CarUpdate(valor_minimo_repasse=155000.0)
        with self.assertRaises(HTTPException) as cm:
            update_car("car-alpha-001", invalid_payload, self.db, self.user_alpha)
        self.assertEqual(cm.exception.status_code, 400)
        self.assertIn("superior ao preço", cm.exception.detail)

        # 3. Rejeição por usuário sem permissão (não-proprietário)
        with self.assertRaises(HTTPException) as cm2:
            update_car("car-alpha-001", update_payload, self.db, self.user_beta)
        self.assertEqual(cm2.exception.status_code, 403)

    def test_car_delete_with_b2b_dependencies_cascade(self):
        """Testa exclusão limpa e atômica de veículo com reservas, mensagens e transações sem erro de FK."""
        from routers.cars import delete_car

        # Cria carro com dependências
        test_car = models.Car(
            id="car-cascade-test",
            brand="Honda",
            model="HR-V EXL",
            year=2023,
            km=25000,
            price=138000.0,
            image="test.jpg",
            store_id=1,
            user_id=self.user_alpha.id
        )
        self.db.add(test_car)
        self.db.commit()

        # Cria reserva e mensagem
        res = models.CarReservation(
            id="res-cascade-001",
            car_id="car-cascade-test",
            requesting_store_id=2,
            owner_store_id=1,
            seller_user_id="user-beta",
            proposed_price=130000.0,
            status="ativa",
            created_at="2026-09-24",
            expires_at=time.time() + 3600
        )
        self.db.add(res)
        self.db.commit()

        msg = models.PartnerMessage(
            reservation_id="res-cascade-001",
            sender_user_id="user-beta",
            sender_store_id=2,
            message="Mensagem vinculada à reserva",
            created_at="2026-09-24"
        )
        self.db.add(msg)
        self.db.commit()

        # Executa delete_car pelo proprietário
        result = delete_car("car-cascade-test", self.db, self.user_alpha)
        self.assertEqual(result["status"], "success")

        # Verifica que o carro e suas dependências foram removidos
        self.assertIsNone(self.db.query(models.Car).filter(models.Car.id == "car-cascade-test").first())
        self.assertIsNone(self.db.query(models.CarReservation).filter(models.CarReservation.id == "res-cascade-001").first())
        self.assertEqual(self.db.query(models.PartnerMessage).filter(models.PartnerMessage.reservation_id == "res-cascade-001").count(), 0)

if __name__ == '__main__':
    unittest.main()

