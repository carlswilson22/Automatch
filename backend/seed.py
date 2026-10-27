"""
seed.py — Script de carga inicial (seed) idempotente do banco de dados.

Responsabilidades:
  - Upsert das 3 lojas oficiais (AutoShop Prime, Motors Campinas, Alpha).
  - Upsert dos 5 veículos canônicos da vitrine (sc-001 a sc-005) com tags,
    metadados completos, preços FIPE, condições B2B e vínculo ao admin.
  - Saneamento de imagens órfãs: substitui referências a arquivos inexistentes
    pelo placeholder oficial ou pela foto correspondente ao modelo.
  - Atribuição de user_id (admin) a veículos sem dono.

Criado como script executável standalone (python seed.py) e também chamado
automaticamente no lifespan do FastAPI em main.py.
"""

import os
import logging
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

logger = logging.getLogger("automatch.seed")

VALID_MEDIA_FILENAMES = {
    "FotoCorollaCross.jpg",
    "FotoPoloTSI.jpg",
    "FotoHyundaiHB20.jpg",
    "FotoChevroletTracker.jpg",
    "FotoFiatPulse.jpg",
    "placeholder-carro.jpg",
    "carro_lataria_amassada.jpg",
    "carro_parachoque_danificado.jpg",
    "hero-video-poster.jpg"
}


def sanitize_car_image(image_path: str, brand: str = "", model: str = "") -> str:
    """Retorna um caminho de imagem física garantidamente existente no diretório public/images."""
    if not image_path:
        return "/images/placeholder-carro.jpg"

    filename = os.path.basename(image_path.strip())
    if filename in VALID_MEDIA_FILENAMES:
        return f"/images/{filename}"

    # Resolução inteligente por marca/modelo se o arquivo apontado for órfão
    b_lower = (brand or "").lower()
    m_lower = (model or "").lower()

    if "toyota" in b_lower or "corolla" in m_lower or "cross" in m_lower:
        return "/images/FotoCorollaCross.jpg"
    elif "volkswagen" in b_lower or "polo" in m_lower or "tsi" in m_lower:
        return "/images/FotoPoloTSI.jpg"
    elif "hyundai" in b_lower or "hb20" in m_lower:
        return "/images/FotoHyundaiHB20.jpg"
    elif "chevrolet" in b_lower or "tracker" in m_lower:
        return "/images/FotoChevroletTracker.jpg"
    elif "fiat" in b_lower or "pulse" in m_lower or "abarth" in m_lower:
        return "/images/FotoFiatPulse.jpg"

    return "/images/placeholder-carro.jpg"


def seed_db():
    """
    Execução idempotente de carga inicial e saneamento do banco de dados (ACH-10 e ACH-12):
    1. Upsert das lojas oficiais (AutoShop Prime, Motors Campinas, Concessionária Alpha)
    2. Upsert dos 5 veículos canônicos da vitrine (sc-001 a sc-005) com tags e metadados completos
    3. Normalização e saneamento de referências de imagens para arquivos físicos existentes
    """
    db = SessionLocal()
    try:
        # 1. Upsert Lojas Oficiais (ACH-10)
        stores_data = [
            {
                "id": 1,
                "name": "AutoShop Prime",
                "slug": "autoshop-prime",
                "logo": "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200",
                "description": "Concessionária matriz especializada em seminovos periciados e certificados."
            },
            {
                "id": 2,
                "name": "Motors Campinas",
                "slug": "motors-campinas",
                "logo": "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=200",
                "description": "Referência regional em veículos premium e repasse B2B de alta liquidez."
            },
            {
                "id": 3,
                "name": "Concessionária Alpha",
                "slug": "alpha-motors",
                "logo": "https://images.unsplash.com/photo-1617704548623-340376564e68?auto=format&fit=crop&q=80&w=200",
                "description": "Rede integrada com laudo cautelar aprovado e garantia estendida."
            }
        ]

        store_map = {}
        for s_data in stores_data:
            existing_store = db.query(models.Store).filter(
                (models.Store.id == s_data["id"]) | (models.Store.slug == s_data["slug"])
            ).first()
            if not existing_store:
                new_store = models.Store(**s_data)
                db.add(new_store)
                db.flush()
                store_map[s_data["id"]] = new_store
            else:
                existing_store.name = s_data["name"]
                existing_store.slug = s_data["slug"]
                existing_store.logo = s_data["logo"]
                existing_store.description = s_data["description"]
                store_map[s_data["id"]] = existing_store

        db.commit()

        # 2. Resolução do Usuário Admin
        admin_user = db.query(models.User).filter(models.User.email == "admin@automatch.com").first()
        admin_id = admin_user.id if admin_user else "user-1"

        # 3. Upsert dos 5 Veículos Canônicos da Vitrine (sc-001 a sc-005)
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
                "store_id": store_map[1].id,
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
                "status_reserva": "disponivel",
                "user_id": admin_id
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
                "store_id": store_map[2].id,
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
                "status_reserva": "disponivel",
                "user_id": admin_id
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
                "store_id": store_map[3].id,
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
                "status_reserva": "disponivel",
                "user_id": admin_id
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
                "store_id": store_map[1].id,
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
                "status_reserva": "disponivel",
                "user_id": admin_id
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
                "store_id": store_map[2].id,
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
                "status_reserva": "disponivel",
                "user_id": admin_id
            }
        ]

        for c_data in cars_data:
            existing_car = db.query(models.Car).filter(models.Car.id == c_data["id"]).first()
            if not existing_car:
                db.add(models.Car(**c_data))
            else:
                for k, v in c_data.items():
                    setattr(existing_car, k, v)

        db.commit()

        # 4. Saneamento de Imagens Inexistentes em Todos os Carros (ACH-12)
        all_cars = db.query(models.Car).all()
        sanitized_count = 0
        for car in all_cars:
            clean_img = sanitize_car_image(car.image, car.brand, car.model)
            if car.image != clean_img:
                car.image = clean_img
                sanitized_count += 1
            if not car.user_id:
                car.user_id = admin_id
            if not car.store_id:
                car.store_id = store_map[1].id

        db.commit()
        print(f"Seed concluído com sucesso: 3 lojas, 5 carros canônicos atualizados e {sanitized_count} imagens saneadas!")
    except Exception as e:
        print(f"Erro na execução do seed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
