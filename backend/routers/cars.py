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


@router.get("/cars")
def get_cars(
    db: Session = Depends(get_db),
    store_id: Optional[int] = None,
    q: Optional[str] = None,
    brand: Optional[str] = None,
    year_min: Optional[int] = None,
    year_max: Optional[int] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    page: Optional[int] = 1,
    limit: Optional[int] = 20
):
    """
    Retorna catálogo de veículos com paginação server-side, busca textual e filtros combinados.
    Envelope: { items: [...], total: N, page: P, pages: T, limit: L }
    """
    query = db.query(models.Car)
    
    if store_id is not None:
        query = query.filter(models.Car.store_id == store_id)
        
    if q is not None and len(q.strip()) > 0:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                models.Car.brand.ilike(search_term),
                models.Car.model.ilike(search_term),
                models.Car.description.ilike(search_term)
            )
        )

    if brand is not None and brand.strip():
        query = query.filter(models.Car.brand.ilike(f"%{brand.strip()}%"))

    if year_min is not None:
        query = query.filter(models.Car.year >= year_min)

    if year_max is not None:
        query = query.filter(models.Car.year <= year_max)

    if price_min is not None:
        query = query.filter(models.Car.price >= price_min)

    if price_max is not None:
        query = query.filter(models.Car.price <= price_max)

    # Total antes da paginação
    total = query.count()

    # Sanitizar parâmetros de paginação
    page = max(1, page or 1)
    limit = max(1, min(100, limit or 20))
    pages = max(1, (total + limit - 1) // limit)
    offset = (page - 1) * limit

    cars = query.offset(offset).limit(limit).all()

    return {
        "items": [schemas.CarSchema.model_validate(c) for c in cars],
        "total": total,
        "page": page,
        "pages": pages,
        "limit": limit
    }


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
