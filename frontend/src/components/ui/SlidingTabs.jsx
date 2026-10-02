import React from 'react';
import { motion } from 'framer-motion';

/**
 * SlidingTabs
 * Adaptado do padrão MicroKit UI (MIT - Henrique Barone) / Sliding Underline & Content Tabs.
 * Abas com indicador animado via Framer Motion layoutId para transição fluida entre opções.
 */
export default function SlidingTabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pill', // 'pill' | 'underline'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  layoutId = 'sliding-tab-indicator'
}) {
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-2.5 px-5'
  }[size] || 'text-sm py-2 px-4';

  const containerClasses = variant === 'pill'
    ? 'bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 inline-flex items-center gap-1'
    : 'border-b border-slate-200 flex items-center gap-6';

  return (
    <div
      role="tablist"
      className={`${containerClasses} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`relative pb-3 font-bold transition-colors duration-200 flex items-center gap-2 select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md ${
                sizeClasses
              } ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId={layoutId}
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full"
                />
              )}
            </button>
          );
        }

        // Variant: 'pill'
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative font-bold transition-colors duration-200 flex items-center gap-2 select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl ${
              sizeClasses
            } ${
              isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-blue-600 rounded-xl shadow-sm z-0"
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
