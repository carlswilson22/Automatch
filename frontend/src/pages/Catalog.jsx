import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockCars } from '../data/mockData';
import { ShieldCheck, Filter, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StoreIdentifier from '../components/ui/StoreIdentifier';

const Catalog = () => {
  const navigate = useNavigate();
  const [filterLaudoAprovado, setFilterLaudoAprovado] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering logic
  const filteredCars = mockCars.filter(car => {
    // 1. Text Search
    const matchesSearch = `${car.brand} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Laudo Filter
    // Find laudo timeline item
    const laudoItem = car.timeline.find(t => t.type === 'laudo');
    const isLaudoAprovado = laudoItem && laudoItem.status === 'approved';

    const matchesLaudo = filterLaudoAprovado ? isLaudoAprovado : true;

    return matchesSearch && matchesLaudo;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <nav className="w-full px-6 py-4 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <ShieldCheck className="w-8 h-8 text-brand-blue" />
          <span className="text-xl font-black tracking-tight text-brand-navy hidden sm:block">AUTOMATCH</span>
        </div>
        <div className="flex-1 max-w-md mx-6">
          <input
            type="text"
            placeholder="Buscar por marca ou modelo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-brand-blue focus:outline-none"
          />
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">

        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-brand-navy font-bold">
              <Filter className="w-5 h-5" />
              <h2>Filtros</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="laudo-approved"
                      checked={filterLaudoAprovado}
                      onChange={(e) => setFilterLaudoAprovado(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-emerald focus:ring-brand-emerald cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-emerald transition-colors">Apenas Laudo Aprovado</span>
                  <span className="text-xs text-slate-500 mt-0.5">Sem passagem por leilão ou estrutura danificada.</span>
                </div>
              </label>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <main className="flex-1">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Catálogo de Veículos</h1>
              <p className="text-sm text-slate-500 mt-1">{filteredCars.length} veículos encontrados com transparência total.</p>
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCars.map((car) => {
                const isExcellent = car.trustScore >= 90;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={car.id}
                    onClick={() => navigate(`/vehicle/${car.id}`)}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <img
                        src={car.images[0]}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* TrustScore Badge Overlay */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/40 shadow-sm flex items-center gap-1.5 text-xs font-bold">
                        <ShieldCheck className={`w-4 h-4 ${isExcellent ? 'text-brand-emerald' : 'text-amber-500'}`} />
                        <span className="text-slate-800">Score: {car.trustScore}</span>
                      </div>
                      
                      {/* Store Branding */}
                      <div className="absolute top-3 right-3 z-10">
                        <StoreIdentifier storeId={car.storeId} variant="badge" />
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{car.brand}</span>
                        <span className="text-xs text-slate-500">{car.year} • {car.mileage.toLocaleString('pt-BR')} km</span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 leading-tight mb-4 truncate">{car.model}</h3>

                      <div className="mt-auto">
                        <p className="text-2xl font-black text-brand-navy mb-4">
                          R$ {car.price.toLocaleString('pt-BR')}
                        </p>
                        <div className="w-full py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-brand-blue font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                          Ver Dossiê
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-6 group-hover:ml-0" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filteredCars.length === 0 && (
            <div className="w-full py-20 flex flex-col items-center justify-center text-slate-500">
              <AlertTriangle className="w-12 h-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-600">Nenhum veículo encontrado.</p>
              <p className="text-sm mt-1">Tente ajustar seus filtros de busca.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;
