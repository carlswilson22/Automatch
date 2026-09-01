# pyrefly: ignore [missing-import]
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
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
    year = Column(Integer)
    km = Column(Integer)
    price = Column(Float)
    image = Column(String)
    store_id = Column(Integer, ForeignKey("stores.id"))

    store = relationship("Store", back_populates="cars")

class LaudoWatchlist(Base):
    __tablename__ = "laudo_watchlist"

    id = Column(Integer, primary_key=True, index=True)
    placa = Column(String(10), index=True, nullable=False)
    codigo_fipe = Column(String(20), nullable=True)
    user_email = Column(String(100), nullable=True)
    status = Column(String(50), default="MONITORANDO")  # MONITORANDO, ATUALIZADO, ALERTA
    ultima_verificacao = Column(DateTime, default=datetime.utcnow)
    criado_em = Column(DateTime, default=datetime.utcnow)

