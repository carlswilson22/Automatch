import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ArrowLeft, Heart, Trash2, Calendar, Gauge, Palette,
  MapPin, Eye, ChevronRight, Car, Scale
} from 'lucide-react';
import { getFavorites, removeFavorite, subscribeFavorites } from '../data/favoritesManager';
import { showcaseCars } from '../data/showcaseData';
import { mockCars } from '../data/mockData';
import { getNewCars } from '../data/newCarsManager';
import VehicleComparatorModal from '../components/vehicle/VehicleComparatorModal';
import ErrorBoundary from '../components/common/ErrorBoundary';

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

    // Carrega carros do backend para resolver IDs do banco de dados
    fetch('/api/cars?limit=100')
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
      bodyType: mock.metadata?.bodyType || 'Sedã', 
      fuel: mock.metadata?.fuel || 'Flex',
      transmission: mock.metadata?.transmission || 'Automático',
      fipePrice: mock.fipePrice || (mock.price ? mock.price * 1.04 : null),
      laudoStatus: mock.laudoStatus || 'Aprovado 100%',
      detranStatus: mock.detranStatus || 'Sem Pendências',
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
      transmission: 'Automático',
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
      image: dbCar.image || '/images/FotoHondaCivic.jpeg',
      bodyType: dbCar.body_type || 'Particular',
      fuel: dbCar.fuel || 'Flex',
      transmission: dbCar.transmission || 'Automático',
      fipePrice: dbCar.price ? dbCar.price * 1.04 : null,
      laudoStatus: 'Aprovado 100%',
      detranStatus: 'Sem Pendências',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <nav className="w-full px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <ShieldCheck className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-black tracking-tight text-white uppercase italic">
                Automatch
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {favoriteCars.length >= 2 && (
              <button
                onClick={() => setIsComparatorOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition-all"
              >
                <Scale className="w-4 h-4" />
                <span>Comparar Veículos ({selectedForCompare.length > 0 ? selectedForCompare.length : '2'})</span>
              </button>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Heart className="w-5 h-5 text-red-400 fill-red-400" />
              <span className="font-bold text-white">{favoriteCars.length}</span>
              <span className="hidden sm:inline">curtido(s)</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <button onClick={() => navigate('/')} className="hover:text-blue-400">Início</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300 font-bold">Carros Curtidos</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-400 fill-red-400" />
              Meus Carros Curtidos
            </h1>
            <p className="text-slate-400 text-sm">
              Os veículos que você marcou como favoritos aparecem aqui para acompanhamento e comparação técnica.
            </p>
          </div>

          {/* Botão de Comparar em Telas Menores */}
          {favoriteCars.length >= 2 && (
            <div className="sm:hidden">
              <button
                onClick={() => setIsComparatorOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg"
              >
                <Scale className="w-4 h-4" />
                <span>Comparar Veículos Selecionados</span>
              </button>
            </div>
          )}
        </div>

        {/* Barra de Seleção do Comparador (quando há 2 ou mais carros curtidos) */}
        {favoriteCars.length >= 2 && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-blue-300">
              <Scale className="w-5 h-5 text-blue-400 shrink-0" />
              <span>
                Selecione de 2 a 3 veículos para confrontar preços FIPE, laudos cautelares, quilometragem anual e dados do DETRAN.
              </span>
            </div>
            <button
              onClick={() => setIsComparatorOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
            >
              Abrir Comparador ({selectedForCompare.length || 2} selecionados)
            </button>
          </div>
        )}

        {favoriteCars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-slate-900 rounded-full mb-6 border border-slate-800">
              <Heart className="w-12 h-12 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Nenhum carro curtido ainda</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-md">
              Explore nossa vitrine e clique no ícone de coração nos veículos que gostar para salvá-los aqui.
            </p>
            <button
              onClick={() => navigate('/encontrar')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
            >
              Explorar Vitrine
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {favoriteCars.map((car) => {
                const isSelected = selectedForCompare.includes(car.id);
                return (
                  <motion.div
                    key={car.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`bg-slate-900 rounded-2xl border overflow-hidden shadow-xl transition-all group relative ${
                      isSelected ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Botão de Seleção para Comparação */}
                      {favoriteCars.length >= 2 && (
                        <button
                          onClick={() => toggleSelectForCompare(car.id)}
                          className={`absolute top-3 left-3 px-2.5 py-1.5 rounded-xl backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                            isSelected 
                              ? 'bg-blue-600 text-white border border-blue-400' 
                              : 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700'
                          }`}
                          title="Selecionar para comparação"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Comparando' : 'Comparar'}</span>
                        </button>
                      )}

                      {/* Botão de Remover */}
                      <button
                        onClick={() => handleRemove(car.id)}
                        className="absolute top-3 right-3 p-2 bg-slate-950/80 backdrop-blur-sm rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all border border-slate-700"
                        title="Remover dos favoritos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {car.bodyType && !favoriteCars.length && (
                        <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase bg-blue-600 text-white px-2.5 py-1 rounded-lg shadow-lg">
                          {car.bodyType}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-white text-sm truncate">{car.name}</h3>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{car.year}</span>
                          <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{typeof car.mileage === 'number' ? car.mileage.toLocaleString('pt-BR') + ' km' : car.mileage}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                        <p className="text-lg font-black text-white">
                          R$ {typeof car.price === 'number' ? car.price.toLocaleString('pt-BR') : car.price}
                        </p>
                        <button
                          onClick={() => navigate(`/encontrar/${car.id}`)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver Anúncio
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

      {/* Modal Comparador Multidimensional com ErrorBoundary */}
      <ErrorBoundary
        title="Comparador Multidimensional Indisponível"
        description="Não foi possível inicializar o comparador para os veículos curtidos. Tente novamente ou desmarque algum veículo."
        onClose={() => setIsComparatorOpen(false)}
      >
        <VehicleComparatorModal
          isOpen={isComparatorOpen}
          onClose={() => setIsComparatorOpen(false)}
          initialVehicles={vehiclesToCompare.length >= 2 ? vehiclesToCompare : favoriteCars.slice(0, 2)}
          availableVehicles={favoriteCars}
        />
      </ErrorBoundary>
    </div>
  );
}
