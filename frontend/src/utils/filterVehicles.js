/**
 * Pure and Testable Vehicle Filtering & Sorting Engine — Automatch
 *
 * Implementa a fonte única da verdade para filtragem e ordenação (GAR-02).
 */

export const KM_RANGES = [
  { label: 'Qualquer', max: Infinity },
  { label: 'Até 10.000 km', max: 10000 },
  { label: 'Até 30.000 km', max: 30000 },
  { label: 'Até 50.000 km', max: 50000 }
];

export const PRICE_RANGES = [
  { label: 'Qualquer', min: 0, max: Infinity },
  { label: 'Até R$ 80.000', min: 0, max: 80000 },
  { label: 'R$ 80.000 a R$ 150.000', min: 80000, max: 150000 },
  { label: 'R$ 150.000 a R$ 200.000', min: 150000, max: 200000 },
  { label: 'Acima de R$ 200.000', min: 200000, max: Infinity }
];

/**
 * Normaliza strings para comparação imune a acentos e maiúsculas/minúsculas.
 */
export function normalizeString(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normaliza categorias de carroceria para garantir equivalência canônica (ex: Seda/Sedã -> sedan).
 */
export function normalizeBodyType(bodyType) {
  if (!bodyType) return '';
  const norm = normalizeString(bodyType);
  if (norm === 'seda' || norm === 'sedan') {
    return 'sedan';
  }
  return norm;
}

/**
 * Filtra e ordena uma lista de veículos com base nos critérios especificados.
 *
 * @param {Array} vehicles Lista de veículos
 * @param {Object} filters Critérios de filtro
 * @returns {Array} Veículos filtrados e ordenados
 */
export function filterVehicles(vehicles, filters = {}) {
  if (!Array.isArray(vehicles)) return [];

  const {
    store = 'Todas',
    brand = 'Todas',
    bodyType = 'Todos',
    year = 'Todos',
    price = 'Qualquer',
    km = 'Qualquer',
    query = '',
    sortBy = 'featured'
  } = filters;

  const normalizedQuery = normalizeString(query);
  const normalizedBrand = normalizeString(brand);
  const normalizedBodyType = normalizeBodyType(bodyType);

  // Faixas numéricas
  const priceRange = typeof price === 'object' && price !== null
    ? price
    : (PRICE_RANGES.find(r => r.label === price) || { min: 0, max: Infinity });

  const kmRange = typeof km === 'object' && km !== null
    ? km
    : (KM_RANGES.find(r => r.label === km) || { max: Infinity });

  const filtered = vehicles.filter((c) => {
    if (!c) return false;

    // 1. Loja
    if (store !== 'Todas') {
      const targetStore = String(store).replace('store-', '');
      const carStore = String(c.storeId || c.store_id || '').replace('store-', '');
      if (carStore !== targetStore) return false;
    }

    // 2. Marca (normalizada e insensível a caixa/acentos)
    if (brand !== 'Todas') {
      const carBrand = normalizeString(c.brand || c.marca);
      if (carBrand !== normalizedBrand) return false;
    }

    // 3. Tipo de Veículo (Carroceria com normalização canônica)
    if (bodyType !== 'Todos') {
      const carType = normalizeBodyType(c.bodyType || c.body_type);
      if (carType !== normalizedBodyType) return false;
    }

    // 4. Ano (GAR-02: Garantido)
    if (year !== 'Todos') {
      const targetYear = Number(year);
      const carYear = Number(c.year || c.ano);
      if (!isNaN(targetYear) && carYear !== targetYear) return false;
    }

    // 5. Preço (GAR-02: Garantido)
    const carPrice = typeof c.price === 'number' ? c.price : (parseFloat(c.price || c.preco || 0) || 0);
    if (carPrice < priceRange.min || (priceRange.max < Infinity && carPrice > priceRange.max)) {
      return false;
    }

    // 6. Quilometragem
    const carKm = c.mileage !== undefined ? Number(c.mileage) : (Number(c.km) || 0);
    if (kmRange.max < Infinity && carKm > kmRange.max) {
      return false;
    }

    // 7. Busca textual
    if (normalizedQuery) {
      const searchable = normalizeString(
        `${c.name || ''} ${c.brand || ''} ${c.model || ''} ${c.description || ''} ${c.color || ''}`
      );
      if (!searchable.includes(normalizedQuery)) return false;
    }

    return true;
  });

  // Ordenação
  return [...filtered].sort((a, b) => {
    const priceA = typeof a.price === 'number' ? a.price : Number(a.price || 0);
    const priceB = typeof b.price === 'number' ? b.price : Number(b.price || 0);
    const yearA = Number(a.year || 0);
    const yearB = Number(b.year || 0);
    const kmA = Number(a.mileage ?? a.km ?? 0);
    const kmB = Number(b.mileage ?? b.km ?? 0);

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'year') return yearB - yearA;
    if (sortBy === 'km') return kmA - kmB;
    // Padrão: Destaque
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });
}
