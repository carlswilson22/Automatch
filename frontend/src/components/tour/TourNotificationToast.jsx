/**
 * TourNotificationToast.jsx — Notificação discreta e opcional de primeiro acesso para tour guiado.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para sugerir o tour interativo de forma não-intrusiva a novos usuários,
 *     com persistência defensiva em localStorage e opção de dispensar permanentemente.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles, X } from 'lucide-react';

const STORAGE_KEY = 'automatch_tour_preferences';

export default function TourNotificationToast({ onStartTour }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.dismissedOnboardingSuggestion) {
          return;
        }
      }
      // Mostra o toast após 1.5s na primeira visita
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    } catch (_) {
      // Falha silenciosa em caso de restrições de sandbox / private mode
    }
  }, []);

  const handleDismiss = (permanent = true) => {
    setIsVisible(false);
    if (permanent) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ dismissedOnboardingSuggestion: true })
        );
      } catch (_) {}
    }
  };

  const handleAccept = () => {
    handleDismiss(true);
    if (onStartTour) {
      onStartTour('comprar');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-white"
          role="region"
          aria-label="Sugestão de tour guiado"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">
                  Novo por aqui?
                </h4>
                <p className="text-[11px] text-slate-400">
                  Faça um tour rápido de 60s pelo Automatch.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDismiss(true)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer -mr-1 -mt-1"
              aria-label="Dispensar sugestão de tour"
              title="Não mostrar novamente"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => handleDismiss(false)}
              className="min-h-[44px] px-3 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Agora não
            </button>
            <button
              onClick={handleAccept}
              className="min-h-[44px] px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Fazer Tour (60s)
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

