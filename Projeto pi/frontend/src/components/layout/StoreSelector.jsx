import React from 'react';
import { ChevronDown, Store } from 'lucide-react';
import { stores } from '../../data/inventoryData';

export default function StoreSelector({ selectedStoreId, onSelect }) {
  const selectedStore = stores.find(s => s.id === selectedStoreId);

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 mb-1.5 ml-1">
        <Store className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecionar Unidade</span>
      </div>
      <div className="relative">
        <select
          value={selectedStoreId || ''}
          onChange={(e) => onSelect(e.target.value)}
          className="appearance-none w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:outline-none cursor-pointer pr-10 hover:border-slate-300 transition-all shadow-sm"
        >
          <option value="">Todas as Lojas</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
}
