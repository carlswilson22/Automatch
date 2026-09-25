# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
import uuid
from database import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    slug = Column(String, unique=True, index=True)
    logo = Column(String)
    description = Column(Text)

    cars = relationship("Car", back_populates="store")

class Car(Base):
    __tablename__ = "cars"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    brand = Column(String, index=True)
    model = Column(String, index=True)
    year = Column(Integer, index=True)
    km = Column(Integer)
    price = Column(Float, index=True)
    image = Column(String)
    video_url = Column(String, nullable=True)
    
    color = Column(String, nullable=True)
    fuel = Column(String, nullable=True)
    transmission = Column(String, nullable=True)
    body_type = Column(String, nullable=True)
    location = Column(String, nullable=True)
    plate = Column(String, nullable=True)
    fipe_code = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    full_description = Column(Text, nullable=True)
    tags = Column(String, nullable=True)
    laudo_status = Column(String, nullable=True)
    debt_status = Column(String, nullable=True)
    auction_history = Column(String, nullable=True)
    fipe_price = Column(Float, nullable=True)
    auto_price = Column(Float, nullable=True)
    laudo_url = Column(String, nullable=True)
    laudo_feedback = Column(Text, nullable=True)
    original_price = Column(Float, nullable=True)
    price_history = Column(Text, nullable=True)

    store_id = Column(Integer, ForeignKey("stores.id"), index=True)
    store = relationship("Store", back_populates="cars")

    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    
    # B2B Estoque Compartilhado & Repasse
    compartilhavel = Column(Integer, default=0) # 0 = False, 1 = True
    valor_minimo_repasse = Column(Float, nullable=True)
    comissao_fixa = Column(Float, nullable=True)
    observacoes_repasse = Column(Text, nullable=True)
    status_reserva = Column(String(32), default="disponivel") # disponivel, reservado, em_fechamento, vendido

class LaudoWatchlist(Base):
    __tablename__ = "laudo_watchlist"

    id = Column(Integer, primary_key=True, index=True)
    car_id = Column(String(36), ForeignKey("cars.id"), index=True)
    placa = Column(String, index=True)
    last_check = Column(String, nullable=True)
    status = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    photo = Column(String, nullable=True)
    member_since = Column(String, default="Março 2024")
    
    # Papéis e vinculação B2B à Concessionária
    role = Column(String(32), default="lojista") # lojista, admin, comprador
    sub_role = Column(String(32), default="owner") # owner, manager, seller
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True, index=True)
    store = relationship("Store", foreign_keys=[store_id])

class PaymentOrder(Base):
    __tablename__ = "payment_orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    protocol = Column(String, unique=True, index=True, nullable=False)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=True)
    item_description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)
    status = Column(String, default="Aprovado")
    created_at = Column(String, nullable=False)


class LaudoProtocol(Base):
    __tablename__ = "laudo_protocols"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    protocol = Column(String, unique=True, index=True, nullable=False)
    car_id = Column(String(36), ForeignKey("cars.id"), index=True)
    created_at = Column(String, nullable=False)
    snapshot_data = Column(Text, nullable=False)


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id"), index=True)
    token_hash = Column(String, nullable=False)
    otp_code = Column(String(6), nullable=False)
    expires_at = Column(Float, nullable=False)
    used = Column(Integer, default=0)
    created_at = Column(String, nullable=False)


# ============================================================================
# REDE B2B DE ESTOQUE COMPARTILHADO & PARCERIAS ENTRE LOJAS
# ============================================================================

class StorePartnership(Base):
    __tablename__ = "store_partnerships"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    requester_store_id = Column(Integer, ForeignKey("stores.id"), index=True, nullable=False)
    receiver_store_id = Column(Integer, ForeignKey("stores.id"), index=True, nullable=False)
    status = Column(String(32), default="pendente", index=True)  # pendente, ativa, recusada, encerrada
    commission_rate = Column(Float, default=3.0)
    notes = Column(Text, nullable=True)
    termination_reason = Column(Text, nullable=True)
    created_at = Column(String, nullable=False)
    activated_at = Column(String, nullable=True)
    terminated_at = Column(String, nullable=True)

    requester_store = relationship("Store", foreign_keys=[requester_store_id])
    receiver_store = relationship("Store", foreign_keys=[receiver_store_id])


