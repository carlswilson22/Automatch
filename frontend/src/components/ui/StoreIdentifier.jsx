import React from 'react';
import { stores } from '../../data/inventoryData';
import { Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StoreIdentifier = ({ storeId, variant = 'default', className = "", dark = false }) => {
  const navigate = useNavigate();
  const store = stores.find(s => s.id === storeId);

  if (!store) return null;

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
