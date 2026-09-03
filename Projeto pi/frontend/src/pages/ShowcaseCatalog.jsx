import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StoreIdentifier from '../components/ui/StoreIdentifier';
import { stores } from '../data/inventoryData';
import { useAuth } from '../contexts/AuthContext';
import { getNewCars } from '../data/newCarsManager';
import {
  ShieldCheck, Search, ChevronRight, Calendar, Gauge, Palette,
  MapPin, Heart, Eye, Zap, Filter, ArrowLeft, SlidersHorizontal,
  Car, Truck, Battery, ChevronDown, X, Star, RotateCcw, Tag, UserPlus, LogIn, Sparkles
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────
const showcaseCars = [
  {
    id: 'sc-001', name: 'Honda Civic Touring', brand: 'Honda', year: 2023,
    price: 165000, color: 'Branco Perola', mileage: 18500, storeId: 'store-1',
    image: '/images/FotoHondaCivic.jpeg',
    bodyType: 'Sedã',
    icon: Car, featured: true, seller: 'Automatch Premium', location: 'São Paulo, SP',
    description: 'Sedã premium com motor 1.5 turbo de 173cv, câmbio CVT, teto solar, bancos em couro e central multimídia de 9" com wireless Apple CarPlay.',
    tags: ['1.5 Turbo', 'Teto Solar', 'Couro'],
  },
  {
    id: 'sc-003', name: 'Volkswagen Golf GTI', brand: 'Volkswagen', year: 2022,
    price: 215000, color: 'Branco Perola', mileage: 12300, storeId: 'store-1',
    image: '/images/FotoGolfGTI.jpeg', bodyType: 'Hatch',
    icon: Car, featured: true, seller: 'Automatch Sport', location: 'Belo Horizonte, MG',
    description: 'Hatch esportivo com motor 2.0 TSI de 230cv, câmbio DSG de 6 marchas, suspensão esportiva e Cockpit Digital de 10.25".',
    tags: ['2.0 TSI 230cv', 'DSG', 'Cockpit Digital'],
  },
  {
    id: 'sc-005', name: 'Tesla Model 3', brand: 'Tesla', year: 2024,
    price: 289000, color: 'Cinza Grafite', mileage: 5200, storeId: 'store-3',
    image: '/images/FotoTeslaModel3.jpeg', bodyType: 'Elétrico',
    icon: Battery, featured: true, seller: 'Automatch Green', location: 'São Paulo, SP',
    description: 'Sedã 100% elétrico com motor de 283cv, autonomia de 510 km (WLTP), Supercharger e Autopilot de nível 2.',
    tags: ['Elétrico 283cv', '510 km Autonomia', 'Autopilot'],
  },
  {
    id: 'sc-002', name: 'Jeep Compass Limited', brand: 'Jeep', year: 2023,
    price: 189900, color: 'Preto Fosco', mileage: 22000, storeId: 'store-1',
    image: '/images/FotoJeepCompassLimited.jpeg',
    bodyType: 'SUV',
    icon: Car, featured: false, seller: 'Automatch Select', location: 'Rio de Janeiro, RJ',
    description: 'SUV com motor 1.3 turbo flex de 185cv, câmbio automático de 6 marchas, tração 4x4, teto panorâmico e câmera 360°.',
    tags: ['4x4', 'Teto Panorâmico', 'Turbo Flex'],
  },
  {
    id: 'sc-004', name: 'Toyota Hilux SRX', brand: 'Toyota', year: 2022,
    price: 285000, color: 'Branco Pérola', mileage: 38000, storeId: 'store-1',
    image: '/images/FotoNovaHilux.jpeg',
    icon: Truck, featured: false, seller: 'Automatch Work', location: 'Curitiba, PR',
    description: 'Picape com motor 2.8 diesel de 204cv e 500 Nm, tração 4x4 com reduzida, cabine dupla e Toyota Safety Sense.',
    tags: ['Diesel 2.8', '4x4 Reduzida', 'Safety Sense'],
  },
];

const BRANDS = ['Todas', ...new Set(showcaseCars.map(c => c.brand))];
const BODY_TYPES = ['Todos', 'Sedã', 'SUV', 'Hatch', 'Pickup', 'Elétrico'];
const YEAR_OPTIONS = ['Todos', '2024', '2023', '2022', '2021', '2020'];
const KM_RANGES = [
  { label: 'Qualquer', max: Infinity },
  { label: 'Até 10.000 km', max: 10000 },
  { label: 'Até 30.000 km', max: 30000 },
  { label: 'Até 50.000 km', max: 50000 },
];
const PRICE_RANGES = [
  { label: 'Qualquer', min: 0, max: Infinity },
  { label: 'Até R$ 80.000', min: 0, max: 80000 },
  { label: 'R$ 80.000 – R$ 150.000', min: 80000, max: 150000 },
  { label: 'R$ 150.000 – R$ 200.000', min: 150000, max: 200000 },
  { label: 'Acima de R$ 200.000', min: 200000, max: Infinity },
];

// ─── CAR CARD ────────────────────────────────────────────────────────────────
const CarCard = ({ car, index, viewMode }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  // ── LIST VIEW ──
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.06 }}
        className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col md:flex-row"
        onClick={() => navigate(`/encontrar/${car.id}`)}
      >
        <div className="relative w-full md:w-80 aspect-[16/10] md:aspect-auto shrink-0 overflow-hidden bg-slate-100">
          <img 
            src={car.image || '/images/FotoGolfGTI.jpeg'} 
            alt={car.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          {car.featured && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" /> Destaque
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md z-10">
            <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
          </button>

          {/* Store Branding */}
          <div className="absolute top-3 left-3 z-20">
            <StoreIdentifier storeId={car.storeId} variant="badge" />
          </div>
        </div>
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{car.name}</h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5"><car.icon className="w-3.5 h-3.5" /> {car.bodyType}</p>
            </div>
            <p className="text-2xl font-black text-brand-blue whitespace-nowrap">R$ {car.price.toLocaleString('pt-BR')}</p>
          </div>
          <div className="flex gap-4 my-3 text-xs text-slate-500 font-medium flex-wrap">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {car.year}</span>
            <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> {car.mileage.toLocaleString('pt-BR')} km</span>
            <span className="flex items-center gap-1"><Palette className="w-3.5 h-3.5" /> {car.color}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {car.location}</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">{car.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {car.tags.map(t => <span key={t} className="text-[10px] font-bold text-brand-blue bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{t}</span>)}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── GRID VIEW ──
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
      onClick={() => navigate(`/encontrar/${car.id}`)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img 
          src={car.image || '/images/FotoGolfGTI.jpeg'} 
          alt={car.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {car.featured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" /> Destaque
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-10">
          <p className="text-2xl font-black text-white drop-shadow-md">R$ {car.price.toLocaleString('pt-BR')}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md z-10">
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>

        {/* Store Branding */}
        <div className="absolute top-3 left-3 z-20">
          <StoreIdentifier storeId={car.storeId} variant="badge" />
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 leading-tight">{car.name}</h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1 mb-3"><car.icon className="w-3.5 h-3.5" /> {car.bodyType}</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { icon: Calendar, val: car.year },
            { icon: Gauge, val: `${car.mileage.toLocaleString('pt-BR')} km` },
            { icon: Palette, val: car.color },
          ].map((s, i) => (
            <div key={i} className="bg-slate-50 rounded-lg px-2 py-1.5 text-center border border-slate-100">
              <s.icon className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
              <p className="text-[11px] font-bold text-slate-700 truncate">{s.val}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-2">{car.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-auto mb-3">
          {car.tags.map(t => <span key={t} className="text-[10px] font-bold text-brand-blue bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">{t}</span>)}
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium mb-3 border-t border-slate-100 pt-2">
          <span>{car.seller}</span>
          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {car.location}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/encontrar/${car.id}`); }} className="flex-1 py-2.5 bg-brand-blue text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
            <Eye className="w-4 h-4" /> Ver Detalhes
          </button>
          <button className="py-2.5 px-3 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200 transition-colors" onClick={e => e.stopPropagation()}>
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── FILTER CHIP (for active filters) ────────────────────────────────────────
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-brand-blue/10 text-brand-blue text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-blue/20">
    {label}
    <button onClick={onRemove} className="hover:bg-brand-blue/20 rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
  </span>
);

// ─── FILTER SELECT ───────────────────────────────────────────────────────────
const FilterSelect = ({ label, icon: Icon, value, onChange, options }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" /> {label}
    </label>
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none cursor-pointer pr-8 transition-all">
        {options.map(o => {
          if (typeof o === 'string') return <option key={o} value={o}>{o}</option>;
          return <option key={o.value !== undefined ? o.value : o.label} value={o.value !== undefined ? o.value : o.label}>{o.label}</option>;
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    </div>
  </div>
);

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
const ShowcaseCatalog = () => {
  const catalogRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [allCars, setAllCars] = useState(showcaseCars);

  // Load cars from PostgreSQL Backend API + localStorage / fallback
  useEffect(() => {
    fetch('/api/cars')
      .then(res => res.ok ? res.json() : [])
      .then(apiCars => {
        const local = getNewCars();
        let apiFormatted = [];
        if (Array.isArray(apiCars) && apiCars.length > 0) {
          apiFormatted = apiCars.map(c => ({
            id: c.id,
            name: `${c.brand} ${c.model}`,
            brand: c.brand,
            year: c.year,
            price: typeof c.price === 'number' ? `R$ ${c.price.toLocaleString('pt-BR')}` : c.price,
            rawPrice: c.price,
            color: c.color || 'Prata',
            mileage: c.km ? Number(c.km) : 0,
            image: c.image || '/images/FotoHondaCivic.jpeg',
            bodyType: c.body_type || 'Particular',
            icon: Car,
            featured: true,
            seller: 'Veículo Verificado',
            location: c.location || 'São Paulo, SP',
            description: c.description || 'Veículo com laudo cautelar aprovado.',
            tags: [c.transmission || 'Automático', 'Certificado'],
            storeId: c.store_id ? `store-${c.store_id}` : 'store-1',
            plate: c.plate || 'ABC1234',
            fipeCode: c.fipe_code || '004487-3'
          }));
        }

        const localFormatted = local.map(c => ({
          id: c.id,
          name: `${c.marca} ${c.modelo}`,
          brand: c.marca,
          year: c.ano,
          price: c.preco,
          color: c.cor || 'Prata',
          mileage: c.km ? Number(c.km) : 0,
          image: c.imagem || '/images/FotoHondaCivic.jpeg',
          bodyType: 'Particular',
          icon: Car,
          featured: true,
          seller: 'Vendedor Particular',
          location: c.localizacao || 'São Paulo, SP',
          description: c.descricao || 'Veículo anunciado pelo proprietário.',
          tags: [c.transmissao || 'Automático', 'Novidade'],
          storeId: c.storeId || 'store-1',
          plate: 'ABC1234',
          fipeCode: '004487-3'
        }));

        const combined = [...apiFormatted, ...localFormatted, ...showcaseCars];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        setAllCars(unique);
      })
      .catch(() => {
        const local = getNewCars();
        const formatted = local.map(c => ({
          id: c.id,
          name: `${c.marca} ${c.modelo}`,
          brand: c.marca,
          year: c.ano,
          price: c.preco,
          color: c.cor || 'Prata',
          mileage: c.km ? Number(c.km) : 0,
          image: c.imagem || '/images/FotoHondaCivic.jpeg',
          bodyType: 'Particular',
          icon: Car,
          featured: true,
          seller: 'Vendedor Particular',
          location: c.localizacao || 'São Paulo, SP',
          description: c.descricao || 'Veículo anunciado pelo proprietário.',
          tags: [c.transmissao || 'Automático', 'Novidade'],
          storeId: c.storeId || 'store-1'
        }));
        setAllCars([...formatted, ...showcaseCars]);
      });
  }, []);

  // Filter states
  const [searchParams] = useSearchParams();
  const urlStoreId = searchParams.get('store');
  const [filterStore, setFilterStore] = useState(urlStoreId || 'Todas');
  const [filterBrand, setFilterBrand] = useState('Todas');
  const [filterType, setFilterType] = useState('Todos');
  const [filterYear, setFilterYear] = useState('Todos');
  const [filterPrice, setFilterPrice] = useState('Qualquer');
  const [filterKm, setFilterKm] = useState('Qualquer');

  useEffect(() => {
    if (urlStoreId) {
      setFilterStore(urlStoreId);
    }
  }, [urlStoreId]);

  const activeFilterCount = [filterStore !== 'Todas', filterBrand !== 'Todas', filterType !== 'Todos', filterYear !== 'Todos', filterPrice !== 'Qualquer', filterKm !== 'Qualquer'].filter(Boolean).length;

  const resetFilters = () => {
    setFilterStore('Todas');
    setFilterBrand('Todas');
    setFilterType('Todos');
    setFilterYear('Todos');
    setFilterPrice('Qualquer');
    setFilterKm('Qualquer');
    setSearchQuery('');
  };

  const results = useMemo(() => {
    let cars = allCars;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cars = cars.filter(c => `${c.name} ${c.bodyType} ${c.color} ${c.brand}`.toLowerCase().includes(q));
    }
    // Store Filter
    if (filterStore !== 'Todas') cars = cars.filter(c => c.storeId === filterStore);

    // Brand
    if (filterBrand !== 'Todas') cars = cars.filter(c => c.brand === filterBrand);
    // Type
    if (filterType !== 'Todos') cars = cars.filter(c => c.bodyType === filterType);
    // Year
    if (filterYear !== 'Todos') cars = cars.filter(c => c.year === parseInt(filterYear));
    // Price
    const priceRange = PRICE_RANGES.find(r => r.label === filterPrice);
    if (priceRange) cars = cars.filter(c => c.price >= priceRange.min && c.price <= priceRange.max);
    // KM
    const kmRange = KM_RANGES.find(r => r.label === filterKm);
    if (kmRange) cars = cars.filter(c => c.mileage <= kmRange.max);

    // Sort
    return [...cars].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'year') return b.year - a.year;
      if (sortBy === 'km') return a.mileage - b.mileage;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [searchQuery, filterStore, filterBrand, filterType, filterYear, filterPrice, filterKm, sortBy]);

  // ── Filter Sidebar content (reused for desktop & mobile drawer) ──
  const FilterPanel = () => (
    <div className="space-y-5">
      <FilterSelect label="Loja" icon={MapPin} value={filterStore} onChange={setFilterStore} options={['Todas', ...stores.filter(s => s.name !== 'Escolha Clássica').map(s => ({ label: s.name, value: s.id }))]} />
      <FilterSelect label="Marca" icon={Tag} value={filterBrand} onChange={setFilterBrand} options={BRANDS} />
      <FilterSelect label="Tipo de Veículo" icon={Car} value={filterType} onChange={setFilterType} options={BODY_TYPES} />
      <FilterSelect label="Ano" icon={Calendar} value={filterYear} onChange={setFilterYear} options={YEAR_OPTIONS} />
      <FilterSelect label="Faixa de Preço" icon={Tag} value={filterPrice} onChange={setFilterPrice} options={PRICE_RANGES} />
      <FilterSelect label="Quilometragem" icon={Gauge} value={filterKm} onChange={setFilterKm} options={KM_RANGES} />

      {activeFilterCount > 0 && (
        <button onClick={resetFilters}
          className="w-full mt-2 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 py-2 rounded-xl border border-slate-200 hover:border-red-200 transition-colors">
          <RotateCcw className="w-4 h-4" /> Limpar Filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* ── Header ── */}
      <nav className="w-full px-4 sm:px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate('/')}>
            <ShieldCheck className="w-7 h-7 text-brand-blue" />
            <span className="text-lg font-black tracking-tight text-brand-navy hidden sm:block">AUTOMATCH</span>
          </div>
          <div className="flex-1 max-w-lg mx-auto hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, tipo ou cor..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none transition-all" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/planos')}
              className="text-xs font-bold text-slate-600 hover:text-brand-blue flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Planos</span>
            </button>
            <button
              onClick={() => navigate('/novo-anuncio')}
              className="text-xs font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full transition-colors"
            >
              + Anunciar
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/perfil')}
                className="flex items-center gap-2.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-full hover:bg-white transition-all group pr-3"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 group-hover:border-brand-blue transition-colors">
                  <img
                    src={user.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 hidden sm:block truncate max-w-[100px]">
                  {user.name}
                </span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-brand-blue font-semibold text-xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-full font-bold text-xs transition-all shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Cadastrar</span>
                </button>
              </>
            )}

            {/* Mobile filter toggle */}
            <button onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden p-2.5 bg-slate-100 rounded-xl relative shrink-0">
              <Filter className="w-5 h-5 text-slate-600" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-brand-navy font-bold">
              <Filter className="w-5 h-5" />
              <h2>Filtros</h2>
              {activeFilterCount > 0 && (
                <span className="ml-auto bg-brand-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeFilterCount}</span>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* ── Mobile Filter Drawer ── */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={() => setMobileFiltersOpen(false)} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl p-6 overflow-y-auto md:hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Filter className="w-5 h-5" /> Filtros</h2>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <FilterPanel />
                <button onClick={() => setMobileFiltersOpen(false)}
                  className="w-full mt-6 bg-brand-blue text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
                  Ver {results.length} Resultados
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">
          {/* Title bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-2 border border-brand-blue/20">
                <Zap className="w-3 h-3" /> Vitrine Digital
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800">Encontre Seu Carro</h1>
              <p className="text-slate-500 text-sm mt-1">{results.length} veículo{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-9 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none cursor-pointer">
                  <option value="featured">Destaques</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="year">Mais Novo</option>
                  <option value="km">Menor KM</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl flex overflow-hidden">
                <button onClick={() => setViewMode('grid')}
                  className={`px-3 py-2.5 text-sm transition-colors ${viewMode === 'grid' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <SlidersHorizontal className="w-4 h-4 rotate-90" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`px-3 py-2.5 text-sm transition-colors ${viewMode === 'list' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {filterStore !== 'Todas' && <FilterChip label={`Loja: ${stores.find(s => s.id === filterStore)?.name || filterStore}`} onRemove={() => setFilterStore('Todas')} />}
              {filterBrand !== 'Todas' && <FilterChip label={`Marca: ${filterBrand}`} onRemove={() => setFilterBrand('Todas')} />}
              {filterType !== 'Todos' && <FilterChip label={`Tipo: ${filterType}`} onRemove={() => setFilterType('Todos')} />}
              {filterYear !== 'Todos' && <FilterChip label={`Ano: ${filterYear}`} onRemove={() => setFilterYear('Todos')} />}
              {filterPrice !== 'Qualquer' && <FilterChip label={filterPrice} onRemove={() => setFilterPrice('Qualquer')} />}
              {filterKm !== 'Qualquer' && <FilterChip label={filterKm} onRemove={() => setFilterKm('Qualquer')} />}
              <button onClick={resetFilters} className="text-xs text-red-500 font-medium hover:underline ml-1">Limpar todos</button>
            </div>
          )}

          {/* Results */}
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.map((c, i) => <CarCard key={c.id} car={c} index={i} viewMode="grid" />)}
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-5">
                {results.map((c, i) => <CarCard key={c.id} car={c} index={i} viewMode="list" />)}
              </motion.div>
            )}
          </AnimatePresence>

          {results.length === 0 && (
            <div className="w-full py-20 flex flex-col items-center justify-center text-slate-500">
              <Search className="w-12 h-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-600">Nenhum veículo encontrado.</p>
              <p className="text-sm mt-1">Tente ajustar seus filtros de busca.</p>
              <button onClick={resetFilters}
                className="mt-4 text-brand-blue font-semibold text-sm hover:underline flex items-center gap-1">
                <RotateCcw className="w-4 h-4" /> Limpar filtros
              </button>
            </div>
          )}


        </main>
      </div>
    </div>
  );
};

export default ShowcaseCatalog;
