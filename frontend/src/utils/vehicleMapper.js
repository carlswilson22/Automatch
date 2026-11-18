import { vehicleStatusValue } from './vehicleInformation.js';
import { parseVehicleNumber } from './vehicleNumbers.js';
/**
 * vehicleMapper.js — Mapeador de contratos de dados de veículos (Backend -> Frontend).
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para converter estruturas recebidas da API REST nos formatos canônicos esperados
 *     pelos componentes visuais da vitrine e detalhes do carro.
 */
/**
 * Unified Vehicle ViewModel Mapper — Automatch
 *
 * Mapeador central e canônico para converter registros brutos de veículos (API / banco de dados / local)
 * em um modelo padronizado e imutável para a interface do usuário.
 *
 * Resolve de forma definitiva o problema de montagem duplicada em múltiplos componentes (GAR-03),
 * garantindo a preservação integral de photos360, laudo cautelar, histórico e metadados.
 */

import { Car } from 'lucide-react';
import { showcaseCars } from '../data/showcaseData.js';

// Conjunto canônico de ângulos da varredura 360° orbital
export const ORBITAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * Valida se um conjunto de photos360 é autêntico e completo (contém os 8 ângulos válidos).
 */
export function isComplete360Set(photos360) {
  if (!photos360 || typeof photos360 !== 'object') return false;
  const angles = Object.keys(photos360).map(Number);
  const hasAllAngles = ORBITAL_ANGLES.every(a => angles.includes(a) && typeof photos360[a] === 'string' && photos360[a].trim().length > 0);
  if (!hasAllAngles) return false;

  // Garante que não é a mesma foto repetida em todos os ângulos
  const uniqueUrls = new Set(ORBITAL_ANGLES.map(a => photos360[a]));
  return uniqueUrls.size >= 4; // Mínimo de 4 ângulos distintos para considerar varredura orbital real
}

/**
 * Obtém conjunto oficial de photos360 caso o veículo seja um dos modelos homologados.
 * Suporta IDs no formato 'sc-001' (catálogo local) ou numérico 1–5 (API REST).
 */
function resolvePhotos360(raw) {
  if (raw.photos360 && isComplete360Set(raw.photos360)) {
    return raw.photos360;
  }

  // Normaliza id: aceita 'sc-001' ou numérico 1–5 → 'sc-001'
  const idStr = String(raw.id || '');
  const numericId = parseInt(idStr, 10);
  const normalizedId = idStr.startsWith('sc-')
    ? idStr
    : (!isNaN(numericId) && numericId >= 1 && numericId <= 5)
      ? `sc-00${numericId}`
      : null;

  if (normalizedId && ['sc-001', 'sc-002', 'sc-003', 'sc-004', 'sc-005'].includes(normalizedId)) {
    const staticOfficial = showcaseCars.find(c => c.id === normalizedId);
    if (staticOfficial?.photos360) {
      return staticOfficial.photos360;
    }
  }

  // Fallback por nome: resolve veículos cujo ID não segue a convenção mas o nome bate
  if (raw.name || (raw.brand && raw.model)) {
    const searchName = (raw.name || `${raw.brand || ''} ${raw.model || ''}`).toLowerCase().trim();
    const byName = showcaseCars.find(c =>
      c.name.toLowerCase().includes(searchName) || searchName.includes(c.name.toLowerCase())
    );
    if (byName?.photos360) {
      return byName.photos360;
    }
  }

  if (import.meta.env?.DEV) {

    console.warn(`[Automatch 360°] photos360 não resolvido para id="${idStr}" — varredura orbital indisponível.`);
  }

  return null;
}

/**
 * Normaliza e sanitiza a galeria de fotos.
 */
function resolveGallery(raw, mainImage) {
  if (Array.isArray(raw.gallery) && raw.gallery.length > 0) {
    return raw.gallery;
  }
  if (Array.isArray(raw.images) && raw.images.length) return raw.images;
  if (typeof raw.tags === 'string' && raw.tags.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw.tags);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // Ignora tags não JSON
    }
  }
  return mainImage ? [mainImage] : ['/images/placeholder-carro.jpg'];
}

/**
 * Mapeia qualquer registro de veículo da API ou armazenamento local para o ViewModel da UI.
 */