class CarReservation(Base):
    __tablename__ = "car_reservations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    car_id = Column(String(36), ForeignKey("cars.id"), index=True, nullable=False)
    partnership_id = Column(String(36), ForeignKey("store_partnerships.id"), index=True, nullable=True)
    requesting_store_id = Column(Integer, ForeignKey("stores.id"), index=True, nullable=False)
    owner_store_id = Column(Integer, ForeignKey("stores.id"), index=True, nullable=False)
    seller_user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    proposed_price = Column(Float, nullable=False)
    client_markup = Column(Float, default=0.0)
    client_name = Column(String, nullable=True)
    status = Column(String(32), default="ativa", index=True)  # ativa, expirada, consentida, recusada, cancelada
    duration_minutes = Column(Integer, default=120)
    created_at = Column(String, nullable=False)
    expires_at = Column(Float, nullable=False)  # Unix timestamp
    closing_requested = Column(Integer, default=0)
    consent_notes = Column(Text, nullable=True)

    car = relationship("Car", foreign_keys=[car_id])
    requesting_store = relationship("Store", foreign_keys=[requesting_store_id])
    owner_store = relationship("Store", foreign_keys=[owner_store_id])
    seller_user = relationship("User", foreign_keys=[seller_user_id])


class PartnerTransaction(Base):
    __tablename__ = "partner_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    protocol = Column(String, unique=True, index=True, nullable=False)
    reservation_id = Column(String(36), ForeignKey("car_reservations.id"), nullable=True, index=True)
    car_id = Column(String(36), ForeignKey("cars.id"), index=True, nullable=False)
    selling_store_id = Column(Integer, ForeignKey("stores.id"), index=True, nullable=False)
    buying_store_id = Column(Integer, ForeignKey("stores.id"), index=True, nullable=False)
    closing_user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=True)
    final_price = Column(Float, nullable=False)
    repasse_piso = Column(Float, nullable=False)
    markup_amount = Column(Float, default=0.0)
    commission_amount = Column(Float, default=0.0)
    status = Column(String(32), default="concluida")
    created_at = Column(String, nullable=False)

    car = relationship("Car", foreign_keys=[car_id])
    selling_store = relationship("Store", foreign_keys=[selling_store_id])
    buying_store = relationship("Store", foreign_keys=[buying_store_id])


class PartnerMessage(Base):
    __tablename__ = "partner_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    reservation_id = Column(String(36), ForeignKey("car_reservations.id"), index=True, nullable=False)
    sender_user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    sender_store_id = Column(Integer, ForeignKey("stores.id"), index=True, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(String, nullable=False)

    sender_user = relationship("User", foreign_keys=[sender_user_id])
    sender_store = relationship("Store", foreign_keys=[sender_store_id])


class PartnerReview(Base):
    __tablename__ = "partner_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    transaction_id = Column(String(36), ForeignKey("partner_transactions.id"), index=True, nullable=True)
    reviewer_store_id = Column(Integer, ForeignKey("stores.id"), index=True, nullable=False)
    reviewed_store_id = Column(Integer, ForeignKey("stores.id"), index=True, nullable=False)
    rating = Column(Integer, nullable=False)
    punctuality_rating = Column(Integer, default=5)
    comment = Column(Text, nullable=True)
    created_at = Column(String, nullable=False)

    reviewer_store = relationship("Store", foreign_keys=[reviewer_store_id])
    reviewed_store = relationship("Store", foreign_keys=[reviewed_store_id])


class PartnershipAuditLog(Base):
    __tablename__ = "partnership_audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), nullable=False, index=True)
    store_id = Column(Integer, nullable=True, index=True)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(String, nullable=False)

