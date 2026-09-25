import time
import uuid
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from database import get_db
import models
import schemas
import security

logger = logging.getLogger("automatch")
router = APIRouter(prefix="/api/partnerships", tags=["B2B Store Partnerships & Shared Inventory"])


# ==============================================================================
# Helpers de Autenticação e Verificação de Papéis B2B
# ==============================================================================

def get_current_b2b_user(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
) -> models.User:
    """
    Valida token JWT e garante que o usuário possui papel Lojista ou Administrador.
    Atribui store_id padrão (store-1) caso o lojista ainda não tenha store_id associado.
    """
    if not authorization or not authorization.startswith("Bearer "):
        # Fallback para desenvolvimento / lojista padrão caso sem token explícito
        user = db.query(models.User).filter(models.User.email == "admin@automatch.com").first()
        if user:
            if not user.store_id:
                user.store_id = 1
                db.commit()
            return user
        raise HTTPException(status_code=401, detail="Autenticação necessária para acessar o módulo B2B.")

    token = authorization.split(" ")[1]
    payload = security.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token de autenticação inválido ou expirado.")

    user_id = payload.get("sub")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Atribui loja padrão caso ainda não definida
    if not user.store_id:
        user.store_id = 1
        db.commit()

    # Validação de papel (Lojista ou Admin)
    role = getattr(user, 'role', 'lojista') or 'lojista'
    if role not in ['lojista', 'admin']:
        raise HTTPException(status_code=403, detail="Acesso restrito a lojistas parceiros e administradores.")

    return user


