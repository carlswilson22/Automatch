import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def seed_db():
    db = SessionLocal()
    try:
        # Check if we already have stores
        if db.query(models.Store).count() == 0:
            print("Seeding stores...")
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

        stores = db.query(models.Store).all()
        store1 = stores[0] if len(stores) > 0 else None
        store2 = stores[1] if len(stores) > 1 else store1
        store3 = stores[2] if len(stores) > 2 else store1

        # Check if we have cars in database
        if db.query(models.Car).count() == 0:
            print("Seeding official 5 showcase cars...")
            cars_data = [
                {
                    "id": "sc-001",
                    "brand": "Toyota",
                    "model": "Corolla Cross XRX Híbrido",
                    "year": 2024,
                    "km": 12000,
                    "price": 185000.0,
                    "fipe_price": 192000.0,
                    "original_price": 194000.0,
                    "image": "/images/FotoCorollaCross.jpg",
                    "store_id": store1.id if store1 else 1,
                    "color": "Branco Pérola",
                    "fuel": "Híbrido Flex",
                    "transmission": "Automático CVT",
                    "body_type": "SUV",
                    "location": "São Paulo, SP",
                    "plate": "ABC1234",
                    "fipe_code": "004487-3",
                    "description": "SUV híbrido flex topo de linha, teto solar elétrico, pacote Toyota Safety Sense e revisões em concessionária.",
                    "tags": "Híbrido Flex, Teto Solar, Safety Sense, Único Dono, Garantia de Fábrica",
                    "compartilhavel": 1,
                    "valor_minimo_repasse": 166500.0,
                    "comissao_fixa": 3500.0,
                    "status_reserva": "disponivel"
                },
                {
                    "id": "sc-002",
                    "brand": "Volkswagen",
                    "model": "Polo TSI Comfortline",
                    "year": 2023,
                    "km": 18500,
                    "price": 98000.0,
                    "fipe_price": 104000.0,
                    "original_price": 103000.0,
                    "image": "/images/FotoPoloTSI.jpg",
                    "store_id": store2.id if store2 else 2,
                    "color": "Vermelho",
                    "fuel": "Flex",
                    "transmission": "Automático Tiptronic 6 marchas",
                    "body_type": "Hatch",
                    "location": "Campinas, SP",
                    "plate": "XYZ5678",
                    "fipe_code": "005398-8",
                    "description": "Hatch esportivo e econômico com motor 1.0 TSI Turbo, painel 100% digital Active Info Display e VW Play.",
                    "tags": "1.0 Turbo TSI, Painel Digital, VW Play, Câmbio Automático 6M, Laudo Aprovado",
                    "compartilhavel": 1,
                    "valor_minimo_repasse": 88200.0,
                    "comissao_fixa": 2500.0,
                    "status_reserva": "disponivel"
                },
                {
                    "id": "sc-003",
                    "brand": "Hyundai",
                    "model": "HB20 Platinum Plus",
                    "year": 2024,
                    "km": 5000,
                    "price": 105000.0,
                    "fipe_price": 110000.0,
                    "original_price": 105000.0,
                    "image": "/images/FotoHyundaiHB20.jpg",
                    "store_id": store3.id if store3 else 3,
                    "color": "Prata",
                    "fuel": "Flex",
                    "transmission": "Automático de 6 marchas",
                    "body_type": "Hatch",
                    "location": "Curitiba, PR",
                    "plate": "HBD9988",
                    "fipe_code": "015190-4",
                    "description": "Versão Platinum com motor TGDI Turbo, pacote Hyundai SmartSense de segurança e apenas 5.000 km rodados.",
                    "tags": "1.0 TGDI Turbo, SmartSense, Chave Presencial, Garantia até 2029, Apenas 5.000 km",
                    "compartilhavel": 1,
                    "valor_minimo_repasse": 94500.0,
                    "comissao_fixa": 3000.0,
                    "status_reserva": "disponivel"
                },
                {
                    "id": "sc-004",
                    "brand": "Chevrolet",
                    "model": "Tracker Premier 1.2 Turbo",
                    "year": 2024,
                    "km": 8500,
                    "price": 152000.0,
                    "fipe_price": 159000.0,
                    "original_price": 158000.0,
                    "image": "/images/FotoChevroletTracker.jpg",
                    "store_id": store1.id if store1 else 1,
                    "color": "Azul Escuro",
                    "fuel": "Flex",
                    "transmission": "Automático de 6 marchas",
                    "body_type": "SUV",
                    "location": "São Paulo, SP",
                    "plate": "TRK4321",
                    "fipe_code": "004512-8",
                    "description": "SUV Premier com teto solar panorâmico, motor 1.2 Turbo, assistente de estacionamento autônomo e Wi-Fi nativo.",
                    "tags": "1.2 Turbo, Teto Panorâmico, Easy Park, Wi-Fi Nativo, Alerta Ponto Cego",
                    "compartilhavel": 1,
                    "valor_minimo_repasse": 136800.0,
                    "comissao_fixa": 3500.0,
                    "status_reserva": "disponivel"
                },
                {
                    "id": "sc-005",
                    "brand": "Fiat",
                    "model": "Pulse Abarth 1.3 Turbo",
                    "year": 2024,
                    "km": 3200,
                    "price": 145000.0,
                    "fipe_price": 149900.0,
                    "original_price": 145000.0,
                    "image": "/images/FotoFiatPulse.jpg",
                    "store_id": store2.id if store2 else 2,
                    "color": "Vermelho",
                    "fuel": "Flex",
                    "transmission": "Automático esportivo 6 marchas",
                    "body_type": "SUV",
                    "location": "Campinas, SP",
                    "plate": "ABT2026",
                    "fipe_code": "001550-4",
                    "description": "O puro esportivo da divisão do escorpião com motor Turbo 270 de 185 cv, modo Poison e escape esportivo duplo.",
                    "tags": "Abarth Oficial, Turbo 270 (185cv), Modo Poison, Escapamento Duplo, Apenas 3.200 km",
                    "compartilhavel": 1,
                    "valor_minimo_repasse": 130500.0,
                    "comissao_fixa": 3000.0,
                    "status_reserva": "disponivel"
                }
            ]
            cars_to_add = [models.Car(**c) for c in cars_data]
            db.add_all(cars_to_add)
            db.commit()
            print(f"Database seeded successfully with {len(cars_to_add)} official cars!")
        else:
            print(f"Database already contains {db.query(models.Car).count()} cars. Skipping car seed.")
    except Exception as e:
        print(f"Seed error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
