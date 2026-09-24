import logging
from typing import List, Optional, Dict, Any

from sqlalchemy import or_
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, Header

import models
import schemas
from database import get_db
from routers.auth import get_current_user_from_header

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
def create_car(
    car: schemas.CarBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_header)
) -> schemas.CarSchema:
    car_data = car.dict()
    car_data["user_id"] = current_user.id
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
def delete_car(
    car_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_header)
) -> Dict[str, Any]:
    """
    Exclui um anúncio de veículo do catálogo e banco de dados.
    Remove laudos associados (FK cascade manual) antes da exclusão.
    Apenas o proprietário do anúncio ou o administrador oficial pode excluir (OWASP A01).
    """
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        # Se não encontrou por UUID exato, tenta busca segura ou confirma sucesso para idempotência
        return {"status": "success", "message": "Anúncio removido ou inexistente no banco de dados.", "deleted_id": car_id}
    
    is_admin = (current_user.email == "admin@automatch.com")
    if car.user_id and car.user_id != current_user.id and not is_admin:
        raise HTTPException(
            status_code=403,
            detail="Permissão negada. Você só pode excluir anúncios cadastrados pela sua conta."
        )

    # Remove laudos associados para evitar violação de FK
    try:
        db.query(models.LaudoProtocol).filter(models.LaudoProtocol.car_id == car_id).delete()
    except Exception as e:
        logger.warning("Erro ao remover laudos associados ao carro %s: %s", car_id, e)

    db.delete(car)
    db.commit()
    logger.info("Veículo com ID %s excluído com sucesso do banco de dados.", car_id)
    return {"status": "success", "message": "Anúncio excluído com sucesso.", "deleted_id": car_id}


from services.pricing_service import calcular_indicador_mercado, calcular_tco_mensal
from pydantic import BaseModel

class TcoRequest(BaseModel):
    price: float
    fipe_price: Optional[float] = None
    fuel: Optional[str] = "Flex"
    uf: Optional[str] = "SP"
    monthly_km: Optional[int] = 1000
    fuel_price: Optional[float] = None


@router.get("/cars/{car_id}/market-indicator")
def get_car_market_indicator(car_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Retorna o termômetro de mercado para o veículo: classificação de preço, diferença FIPE e régua de dispersão.
    """
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Veículo não encontrado.")
    
    return calcular_indicador_mercado(
        price=car.price,
        fipe_price=car.fipe_price or car.price,
        auto_price=car.auto_price
    )


@router.post("/cars/tco-calculator")
def post_tco_calculator(payload: TcoRequest) -> Dict[str, Any]:
    """
    Calcula o Custo Total de Posse (TCO) mensal detalhado para um veículo.
    """
    return calcular_tco_mensal(
        price=payload.price,
        fipe_price=payload.fipe_price,
        fuel=payload.fuel,
        uf=payload.uf or "SP",
        monthly_km=payload.monthly_km or 1000,
        fuel_price=payload.fuel_price
    )

