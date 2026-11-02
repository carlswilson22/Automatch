/**
 * AutomatchTour.jsx — Componente de Tour Guiado Interativo com Spotlight e Acessibilidade Plena.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para substituir textos longos da plataforma por uma experiência visual interativa passo a passo,
 *     com destaque visual (spotlight) nos elementos reais, navegação fluida por rotas e total conformidade com WCAG AAA.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, ChevronRight, ChevronLeft, X, Sparkles, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getTourById } from '../../data/tourGuideData';
import { lockScroll, unlockScroll } from '../../utils/scrollLockCore';

const SPOTLIGHT_PADDING = 8;
const MAX_WAIT_TIMEOUT_MS = 2500;

export default function AutomatchTour({
  isOpen,
  tourId,
  onClose,
  initialStepIndex = 0
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [stepIndex, setStepIndex] = useState(initialStepIndex);
  const [targetRect, setTargetRect] = useState(null);
  const [isCenteredFallback, setIsCenteredFallback] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const dialogRef = useRef(null);
  const triggerElementRef = useRef(null);
  const tourConfig = getTourById(tourId, user?.role);
  const steps = tourConfig?.steps || [];
  const currentStep = steps[stepIndex];

  // Verifica preferência de movimento reduzido
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Salva o elemento que disparou o tour para devolução de foco
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement;
      setStepIndex(initialStepIndex);
    }
  }, [isOpen, initialStepIndex]);

  // Gestão estrita do bloqueio de rolagem central
  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }
  }, [isOpen]);

  // Localiza e mede o elemento-alvo no DOM
  const measureTarget = useCallback(() => {
    if (!currentStep) return;

    const element = document.querySelector(`[data-tour="${currentStep.targetAnchor}"]`);
    if (!element) {
      setIsCenteredFallback(true);
      setTargetRect(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 &&
      window.getComputedStyle(element).display !== 'none' &&
      window.getComputedStyle(element).visibility !== 'hidden';

    if (!isVisible) {
      setIsCenteredFallback(true);
      setTargetRect(null);
      return;
    }

    // Rolagem suave até o elemento se necessário
    if (!prefersReducedMotion) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    } else {
      element.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
    }

    // Medição calibrada com respiro
    const updatedRect = element.getBoundingClientRect();
    setTargetRect({
      top: updatedRect.top - SPOTLIGHT_PADDING,
      left: updatedRect.left - SPOTLIGHT_PADDING,
      width: updatedRect.width + (SPOTLIGHT_PADDING * 2),
      height: updatedRect.height + (SPOTLIGHT_PADDING * 2),
      right: updatedRect.right + SPOTLIGHT_PADDING,
      bottom: updatedRect.bottom + SPOTLIGHT_PADDING,
    });
    setIsCenteredFallback(false);
  }, [currentStep, prefersReducedMotion]);

  // Monitora transição de rotas e carregamento assíncrono do elemento
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    // Se o passo requer outra rota, navega
    if (currentStep.targetRoute && location.pathname !== currentStep.targetRoute) {
      setIsNavigating(true);
      navigate(currentStep.targetRoute);
      return;
    }

    setIsNavigating(false);

    // Tenta medir imediatamente ou aguarda até MAX_WAIT_TIMEOUT_MS
    let attempts = 0;
    const maxAttempts = 25; // 25 x 100ms = 2.5s
    const timer = setInterval(() => {
      attempts++;
      const el = document.querySelector(`[data-tour="${currentStep.targetAnchor}"]`);
      if (el || attempts >= maxAttempts) {
        clearInterval(timer);
        measureTarget();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isOpen, currentStep, location.pathname, navigate, measureTarget]);

  // Recalcula medição ao redimensionar a janela
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => measureTarget();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, measureTarget]);

  // Encerramento seguro do tour e devolução de foco
  const handleClose = useCallback(() => {
    if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
      try {
        triggerElementRef.current.focus();
      } catch (_) {}
    }
    onClose();
  }, [onClose]);

  // Navegação para o próximo passo
  const handleNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  }, [stepIndex, steps.length, handleClose]);

  // Navegação para o passo anterior
  const handlePrev = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  }, [stepIndex]);

  // Atalhos de teclado acessíveis (Tab Trap, Escape, Setas)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key === 'ArrowRight' || (e.key === 'Enter' && e.target.tagName !== 'BUTTON')) {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
        return;
      }

      // Focus trap dentro do diálogo
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handleNext, handlePrev]);

  // Leva o foco para o diálogo na mudança de passo
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen, stepIndex]);

  if (!isOpen || !tourConfig || steps.length === 0 || !currentStep) {
    return null;
  }

  // Cálculo da posição do balão
  let popoverStyle = {};
  if (isCenteredFallback || !targetRect) {
    popoverStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: 'min(92vw, 420px)',
    };
  } else {
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const preferBottom = spaceBelow >= 260 || spaceBelow >= spaceAbove;

    const verticalTop = preferBottom
      ? Math.min(window.innerHeight - 280, targetRect.bottom + 14)
      : Math.max(16, targetRect.top - 240);

    const horizontalLeft = Math.max(
      16,
      Math.min(window.innerWidth - 420, targetRect.left)
    );

    popoverStyle = {
      position: 'fixed',
      top: `${verticalTop}px`,
      left: `${horizontalLeft}px`,
      maxWidth: 'min(92vw, 400px)',
    };
  }

  const progressPercent = ((stepIndex + 1) / steps.length) * 100;

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-auto" role="presentation">
      {/* SVG Mask Spotlight Overlay */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-auto"
        style={{ zIndex: 9998 }}
        aria-hidden="true"
      >
        <defs>
          <mask id="spotlight-mask">
            {/* Base escura total */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Recorte transparente no elemento-alvo */}
            {targetRect && !isCenteredFallback && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="14"
                ry="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Camada semitransparente escurecedora */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.78)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Anel de Destaque Pulsante ao Redor do Elemento */}
      {targetRect && !isCenteredFallback && (
        <div
          className="fixed pointer-events-none rounded-2xl ring-2 ring-cyan-400/80 shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300"
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            zIndex: 9999,
          }}
          aria-hidden="true"
        />
      )}

      {/* Balão do Tour (Popover Acessível) */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-desc"
        tabIndex={-1}
        style={{ ...popoverStyle, zIndex: 10000 }}
        className="w-full bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-white outline-none focus:ring-2 focus:ring-cyan-400/50"
      >
        {/* Barra de Progresso no Topo */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          />
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3" />
              {tourConfig.badge}
            </span>
            <span className="text-xs text-slate-400 font-semibold" aria-live="polite">
              Passo {stepIndex + 1} de {steps.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-11 h-11 -mr-2 -mt-2 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Pular e fechar o tour"
            title="Fechar tour (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo do Passo */}
        <div className="mb-6">
          <h3
            id="tour-step-title"
            className="text-base sm:text-lg font-black tracking-tight text-white mb-2"
          >
            {currentStep.title}
          </h3>
          <p
            id="tour-step-desc"
            className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light"
          >
            {currentStep.text}
          </p>
        </div>

        {/* Rodapé de Ações com Alvos Mínimos de 44x44px */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] px-3 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Pular tour
          </button>

          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="min-h-[44px] min-w-[44px] px-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-700 active:scale-95 cursor-pointer"
                title="Passo anterior (Seta Esquerda)"
                aria-label="Voltar para o passo anterior"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="min-h-[44px] px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
              title={stepIndex === steps.length - 1 ? 'Concluir tour (Enter)' : 'Próximo passo (Enter ou Seta Direita)'}
            >
              <span>{stepIndex === steps.length - 1 ? 'Concluir' : 'Próximo'}</span>
              {stepIndex === steps.length - 1 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

