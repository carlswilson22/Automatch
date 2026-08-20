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
    store_id = Column(Integer, ForeignKey("stores.id"))

    store = relationship("Store", back_populates="cars")
