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
import { showcaseCars } from '../data/showcaseData';

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
 */
function resolvePhotos360(raw) {
  if (raw.photos360 && isComplete360Set(raw.photos360)) {
    return raw.photos360;
  }

  // Se for um dos 5 carros oficiais com assets homologados em /images/cars/{id}/
  const idStr = String(raw.id || '');
  if (['sc-001', 'sc-002', 'sc-003', 'sc-004', 'sc-005'].includes(idStr)) {
    const staticOfficial = showcaseCars.find(c => c.id === idStr);
    if (staticOfficial?.photos360) {
      return staticOfficial.photos360;
    }
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
  if (!raw) return null;

  const id = String(raw.id || '');
  const brand = raw.brand || raw.marca || 'Veículo';
  const model = raw.model || raw.modelo || '';
  const name = raw.name || `${brand} ${model}`.trim();
  const year = Number(raw.year || raw.ano || new Date().getFullYear());
  const price = typeof raw.price === 'number' ? raw.price : (parseFloat(String(raw.price || raw.preco || 0).replace(/[^\d.-]/g, '')) || 0);
  const mileage = raw.km !== undefined && raw.km !== null ? Number(raw.km) : (Number(raw.mileage) || 0);
  const image = raw.image || raw.imagem || '/images/placeholder-carro.jpg';
  const color = raw.color || raw.cor || 'Prata';
  const bodyType = raw.body_type || raw.bodyType || 'Particular';
  const storeId = raw.store_id ? `store-${raw.store_id}` : (raw.storeId || 'store-1');
  const photos360 = resolvePhotos360(raw);
  const gallery = resolveGallery(raw, image);

  const originalPrice = raw.original_price || raw.originalPrice || (price > 0 ? price * 1.04 : null);
  const fipePrice = raw.fipe_price || raw.fipePrice || (price > 0 ? price * 1.04 : null);
  const autoPrice = raw.auto_price || raw.autoPrice || (price > 0 ? price * 0.98 : null);

  let priceHistory = [];
  if (Array.isArray(raw.priceHistory)) {
    priceHistory = raw.priceHistory;
  } else if (typeof raw.price_history === 'string' && raw.price_history.startsWith('[')) {
    try {
      priceHistory = JSON.parse(raw.price_history);
    } catch {
      priceHistory = [];
    }
  }

  return {
    id,
    name,
    brand,
    model,
    year,
    price,
    originalPrice,
    priceHistory,
    fipePrice,
    autoPrice,
    color,
    mileage,
    image,
    gallery,
    photos360,
    bodyType,
    icon: Car,
    featured: Boolean(raw.featured ?? true),
    storeId,
    plate: raw.plate || raw.placa || 'ABC1234',
    fipeCode: raw.fipe_code || raw.fipeCode || '004487-3',
    laudoUrl: raw.laudo_url || raw.laudoUrl || null,
    laudoFeedback: raw.laudo_feedback || raw.laudoFeedback || null,
    videoUrl: raw.video_url || raw.videoUrl || null,
    description: raw.description || raw.descricao || 'Veículo com laudo cautelar aprovado e procedência garantida.',
    fullDescription: raw.full_description || raw.fullDescription || raw.description || 'Veículo inspecionado e auditado com laudo cautelar 100% aprovado pela plataforma Automatch.',
    tags: Array.isArray(raw.tags) 
      ? raw.tags 
      : (typeof raw.tags === 'string' && !raw.tags.startsWith('[') ? raw.tags.split(',').map(t => t.trim()).filter(Boolean) : [raw.transmission || 'Automático', 'Certificado']),
    damagePoints: Array.isArray(raw.damagePoints) ? raw.damagePoints : [],
    specs: raw.specs || {
      motor: 'Flex de Alta Performance',
      cambio: raw.transmission || 'Automático',
      combustivel: raw.fuel || 'Flex',
      portas: '4 portas',
      direcao: 'Elétrica Progressiva',
      freios: 'ABS com EBD',
      airbags: '6 airbags',
      tracao: 'Dianteira'
    },
    seller: raw.seller || {
      name: 'Automatch Certified',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Automatch',
      rating: 5.0,
      ads: 12,
      since: '2023'
    },
    // B2B Repasse
    compartilhavel: raw.compartilhavel ?? 0,
    valorMinimoRepasse: raw.valor_minimo_repasse ?? raw.valorMinimoRepasse ?? null,
    comissaoFixa: raw.comissao_fixa ?? raw.comissaoFixa ?? null,
    observacoesRepasse: raw.observacoes_repasse ?? raw.observacoesRepasse ?? null,
    statusReserva: raw.status_reserva || raw.statusReserva || 'disponivel'
  };
}