export function mapVehicleToViewModel(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const id = String(raw.id ?? '');
  const brand = raw.brand || raw.marca || 'Veículo';
  const model = raw.model || raw.modelo || '';
  const price = parseVehicleNumber(raw.price ?? raw.preco);
  const mileage = parseVehicleNumber(raw.mileage ?? raw.km, null);
  const image = raw.image || raw.imagem || raw.images?.[0] || '/images/placeholder-carro.jpg';
  const body = raw.bodyType || raw.body_type || raw.metadata?.bodyType || 'Não informado';
  const specs = { ...(raw.specs || {}) };
  const fuel = raw.fuel || raw.combustivel || specs.combustivel || raw.metadata?.fuel;
  const transmission = raw.transmission || raw.transmissao || raw.cambio || specs.cambio || raw.metadata?.transmission;
  if (!specs.motor && raw.metadata?.engine) specs.motor = raw.metadata.engine;
  if (!specs.combustivel && fuel) specs.combustivel = fuel;
  if (!specs.cambio && transmission) specs.cambio = transmission;
  let tags = Array.isArray(raw.tags) ? raw.tags : [];
  if (typeof raw.tags === 'string' && !raw.tags.startsWith('[')) tags = raw.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  let priceHistory = Array.isArray(raw.priceHistory) ? raw.priceHistory : [];
  if (typeof raw.price_history === 'string') {
    try { const parsed = JSON.parse(raw.price_history); if (Array.isArray(parsed)) priceHistory = parsed; } catch { /* Preserve missing history. */ }
  }
  const rawOriginal = parseVehicleNumber(raw.originalPrice ?? raw.original_price, null);
  const store = raw.storeId ?? raw.store_id;
  return {
    ...raw,
    id, brand, model, name: raw.name || `${brand} ${model}`.trim(),
    year: parseVehicleNumber(raw.year ?? raw.ano, null), price, mileage,
    originalPrice: rawOriginal != null && rawOriginal > price ? rawOriginal : null,
    priceHistory,
    fipePrice: parseVehicleNumber(raw.fipePrice ?? raw.fipe_price, null),
    fipeCode: raw.fipeCode || raw.fipe_code || null,
    fipeReference: raw.fipeReference || raw.mes_referencia_fipe || null,
    autoPrice: parseVehicleNumber(raw.autoPrice ?? raw.auto_price, null),
    color: raw.color || raw.cor || 'Não informado', fuel: fuel || 'Não informado', transmission: transmission || 'Não informado',
    image, gallery: resolveGallery(raw, image), photos360: resolvePhotos360(raw),
    bodyType: ['seda', 'sedã'].includes(String(body).trim().toLowerCase()) ? 'Sedan' : body,
    icon: Car, featured: Boolean(raw.featured ?? true),
    storeId: store == null ? null : String(store).startsWith('store-') ? String(store) : `store-${store}`,
    plate: raw.plate || raw.placa || '',
    laudoUrl: raw.laudoUrl || raw.laudo_url || null,
    laudoFeedback: raw.laudoFeedback || raw.laudo_feedback || null,
    laudoStatus: vehicleStatusValue(raw.laudoStatus ?? raw.laudo_status ?? raw.laudo),
    debtStatus: vehicleStatusValue(raw.debtStatus ?? raw.debt_status ?? raw.debitos),
    auctionHistory: vehicleStatusValue(raw.auctionHistory ?? raw.auction_history ?? raw.leilao),
    videoUrl: raw.videoUrl || raw.video_url || null,
    description: raw.description || raw.descricao || '',
    fullDescription: raw.fullDescription || raw.full_description || raw.description || raw.descricao || '',
    tags, damagePoints: Array.isArray(raw.damagePoints) ? raw.damagePoints : [], specs,
    seller: raw.seller || { name: 'Anunciante', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Anunciante', rating: null, ads: null, since: 'Não informado' },
    compartilhavel: raw.compartilhavel ?? false,
    valorMinimoRepasse: raw.valorMinimoRepasse ?? raw.valor_minimo_repasse ?? null,
    comissaoFixa: raw.comissaoFixa ?? raw.comissao_fixa ?? null,
    observacoesRepasse: raw.observacoesRepasse ?? raw.observacoes_repasse ?? null,
    statusReserva: raw.statusReserva || raw.status_reserva || 'disponivel'
  };
}
