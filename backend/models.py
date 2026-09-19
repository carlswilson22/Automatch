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
