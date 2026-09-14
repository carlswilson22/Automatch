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
        cars_data = [
            {"brand": "Volkswagen", "model": "Golf GTI 2.0 TSI", "year": 2022, "km": 12300, "price": 215000.0, "image": "/images/FotoGolfGTI.jpeg", "store_id": store1.id},
            {"brand": "Honda", "model": "Civic Touring 1.5 Turbo", "year": 2023, "km": 18500, "price": 165000.0, "image": "/images/FotoHondaCivic.jpeg", "store_id": store2.id},
            {"brand": "Tesla", "model": "Model 3", "year": 2024, "km": 5200, "price": 289000.0, "image": "/images/FotoTeslaModel3.jpeg", "store_id": store3.id},
            {"brand": "Jeep", "model": "Compass Limited T270", "year": 2023, "km": 22000, "price": 189900.0, "image": "/images/FotoJeepCompassLimited.jpeg", "store_id": store1.id},
            {"brand": "Toyota", "model": "Hilux SRX 2.8 Diesel", "year": 2022, "km": 38000, "price": 285000.0, "image": "/images/FotoNovaHilux.jpeg", "store_id": store2.id},
            {"brand": "Tesla", "model": "Model 3 Long Range", "year": 2023, "km": 18000, "price": 310000.0, "image": "/images/FotoTeslaModel3.jpeg", "store_id": store3.id},
            {"brand": "Toyota", "model": "Corolla Cross XRX Híbrido", "year": 2024, "km": 12000, "price": 185000.0, "image": "/images/FotoCorollaCross.jpg", "store_id": store1.id},
            {"brand": "Volkswagen", "model": "Polo TSI Comfortline", "year": 2023, "km": 18500, "price": 98000.0, "image": "/images/FotoPoloTSI.jpg", "store_id": store2.id},
            {"brand": "Hyundai", "model": "HB20 Platinum Plus", "year": 2024, "km": 5000, "price": 105000.0, "image": "/images/FotoHyundaiHB20.jpg", "store_id": store3.id},
            {"brand": "Chevrolet", "model": "Tracker Premier 1.2 Turbo", "year": 2024, "km": 8500, "price": 152000.0, "image": "/images/FotoChevroletTracker.jpg", "store_id": store1.id},
            {"brand": "Fiat", "model": "Pulse Abarth 1.3 Turbo", "year": 2024, "km": 3200, "price": 145000.0, "image": "/images/FotoFiatPulse.jpg", "store_id": store2.id},
            {"brand": "BMW", "model": "320i M Sport", "year": 2023, "km": 15000, "price": 295000.0, "image": "/images/FotoGolfGTI.jpeg", "store_id": store1.id},
            {"brand": "Porsche", "model": "Macan T PDK", "year": 2023, "km": 11000, "price": 480000.0, "image": "/images/FotoTeslaModel3.jpeg", "store_id": store2.id},
            {"brand": "Ford", "model": "Ranger Limited V6", "year": 2023, "km": 25000, "price": 279000.0, "image": "/images/FotoNovaHilux.jpeg", "store_id": store3.id},
            {"brand": "Chevrolet", "model": "Onix Premier 1.0 Turbo", "year": 2023, "km": 21000, "price": 92000.0, "image": "/images/FotoPoloTSI.jpg", "store_id": store1.id},
            {"brand": "Hyundai", "model": "Creta Ultimate 2.0", "year": 2024, "km": 7000, "price": 168000.0, "image": "/images/FotoHyundaiHB20.jpg", "store_id": store2.id},
            {"brand": "Jeep", "model": "Renegade Longitude T270", "year": 2023, "km": 19000, "price": 129900.0, "image": "/images/FotoJeepCompassLimited.jpeg", "store_id": store1.id},
            {"brand": "Nissan", "model": "Kicks Exclusive CVT", "year": 2023, "km": 14000, "price": 124000.0, "image": "/images/FotoCorollaCross.jpg", "store_id": store3.id},
            {"brand": "Honda", "model": "HR-V Touring 1.5 Turbo", "year": 2024, "km": 9500, "price": 189900.0, "image": "/images/FotoHondaCivic.jpeg", "store_id": store2.id},
            {"brand": "Toyota", "model": "Yaris XLS 1.5", "year": 2023, "km": 16000, "price": 99000.0, "image": "/images/FotoCorollaCross.jpg", "store_id": store1.id},
            {"brand": "Volkswagen", "model": "T-Cross Highline 250 TSI", "year": 2024, "km": 8000, "price": 162000.0, "image": "/images/FotoGolfGTI.jpeg", "store_id": store2.id},
            {"brand": "Fiat", "model": "Fastback Limited Powered by Abarth", "year": 2024, "km": 6000, "price": 149900.0, "image": "/images/FotoFiatPulse.jpg", "store_id": store3.id},
            {"brand": "Renault", "model": "Duster Iconic 1.3 Turbo", "year": 2023, "km": 22000, "price": 115000.0, "image": "/images/FotoJeepCompassLimited.jpeg", "store_id": store1.id},
            {"brand": "Volvo", "model": "XC40 Recharge Ultimate", "year": 2023, "km": 12000, "price": 320000.0, "image": "/images/FotoTeslaModel3.jpeg", "store_id": store2.id},
            {"brand": "BYD", "model": "Song Plus DM-i Híbrido", "year": 2024, "km": 4500, "price": 239000.0, "image": "/images/FotoCorollaCross.jpg", "store_id": store3.id}
        ]

        cars_to_add = [models.Car(**c) for c in cars_data]
        db.add_all(cars_to_add)
        db.commit()
        
        print(f"Database seeded successfully with {len(cars_to_add)} cars!")
    else:
        # Check if we should supplement existing cars to test pagination
        existing_count = db.query(models.Car).count()
        if existing_count < 20:
            print(f"Current car count is {existing_count}. Adding additional cars for pagination...")
            store1 = db.query(models.Store).filter_by(slug="euroville").first() or db.query(models.Store).first()
            store2 = db.query(models.Store).filter_by(slug="stuttgart").first() or store1
            store3 = db.query(models.Store).filter_by(slug="tesla-auto").first() or store1
            
            supplementary = [
                {"brand": "Toyota", "model": "Corolla Cross XRX Híbrido", "year": 2024, "km": 12000, "price": 185000.0, "image": "/images/FotoCorollaCross.jpg", "store_id": store1.id},
                {"brand": "Volkswagen", "model": "Polo TSI Comfortline", "year": 2023, "km": 18500, "price": 98000.0, "image": "/images/FotoPoloTSI.jpg", "store_id": store2.id},
                {"brand": "Hyundai", "model": "HB20 Platinum Plus", "year": 2024, "km": 5000, "price": 105000.0, "image": "/images/FotoHyundaiHB20.jpg", "store_id": store3.id},
                {"brand": "Chevrolet", "model": "Tracker Premier 1.2 Turbo", "year": 2024, "km": 8500, "price": 152000.0, "image": "/images/FotoChevroletTracker.jpg", "store_id": store1.id},
                {"brand": "Fiat", "model": "Pulse Abarth 1.3 Turbo", "year": 2024, "km": 3200, "price": 145000.0, "image": "/images/FotoFiatPulse.jpg", "store_id": store2.id},
                {"brand": "BMW", "model": "320i M Sport", "year": 2023, "km": 15000, "price": 295000.0, "image": "/images/FotoGolfGTI.jpeg", "store_id": store1.id},
                {"brand": "Porsche", "model": "Macan T PDK", "year": 2023, "km": 11000, "price": 480000.0, "image": "/images/FotoTeslaModel3.jpeg", "store_id": store2.id},
                {"brand": "Ford", "model": "Ranger Limited V6", "year": 2023, "km": 25000, "price": 279000.0, "image": "/images/FotoNovaHilux.jpeg", "store_id": store3.id},
                {"brand": "Chevrolet", "model": "Onix Premier 1.0 Turbo", "year": 2023, "km": 21000, "price": 92000.0, "image": "/images/FotoPoloTSI.jpg", "store_id": store1.id},
                {"brand": "Hyundai", "model": "Creta Ultimate 2.0", "year": 2024, "km": 7000, "price": 168000.0, "image": "/images/FotoHyundaiHB20.jpg", "store_id": store2.id},
                {"brand": "Jeep", "model": "Renegade Longitude T270", "year": 2023, "km": 19000, "price": 129900.0, "image": "/images/FotoJeepCompassLimited.jpeg", "store_id": store1.id},
                {"brand": "Nissan", "model": "Kicks Exclusive CVT", "year": 2023, "km": 14000, "price": 124000.0, "image": "/images/FotoCorollaCross.jpg", "store_id": store3.id},
                {"brand": "Honda", "model": "HR-V Touring 1.5 Turbo", "year": 2024, "km": 9500, "price": 189900.0, "image": "/images/FotoHondaCivic.jpeg", "store_id": store2.id},
                {"brand": "Toyota", "model": "Yaris XLS 1.5", "year": 2023, "km": 16000, "price": 99000.0, "image": "/images/FotoCorollaCross.jpg", "store_id": store1.id},
                {"brand": "Volkswagen", "model": "T-Cross Highline 250 TSI", "year": 2024, "km": 8000, "price": 162000.0, "image": "/images/FotoGolfGTI.jpeg", "store_id": store2.id},
                {"brand": "Fiat", "model": "Fastback Limited Powered by Abarth", "year": 2024, "km": 6000, "price": 149900.0, "image": "/images/FotoFiatPulse.jpg", "store_id": store3.id},
                {"brand": "Renault", "model": "Duster Iconic 1.3 Turbo", "year": 2023, "km": 22000, "price": 115000.0, "image": "/images/FotoJeepCompassLimited.jpeg", "store_id": store1.id},
                {"brand": "Volvo", "model": "XC40 Recharge Ultimate", "year": 2023, "km": 12000, "price": 320000.0, "image": "/images/FotoTeslaModel3.jpeg", "store_id": store2.id},
                {"brand": "BYD", "model": "Song Plus DM-i Híbrido", "year": 2024, "km": 4500, "price": 239000.0, "image": "/images/FotoCorollaCross.jpg", "store_id": store3.id}
            ]
            added = [models.Car(**c) for c in supplementary]
            db.add_all(added)
            db.commit()
            print(f"Added {len(added)} supplementary cars. Total is now {db.query(models.Car).count()}!")
        else:
            print("Database already contains records. Skipping seed.")
        
    db.close()

if __name__ == "__main__":
    seed_db()
