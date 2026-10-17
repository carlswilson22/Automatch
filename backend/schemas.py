from datetime import datetime
from typing import List, Optional
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, ConfigDict, field_validator

class CarBase(BaseModel):
    brand: str
    model: str
    year: int
    km: int
    price: float

    # DEF-03: Validação de intervalos — garante consistência entre frontend e backend
    @field_validator("year")
    @classmethod
    def validate_year(cls, v: int) -> int:
        current_year = datetime.now().year
        if v < 1900 or v > current_year + 1:
            raise ValueError(f"Ano inválido: deve estar entre 1900 e {current_year + 1}.")
        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: float) -> float:
        if v < 1.0:
            raise ValueError("Preço inválido: deve ser maior que zero (mínimo R$ 1,00).")
        return v
    image: Optional[str] = "placeholder-carro.jpg"
    store_id: Optional[int] = None
    
    color: Optional[str] = None
    fuel: Optional[str] = None
    transmission: Optional[str] = None
    body_type: Optional[str] = None
    location: Optional[str] = None
    plate: Optional[str] = None
    fipe_code: Optional[str] = None
    description: Optional[str] = None
    full_description: Optional[str] = None
    tags: Optional[str] = None
    laudo_status: Optional[str] = None
    debt_status: Optional[str] = None
    auction_history: Optional[str] = None
    fipe_price: Optional[float] = None
    auto_price: Optional[float] = None
    laudo_url: Optional[str] = None
    laudo_feedback: Optional[str] = None
    video_url: Optional[str] = None
    original_price: Optional[float] = None
    user_id: Optional[str] = None
    compartilhavel: Optional[bool] = False
    valor_minimo_repasse: Optional[float] = None
    comissao_fixa: Optional[float] = None
    observacoes_repasse: Optional[str] = None
    status_reserva: Optional[str] = "disponivel"

class CarSchema(CarBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class CarUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    km: Optional[int] = None
    price: Optional[float] = None
    image: Optional[str] = None
    color: Optional[str] = None
    fuel: Optional[str] = None
    transmission: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    laudo_status: Optional[str] = None
    debt_status: Optional[str] = None
    auction_history: Optional[str] = None
    # B2B Repasse
    compartilhavel: Optional[bool] = None
    valor_minimo_repasse: Optional[float] = None
    comissao_fixa: Optional[float] = None
    observacoes_repasse: Optional[str] = None

class StoreBase(BaseModel):
    name: str
    slug: str
    logo: Optional[str] = None
    description: Optional[str] = None

class StoreSummarySchema(StoreBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class StoreSchema(StoreSummarySchema):
    cars: List[CarSchema] = []

class LaudoWatchlistSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    car_id: str
    placa: str
    last_check: Optional[str] = None
    status: Optional[str] = None

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    # Papel solicitado pelo usuário: apenas 'lojista' ou 'comum'.
    # 'admin' nunca pode ser definido via API pública (ignorado e rejeitado).
    role: Optional[str] = "comum"
    # Nome da loja: obrigatório quando role == 'lojista' (validação feita no endpoint).
    store_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    photo: Optional[str] = None
    memberSince: Optional[str] = None
    role: Optional[str] = "comum"
    sub_role: Optional[str] = None
    store_id: Optional[int] = None
    token: Optional[str] = None


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    photo: Optional[str] = None

class StoreOnboardingRequest(BaseModel):
    name: str
    description: Optional[str] = None
    logo: Optional[str] = None

class CheckoutRequest(BaseModel):
    customer_name: str
    customer_email: Optional[str] = None
    item_description: str
    amount: float
    payment_method: str

class CheckoutResponse(BaseModel):
    protocol: str
    date: str
    item: str
    amount: float
    method: str
    customer: str
    status: str

class LaudoProtocolResponse(BaseModel):
    valido: bool
    protocolo: str
    data_emissao: str
    veiculo: dict
    dados_fipe: Optional[dict] = None
    dados_detran: Optional[dict] = None
    situacao: str


class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class ForgotPasswordResponse(BaseModel):
    message: str
    expires_in: int

class PaginatedCarsResponse(BaseModel):
    items: List[CarSchema]
    total: int
    page: int
    pages: int
    limit: int


# ============================================================================
# SCHEMAS: REDE B2B & CONSULTA DE PLACA
# ============================================================================

class PartnershipInviteRequest(BaseModel):
    receiver_store_id: int
    commission_rate: Optional[float] = 3.0
    notes: Optional[str] = None

class PartnershipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    requester_store_id: int
    receiver_store_id: int
    requester_store_name: Optional[str] = None
    receiver_store_name: Optional[str] = None
    status: str
    commission_rate: float
    notes: Optional[str] = None
    termination_reason: Optional[str] = None
    created_at: str
    activated_at: Optional[str] = None
    is_incoming: Optional[bool] = False

class SharedCarResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    brand: str
    model: str
    year: int
    km: int
    price: float
    valor_minimo_repasse: float
    comissao_fixa: Optional[float] = 3.0
    observacoes_repasse: Optional[str] = None
    status_reserva: str
    image: str
    store_id: int
    store_name: str
    store_logo: Optional[str] = None
    location: Optional[str] = None
    color: Optional[str] = None
    fuel: Optional[str] = None
    transmission: Optional[str] = None

class ReservationCreateRequest(BaseModel):
    car_id: str
    proposed_price: float
    client_markup: Optional[float] = 0.0
    client_name: Optional[str] = None
    duration_minutes: Optional[int] = 120

class ReservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    car_id: str
    car_title: Optional[str] = None
    car_image: Optional[str] = None
    requesting_store_id: int
    requesting_store_name: Optional[str] = None
    owner_store_id: int
    owner_store_name: Optional[str] = None
    seller_user_id: str
    proposed_price: float
    client_markup: float
    client_name: Optional[str] = None
    status: str
    duration_minutes: int
    created_at: str
    expires_at: float
    time_remaining_seconds: Optional[int] = None
    closing_requested: int
    consent_notes: Optional[str] = None
    is_owner: Optional[bool] = False

class ReservationConsentRequest(BaseModel):
    approved: bool
    notes: Optional[str] = None

class PartnerTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    protocol: str
    reservation_id: Optional[str] = None
    car_id: str
    car_title: Optional[str] = None
    car_image: Optional[str] = None
    selling_store_id: int
    selling_store_name: Optional[str] = None
    buying_store_id: int
    buying_store_name: Optional[str] = None
    final_price: float
    repasse_piso: float
    markup_amount: float
    commission_amount: float
    status: str
    created_at: str

class PartnerMessageCreate(BaseModel):
    message: str

class PartnerMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    reservation_id: str
    sender_user_id: str
    sender_name: Optional[str] = None
    sender_store_id: int
    sender_store_name: Optional[str] = None
    message: str
    created_at: str
    is_me: Optional[bool] = False

class PartnerReviewCreate(BaseModel):
    transaction_id: Optional[str] = None
    reviewed_store_id: int
    rating: int
    punctuality_rating: Optional[int] = 5
    comment: Optional[str] = None

class PlateLookupResponse(BaseModel):
    placa: str
    marca: str
    modelo: str
    ano_fabricacao: int
    ano_modelo: int
    cor: str
    combustivel: str
    chassi_parcial: str
    municipio: str
    uf: str
    situacao_veiculo: str
    status_roubo_furto: str
    restricoes_financeiras: str
    historico_leilao: str
    preco_fipe_sugerido: Optional[float] = None
    codigo_fipe: Optional[str] = None
    mes_referencia_fipe: Optional[str] = None
    cache_hit: bool = False
    is_simulado: bool = False

