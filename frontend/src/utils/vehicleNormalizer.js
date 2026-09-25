/**
 * vehicleNormalizer.js
 * Utilitário canônico para harmonizar dados de veículos entre o banco relacional (snake_case/ints)
 * e os mocks estáticos da vitrine (camelCase/strings formatadas).
 * Previne falhas silenciosas de propriedades indefinidas e garante integridade do comparador e TCO.
 */

export function normalizeVehicle(rawCar) {
  if (!rawCar) return null;

  const rawPrice = rawCar.price ?? rawCar.preco ?? 0;
  const numPrice = typeof rawPrice === 'number' 
    ? rawPrice 
    : (Number(String(rawPrice).replace(/[^0-9.-]+/g, '')) || 0);

  const rawFipe = rawCar.fipePrice ?? rawCar.fipe_price ?? (numPrice > 0 ? numPrice * 1.04 : 0);
  const numFipe = typeof rawFipe === 'number' 
    ? rawFipe 
    : (Number(String(rawFipe).replace(/[^0-9.-]+/g, '')) || (numPrice * 1.04));

  const rawKm = rawCar.km ?? rawCar.mileage ?? 0;
  const numKm = typeof rawKm === 'number' 
    ? rawKm 
    : (Number(String(rawKm).replace(/\D/g, '')) || 0);

  const brand = (rawCar.brand || rawCar.marca || '').trim();
  const model = (rawCar.model || rawCar.modelo || '').trim();
  const name = rawCar.name || `${brand} ${model}`.trim() || 'Veículo Automatch';

  // Normalização de tags
  let tags = [];
  if (Array.isArray(rawCar.tags)) {
    tags = rawCar.tags;
  } else if (typeof rawCar.tags === 'string' && rawCar.tags.trim()) {
    try {
      const parsed = JSON.parse(rawCar.tags);
      tags = Array.isArray(parsed) ? parsed : rawCar.tags.split(',').map(t => t.trim());
    } catch {
      tags = rawCar.tags.split(',').map(t => t.trim());
    }
  } else {
    tags = ['Procedência Auditada', 'Laudo Aprovado'];
  }

  return {
    id: String(rawCar.id || ''),
    name,
    brand: brand || name.split(' ')[0] || 'Geral',
    model: model || name.split(' ').slice(1).join(' ') || 'Modelo',
    year: Number(rawCar.year || rawCar.ano || 2024),
    price: numPrice,
    formattedPrice: `R$ ${numPrice.toLocaleString('pt-BR')}`,
    fipePrice: numFipe,
    formattedFipePrice: `R$ ${Math.round(numFipe).toLocaleString('pt-BR')}`,
    mileage: numKm,
    formattedMileage: `${numKm.toLocaleString('pt-BR')} km`,
    color: rawCar.color || rawCar.cor || 'Prata',
    fuel: rawCar.fuel || rawCar.combustivel || 'Flex',
    transmission: rawCar.transmission || rawCar.cambio || 'Automático',
    bodyType: rawCar.bodyType || rawCar.body_type || 'SUV',
    image: rawCar.image || rawCar.imagem || 'FotoGolfGTI.jpeg',
    videoUrl: rawCar.videoUrl || rawCar.video_url || null,
    storeId: Number(rawCar.storeId || rawCar.store_id || 1),
    tags,
    description: rawCar.description || 'Veículo em excelente estado de conservação, revisado e com garantia de procedência.',
    fullDescription: rawCar.fullDescription || rawCar.full_description || rawCar.description || '',
    laudoStatus: rawCar.laudoStatus || rawCar.laudo_status || 'Aprovado',
    debtStatus: rawCar.debtStatus || rawCar.debt_status || 'Sem Débitos',
    auctionHistory: rawCar.auctionHistory || rawCar.auction_history || 'Sem Registro de Leilão',
    // Propriedades B2B
    compartilhavel: Boolean(rawCar.compartilhavel),
    valorMinimoRepasse: typeof rawCar.valor_minimo_repasse === 'number' ? rawCar.valor_minimo_repasse : (Number(rawCar.valorMinimoRepasse) || null),
    comissaoFixa: typeof rawCar.comissao_fixa === 'number' ? rawCar.comissao_fixa : (Number(rawCar.comissaoFixa) || null),
    observacoesRepasse: rawCar.observacoes_repasse || rawCar.observacoesRepasse || '',
    statusReserva: rawCar.status_reserva || rawCar.statusReserva || 'disponivel'
  };
}

export function normalizeVehicleList(cars) {
  if (!Array.isArray(cars)) return [];
  return cars.map(normalizeVehicle).filter(Boolean);
}
