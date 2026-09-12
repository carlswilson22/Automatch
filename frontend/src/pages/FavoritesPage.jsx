import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ArrowLeft, Heart, Trash2, Calendar, Gauge, Palette,
  MapPin, Eye, ChevronRight, Car
} from 'lucide-react';
import { getFavorites, removeFavorite } from '../data/favoritesManager';
import { showcaseCars } from '../data/showcaseData';
import { mockCars } from '../data/mockData';
import { getNewCars } from '../data/newCarsManager';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setFavoriteIds(getFavorites());
  }, []);

  // Resolve car objects from all data sources
  const favoriteCars = favoriteIds.map(id => {
    // Check showcaseData
    let car = showcaseCars.find(c => c.id === id);
    if (car) return { ...car, source: 'showcase' };

    // Check mockData
    const mock = mockCars.find(c => c.id === id);
    if (mock) return {
      id: mock.id, name: `${mock.brand} ${mock.model}`, brand: mock.brand,
      year: mock.year, price: mock.price, mileage: mock.mileage,
      image: mock.images?.[0] || '/images/placeholder-carro.jpg',
      bodyType: mock.metadata?.bodyType || 'Sedã', source: 'mock'
    };

    // Check localStorage (user-created)
    const local = getNewCars().find(c => c.id === id);
    if (local) return {
      id: local.id, name: `${local.marca} ${local.modelo}`, brand: local.marca,
      year: local.ano, price: local.preco, mileage: local.km || 0,
      image: local.imagem || '/images/placeholder-carro.jpg',
      bodyType: 'Particular', source: 'local'
    };

    return null;
  }).filter(Boolean);

  const handleRemove = (carId) => {
    removeFavorite(carId);
    setFavoriteIds(prev => prev.filter(id => id !== carId));
  };

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
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            <span className="font-bold text-white">{favoriteCars.length}</span>
            <span className="hidden sm:inline">curtido(s)</span>
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

        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-400 fill-red-400" />
          Meus Carros Curtidos
        </h1>
        <p className="text-slate-400 text-sm mb-8">Os veículos que você marcou como favoritos aparecem aqui.</p>

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
              {favoriteCars.map((car) => (
                <motion.div
                  key={car.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition-all group"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => handleRemove(car.id)}
                      className="absolute top-3 right-3 p-2 bg-slate-950/80 backdrop-blur-sm rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all border border-slate-700"
                      title="Remover dos favoritos"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {car.bodyType && (
                      <span className="absolute top-3 left-3 text-[10px] font-black uppercase bg-blue-600 text-white px-2.5 py-1 rounded-lg shadow-lg">
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
                    <div className="flex items-center justify-between">
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
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
