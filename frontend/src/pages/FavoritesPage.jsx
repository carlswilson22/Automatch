import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, Trash2, Calendar, Gauge, Palette,
  Eye, ChevronRight, Car, Scale, Search, Sparkles
} from 'lucide-react';
import { getFavorites, removeFavorite, subscribeFavorites } from '../data/favoritesManager';
import { showcaseCars } from '../data/showcaseData';
import { mockCars } from '../data/mockData';
import { getNewCars } from '../data/newCarsManager';
import { getVehicleImageUrl, handleVehicleImageError } from '../utils/imageHelper';
import ErrorBoundary from '../components/common/ErrorBoundary';
import AutomatchLogo from '../components/ui/AutomatchLogo';
import GlowButton from '../components/ui/GlowButton';

// Code-Splitting: Comparador carregado sob demanda
const VehicleComparatorModal = React.lazy(() => import('../components/vehicle/VehicleComparatorModal'));

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }
};

const formatPrice = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.-]+/g, ''));
  return isNaN(num) || num <= 0 ? '' : `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatMileage = (val) => {
  if (val === undefined || val === null) return '0 km';
  if (typeof val === 'number') return `${val.toLocaleString('pt-BR')} km`;
  return String(val);
};

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [dbCars, setDbCars] = useState([]);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ids = getFavorites();
    setFavoriteIds(ids);
    if (ids.length >= 2) {
      setSelectedForCompare(ids.slice(0, 2));
    }

    const unsub = subscribeFavorites ? subscribeFavorites((newIds) => {
      setFavoriteIds(newIds);
      if (newIds.length >= 2 && selectedForCompare.length === 0) {
        setSelectedForCompare(newIds.slice(0, 2));
      }
    }) : () => {};

    // Carrega carros do backend para resolver IDs do banco de dados (com timeout de 1.2s)
    fetch('/api/cars?limit=100', { signal: AbortSignal.timeout(1200) })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const items = Array.isArray(data) ? data : (data?.items || []);
        setDbCars(items);
      })
      .catch(() => {});

    return unsub;
  }, []);

  // Resolve car objects from all data sources including Postgres API
  const favoriteCars = favoriteIds.map(id => {
    // 1. Check showcaseData
    let car = showcaseCars.find(c => String(c.id) === String(id));
    if (car) return {
      ...car,
      source: 'showcase',
      fipePrice: car.fipePrice || car.price * 1.05,
      laudoStatus: car.laudoStatus || 'Aprovado 100%',
      detranStatus: car.detranStatus || 'IPVA 2026 Quitado'
    };

    // 2. Check mockData
    const mock = mockCars.find(c => String(c.id) === String(id));
    if (mock) return {
      id: mock.id,
      name: `${mock.brand} ${mock.model}`,
      brand: mock.brand,
      model: mock.model,
      year: mock.year,
      price: mock.price,
      mileage: mock.mileage,
      image: mock.images?.[0] || '/images/placeholder-carro.jpg',
      bodyType: mock.metadata?.bodyType || 'Seda',
      fuel: mock.metadata?.fuel || 'Flex',
      transmission: mock.metadata?.transmission || 'Automatico',
      fipePrice: mock.fipePrice || (mock.price ? mock.price * 1.04 : null),
      laudoStatus: mock.laudoStatus || 'Aprovado 100%',
      detranStatus: mock.detranStatus || 'Sem Pendencias',
      source: 'mock'
    };

    // 3. Check localStorage (user-created)
    const local = getNewCars().find(c => String(c.id) === String(id));
    if (local) return {
      id: local.id,
      name: `${local.marca} ${local.modelo}`,
      brand: local.marca,
      model: local.modelo,
      year: local.ano,
      price: local.preco,
      mileage: local.km || 0,
      image: local.imagem || '/images/placeholder-carro.jpg',
      bodyType: 'Particular',
      fuel: 'Flex',
      transmission: 'Automatico',
      fipePrice: local.preco ? local.preco * 1.03 : null,
      laudoStatus: 'Aprovado 100%',
      detranStatus: 'Regularizado',
      source: 'local'
    };

    // 4. Check PostgreSQL Database Cars
    const dbCar = dbCars.find(c => String(c.id) === String(id));
    if (dbCar) return {
      id: dbCar.id,
      name: `${dbCar.brand} ${dbCar.model}`,
      brand: dbCar.brand,
      model: dbCar.model,
      year: dbCar.year,
      price: typeof dbCar.price === 'number' ? dbCar.price : (parseFloat(dbCar.price) || 0),
      mileage: dbCar.km || 0,
      image: dbCar.image || '/images/placeholder-carro.jpg',
      bodyType: dbCar.body_type || 'Particular',
      fuel: dbCar.fuel || 'Flex',
      transmission: dbCar.transmission || 'Automatico',
      fipePrice: dbCar.price ? dbCar.price * 1.04 : null,
      laudoStatus: 'Aprovado 100%',
      detranStatus: 'Sem Pendencias',
      source: 'database'
    };

    return null;
  }).filter(Boolean);

  const handleRemove = (carId) => {
    removeFavorite(carId);
    setFavoriteIds(prev => prev.filter(id => id !== carId));
    setSelectedForCompare(prev => prev.filter(id => id !== carId));
  };

  const toggleSelectForCompare = (carId) => {
    if (selectedForCompare.includes(carId)) {
      setSelectedForCompare(prev => prev.filter(id => id !== carId));
    } else {
      if (selectedForCompare.length >= 3) {
        setSelectedForCompare(prev => [...prev.slice(1), carId]);
      } else {
        setSelectedForCompare(prev => [...prev, carId]);
      }
    }
  };

  const vehiclesToCompare = favoriteCars.filter(c => selectedForCompare.includes(c.id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <nav className="w-full px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors" aria-label="Voltar">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <AutomatchLogo size="md" theme="light" onClick={() => navigate('/')} />
          </div>
          <div className="flex items-center gap-3">
            {favoriteCars.length >= 2 && (
              <button
                onClick={() => setIsComparatorOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition-all active:scale-95"
              >
                <Scale className="w-4 h-4" />
                <span>Comparar Veiculos ({selectedForCompare.length > 0 ? selectedForCompare.length : '2'})</span>
              </button>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              <span className="font-bold text-red-600">{favoriteCars.length}</span>
              <span className="hidden sm:inline text-red-500 text-xs font-medium">curtido(s)</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
          <button onClick={() => navigate('/')} className="hover:text-blue-600 transition-colors">Inicio</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-bold">Carros Curtidos</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3 tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </div>
              Meus Carros Curtidos
            </h1>
            <p className="text-slate-500 text-sm font-light">
              Os veiculos que voce marcou como favoritos aparecem aqui para acompanhamento e comparacao tecnica.
            </p>
          </div>

          {/* Botão de Comparar em Telas Menores */}
          {favoriteCars.length >= 2 && (
            <div className="sm:hidden">
              <button
                onClick={() => setIsComparatorOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition-all active:scale-95"
              >
                <Scale className="w-4 h-4" />
                <span>Comparar Veiculos Selecionados</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Barra de Selecao do Comparador */}
        {favoriteCars.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 text-xs text-blue-700">
              <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                <Scale className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <span className="font-medium">
                Selecione de 2 a 3 veiculos para confrontar precos FIPE, laudos cautelares, quilometragem anual e dados do DETRAN.
              </span>
            </div>
            <button
              onClick={() => setIsComparatorOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap active:scale-95"
            >
              Abrir Comparador ({selectedForCompare.length || 2} selecionados)
            </button>
          </motion.div>
        )}

        {favoriteCars.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="p-6 bg-white rounded-3xl mb-6 border border-slate-200 shadow-card">
              <Heart className="w-14 h-14 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Nenhum carro curtido ainda</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-md font-light leading-relaxed">
              Explore nossa vitrine e clique no icone de coracao nos veiculos que gostar para salva-los aqui.
            </p>
            <GlowButton onClick={() => navigate('/encontrar')} size="lg" icon={Search}>
              Explorar Vitrine
            </GlowButton>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {favoriteCars.map((car, index) => {
                const isSelected = selectedForCompare.includes(car.id);
                return (
                  <motion.div
                    key={car.id}
                    layout
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className={`bg-white rounded-2xl border overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group relative flex flex-col ${
                      isSelected ? 'border-blue-400 ring-2 ring-blue-200' : 'border-slate-200/80'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={getVehicleImageUrl(car.image)}
                        alt={car.name}
                        loading="lazy"
                        decoding="async"
                        onError={handleVehicleImageError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Botao de Selecao para Comparacao */}
                      {favoriteCars.length >= 2 && (
                        <button
                          onClick={() => toggleSelectForCompare(car.id)}
                          className={`absolute top-3 left-3 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                            isSelected
                              ? 'bg-blue-600 text-white border border-blue-400'
                              : 'bg-white/95 text-slate-600 hover:text-blue-600 border border-slate-200/80'
                          }`}
                          title="Selecionar para comparacao"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Comparando' : 'Comparar'}</span>
                        </button>
                      )}

                      {/* Botao de Remover */}
                      <button
                        onClick={() => handleRemove(car.id)}
                        className="absolute top-3 right-3 p-2 bg-white/95 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200/60 shadow-sm"
                        title="Remover dos favoritos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base truncate group-hover:text-blue-600 transition-colors" title={car.name}>{car.name}</h3>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 font-medium">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{car.year}</span>
                          <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{formatMileage(car.mileage)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 rounded-lg px-2 py-1.5 text-center border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-medium">Combustivel</p>
                          <p className="text-[11px] font-bold text-slate-700">{car.fuel || 'Flex'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg px-2 py-1.5 text-center border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-medium">Cambio</p>
                          <p className="text-[11px] font-bold text-slate-700">{car.transmission || 'Automatico'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                        {formatPrice(car.price) && (
                          <p className="text-lg font-black text-blue-600">
                            {formatPrice(car.price)}
                          </p>
                        )}
                        <button
                          onClick={() => navigate(`/encontrar/${car.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shadow-blue-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver Anuncio
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Modal Comparador Multidimensional (Lazy Mounted com Suspense) */}
      <React.Suspense fallback={null}>
        {isComparatorOpen && (
          <ErrorBoundary
            isOpen={isComparatorOpen}
            resetKey={isComparatorOpen ? 'open' : 'closed'}
            title="Comparador Multidimensional Indisponivel"
            description="Nao foi possivel inicializar o comparador para os veiculos curtidos. Tente novamente ou desmarque algum veiculo."
            onClose={() => setIsComparatorOpen(false)}
          >
            <VehicleComparatorModal
              isOpen={isComparatorOpen}
              onClose={() => setIsComparatorOpen(false)}
              initialVehicles={vehiclesToCompare.length >= 2 ? vehiclesToCompare : favoriteCars.slice(0, 2)}
              availableVehicles={favoriteCars}
            />
          </ErrorBoundary>
        )}
      </React.Suspense>
    </div>
  );
}
