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
    year = Column(Integer)
    km = Column(Integer)
    price = Column(Float)
    image = Column(String)
    
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

    store_id = Column(Integer, ForeignKey("stores.id"))
    store = relationship("Store", back_populates="cars")

class LaudoWatchlist(Base):
    __tablename__ = "laudo_watchlist"

    id = Column(Integer, primary_key=True, index=True)
    car_id = Column(String(36), ForeignKey("cars.id"), index=True)
    placa = Column(String, index=True)
    last_check = Column(String, nullable=True)
    status = Column(String, nullable=True)
