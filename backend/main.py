from fastapi import FastAPI, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import models
import schemas
from database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Automatch API")

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/login")
def login(request: LoginRequest):
    # Mocking a valid user for demonstration purposes
    if request.email == "admin@automatch.com" and request.password == "admin123":
        return {
            "id": "user-1",
            "name": "Admin",
            "email": request.email,
            "memberSince": "Abril 2024",
            "photo": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
        }
    
    # Generic error to avoid user enumeration
    raise HTTPException(
        status_code=401,
        detail="E-mail ou senha incorretos."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/stores", response_model=List[schemas.StoreSchema])
def get_stores(db: Session = Depends(get_db)):
    stores = db.query(models.Store).all()
    return stores

@app.get("/api/cars", response_model=List[schemas.CarSchema])
def get_cars(
    db: Session = Depends(get_db),
    store_id: Optional[int] = None,
    q: Optional[str] = None
):
    query = db.query(models.Car)
    
    if store_id is not None:
        query = query.filter(models.Car.store_id == store_id)
        
    if q is not None and len(q.strip()) > 0:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                models.Car.brand.ilike(search_term),
                models.Car.model.ilike(search_term)
            )
        )
        
    cars = query.all()
    return cars

@app.post("/api/cars", response_model=schemas.CarSchema)
def create_car(car: schemas.CarBase, db: Session = Depends(get_db)):
    db_car = models.Car(**car.dict())
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car

