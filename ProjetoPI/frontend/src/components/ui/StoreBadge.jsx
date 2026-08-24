import React from 'react';
import { Store } from 'lucide-react';

export default function StoreBadge({ store, onClick }) {
  if (!store) return null;

  return (
    <div 
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick(store.id);
        }
      }}
      className={`
        inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full 
        bg-white/80 backdrop-blur-sm border border-slate-200/50
        shadow-sm transition-all duration-300
        ${onClick ? 'cursor-pointer hover:bg-white hover:shadow-md hover:scale-105 active:scale-95' : ''}
      `}
    >
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden border shrink-0"
        style={{ borderColor: `${store.color_theme}20`, backgroundColor: `${store.color_theme}10` }}
      >
        {store.logo_url ? (
          <img src={store.logo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <Store className="w-3.5 h-3.5" style={{ color: store.color_theme }} />
        )}
      </div>
      <span 
        className="text-[10px] font-bold uppercase tracking-widest text-slate-700"
      >
        {store.name}
      </span>
      
      {/* Visual Accent Dot */}
      <div 
        className="w-1.5 h-1.5 rounded-full ml-0.5"
        style={{ backgroundColor: store.color_theme }}
      />
    </div>
  );
}
