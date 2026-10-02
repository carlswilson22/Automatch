import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StoreIdentifier from '../components/ui/StoreIdentifier';
import PriceDropBadge from '../components/vehicle/PriceDropBadge';
import AutomatchLogo from '../components/ui/AutomatchLogo';
import FocusInput from '../components/ui/FocusInput';
import SlidingTabs from '../components/ui/SlidingTabs';
import { stores } from '../data/inventoryData';
import { useAuth } from '../contexts/AuthContext';
import { getNewCars, isCarDeleted } from '../data/newCarsManager';
import { toggleFavorite, isFavorite, subscribeFavorites } from '../data/favoritesManager';
import VehicleComparatorModal from '../components/vehicle/VehicleComparatorModal';
import {
  Search, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, Calendar, Gauge, Palette,
  MapPin, Heart, Eye, Zap, Filter, ArrowLeft, LogIn, Scale,
  Car, ChevronDown, X, Star, RotateCcw, Tag, Loader2, LayoutGrid, List
} from 'lucide-react';
import { getVehicleImageUrl, handleVehicleImageError } from '../utils/imageHelper';
import VehicleCardSkeleton from '../components/common/VehicleCardSkeleton';

export const formatMileage = (val) => {
  if (val === undefined || val === null) return '0 km';
  if (typeof val === 'number') return `${val.toLocaleString('pt-BR')} km`;
  const str = String(val).trim();
  if (str.toLowerCase().endsWith('km')) return str;
  const num = Number(str.replace(/\D/g, ''));
  return isNaN(num) || num === 0 ? `${str} km` : `${num.toLocaleString('pt-BR')} km`;
};

