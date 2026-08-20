from typing import List, Optional
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
