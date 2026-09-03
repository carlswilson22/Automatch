import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Banknote, 
  Search, 
  LayoutGrid, 
  List, 
  ArrowLeft,
  Filter,
  TrendingUp,
  Package,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { stores, inventory } from '../data/inventoryData';
import StoreSelector from '../components/layout/StoreSelector';
import StoreIdentifier from '../components/ui/StoreIdentifier';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filteredInventory = inventory.filter(item => {
    const matchesStore = !selectedStoreId || item.storeId === selectedStoreId;
    const matchesSearch = item.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.plate.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStore && matchesSearch;
  });

  const getStoreStats = () => {
    const totalAssets = filteredInventory.length;
    const totalValue = filteredInventory.reduce((acc, item) => acc + item.sale_value, 0);
    const pendingFinance = filteredInventory.filter(i => i.financial_status === 'pending').length;
    
    return { totalAssets, totalValue, pendingFinance };
  };

  const stats = getStoreStats();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Gestão de Ativos</h1>
              <p className="text-xs text-slate-400 font-medium">B2B Dashboard • {selectedStoreId ? (stores.find(s => s.id === selectedStoreId)?.name || 'Unidade') : 'Visão Geral'}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 min-w-[300px]">
            <div className="flex-1">
              <StoreSelector selectedStoreId={selectedStoreId} onSelect={setSelectedStoreId} />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por modelo ou placa..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-none rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total em Estoque', value: stats.totalAssets, icon: Package, color: 'brand-blue' },
            { label: 'Valor Adensado', value: `R$ ${stats.totalValue.toLocaleString('pt-BR')}`, icon: Banknote, color: 'emerald' },
            { label: 'Pendências Financ.', value: stats.pendingFinance, icon: FileText, color: 'amber' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-brand-blue`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-black text-slate-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Inventory Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Inventário Disponível</h2>
          <div className="bg-white border border-slate-200 rounded-xl flex overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inventory View */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredInventory.map((item, idx) => {
                const store = stores.find(s => s.id === item.storeId);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all group relative"
                  >
                    {/* Store Color Accent */}
                    <div 
                      className="absolute top-0 left-0 bottom-0 w-1 z-10" 
                      style={{ backgroundColor: store?.color_theme || '#2563eb' }}
                    />
                    
                    <div className="aspect-[16/9] overflow-hidden bg-slate-100 relative">
                      <img 
                        src={item.image || '/images/FotoGolfGTI.jpeg'} 
                        alt={item.model} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      
                      {/* Floating Badge */}
                      <div className="absolute top-3 right-3 z-20">
                        <StoreIdentifier storeId={item.storeId} variant="badge" />
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase border border-slate-100">
                          {item.plate}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{item.brand} {item.model}</h3>
                      <p className="text-2xl font-black text-brand-blue mb-4">
                        R$ {item.sale_value.toLocaleString('pt-BR')}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${item.financial_status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                            {item.financial_status === 'paid' ? 'Quitado' : item.financial_status === 'pending' ? 'Pendente' : 'Financiado'}
                          </span>
                        </div>
                        <button className="text-xs font-bold text-brand-blue hover:underline">
                          Gerenciar Ativo
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Ativo</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Unidade</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Placa</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Valor Sugerido</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const store = stores.find(s => s.id === item.storeId);
                    return (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                              <img 
                                src={item.image || '/images/FotoGolfGTI.jpeg'} 
                                alt="" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <span className="font-bold text-slate-700">{item.brand} {item.model}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StoreIdentifier storeId={item.storeId} className="scale-90 origin-left" />
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.plate}</td>
                        <td className="px-6 py-4 font-black text-slate-800">R$ {item.sale_value.toLocaleString('pt-BR')}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${item.financial_status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                              {item.financial_status === 'paid' ? 'Quitado' : item.financial_status === 'pending' ? 'Pendente' : 'Financiado'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
        
        {filteredInventory.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
             <Car className="w-12 h-12 mb-4 opacity-20" />
             <p className="font-medium">Nenhum ativo encontrado para esta unidade.</p>
          </div>
        )}
      </main>
    </div>
  );
}