export const formatPrice = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.-]+/g, ''));
  return isNaN(num) || num <= 0 ? '' : `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const showcaseCars = [
  { id: 'sc-001', name: 'Toyota Corolla Cross XRX', brand: 'Toyota', year: 2024, price: 185000, fipePrice: 192000, originalPrice: 194000, color: 'Branco Perola', mileage: 12000, storeId: 'store-1', image: '/images/FotoCorollaCross.jpg', bodyType: 'SUV', icon: Car, featured: true, description: 'SUV hibrido flex, pacote de seguranca completo e teto solar.', tags: ['Hibrido Flex', 'Teto Solar', 'Safety Sense'] },
  { id: 'sc-002', name: 'Volkswagen Polo TSI', brand: 'Volkswagen', year: 2023, price: 98000, fipePrice: 104000, originalPrice: 103000, color: 'Vermelho', mileage: 18500, storeId: 'store-2', image: '/images/FotoPoloTSI.jpg', bodyType: 'Hatch', icon: Car, featured: false, description: 'Hatch potente e economico com painel digital.', tags: ['1.0 Turbo', 'Painel Digital', 'VW Play'] },
  { id: 'sc-003', name: 'Hyundai HB20 Platinum', brand: 'Hyundai', year: 2024, price: 105000, color: 'Prata', mileage: 5000, storeId: 'store-3', image: '/images/FotoHyundaiHB20.jpg', bodyType: 'Hatch', icon: Car, featured: true, description: 'Design renovado, excelente acabamento e conectividade avancada.', tags: ['SmartSense', 'Camera de Re', 'Unico Dono'] },
  { id: 'sc-004', name: 'Chevrolet Tracker Premier', brand: 'Chevrolet', year: 2024, price: 152000, color: 'Azul Escuro', mileage: 8500, storeId: 'store-1', image: '/images/FotoChevroletTracker.jpg', bodyType: 'SUV', icon: Car, featured: true, description: 'SUV urbano mais completo da categoria com teto solar panoramico.', tags: ['1.2 Turbo', 'Teto Panoramico', 'Wi-Fi'] },
  { id: 'sc-005', name: 'Fiat Pulse Abarth', brand: 'Fiat', year: 2024, price: 145000, color: 'Vermelho', mileage: 3200, storeId: 'store-2', image: '/images/FotoFiatPulse.jpg', bodyType: 'SUV', icon: Car, featured: true, description: 'O primeiro SUV Abarth do mundo, performance esportiva e design exclusivo.', tags: ['Abarth', 'Turbo 270', 'Esportivo'] },
];

const BRANDS = ['Todas', 'Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jeep', 'Nissan', 'Renault', 'Tesla', 'Toyota', 'Volkswagen', 'BMW', 'Porsche'];
const BODY_TYPES = ['Todos', 'Seda', 'SUV', 'Hatch', 'Picape'];
const YEAR_OPTIONS = ['Todos', '2024', '2023', '2022', '2021', '2020'];
const KM_RANGES = [{ label: 'Qualquer', max: Infinity }, { label: 'Ate 10.000 km', max: 10000 }, { label: 'Ate 30.000 km', max: 30000 }, { label: 'Ate 50.000 km', max: 50000 }];
const PRICE_RANGES = [{ label: 'Qualquer', min: 0, max: Infinity }, { label: 'Ate R$ 80.000', min: 0, max: 80000 }, { label: 'R$ 80.000 a R$ 150.000', min: 80000, max: 150000 }, { label: 'R$ 150.000 a R$ 200.000', min: 150000, max: 200000 }, { label: 'Acima de R$ 200.000', min: 200000, max: Infinity }];

const CarCard = React.memo(({ car, index, viewMode }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(() => isFavorite(car.id));

  useEffect(() => {
    setLiked(isFavorite(car.id));
    return subscribeFavorites((favs) => setLiked(favs.includes(String(car.id))));
  }, [car.id]);

  const handleLike = (e) => { e.stopPropagation(); const updated = toggleFavorite(car.id); setLiked(updated.includes(car.id)); };

  if (viewMode === 'list') {
    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }} className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer flex flex-col md:flex-row" onClick={() => navigate(`/encontrar/${car.id}`)}>
        <div className="relative w-full md:w-80 aspect-[16/10] md:aspect-auto shrink-0 overflow-hidden bg-slate-900">
          <img src={getVehicleImageUrl(car.image || 'placeholder-carro.jpg')} alt={car.name} loading="lazy" decoding="async" onError={handleVehicleImageError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <button onClick={handleLike} aria-label={liked ? 'Remover dos favoritos' : 'Curtir veiculo'} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 border border-slate-200/60 flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"><Heart className={`w-4 h-4 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-400 hover:text-red-500'}`} /></button>
          <div className="absolute top-3 left-3 z-20"><StoreIdentifier storeId={car.storeId} variant="badge" /></div>
        </div>
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex justify-between items-start mb-1 gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-xl font-bold text-slate-800 truncate" title={car.name}>{car.name}</h3>
                  {car.featured && <span title="Destaque" className="inline-flex items-center shrink-0"><Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" /></span>}
                </div>
                {formatPrice(car.price) && <span className="text-xl font-black text-brand-blue whitespace-nowrap shrink-0">{formatPrice(car.price)}</span>}
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5"><Car className="w-3.5 h-3.5" /> {car.bodyType}</p>
            </div>
            <div className="text-right shrink-0"><PriceDropBadge originalPrice={car.originalPrice} currentPrice={car.price} variant="badge" isFeatured={car.featured} /></div>
          </div>
          <div className="flex gap-4 my-3 text-xs text-slate-500 font-medium flex-wrap">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {car.year}</span>
            <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> {formatMileage(car.mileage)}</span>
            <span className="flex items-center gap-1"><Palette className="w-3.5 h-3.5" /> {car.color}</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">{car.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-auto">{car.tags.map(t => <span key={t} className="text-[10px] font-bold text-brand-blue bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{t}</span>)}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }} className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col" onClick={() => navigate(`/encontrar/${car.id}`)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img src={getVehicleImageUrl(car.image || 'placeholder-carro.jpg')} alt={car.name} loading="lazy" decoding="async" onError={handleVehicleImageError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 flex items-end justify-end"><PriceDropBadge originalPrice={car.originalPrice} currentPrice={car.price} variant="badge" isFeatured={car.featured} /></div>
        <button onClick={handleLike} aria-label={liked ? 'Remover dos favoritos' : 'Curtir veiculo'} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 border border-slate-200/60 flex items-center justify-center hover:bg-white transition-colors shadow-sm z-10"><Heart className={`w-4 h-4 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-400 hover:text-red-500'}`} /></button>
        <div className="absolute top-3 left-3 z-20"><StoreIdentifier storeId={car.storeId} variant="badge" /></div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap mb-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <h3 className="text-lg font-bold text-slate-800 leading-tight truncate" title={car.name}>{car.name}</h3>
            {car.featured && <span title="Destaque" className="inline-flex items-center shrink-0"><Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" /></span>}
          </div>
          {formatPrice(car.price) && <span className="text-lg font-black text-brand-blue whitespace-nowrap shrink-0">{formatPrice(car.price)}</span>}
        </div>
        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-3"><Car className="w-3.5 h-3.5" /> {car.bodyType}</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[{ icon: Calendar, val: car.year }, { icon: Gauge, val: formatMileage(car.mileage) }, { icon: Palette, val: car.color }].map((s, i) => (
            <div key={i} className="bg-slate-50 rounded-lg px-2 py-1.5 text-center border border-slate-100"><s.icon className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" /><p className="text-[11px] font-bold text-slate-700 truncate">{s.val}</p></div>
          ))}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-2">{car.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-auto mb-4">{car.tags.map(t => <span key={t} className="text-[10px] font-bold text-brand-blue bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{t}</span>)}</div>
        <button onClick={(e) => { e.stopPropagation(); navigate(`/encontrar/${car.id}`); }} className="w-full py-2.5 bg-brand-blue text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"><Eye className="w-4 h-4" /> Ver Detalhes</button>
      </div>
    </motion.div>
  );
});
CarCard.displayName = 'CarCard';

const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-brand-blue/10 text-brand-blue text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-blue/20">
    {label}<button onClick={onRemove} className="hover:bg-brand-blue/20 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
  </span>
);

const FilterSelect = ({ label, icon: Icon, value, onChange, options }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" /> {label}</label>
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none cursor-pointer pr-8 transition-all">
        {options.map(o => { if (typeof o === 'string') return <option key={o} value={o}>{o}</option>; return <option key={o.value !== undefined ? o.value : o.label} value={o.value !== undefined ? o.value : o.label}>{o.label}</option>; })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    </div>
  </div>
);

const ShowcaseCatalog = () => {
  const catalogRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [allCars, setAllCars] = useState(showcaseCars);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const itemsPerPage = 20;

  const [searchParams] = useSearchParams();
  const urlStoreId = searchParams.get('store');
  const [filterStore, setFilterStore] = useState(urlStoreId || 'Todas');
  const [filterBrand, setFilterBrand] = useState('Todas');
  const [filterType, setFilterType] = useState('Todos');
  const [filterYear, setFilterYear] = useState('Todos');
  const [filterPrice, setFilterPrice] = useState('Qualquer');
  const [filterKm, setFilterKm] = useState('Qualquer');

  useEffect(() => { if (urlStoreId) setFilterStore(urlStoreId); }, [urlStoreId]);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => { const h = setTimeout(() => setDebouncedSearch(searchQuery), 300); return () => clearTimeout(h); }, [searchQuery]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filterStore, filterBrand, filterType, filterYear, filterPrice, filterKm]);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('limit', itemsPerPage.toString());
    if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
    if (filterBrand !== 'Todas') params.set('brand', filterBrand);
    if (filterYear !== 'Todos') { params.set('year_min', filterYear); params.set('year_max', filterYear); }
    if (filterPrice !== 'Qualquer') { const pr = PRICE_RANGES.find(r => r.label === filterPrice); if (pr) { if (pr.min > 0) params.set('price_min', pr.min.toString()); if (pr.max < Infinity) params.set('price_max', pr.max.toString()); } }
    if (filterStore !== 'Todas') { const n = parseInt(filterStore.replace('store-', '')); if (!isNaN(n)) params.set('store_id', n.toString()); }

    fetch(`/api/cars?${params.toString()}`, { signal: AbortSignal.timeout(1200) })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(apiData => {
        const rawItems = Array.isArray(apiData) ? apiData : (apiData?.items || []);
        const serverTotal = typeof apiData?.total === 'number' ? apiData.total : rawItems.length;
        const serverPages = typeof apiData?.pages === 'number' ? apiData.pages : (Math.ceil(serverTotal / itemsPerPage) || 1);
        const local = getNewCars();
        const mapCar = c => ({ id: c.id, name: `${c.brand} ${c.model}`, brand: c.brand, year: c.year, price: typeof c.price === 'number' ? c.price : (parseFloat(c.price) || 0), color: c.color || 'Prata', mileage: c.km ? Number(c.km) : 0, image: c.image || '/images/placeholder-carro.jpg', bodyType: c.body_type || 'Particular', icon: Car, featured: true, description: c.description || 'Veiculo com laudo cautelar aprovado.', tags: [c.transmission || 'Automatico', 'Certificado'], storeId: c.store_id ? `store-${c.store_id}` : 'store-1' });
        const mapLocal = c => { const p = typeof c.preco === 'number' ? c.preco : (parseFloat(String(c.preco).replace(/[^\d]/g, '')) || 0); return { id: c.id, name: `${c.marca} ${c.modelo}`, brand: c.marca, year: c.ano, price: p, color: c.cor || 'Prata', mileage: c.km ? Number(c.km) : 0, image: c.imagem || '/images/placeholder-carro.jpg', bodyType: 'Particular', icon: Car, featured: true, description: c.descricao || 'Veiculo anunciado pelo proprietario.', tags: [c.transmissao || 'Automatico', 'Novidade'], storeId: c.storeId || 'store-1' }; };
        const apiF = rawItems.map(mapCar);
        const localF = local.map(mapLocal);
        let list = [...apiF];
        if (apiF.length === 0 && !debouncedSearch.trim() && filterBrand === 'Todas') list = [...localF, ...showcaseCars];
        else if (currentPage === 1 && localF.length > 0) list = [...localF, ...apiF];
        const unique = Array.from(new Map(list.map(i => [i.id, i])).values()).filter(c => !isCarDeleted(c.id));
        setAllCars(unique);
        setTotalItems(serverTotal > 0 ? serverTotal : unique.length);
        setTotalPages(serverPages > 0 ? serverPages : (Math.ceil(unique.length / itemsPerPage) || 1));
        setIsLoading(false);
      })
      .catch(() => {
        const local = getNewCars();
        const mapLocal = c => { const p = typeof c.preco === 'number' ? c.preco : (parseFloat(String(c.preco).replace(/[^\d]/g, '')) || 0); return { id: c.id, name: `${c.marca} ${c.modelo}`, brand: c.marca, year: c.ano, price: p, color: c.cor || 'Prata', mileage: c.km ? Number(c.km) : 0, image: c.imagem || '/images/placeholder-carro.jpg', bodyType: 'Particular', icon: Car, featured: true, description: c.descricao || 'Veiculo anunciado pelo proprietario.', tags: [c.transmissao || 'Automatico', 'Novidade'], storeId: c.storeId || 'store-1' }; };
        const fallback = [...local.map(mapLocal), ...showcaseCars].filter(c => !isCarDeleted(c.id));
        const filtered = filterStore !== 'Todas' ? fallback.filter(c => c.storeId === filterStore) : fallback;
        setAllCars(filtered); setTotalItems(filtered.length); setTotalPages(Math.ceil(filtered.length / itemsPerPage) || 1); setIsLoading(false);
      });
  }, [currentPage, debouncedSearch, filterBrand, filterYear, filterPrice, filterStore]);

  const activeFilterCount = [filterStore !== 'Todas', filterBrand !== 'Todas', filterType !== 'Todos', filterYear !== 'Todos', filterPrice !== 'Qualquer', filterKm !== 'Qualquer'].filter(Boolean).length;
  const resetFilters = () => { setFilterStore('Todas'); setFilterBrand('Todas'); setFilterType('Todos'); setFilterYear('Todos'); setFilterPrice('Qualquer'); setFilterKm('Qualquer'); setSearchQuery(''); setCurrentPage(1); };

  const results = useMemo(() => {
    let cars = allCars;
    if (filterStore !== 'Todas') cars = cars.filter(c => c.storeId === filterStore);
    if (filterType !== 'Todos') cars = cars.filter(c => c.bodyType === filterType);
    const kmR = KM_RANGES.find(r => r.label === filterKm);
    if (kmR && kmR.max < Infinity) cars = cars.filter(c => c.mileage <= kmR.max);
    return [...cars].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'year') return b.year - a.year;
      if (sortBy === 'km') return a.mileage - b.mileage;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [allCars, filterStore, filterType, filterKm, sortBy]);

  const handlePageChange = (p) => { if (p >= 1 && p <= totalPages && p !== currentPage) { setCurrentPage(p); catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  const renderFilterPanel = () => (
    <div className="space-y-5">
      <FilterSelect label="Loja" icon={MapPin} value={filterStore} onChange={setFilterStore} options={['Todas', ...stores.filter(s => s.name !== 'Escolha Classica').map(s => ({ label: s.name, value: s.id }))]} />
      <FilterSelect label="Marca" icon={Tag} value={filterBrand} onChange={setFilterBrand} options={BRANDS} />
      <FilterSelect label="Tipo de Veiculo" icon={Car} value={filterType} onChange={setFilterType} options={BODY_TYPES} />
      <FilterSelect label="Ano" icon={Calendar} value={filterYear} onChange={setFilterYear} options={YEAR_OPTIONS} />
      <FilterSelect label="Faixa de Preco" icon={Tag} value={filterPrice} onChange={setFilterPrice} options={PRICE_RANGES} />
      <FilterSelect label="Quilometragem" icon={Gauge} value={filterKm} onChange={setFilterKm} options={KM_RANGES} />
      {activeFilterCount > 0 && <button onClick={resetFilters} className="w-full mt-2 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 py-2 rounded-xl border border-slate-200 hover:border-red-200 transition-colors"><RotateCcw className="w-4 h-4" /> Limpar Filtros</button>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <nav className="w-full px-4 sm:px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/')} aria-label="Voltar" className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
          <AutomatchLogo size="md" onClick={() => navigate('/')} />
          <div className="flex-1 max-w-lg mx-auto hidden md:block">
            <FocusInput value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar por marca, modelo, versao ou cor..." icon={Search} rightElement={searchQuery ? (<button onClick={() => setSearchQuery('')} aria-label="Limpar" className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>) : null} />
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setIsComparatorOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors border border-amber-200/60 cursor-pointer active:scale-95" title="Comparar veículos">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              <span>Comparar</span>
            </button>
            <button onClick={() => navigate('/novo-anuncio')} className="text-xs font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full transition-colors">+ Anunciar</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { if (!isAuthenticated) navigate('/login', { state: { from: { pathname: '/favoritos' } } }); else navigate('/favoritos'); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Carros Curtidos"><Heart className="w-5 h-5" /></button>
            {isAuthenticated ? (
              <button onClick={() => navigate('/perfil')} className="flex items-center gap-2.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-full hover:bg-white transition-all group pr-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 group-hover:border-brand-blue transition-colors"><img src={user.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" /></div>
                <span className="text-xs font-bold text-slate-700 hidden sm:block truncate max-w-[100px]">{user.name}</span>
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-full font-bold text-xs transition-all shadow-sm active:scale-95"><LogIn className="w-3.5 h-3.5" /><span>Entrar</span></button>
            )}
            <button onClick={() => setMobileFiltersOpen(true)} className="md:hidden p-2.5 bg-slate-100 rounded-xl relative shrink-0"><Filter className="w-5 h-5 text-slate-600" />{activeFilterCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>}</button>
          </div>
        </div>
      </nav>

      <div className="md:hidden px-4 pt-4 pb-1 max-w-7xl mx-auto w-full">
        <FocusInput value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar por marca, modelo ou versao..." icon={Search} rightElement={searchQuery ? (<button onClick={() => setSearchQuery('')} aria-label="Limpar" className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></button>) : null} />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-brand-navy font-bold"><Filter className="w-5 h-5" /><h2>Filtros</h2>{activeFilterCount > 0 && <span className="ml-auto bg-brand-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeFilterCount}</span>}</div>
            {renderFilterPanel()}
          </div>
        </aside>

        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={() => setMobileFiltersOpen(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl p-6 overflow-y-auto md:hidden">
                <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Filter className="w-5 h-5" /> Filtros</h2><button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button></div>
                {renderFilterPanel()}
                <button onClick={() => setMobileFiltersOpen(false)} className="w-full mt-6 bg-brand-blue text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">Ver {results.length} Resultados</button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main ref={catalogRef} className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-2 border border-brand-blue/20"><Zap className="w-3 h-3" /> Vitrine Digital</div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800">Encontre Seu Carro</h1>
              <p className="text-slate-500 text-sm mt-1">{totalItems} veiculo{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}{totalPages > 1 && <span className="text-slate-400 font-normal ml-2">• Pagina <span className="font-semibold text-slate-700">{currentPage}</span> de <span className="font-semibold text-slate-700">{totalPages}</span></span>}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl px-4 py-2 pr-9 text-xs sm:text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none cursor-pointer shadow-sm transition-all">
                  <option value="featured">Destaques</option><option value="price-asc">Menor Preco</option><option value="price-desc">Maior Preco</option><option value="year">Mais Novo</option><option value="km">Menor KM</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <SlidingTabs tabs={[{ id: 'grid', label: '', icon: LayoutGrid }, { id: 'list', label: '', icon: List }]} activeTab={viewMode} onChange={setViewMode} variant="pill" size="sm" layoutId="catalog-viewmode-tabs" />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {filterStore !== 'Todas' && <FilterChip label={`Loja: ${stores.find(s => s.id === filterStore)?.name || filterStore}`} onRemove={() => setFilterStore('Todas')} />}
              {filterBrand !== 'Todas' && <FilterChip label={`Marca: ${filterBrand}`} onRemove={() => setFilterBrand('Todas')} />}
              {filterType !== 'Todos' && <FilterChip label={`Tipo: ${filterType}`} onRemove={() => setFilterType('Todos')} />}
              {filterYear !== 'Todos' && <FilterChip label={`Ano: ${filterYear}`} onRemove={() => setFilterYear('Todos')} />}
              {filterPrice !== 'Qualquer' && <FilterChip label={filterPrice} onRemove={() => setFilterPrice('Qualquer')} />}
              {filterKm !== 'Qualquer' && <FilterChip label={filterKm} onRemove={() => setFilterKm('Qualquer')} />}
            </div>
          )}

          {isLoading && results.length === 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-5'}>
              {Array.from({ length: 6 }).map((_, idx) => <VehicleCardSkeleton key={idx} viewMode={viewMode} />)}
            </div>
          ) : (
            <>
              {isLoading && <div className="py-2 mb-4 flex items-center justify-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 text-brand-blue animate-spin" /><span className="text-xs font-semibold">Atualizando catalogo...</span></div>}
              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div key={`grid-page-${currentPage}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {results.map((c, i) => <CarCard key={c.id} car={c} index={i} viewMode="grid" />)}
                  </motion.div>
                ) : (
                  <motion.div key={`list-page-${currentPage}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
                    {results.map((c, i) => <CarCard key={c.id} car={c} index={i} viewMode="list" />)}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {results.length === 0 && !isLoading && (
            <div className="w-full py-20 flex flex-col items-center justify-center text-slate-500">
              <Search className="w-12 h-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-600">Nenhum veiculo encontrado.</p>
              <p className="text-sm mt-1">Tente ajustar seus filtros de busca.</p>
              <button onClick={resetFilters} className="mt-4 text-brand-blue font-semibold text-sm hover:underline flex items-center gap-1"><RotateCcw className="w-4 h-4" /> Limpar filtros</button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-sm text-slate-500 font-medium">Pagina <span className="font-bold text-slate-800">{currentPage}</span> de <span className="font-bold text-slate-800">{totalPages}</span><span className="text-slate-400 mx-2">•</span>Total de <span className="font-bold text-slate-800">{totalItems}</span> veiculo{totalItems !== 1 ? 's' : ''}</div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Primeira pagina"><ChevronsLeft className="w-4 h-4" /></button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">Anterior</span></button>
                <div className="flex items-center gap-1">
                  {pageNumbers.map((p, idx) => {
                    if (p === '...') return <span key={`e-${idx}`} className="px-2 text-slate-400 font-bold select-none">...</span>;
                    const isActive = p === currentPage;
                    return <button key={`pg-${p}`} onClick={() => handlePageChange(p)} className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-brand-blue text-white shadow-md shadow-blue-500/25 scale-105' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200'}`}>{p}</button>;
                  })}
                </div>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><span className="hidden sm:inline">Proximo</span><ChevronRight className="w-4 h-4" /></button>
                <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Ultima pagina"><ChevronsRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </main>
      </div>

      {isComparatorOpen && (
        <VehicleComparatorModal
          isOpen={isComparatorOpen}
          onClose={() => setIsComparatorOpen(false)}
          availableVehicles={filteredAndSortedCars}
        />
      )}
    </div>
  );
};

export default ShowcaseCatalog;
