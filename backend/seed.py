import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def seed_db():
    db = SessionLocal()
    
    # Check if we already have stores
    if db.query(models.Store).count() == 0:
        print("Seeding database...")
        
        # Initial Stores (Unificados com a Rede B2B)
        store1 = models.Store(
            name="AutoShop Prime",
            slug="autoshop-prime",
            logo="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200",
            description="Concessionária matriz especializada em seminovos periciados e certificados."
        )
        store2 = models.Store(
            name="Motors Campinas",
            slug="motors-campinas",
            logo="https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=200",
            description="Referência regional em veículos premium e repasse B2B de alta liquidez."
        )
        store3 = models.Store(
            name="Concessionária Alpha",
            slug="alpha-motors",
            logo="https://images.unsplash.com/photo-1617704548623-340376564e68?auto=format&fit=crop&q=80&w=200",
            description="Rede integrada com laudo cautelar aprovado e garantia estendida."
        )
        
        db.add_all([store1, store2, store3])
        db.commit()
        db.refresh(store1)
        db.refresh(store2)
        db.refresh(store3)
        
        # Initial Cars (Apenas os 5 carros cadastrados oficiais da Vitrine Digital)
        cars_data = [
            {"brand": "Toyota", "model": "Corolla Cross XRX Híbrido", "year": 2024, "km": 12000, "price": 185000.0, "image": "/images/FotoCorollaCross.jpg", "store_id": store1.id},
            {"brand": "Volkswagen", "model": "Polo TSI Comfortline", "year": 2023, "km": 18500, "price": 98000.0, "image": "/images/FotoPoloTSI.jpg", "store_id": store2.id},
            {"brand": "Hyundai", "model": "HB20 Platinum Plus", "year": 2024, "km": 5000, "price": 105000.0, "image": "/images/FotoHyundaiHB20.jpg", "store_id": store3.id},
            {"brand": "Chevrolet", "model": "Tracker Premier 1.2 Turbo", "year": 2024, "km": 8500, "price": 152000.0, "image": "/images/FotoChevroletTracker.jpg", "store_id": store1.id},
            {"brand": "Fiat", "model": "Pulse Abarth 1.3 Turbo", "year": 2024, "km": 3200, "price": 145000.0, "image": "/images/FotoFiatPulse.jpg", "store_id": store2.id},
        ]

        cars_to_add = [models.Car(**c) for c in cars_data]
        db.add_all(cars_to_add)
        db.commit()
        
        print(f"Database seeded successfully with {len(cars_to_add)} official cars!")
    else:
        print("Database already contains records. Skipping seed.")
        
    db.close()

if __name__ == "__main__":
    seed_db()
