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
            brand="Volkswagen", model="Golf GTI 2.0 TSI", year=2022, km=12300, price=215000.0,
            image="/images/FotoGolfGTI.jpeg",
            store_id=store1.id
        )
        car2 = models.Car(
            brand="Honda", model="Civic Touring 1.5 Turbo", year=2023, km=18500, price=165000.0,
            image="/images/FotoHondaCivic.jpeg",
            store_id=store2.id
        )
        car3 = models.Car(
            brand="Tesla", model="Model 3", year=2024, km=5200, price=289000.0,
            image="/images/FotoTeslaModel3.jpeg",
            store_id=store3.id
        )
        car4 = models.Car(
            brand="Jeep", model="Compass Limited T270", year=2023, km=22000, price=189900.0,
            image="/images/FotoJeepCompassLimited.jpeg",
            store_id=store1.id
        )
        car5 = models.Car(
            brand="Toyota", model="Hilux SRX 2.8 Diesel", year=2022, km=38000, price=285000.0,
            image="/images/FotoNovaHilux.jpeg",
            store_id=store2.id
        )
        car6 = models.Car(
            brand="Tesla", model="Model 3 Long Range", year=2023, km=18000, price=310000.0,
            image="/images/FotoTeslaModel3.jpeg",
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
