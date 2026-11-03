/**
 * AutomatchTour.jsx — Componente de Tour Guiado Interativo com Spotlight e Modo de Demonstração Multitelas.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para acompanhar o usuário pelas páginas da plataforma com spotlight e pop-up explicativo
 *     das funcionalidades da tela, sem ser destruído durante a navegação entre rotas SPA.
 *   - Renderização instantânea (latência zero): sem animações de transição ou escala, resposta de clique imediata
 *     e barra de progresso nativa via CSS estático.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  Compass, ChevronRight, ChevronLeft, X, CheckCircle2
} from 'lucide-react';
import { useTour } from '../../contexts/TourContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTourById } from '../../data/tourGuideData';
import { lockScroll, unlockScroll } from '../../utils/scrollLockCore';

const SPOTLIGHT_PADDING = 14;

export default function AutomatchTour() {
  const { demoState, nextStep, prevStep, stopDemo } = useTour();
  const { user } = useAuth();
  const location = useLocation();

  const [targetRect, setTargetRect] = useState(null);
  const [isCenteredFallback, setIsCenteredFallback] = useState(false);
  const dialogRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const tourConfig = getTourById(demoState.tourId, user?.role);
  const steps = tourConfig?.steps || [];
  const currentStep = steps[demoState.stepIndex];

  // Verifica preferência de movimento reduzido (mantido para conformidade WCAG AAA)
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Gestão estrita do bloqueio de rolagem central
  useEffect(() => {
    if (demoState.isRunning) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }
  }, [demoState.isRunning]);

  // Localiza e mede o elemento-alvo no DOM
  const measureTarget = useCallback((shouldScroll = true) => {
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

    // Rolagem até o elemento
    if (shouldScroll) {
      element.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });

      // Re-calibra medição após a rolagem repousar
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        const settledRect = element.getBoundingClientRect();
        setTargetRect({
          top: Math.max(8, settledRect.top - SPOTLIGHT_PADDING),
          left: Math.max(8, settledRect.left - SPOTLIGHT_PADDING),
          width: Math.min(window.innerWidth - 16, settledRect.width + (SPOTLIGHT_PADDING * 2)),
          height: settledRect.height + (SPOTLIGHT_PADDING * 2),
          right: settledRect.right + SPOTLIGHT_PADDING,
          bottom: settledRect.bottom + SPOTLIGHT_PADDING,
        });
      }, 50);
    }

    // Medição direta com respiro ampliado (14px) para cobrir a área integral
    const updatedRect = element.getBoundingClientRect();
    setTargetRect({
      top: Math.max(8, updatedRect.top - SPOTLIGHT_PADDING),
      left: Math.max(8, updatedRect.left - SPOTLIGHT_PADDING),
      width: Math.min(window.innerWidth - 16, updatedRect.width + (SPOTLIGHT_PADDING * 2)),
      height: updatedRect.height + (SPOTLIGHT_PADDING * 2),
      right: updatedRect.right + SPOTLIGHT_PADDING,
      bottom: updatedRect.bottom + SPOTLIGHT_PADDING,
    });
    setIsCenteredFallback(false);
  }, [currentStep]);

  // Aguarda carregamento do DOM ao trocar de tela ou passo
  useEffect(() => {
    if (!demoState.isRunning || !currentStep) return;

    let attempts = 0;
    const maxAttempts = 30; // 30 x 60ms = 1.8s
    const timer = setInterval(() => {
      attempts++;
      const el = document.querySelector(`[data-tour="${currentStep.targetAnchor}"]`);
      if (el || attempts >= maxAttempts) {
        clearInterval(timer);
        measureTarget(true);
      }
    }, 60);

    return () => clearInterval(timer);
  }, [demoState.isRunning, demoState.stepIndex, location.pathname, currentStep, measureTarget]);

  // Recalcula medição no redimensionamento da janela e durante scroll via RAF
  useEffect(() => {
    if (!demoState.isRunning) return;

    let rafId = null;
    const handleScrollOrResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        measureTarget(false);
      });
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [demoState.isRunning, measureTarget]);

  // Atalhos de teclado acessíveis (Tab Trap, Escape, Setas)
  useEffect(() => {
    if (!demoState.isRunning) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        stopDemo();
        return;
      }
      if (e.key === 'ArrowRight' || (e.key === 'Enter' && e.target.tagName !== 'BUTTON')) {
        e.preventDefault();
        nextStep();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
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
  }, [demoState.isRunning, stopDemo, nextStep, prevStep]);

  // Foco no diálogo a cada novo passo
  useEffect(() => {
    if (demoState.isRunning && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [demoState.isRunning, demoState.stepIndex]);

  if (!demoState.isRunning || !tourConfig || steps.length === 0 || !currentStep) {
    return null;
  }

  // Cálculo da posição do balão pop-up (com margens seguras e posicionamento inteligente)
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

  const progressPercent = ((demoState.stepIndex + 1) / steps.length) * 100;

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-auto" role="presentation">
      {/* SVG Mask Spotlight Overlay — Fundo sem blur pesado */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-auto"
        style={{ zIndex: 9998 }}
        aria-hidden="true"
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && !isCenteredFallback && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="18"
                ry="18"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.78)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Anel de Destaque ao Redor do Elemento — Cobertura Total da Área sem Transições Atrasadas */}
      {targetRect && !isCenteredFallback && (
        <div
          className="fixed pointer-events-none rounded-2xl ring-2 ring-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.35)]"
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

      {/* Pop-up do Tour em Modo Demonstração — Renderização Estática e Imediata */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-desc"
        tabIndex={-1}
        style={{ ...popoverStyle, zIndex: 10000 }}
        className="w-full bg-slate-900 border border-slate-700/90 rounded-3xl p-5 sm:p-6 shadow-2xl text-white outline-none focus:ring-2 focus:ring-cyan-400/50"
      >
        {/* Barra de Progresso no Topo — Estilo Estático Direto */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3" />
              {tourConfig.badge}
            </span>
            {!user && (
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Demonstração
              </span>
            )}
            <span className="text-xs text-slate-400 font-semibold" aria-live="polite">
              Passo {demoState.stepIndex + 1} de {steps.length}
            </span>
          </div>

          <button
            type="button"
            onClick={stopDemo}
            className="w-11 h-11 -mr-2 -mt-2 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-full cursor-pointer"
            aria-label="Encerrar demonstração"
            title="Fechar (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo do Passo na Tela Atual */}
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

        {/* Rodapé com Alvos de Toque Mínimos de 44x44px */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={stopDemo}
            className="min-h-[44px] px-3 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Encerrar
          </button>

          <div className="flex items-center gap-2">
            {demoState.stepIndex > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="min-h-[44px] min-w-[44px] px-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-slate-700 cursor-pointer"
                title="Passo anterior (Seta Esquerda)"
                aria-label="Voltar para a tela anterior"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}

            {demoState.stepIndex === steps.length - 1 && !user ? (
              <button
                type="button"
                onClick={() => stopDemo({ redirectTo: '/login' })}
                className="min-h-[44px] px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
                title="Cadastrar na plataforma"
              >
                <span>Cadastrar para Anunciar</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="min-h-[44px] px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
                title={demoState.stepIndex === steps.length - 1 ? 'Concluir demonstração (Enter)' : 'Próxima tela (Enter ou Seta Direita)'}
              >
                <span>{demoState.stepIndex === steps.length - 1 ? 'Concluir' : 'Próximo'}</span>
                {demoState.stepIndex === steps.length - 1 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
