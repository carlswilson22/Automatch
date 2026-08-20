import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, PlusCircle, Car, AlertTriangle } from 'lucide-react';
import { getNewCars } from '../data/newCarsManager';
import { mockCars } from '../data/mockData';

const NewCarCatalog = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Carregar os carros originais e padronizá-los para o formato do novo catálogo
    const formattedOriginalCars = mockCars.map(car => ({
      id: car.id,
      marca: car.brand,
      modelo: car.model,
      ano: car.year,
      preco: car.price,
      km: car.mileage,
      imagem: car.images && car.images.length > 0 ? car.images[0] : '',
      cor: 'Não informada',
      descricao: 'Anúncio Original Automatch'
    }));

    const localCars = getNewCars();
    setCars([...formattedOriginalCars, ...localCars]);
  }, []);

  const filteredCars = cars.filter(car => 
    `${car.marca} ${car.modelo}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <nav className="w-full px-6 py-4 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <ShieldCheck className="w-8 h-8 text-brand-blue" />
          <span className="text-xl font-black tracking-tight text-slate-800 hidden sm:block">AUTOMATCH (Novos Anúncios)</span>
        </div>
        <div className="flex-1 max-w-md mx-6">
          <input
            type="text"
            placeholder="Buscar por marca ou modelo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          onClick={() => navigate('/novo-anuncio')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm sm:text-base"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Criar Anúncio</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Catálogo de Veículos Anunciados</h1>
          <p className="text-slate-500 mt-2">{filteredCars.length} veículos cadastrados pelos usuários.</p>
        </div>

        {filteredCars.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Car className="w-16 h-16 mb-4 text-slate-300" />
            <p className="text-xl font-medium text-slate-600">Nenhum carro encontrado.</p>
            <p className="text-sm mt-2">Que tal ser o primeiro a criar um anúncio?</p>
            <button
              onClick={() => navigate('/novo-anuncio')}
              className="mt-6 bg-blue-100 text-blue-700 px-6 py-2 rounded-lg font-bold hover:bg-blue-200 transition-colors"
            >
              Anunciar Agora
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredCars.map((car) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={car.id}
                  onClick={() => navigate(`/novo-catalogo/${car.id}`)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 flex items-center justify-center">
                    {car.imagem ? (
                      <img
                        src={car.imagem}
                        alt={`${car.marca} ${car.modelo}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Sem+Foto'; }}
                      />
                    ) : (
                      <Car className="w-16 h-16 text-slate-300" />
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{car.marca}</span>
                      <span className="text-xs text-slate-500">{car.ano} • {car.km ? Number(car.km).toLocaleString('pt-BR') : '0'} km</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 leading-tight mb-2 truncate">{car.modelo}</h3>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <p className="text-2xl font-black text-blue-600">
                        R$ {Number(car.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewCarCatalog;