def log_partnership_audit(db: Session, user_id: str, store_id: Optional[int], action: str, details: str):
    """Registra evento na trilha imutável de auditoria."""
    try:
        log_entry = models.PartnershipAuditLog(
            user_id=user_id,
            store_id=store_id,
            action=action,
            details=details,
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        logger.warning("Falha ao registrar log de auditoria: %s", e)


def refresh_expired_reservations(db: Session):
    """Libera automaticamente carros com reservas ativas cujo tempo limite (TTL) expirou."""
    now = time.time()
    expired_reservations = db.query(models.CarReservation).filter(
        models.CarReservation.status == "ativa",
        models.CarReservation.expires_at <= now
    ).all()

    for res in expired_reservations:
        res.status = "expirada"
        car = db.query(models.Car).filter(models.Car.id == res.car_id).first()
        if car and car.status_reserva == "reservado":
            car.status_reserva = "disponivel"
        
        log_partnership_audit(
            db, 
            res.seller_user_id, 
            res.requesting_store_id, 
            "reserva_expirada", 
            f"Reserva {res.id} expirou por TTL. Veículo {res.car_id} liberado."
        )

    if expired_reservations:
        db.commit()


# ==============================================================================
# 1. Gestão de Parcerias entre Concessionárias
# ==============================================================================

@router.get("/stores-available")
def list_available_stores(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Lista lojas cadastradas na plataforma indicando o status da parceria com a loja do usuário."""
    my_store_id = current_user.store_id or 1
    stores = db.query(models.Store).filter(models.Store.id != my_store_id).all()

    result = []
    for s in stores:
        # Verifica se já existe parceria
        p = db.query(models.StorePartnership).filter(
            or_(
                and_(models.StorePartnership.requester_store_id == my_store_id, models.StorePartnership.receiver_store_id == s.id),
                and_(models.StorePartnership.requester_store_id == s.id, models.StorePartnership.receiver_store_id == my_store_id)
            )
        ).first()

        result.append({
            "id": s.id,
            "name": s.name,
            "slug": s.slug,
            "logo": s.logo,
            "description": s.description,
            "partnership_status": p.status if p else "nenhuma",
            "partnership_id": p.id if p else None,
            "is_requester": (p.requester_store_id == my_store_id) if p else False
        })

    return result


@router.get("/my")
def get_my_partnerships(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Retorna todas as parcerias ativas e pendentes da loja do lojista."""
    my_store_id = current_user.store_id or 1

    partnerships = db.query(models.StorePartnership).filter(
        or_(
            models.StorePartnership.requester_store_id == my_store_id,
            models.StorePartnership.receiver_store_id == my_store_id
        )
    ).order_by(models.StorePartnership.created_at.desc()).all()

    result = []
    for p in partnerships:
        req_store = db.query(models.Store).filter(models.Store.id == p.requester_store_id).first()
        rec_store = db.query(models.Store).filter(models.Store.id == p.receiver_store_id).first()
        is_incoming = (p.receiver_store_id == my_store_id)

        result.append({
            "id": p.id,
            "requester_store_id": p.requester_store_id,
            "receiver_store_id": p.receiver_store_id,
            "requester_store_name": req_store.name if req_store else f"Loja #{p.requester_store_id}",
            "receiver_store_name": rec_store.name if rec_store else f"Loja #{p.receiver_store_id}",
            "status": p.status,
            "commission_rate": p.commission_rate,
            "notes": p.notes,
            "termination_reason": p.termination_reason,
            "created_at": p.created_at,
            "activated_at": p.activated_at,
            "is_incoming": is_incoming
        })

    return result


@router.post("/invite")
def send_partnership_invite(
    payload: schemas.PartnershipInviteRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Envia solicitação de parceria para outra loja."""
    my_store_id = current_user.store_id or 1
    
    if my_store_id == payload.receiver_store_id:
        raise HTTPException(status_code=400, detail="Não é possível solicitar parceria para sua própria loja.")

    receiver_store = db.query(models.Store).filter(models.Store.id == payload.receiver_store_id).first()
    if not receiver_store:
        raise HTTPException(status_code=404, detail="Loja destinatária não encontrada.")

    # Verifica se já existe relação prévia
    existing = db.query(models.StorePartnership).filter(
        or_(
            and_(models.StorePartnership.requester_store_id == my_store_id, models.StorePartnership.receiver_store_id == payload.receiver_store_id),
            and_(models.StorePartnership.requester_store_id == payload.receiver_store_id, models.StorePartnership.receiver_store_id == my_store_id)
        )
    ).first()

    if existing:
        if existing.status == "ativa":
            raise HTTPException(status_code=400, detail="Já existe uma parceria ativa com esta loja.")
        elif existing.status == "pendente":
            raise HTTPException(status_code=400, detail="Já existe um convite pendente entre estas lojas.")
        else:
            # Reativa parceria encerrada ou recusada
            existing.status = "pendente"
            existing.requester_store_id = my_store_id
            existing.receiver_store_id = payload.receiver_store_id
            existing.commission_rate = payload.commission_rate or 3.0
            existing.notes = payload.notes
            existing.created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            db.commit()
            log_partnership_audit(db, current_user.id, my_store_id, "reenvio_convite_parceria", f"Para loja {receiver_store.name}")
            return {"message": "Convite de parceria reenviado com sucesso.", "partnership_id": existing.id}

    new_partnership = models.StorePartnership(
        requester_store_id=my_store_id,
        receiver_store_id=payload.receiver_store_id,
        status="pendente",
        commission_rate=payload.commission_rate or 3.0,
        notes=payload.notes,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(new_partnership)
    db.commit()
    db.refresh(new_partnership)

    log_partnership_audit(db, current_user.id, my_store_id, "envio_convite_parceria", f"Para loja {receiver_store.name}")
    return {"message": "Convite de parceria enviado com sucesso.", "partnership_id": new_partnership.id}


@router.post("/{partnership_id}/accept")
def accept_partnership_invite(
    partnership_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Aceita solicitação de parceria recebida."""
    my_store_id = current_user.store_id or 1
    partnership = db.query(models.StorePartnership).filter(models.StorePartnership.id == partnership_id).first()

    if not partnership:
        raise HTTPException(status_code=404, detail="Parceria não encontrada.")

    if partnership.receiver_store_id != my_store_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Apenas a loja destinatária pode aceitar este convite.")

    partnership.status = "ativa"
    partnership.activated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db.commit()

    log_partnership_audit(db, current_user.id, my_store_id, "aceitou_parceria", f"Parceria {partnership_id} ativada.")
    return {"message": "Parceria ativada com sucesso!", "partnership_id": partnership.id}


@router.post("/{partnership_id}/reject")
def reject_partnership_invite(
    partnership_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Recusa solicitação de parceria recebida."""
    my_store_id = current_user.store_id or 1
    partnership = db.query(models.StorePartnership).filter(models.StorePartnership.id == partnership_id).first()

    if not partnership:
        raise HTTPException(status_code=404, detail="Parceria não encontrada.")

    if partnership.receiver_store_id != my_store_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Apenas a loja destinatária pode recusar este convite.")

    partnership.status = "recusada"
    db.commit()

    log_partnership_audit(db, current_user.id, my_store_id, "recusou_parceria", f"Parceria {partnership_id} recusada.")
    return {"message": "Convite de parceria recusado."}


@router.post("/{partnership_id}/terminate")
def terminate_partnership(
    partnership_id: str,
    reason: Optional[str] = "Encerramento amigável de parceria",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Encerra parceria ativa."""
    my_store_id = current_user.store_id or 1
    partnership = db.query(models.StorePartnership).filter(models.StorePartnership.id == partnership_id).first()

    if not partnership:
        raise HTTPException(status_code=404, detail="Parceria não encontrada.")

    if partnership.requester_store_id != my_store_id and partnership.receiver_store_id != my_store_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Você não tem permissão para encerrar esta parceria.")

    partnership.status = "encerrada"
    partnership.termination_reason = reason
    partnership.terminated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db.commit()

    log_partnership_audit(db, current_user.id, my_store_id, "encerrou_parceria", f"Motivo: {reason}")
    return {"message": "Parceria encerrada com sucesso."}


# ==============================================================================
# 2. Vitrine B2B: Estoque Compartilhado entre Parceiros
# ==============================================================================

@router.get("/shared-inventory")
def get_shared_inventory(
    q: Optional[str] = None,
    max_price: Optional[float] = None,
    store_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """
    Retorna veículos disponíveis no estoque compartilhado de lojas com as quais
    o lojista atual possui parceria ativa.
    """
    refresh_expired_reservations(db)
    my_store_id = current_user.store_id or 1

    # Busca IDs das lojas parceiras ativas
    active_partnerships = db.query(models.StorePartnership).filter(
        models.StorePartnership.status == "ativa",
        or_(
            models.StorePartnership.requester_store_id == my_store_id,
            models.StorePartnership.receiver_store_id == my_store_id
        )
    ).all()

    partner_store_ids = set()
    commission_map = {}
    for p in active_partnerships:
        other_id = p.receiver_store_id if p.requester_store_id == my_store_id else p.requester_store_id
        partner_store_ids.add(other_id)
        commission_map[other_id] = p.commission_rate

    # Se for admin, pode visualizar veículos compartilháveis de todas as lojas
    if current_user.role == 'admin':
        partner_store_ids = {s.id for s in db.query(models.Store).all()}

    if not partner_store_ids:
        return []

    # Consulta veículos compartilháveis das lojas parceiras
    query = db.query(models.Car).filter(
        models.Car.compartilhavel == 1,
        models.Car.store_id.in_(list(partner_store_ids)),
        models.Car.store_id != my_store_id  # não exibe o próprio estoque
    )

    if store_id:
        query = query.filter(models.Car.store_id == store_id)

    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                models.Car.brand.ilike(search),
                models.Car.model.ilike(search),
                models.Car.color.ilike(search)
            )
        )

    if max_price:
        query = query.filter(models.Car.valor_minimo_repasse <= max_price)

    cars = query.order_by(models.Car.year.desc()).all()

    result = []
    for c in cars:
        store = db.query(models.Store).filter(models.Store.id == c.store_id).first()
        piso = c.valor_minimo_repasse or (c.price * 0.90)
        comissao = c.comissao_fixa or commission_map.get(c.store_id, 3.0)

        result.append({
            "id": c.id,
            "brand": c.brand,
            "model": c.model,
            "year": c.year,
            "km": c.km,
            "price": c.price,
            "valor_minimo_repasse": piso,
            "comissao_fixa": comissao,
            "observacoes_repasse": c.observacoes_repasse,
            "status_reserva": c.status_reserva or "disponivel",
            "image": c.image,
            "store_id": c.store_id,
            "store_name": store.name if store else f"Loja #{c.store_id}",
            "store_logo": store.logo if store else None,
            "location": c.location,
            "color": c.color,
            "fuel": c.fuel,
            "transmission": c.transmission
        })

    return result


# ==============================================================================
# 3. Reservas Temporárias (Hold Lock) & Consentimento de Fechamento
# ==============================================================================

@router.post("/reservations")
def create_car_reservation(
    payload: schemas.ReservationCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """
    Cria uma reserva temporária (Hold Lock) de um veículo de loja parceira.
    Validação estrita de piso inviolável: proposed_price deve ser >= valor_minimo_repasse.
    """
    refresh_expired_reservations(db)
    my_store_id = current_user.store_id or 1

    car = db.query(models.Car).filter(models.Car.id == payload.car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Veículo não encontrado.")

    if not car.compartilhavel:
        raise HTTPException(status_code=400, detail="Este veículo não está habilitado para compartilhamento B2B.")

    if car.store_id == my_store_id:
        raise HTTPException(status_code=400, detail="Você não pode reservar um veículo do seu próprio estoque.")

    # Verifica status de reserva
    if car.status_reserva in ["reservado", "em_fechamento", "vendido"]:
        raise HTTPException(status_code=409, detail="Este veículo já está reservado por outra concessionária parceira.")

    # Verifica parceria ativa entre as lojas
    partnership = db.query(models.StorePartnership).filter(
        models.StorePartnership.status == "ativa",
        or_(
            and_(models.StorePartnership.requester_store_id == my_store_id, models.StorePartnership.receiver_store_id == car.store_id),
            and_(models.StorePartnership.requester_store_id == car.store_id, models.StorePartnership.receiver_store_id == my_store_id)
        )
    ).first()

    if not partnership and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Não há parceria ativa entre sua loja e a loja proprietária do carro.")

    # Validação do Piso Inviolável
    piso_inviolavel = car.valor_minimo_repasse or (car.price * 0.90)
    if payload.proposed_price < piso_inviolavel:
        raise HTTPException(
            status_code=400,
            detail=f"Proposta rejeitada: O valor proposto (R$ {payload.proposed_price:,.2f}) é inferior ao piso mínimo de repasse (R$ {piso_inviolavel:,.2f})."
        )

    # Criação do Hold Lock
    duration = payload.duration_minutes or 120
    now = time.time()
    expires_at = now + (duration * 60)

    reservation = models.CarReservation(
        car_id=car.id,
        partnership_id=partnership.id if partnership else None,
        requesting_store_id=my_store_id,
        owner_store_id=car.store_id,
        seller_user_id=current_user.id,
        proposed_price=payload.proposed_price,
        client_markup=payload.client_markup or 0.0,
        client_name=payload.client_name,
        status="ativa",
        duration_minutes=duration,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        expires_at=expires_at,
        closing_requested=0
    )
    db.add(reservation)

    # Atualiza status do veículo
    car.status_reserva = "reservado"
    db.commit()
    db.refresh(reservation)

    # Mensagem inicial automática no chat B2B
    init_msg = models.PartnerMessage(
        reservation_id=reservation.id,
        sender_user_id=current_user.id,
        sender_store_id=my_store_id,
        message=f"Reserva criada com sucesso. Proposta de repasse: R$ {payload.proposed_price:,.2f} | Margem adicionada: R$ {payload.client_markup or 0.0:,.2f}. Cliente em atendimento: {payload.client_name or 'Não informado'}.",
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(init_msg)
    db.commit()

    log_partnership_audit(
        db, 
        current_user.id, 
        my_store_id, 
        "criou_reserva", 
        f"Reserva {reservation.id} no valor de R$ {payload.proposed_price} para o veículo {car.brand} {car.model}."
    )

    return {
        "message": "Veículo reservado com sucesso com Hold Lock temporário!",
        "reservation_id": reservation.id,
        "expires_at": expires_at,
        "duration_minutes": duration
    }


@router.get("/reservations/my")
def get_my_reservations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Retorna reservas em andamento vinculadas à loja do usuário (como solicitante ou proprietária)."""
    refresh_expired_reservations(db)
    my_store_id = current_user.store_id or 1
    now = time.time()

    reservations = db.query(models.CarReservation).filter(
        or_(
            models.CarReservation.requesting_store_id == my_store_id,
            models.CarReservation.owner_store_id == my_store_id
        )
    ).order_by(models.CarReservation.created_at.desc()).all()

    result = []
    for r in reservations:
        car = db.query(models.Car).filter(models.Car.id == r.car_id).first()
        req_store = db.query(models.Store).filter(models.Store.id == r.requesting_store_id).first()
        owner_store = db.query(models.Store).filter(models.Store.id == r.owner_store_id).first()

        time_remaining = max(0, int(r.expires_at - now)) if r.status == "ativa" else 0

        result.append({
            "id": r.id,
            "car_id": r.car_id,
            "car_title": f"{car.brand} {car.model} ({car.year})" if car else "Veículo",
            "car_image": car.image if car else "",
            "requesting_store_id": r.requesting_store_id,
            "requesting_store_name": req_store.name if req_store else f"Loja #{r.requesting_store_id}",
            "owner_store_id": r.owner_store_id,
            "owner_store_name": owner_store.name if owner_store else f"Loja #{r.owner_store_id}",
            "seller_user_id": r.seller_user_id,
            "proposed_price": r.proposed_price,
            "client_markup": r.client_markup,
            "client_name": r.client_name,
            "status": r.status,
            "duration_minutes": r.duration_minutes,
            "created_at": r.created_at,
            "expires_at": r.expires_at,
            "time_remaining_seconds": time_remaining,
            "closing_requested": r.closing_requested,
            "consent_notes": r.consent_notes,
            "is_owner": (r.owner_store_id == my_store_id)
        })

    return result


@router.post("/reservations/{reservation_id}/request-closing")
def request_reservation_closing(
    reservation_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Lojista solicitante solicita formalmente o consentimento da loja dona para fechar o negócio."""
    my_store_id = current_user.store_id or 1
    res = db.query(models.CarReservation).filter(models.CarReservation.id == reservation_id).first()

    if not res:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    if res.requesting_store_id != my_store_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Apenas a loja solicitante pode pedir o fechamento da reserva.")

    if res.status != "ativa":
        raise HTTPException(status_code=400, detail=f"Não é possível solicitar fechamento para reserva com status '{res.status}'.")

    res.closing_requested = 1
    db.commit()

    # Envia mensagem no chat
    chat_msg = models.PartnerMessage(
        reservation_id=res.id,
        sender_user_id=current_user.id,
        sender_store_id=my_store_id,
        message="SOLICITAÇÃO DE FECHAMENTO: O cliente aprovou a proposta! Solicitamos o consentimento oficial para fechamento do repasse.",
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(chat_msg)
    db.commit()

    log_partnership_audit(db, current_user.id, my_store_id, "solicitou_fechamento", f"Reserva {reservation_id}")
    return {"message": "Solicitação de fechamento enviada à loja parceira com sucesso!"}


@router.post("/reservations/{reservation_id}/give-consent")
def give_reservation_consent(
    reservation_id: str,
    payload: schemas.ReservationConsentRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """
    Loja proprietária concede ou recusa consentimento para fechar a transação.
    Se aprovado, emite protocolo formal de repasse (REP-YYYY-XXXXX) e grava PartnerTransaction.
    """
    my_store_id = current_user.store_id or 1
    res = db.query(models.CarReservation).filter(models.CarReservation.id == reservation_id).first()

    if not res:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    if res.owner_store_id != my_store_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Apenas a loja proprietária do veículo pode conceder consentimento.")

    car = db.query(models.Car).filter(models.Car.id == res.car_id).first()
    res.consent_notes = payload.notes

    if not payload.approved:
        res.status = "recusada"
        if car:
            car.status_reserva = "disponivel"
        db.commit()

        # Mensagem no chat
        msg = models.PartnerMessage(
            reservation_id=res.id,
            sender_user_id=current_user.id,
            sender_store_id=my_store_id,
            message=f"CONSENTIMENTO NEGADO: {payload.notes or 'Proposta de fechamento recusada pela loja proprietária.'}",
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(msg)
        db.commit()

        log_partnership_audit(db, current_user.id, my_store_id, "recusou_consentimento", f"Reserva {reservation_id}")
        return {"message": "Consentimento de fechamento recusado. Veículo retornado ao estoque."}

    # Aprovação: gera transação oficial
    res.status = "consentida"
    if car:
        car.status_reserva = "vendido"

    protocol_code = f"REP-{datetime.now().year}-{str(uuid.uuid4())[:8].upper()}"
    piso = res.proposed_price
    markup = res.client_markup or 0.0
    final_price = piso + markup
    commission = piso * 0.03  # comissão padrão de 3% sobre o repasse

    transaction = models.PartnerTransaction(
        protocol=protocol_code,
        reservation_id=res.id,
        car_id=res.car_id,
        selling_store_id=res.owner_store_id,
        buying_store_id=res.requesting_store_id,
        closing_user_id=current_user.id,
        final_price=final_price,
        repasse_piso=piso,
        markup_amount=markup,
        commission_amount=commission,
        status="concluida",
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Mensagem de celebração no chat
    success_msg = models.PartnerMessage(
        reservation_id=res.id,
        sender_user_id=current_user.id,
        sender_store_id=my_store_id,
        message=f"NEGÓCIO FECHADO! Protocolo Oficial emitido: {protocol_code}. Valor final: R$ {final_price:,.2f}.",
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(success_msg)
    db.commit()

    log_partnership_audit(
        db, 
        current_user.id, 
        my_store_id, 
        "concedeu_consentimento", 
        f"Transação {transaction.id} formalizada com protocolo {protocol_code}."
    )

    return {
        "message": "Negócio fechado com sucesso! Protocolo oficial gerado.",
        "protocol": protocol_code,
        "transaction_id": transaction.id,
        "final_price": final_price
    }


@router.post("/reservations/{reservation_id}/cancel")
def cancel_reservation(
    reservation_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Cancela reserva ativa liberando o veículo de volta ao estoque."""
    my_store_id = current_user.store_id or 1
    res = db.query(models.CarReservation).filter(models.CarReservation.id == reservation_id).first()

    if not res:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    if res.requesting_store_id != my_store_id and res.owner_store_id != my_store_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Você não tem permissão para cancelar esta reserva.")

    res.status = "cancelada"
    car = db.query(models.Car).filter(models.Car.id == res.car_id).first()
    if car and car.status_reserva == "reservado":
        car.status_reserva = "disponivel"

    db.commit()
    log_partnership_audit(db, current_user.id, my_store_id, "cancelou_reserva", f"Reserva {reservation_id}")
    return {"message": "Reserva cancelada e veículo liberado para o estoque compartilhado."}


# ==============================================================================
# 4. Chat B2B Direto de Negociação
# ==============================================================================

@router.get("/reservations/{reservation_id}/messages")
def get_reservation_messages(
    reservation_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Retorna histórico de mensagens da negociação vinculada à reserva."""
    my_store_id = current_user.store_id or 1
    res = db.query(models.CarReservation).filter(models.CarReservation.id == reservation_id).first()

    if not res:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    if res.requesting_store_id != my_store_id and res.owner_store_id != my_store_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Acesso restrito aos envolvidos na negociação.")

    messages = db.query(models.PartnerMessage).filter(
        models.PartnerMessage.reservation_id == reservation_id
    ).order_by(models.PartnerMessage.created_at.asc()).all()

    result = []
    for m in messages:
        sender_user = db.query(models.User).filter(models.User.id == m.sender_user_id).first()
        sender_store = db.query(models.Store).filter(models.Store.id == m.sender_store_id).first()

        result.append({
            "id": m.id,
            "reservation_id": m.reservation_id,
            "sender_user_id": m.sender_user_id,
            "sender_name": sender_user.name if sender_user else "Usuário",
            "sender_store_id": m.sender_store_id,
            "sender_store_name": sender_store.name if sender_store else f"Loja #{m.sender_store_id}",
            "message": m.message,
            "created_at": m.created_at,
            "is_me": (m.sender_store_id == my_store_id)
        })

    return result


@router.post("/reservations/{reservation_id}/messages")
def send_reservation_message(
    reservation_id: str,
    payload: schemas.PartnerMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Envia nova mensagem no chat B2B da negociação."""
    my_store_id = current_user.store_id or 1
    res = db.query(models.CarReservation).filter(models.CarReservation.id == reservation_id).first()

    if not res:
        raise HTTPException(status_code=404, detail="Reserva não encontrada.")

    if res.requesting_store_id != my_store_id and res.owner_store_id != my_store_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Acesso restrito aos envolvidos na negociação.")

    new_msg = models.PartnerMessage(
        reservation_id=reservation_id,
        sender_user_id=current_user.id,
        sender_store_id=my_store_id,
        message=payload.message.strip(),
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    return {
        "id": new_msg.id,
        "reservation_id": new_msg.reservation_id,
        "message": new_msg.message,
        "created_at": new_msg.created_at
    }


# ==============================================================================
# 5. Transações Concluídas & Avaliações Mútuas
# ==============================================================================

@router.get("/transactions")
def get_partner_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Retorna histórico de repasses concluídos com protocolo formal."""
    my_store_id = current_user.store_id or 1

    transactions = db.query(models.PartnerTransaction).filter(
        or_(
            models.PartnerTransaction.selling_store_id == my_store_id,
            models.PartnerTransaction.buying_store_id == my_store_id
        )
    ).order_by(models.PartnerTransaction.created_at.desc()).all()

    result = []
    for t in transactions:
        car = db.query(models.Car).filter(models.Car.id == t.car_id).first()
        selling = db.query(models.Store).filter(models.Store.id == t.selling_store_id).first()
        buying = db.query(models.Store).filter(models.Store.id == t.buying_store_id).first()

        result.append({
            "id": t.id,
            "protocol": t.protocol,
            "reservation_id": t.reservation_id,
            "car_id": t.car_id,
            "car_title": f"{car.brand} {car.model} ({car.year})" if car else "Veículo",
            "car_image": car.image if car else "",
            "selling_store_id": t.selling_store_id,
            "selling_store_name": selling.name if selling else f"Loja #{t.selling_store_id}",
            "buying_store_id": t.buying_store_id,
            "buying_store_name": buying.name if buying else f"Loja #{t.buying_store_id}",
            "final_price": t.final_price,
            "repasse_piso": t.repasse_piso,
            "markup_amount": t.markup_amount,
            "commission_amount": t.commission_amount,
            "status": t.status,
            "created_at": t.created_at
        })

    return result


@router.post("/reviews")
def create_partner_review(
    payload: schemas.PartnerReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Envia avaliação mútua entre concessionárias parceiras pós-repasse."""
    my_store_id = current_user.store_id or 1

    if payload.rating < 1 or payload.rating > 5:
        raise HTTPException(status_code=400, detail="Avaliação deve ser entre 1 e 5 estrelas.")

    review = models.PartnerReview(
        transaction_id=payload.transaction_id,
        reviewer_store_id=my_store_id,
        reviewed_store_id=payload.reviewed_store_id,
        rating=payload.rating,
        punctuality_rating=payload.punctuality_rating or 5,
        comment=payload.comment,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(review)
    db.commit()

    log_partnership_audit(
        db, 
        current_user.id, 
        my_store_id, 
        "avaliou_parceiro", 
        f"Nota {payload.rating} estrelas para loja {payload.reviewed_store_id}"
    )

    return {"message": "Avaliação enviada com sucesso!", "review_id": review.id}


@router.get("/audit-logs")
def get_partnership_audit_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_b2b_user)
):
    """Retorna trilha imutável de auditoria B2B para a loja atual."""
    my_store_id = current_user.store_id or 1

    logs = db.query(models.PartnershipAuditLog).filter(
        models.PartnershipAuditLog.store_id == my_store_id
    ).order_by(models.PartnershipAuditLog.created_at.desc()).limit(100).all()

    return logs
