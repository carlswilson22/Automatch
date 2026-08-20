import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def seed_db():
    db = SessionLocal()
    
    # Check if we already have stores
    if db.query(models.Store).count() == 0:
        print("Seeding database...")
        
        # Initial Stores
        store1 = models.Store(
            name="Euroville BMW",
            slug="euroville",
            logo="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200",
            description="A sua concessionária BMW de confiança."
        )
        store2 = models.Store(
            name="Stuttgart Porsche",
            slug="stuttgart",
            logo="https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=200",
            description="Exclusividade e performance Porsche."
        )
        store3 = models.Store(
            name="Tesla Auto",
            slug="tesla-auto",
            logo="https://images.unsplash.com/photo-1617704548623-340376564e68?auto=format&fit=crop&q=80&w=200",
            description="O futuro é agora com Tesla."
        )
        
        db.add_all([store1, store2, store3])
        db.commit()
        db.refresh(store1)
        db.refresh(store2)
        db.refresh(store3)
        
        # Initial Cars
        car1 = models.Car(
            brand="BMW", model="320i M Sport", year=2023, km=15000, price=315000.0,
            image="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",
            store_id=store1.id
        )
        car2 = models.Car(
            brand="Porsche", model="911 Carrera", year=2022, km=8000, price=950000.0,
            image="https://images.unsplash.com/photo-1503376713356-ea6752700a70?auto=format&fit=crop&q=80&w=800",
            store_id=store2.id
        )
        car3 = models.Car(
            brand="Tesla", model="Model 3", year=2024, km=5200, price=289000.0,
            image="https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800",
            store_id=store3.id
        )
        car4 = models.Car(
            brand="BMW", model="X5 xDrive45e", year=2023, km=21000, price=650000.0,
            image="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800",
            store_id=store1.id
        )
        car5 = models.Car(
            brand="Porsche", model="Cayenne", year=2021, km=35000, price=580000.0,
            image="https://images.unsplash.com/photo-1580273916550-e323be2a9baf?auto=format&fit=crop&q=80&w=800",
            store_id=store2.id
        )
        car6 = models.Car(
            brand="Tesla", model="Model Y", year=2023, km=18000, price=340000.0,
            image="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800",
            store_id=store3.id
        )
        
        db.add_all([car1, car2, car3, car4, car5, car6])
        db.commit()
        
        print("Database seeded successfully!")
    else:
        print("Database already contains records. Skipping seed.")
        
    db.close()

if __name__ == "__main__":
    seed_db()
