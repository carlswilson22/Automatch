/**
 * TourIntroModal.jsx — Modal A de Apresentação da Demonstração Interativa.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para apresentar as instruções e o itinerário de telas antes de iniciar a demonstração,
 *     permanecendo aberto de forma estável até que o usuário decida iniciar ou fechar (sem timer automático).
 *   - Otimizado para alto desempenho (60 FPS): renderização direta com aceleração de hardware e sem camadas pesadas de blur.
 */
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, X, PlayCircle, Clock, Sparkles, ArrowRight
} from 'lucide-react';
import { useTour } from '../../contexts/TourContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTourById } from '../../data/tourGuideData';
import { lockScroll, unlockScroll } from '../../utils/scrollLockCore';

export default function TourIntroModal() {
  const { introModal, closeTourIntro, startDemo } = useTour();
  const { user } = useAuth();
  const modalRef = useRef(null);

  const tourConfig = getTourById(introModal.tourId, user?.role);

  // Gestão de bloqueio de rolagem exclusivo
  useEffect(() => {
    if (introModal.isOpen) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }
  }, [introModal.isOpen]);

  // Focus trap e fechamento por ESC
  useEffect(() => {
    if (!introModal.isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeTourIntro();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [introModal.isOpen, closeTourIntro]);

  // Foco no botão primário ao abrir
  useEffect(() => {
    if (introModal.isOpen && modalRef.current) {
      const primaryBtn = modalRef.current.querySelector('[data-primary-action="true"]');
      if (primaryBtn) {
        primaryBtn.focus();
      }
    }
  }, [introModal.isOpen]);

  if (!introModal.isOpen || !tourConfig) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" role="presentation">
        {/* Backdrop Escurecedor Otimizado (sem blur computacional pesado) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={closeTourIntro}
          className="fixed inset-0 bg-slate-950/80"
          style={{ willChange: 'opacity' }}
          aria-hidden="true"
        />

        {/* Card do Modal A — Renderização Fluida em 60 FPS */}
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-intro-title"
          aria-describedby="tour-intro-desc"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{ willChange: 'opacity, transform' }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-3xl p-6 sm:p-8 text-white shadow-2xl z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-sm">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {tourConfig.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {tourConfig.duration}
                  </span>
                </div>
                <h3 id="tour-intro-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Modo de Demonstração
                </h3>
              </div>
            </div>

            <button
              onClick={closeTourIntro}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer -mr-2 -mt-2"
              aria-label="Fechar modal"
              title="Fechar (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Descrição Principal */}
          <p id="tour-intro-desc" className="relative z-10 text-sm text-slate-300 leading-relaxed font-light mb-6">
            {tourConfig.description} Você navegará pelas telas reais do Automatch com um pop-up interativo explicando cada recurso.
          </p>

          {/* Roteiro das Telas que serão visitadas */}
          <div className="relative z-10 bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 mb-8 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Itinerário da Demonstração ({tourConfig.steps.length} etapas)
            </h4>
            <div className="space-y-2.5">
              {tourConfig.steps.map((st, sIdx) => (
                <div key={st.id} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {sIdx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white block">{st.title}</span>
                    <span className="text-slate-400 text-xs font-light">{st.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ações do Modal A */}
          <div className="relative z-10 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeTourIntro}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Agora Não
            </button>
            <button
              type="button"
              data-primary-action="true"
              onClick={() => startDemo(tourConfig.id)}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Iniciar Demonstração</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
