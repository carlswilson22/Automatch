import React from 'react';
import { stores } from '../../data/inventoryData';
import { Store, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StoreIdentifier = ({ storeId, variant = 'default', className = "", dark = false }) => {
  const navigate = useNavigate();
  const store = storeId ? stores.find(s => s.id === storeId) : null;

  if (!store) {
    if (variant === 'badge') {
      return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 backdrop-blur-sm border border-slate-700/60 shadow-sm text-slate-300 ${className}`}>
          <div className="w-4 h-4 rounded-full flex items-center justify-center bg-slate-700 text-slate-300 shrink-0">
            <UserCheck className="w-2.5 h-2.5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Vendedor Particular
          </span>
        </div>
      );
    }
    return (
      <div className={`inline-flex items-center gap-1.5 text-slate-500 ${className}`}>
        <div className={`${variant === 'large' ? 'w-6 h-6' : 'w-5 h-5'} rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 shrink-0 text-slate-500`}>
          <UserCheck className="w-3 h-3" />
        </div>
        <span className={`${variant === 'large' ? 'text-sm' : 'text-xs'} font-semibold text-slate-500`}>
          Vendedor Particular
        </span>
      </div>
    );
  }

  const handleClick = (e) => {
    e.stopPropagation();
    navigate(`/encontrar?store=${store.id}`);
  };

  if (variant === 'badge') {
    return (
      <div 
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-sm transition-all hover:bg-white hover:shadow-md cursor-pointer ${className}`}
      >
        <div 
          className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden border shrink-0"
          style={{ borderColor: `${store.color_theme}20`, backgroundColor: `${store.color_theme}10` }}
        >
          {store.logo_url ? (
            <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Store className="w-3" style={{ color: store.color_theme }} />
          )}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-white' : 'text-slate-700'}`}>
          {store.name}
        </span>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className={`inline-flex items-center gap-2 cursor-pointer group ${className}`}
    >
      <div 
        className={`${variant === 'large' ? 'w-8 h-8' : 'w-6 h-6'} rounded-full flex items-center justify-center overflow-hidden border border-slate-100 shrink-0 bg-slate-50 transition-transform group-hover:scale-110`}
      >
        {store.logo_url ? (
          <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <Store className="w-3.5 h-3.5 text-slate-400" />
        )}
      </div>
      <span className={`${variant === 'large' ? 'text-sm' : 'text-xs'} font-semibold ${dark ? 'text-white/90 group-hover:text-white' : 'text-slate-600 group-hover:text-brand-blue'} transition-colors`}>
        {store.name}
      </span>
    </div>
  );
};

export default StoreIdentifier;
