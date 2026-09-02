from typing import List, Optional
from datetime import datetime
# pyrefly: ignore [missing-import]
from pydantic import BaseModel

class CarBase(BaseModel):
    brand: str
    model: str
    year: int
    km: int
    price: float
    image: str
    store_id: int

class CarSchema(CarBase):
    id: str

    class Config:
        from_attributes = True

class StoreBase(BaseModel):
    name: str
    slug: str
    logo: str
    description: str

class StoreSchema(StoreBase):
    id: int
    cars: List[CarSchema] = []

    class Config:
        from_attributes = True

class LaudoWatchlistBase(BaseModel):
    placa: str
    codigo_fipe: Optional[str] = None
    user_email: Optional[str] = None

class LaudoWatchlistSchema(LaudoWatchlistBase):
    id: int
    status: str
    ultima_verificacao: Optional[datetime] = None
    criado_em: Optional[datetime] = None

    class Config:
        from_attributes = True

