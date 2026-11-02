/**
 * TourContext.jsx — Provedor de contexto global para os tours guiados e modo de demonstração multitelas.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para manter o estado do tour vivo durante navegações de rotas SPA no React Router,
 *     gerenciando o Modal de Apresentação (sem timer de fechamento) e a transição entre telas da demonstração.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getTourById } from '../data/tourGuideData';
import { lockScroll, unlockScroll } from '../utils/scrollLockCore';

const TourContext = createContext({});

export function TourProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Estado do Modal A (Apresentação Inicial)
  const [introModal, setIntroModal] = useState({
    isOpen: false,
    tourId: null,
  });

  // Estado do Modo de Demonstração Interativo Multitelas
  const [demoState, setDemoState] = useState({
    isRunning: false,
    tourId: null,
    stepIndex: 0,
  });

  // Abre o Modal A e mantém aberto até decisão do usuário
  const openTourIntro = useCallback((tourId) => {
    const config = getTourById(tourId, user?.role);
    if (!config) return;

    lockScroll();
    setIntroModal({
      isOpen: true,
      tourId,
    });
  }, [user?.role]);

  // Fecha o Modal A sem iniciar o tour (usuário continua na página atual)
  const closeTourIntro = useCallback(() => {
    setIntroModal({
      isOpen: false,
      tourId: null,
    });
    unlockScroll();
  }, []);

  // Inicia o Modo de Demonstração Interativo
  const startDemo = useCallback((tourId) => {
    const targetTourId = tourId || introModal.tourId;
    const config = getTourById(targetTourId, user?.role);
    if (!config || config.steps.length === 0) {
      closeTourIntro();
      return;
    }

    // Fecha o Modal A
    setIntroModal({
      isOpen: false,
      tourId: null,
    });

    // Inicia a demonstração no passo 0
    setDemoState({
      isRunning: true,
      tourId: targetTourId,
      stepIndex: 0,
    });

    // Direciona para a rota inicial do roteiro se for diferente da rota atual
    const firstStep = config.steps[0];
    if (firstStep?.targetRoute && location.pathname !== firstStep.targetRoute) {
      navigate(firstStep.targetRoute);
    }
  }, [introModal.tourId, user?.role, location.pathname, navigate, closeTourIntro]);

  // Encerra a Demonstração a qualquer momento
  const stopDemo = useCallback(() => {
    setDemoState({
      isRunning: false,
      tourId: null,
      stepIndex: 0,
    });
    unlockScroll();
  }, []);

  // Avança para o próximo passo (transitando de rota se necessário)
  const nextStep = useCallback(() => {
    if (!demoState.isRunning || !demoState.tourId) return;

    const config = getTourById(demoState.tourId, user?.role);
    if (!config) {
      stopDemo();
      return;
    }

    const nextIndex = demoState.stepIndex + 1;
    if (nextIndex < config.steps.length) {
      const nextStepConfig = config.steps[nextIndex];
      setDemoState(prev => ({ ...prev, stepIndex: nextIndex }));

      // Se o próximo passo pertence a outra tela, navega
      if (nextStepConfig?.targetRoute && location.pathname !== nextStepConfig.targetRoute) {
        navigate(nextStepConfig.targetRoute);
      }
    } else {
      // Concluiu todos os passos
      stopDemo();
    }
  }, [demoState, user?.role, location.pathname, navigate, stopDemo]);

  // Volta para o passo anterior
  const prevStep = useCallback(() => {
    if (!demoState.isRunning || !demoState.tourId || demoState.stepIndex <= 0) return;

    const config = getTourById(demoState.tourId, user?.role);
    if (!config) return;

    const prevIndex = demoState.stepIndex - 1;
    const prevStepConfig = config.steps[prevIndex];
    setDemoState(prev => ({ ...prev, stepIndex: prevIndex }));

    if (prevStepConfig?.targetRoute && location.pathname !== prevStepConfig.targetRoute) {
      navigate(prevStepConfig.targetRoute);
    }
  }, [demoState, user?.role, location.pathname, navigate]);

  const value = useMemo(() => ({
    introModal,
    demoState,
    openTourIntro,
    closeTourIntro,
    startDemo,
    stopDemo,
    nextStep,
    prevStep,
  }), [introModal, demoState, openTourIntro, closeTourIntro, startDemo, stopDemo, nextStep, prevStep]);

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour deve ser utilizado dentro de um TourProvider');
  }
  return context;
}

