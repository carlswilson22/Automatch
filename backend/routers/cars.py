import logging
from typing import List, Optional, Dict, Any

from sqlalchemy import or_
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException

import models
import schemas
from database import get_db

logger = logging.getLogger("automatch")
router = APIRouter(prefix="/api", tags=["Cars & Stores"])


@router.get("/stores", response_model=List[schemas.StoreSchema])
def get_stores(db: Session = Depends(get_db)) -> List[schemas.StoreSchema]:
    stores = db.query(models.Store).all()
    return stores


@router.get("/cars", response_model=List[schemas.CarSchema])
def get_cars(
    db: Session = Depends(get_db),
    store_id: Optional[int] = None,
    q: Optional[str] = None
) -> List[schemas.CarSchema]:
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


@router.get("/cars/{car_id}", response_model=schemas.CarSchema)
def get_car_by_id(car_id: str, db: Session = Depends(get_db)) -> schemas.CarSchema:
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Veículo não encontrado.")
    return car


@router.post("/cars", response_model=schemas.CarSchema)
def create_car(car: schemas.CarBase, db: Session = Depends(get_db)) -> schemas.CarSchema:
    car_data = car.dict()
    target_store_id = car_data.get("store_id")
    if target_store_id is not None:
        store_exists = db.query(models.Store).filter(models.Store.id == target_store_id).first()
        if not store_exists:
            first_store = db.query(models.Store).first()
            if first_store:
                car_data["store_id"] = first_store.id
            else:
                default_store = models.Store(
                    name="Automatch Matriz",
                    slug="automatch-matriz",
                    description="Concessionária padrão da plataforma"
                )
                db.add(default_store)
                db.commit()
                db.refresh(default_store)
                car_data["store_id"] = default_store.id

    db_car = models.Car(**car_data)
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car


@router.delete("/cars/{car_id}")
def delete_car(car_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Exclui um anúncio de veículo do catálogo e banco de dados.
    """
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        # Se não encontrou por UUID exato, tenta busca segura ou confirma sucesso para idempotência
        return {"status": "success", "message": "Anúncio removido ou inexistente no banco de dados.", "deleted_id": car_id}
    
    db.delete(car)
    db.commit()
    logger.info("Veículo com ID %s excluído com sucesso do banco de dados.", car_id)
    return {"status": "success", "message": "Anúncio excluído com sucesso.", "deleted_id": car_id}
