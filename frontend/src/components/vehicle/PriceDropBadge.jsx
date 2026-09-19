import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, TrendingDown, Clock, ChevronDown, CheckCircle2, History, Tag } from 'lucide-react';

export default function PriceDropBadge({
  originalPrice,
  currentPrice,
  priceHistory = [],
  variant = 'badge', // 'badge' | 'detailed'
  className = ''
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const numCurrent = typeof currentPrice === 'number'
    ? currentPrice
    : Number(String(currentPrice || 0).replace(/[^0-9.-]+/g, ''));
  const numOriginal = typeof originalPrice === 'number'
    ? originalPrice
    : Number(String(originalPrice || 0).replace(/[^0-9.-]+/g, ''));

  // Só exibe se houver queda comprovada de preço
  if (!numOriginal || numOriginal <= numCurrent) {
    return null;
  }

  const dropAmount = numOriginal - numCurrent;
  const dropPercent = ((dropAmount / numOriginal) * 100).toFixed(1);

  // Histórico sintetizado ou recebido
  const historyList = (Array.isArray(priceHistory) && priceHistory.length > 0)
    ? priceHistory
    : [
        { date: 'Anúncio Inicial', price: numOriginal, label: 'Preço de cadastro' },
        { date: 'Preço Atual', price: numCurrent, label: `Redução de R$ ${Math.round(dropAmount).toLocaleString('pt-BR')}` }
      ];

  // ── VARIANT: BADGE SIMPLES (para cards da vitrine ou cabeçalhos compactos) ──
  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1 bg-gradient-to-r from-rose-500/20 via-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-full text-xs font-black shadow-sm ${className}`}
        title={`Preço anterior: R$ ${Math.round(numOriginal).toLocaleString('pt-BR')}`}
      >
        <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/30 animate-pulse" />
        <span>Preço Baixou R$ {Math.round(dropAmount).toLocaleString('pt-BR')}</span>
        <span className="text-[10px] bg-orange-500/30 text-orange-200 px-1 rounded font-bold ml-0.5">
          -{dropPercent}%
        </span>
      </span>
    );
  }

  // ── VARIANT: DETAILED (para a página de detalhes do veículo com timeline de reajuste) ──
  return (
    <div className={`bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-950 rounded-2xl border border-orange-500/30 p-4 shadow-xl ${className}`}>
      
      {/* Linha Principal do Badge */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-inner">
            <Flame className="w-5 h-5 fill-orange-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                Preço Baixou
              </span>
              <span className="bg-orange-500/20 text-orange-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-orange-500/30">
                -{dropPercent}%
              </span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5">
              Economia de R$ {Math.round(dropAmount).toLocaleString('pt-BR')}{' '}
              <span className="text-xs text-slate-400 line-through font-normal">
                (de R$ {Math.round(numOriginal).toLocaleString('pt-BR')})
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="text-xs text-orange-300 hover:text-white bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold"
        >
          <History className="w-3.5 h-3.5" />
          <span>{isHistoryOpen ? 'Ocultar Histórico' : 'Ver Histórico'}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Histórico Expansível / Linha do Tempo */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-4 mt-3 border-t border-slate-800 space-y-2 overflow-hidden"
          >
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" /> Linha do Tempo de Reduções
            </h5>

            <div className="space-y-2 pl-2 border-l-2 border-orange-500/30 ml-2">
              {historyList.map((item, idx) => (
                <div key={idx} className="relative pl-4 text-xs">
                  <div className="absolute -left-[13px] top-1.5 w-2 h-2 rounded-full bg-orange-400 shadow-sm shadow-orange-500/50" />
                  <div className="flex justify-between items-center text-slate-300 flex-wrap gap-2">
                    <div>
                      <span className="font-bold text-white">R$ {Number(item.price).toLocaleString('pt-BR')}</span>
                      <span className="text-[11px] text-slate-400 ml-2">({item.date})</span>
                    </div>
                    {item.label && (
                      <span className="text-[10px] text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 font-medium">
                        {item.label}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
