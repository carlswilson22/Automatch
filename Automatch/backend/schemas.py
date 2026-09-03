from typing import List, Optional
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
    
    color: Optional[str] = None
    fuel: Optional[str] = None
    transmission: Optional[str] = None
    body_type: Optional[str] = None
    location: Optional[str] = None
    plate: Optional[str] = None
    fipe_code: Optional[str] = None
    description: Optional[str] = None
    full_description: Optional[str] = None
    tags: Optional[str] = None
    laudo_status: Optional[str] = None
    debt_status: Optional[str] = None
    auction_history: Optional[str] = None
    fipe_price: Optional[float] = None
    auto_price: Optional[float] = None

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

class LaudoWatchlistSchema(BaseModel):
    id: int
    car_id: str
    placa: str
    last_check: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True
