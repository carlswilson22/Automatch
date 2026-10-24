import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * HeroVideoScrub
 * 
 * Componente de Hero cinematográfica controlada por rolagem (ScrollTrigger scrub).
 * Apresenta 4 cenas (~10s) sincronizadas com a rolagem ao longo do scroll track.
 * 
 * Acessibilidade e Desempenho:
 * - Suporte estrito a prefers-reduced-motion (exibe apenas o poster estático).
 * - Sincronização via requestAnimationFrame + guarda seeking para evitar engasgos.
 * - Leitura zero de layout no loop de rolagem.
 * - Suporte dinâmico a base path (Docker "/", Dev "/", GitHub Pages "/Automatch/").
 * - aria-hidden="true", muted, playsInline no elemento <video>.
 */
export const HeroVideoScrub = ({ children }) => {
  const containerRef = useRef(null);
  const pinRef = useRef(null);
  const videoRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Resolução segura de caminhos com base path
  const rawBase = import.meta.env.BASE_URL || '/';
  const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const videoSrc = `${baseUrl}videos/hero-scrub.mp4`;
  const posterSrc = `${baseUrl}images/hero-video-poster.jpg`;

  // Detectar prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // Configuração do ScrollTrigger e sincronização via requestAnimationFrame
  useEffect(() => {
    if (reducedMotion || hasError) return;

    const video = videoRef.current;
    const container = containerRef.current;
    const pinEl = pinRef.current;
    if (!video || !container || !pinEl) return;

    let targetTime = 0;
    let rafId = null;

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!video || video.seeking) return;
        if (Math.abs(video.currentTime - targetTime) > 0.03) {
          video.currentTime = targetTime;
        }
      });
    };

    const handleSeeked = () => {
      if (!video) return;
      if (Math.abs(video.currentTime - targetTime) > 0.03) {
        video.currentTime = targetTime;
      }
    };

    video.addEventListener('seeked', handleSeeked);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinEl,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const duration = video.duration || 10;
          targetTime = Math.min(Math.max(self.progress * duration, 0), duration);
          scheduleUpdate();
        },
      });
    }, container);

    return () => {
      video.removeEventListener('seeked', handleSeeked);
      if (rafId) cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, [reducedMotion, hasError, isReady]);

  // Se o usuário preferir movimento reduzido, renderiza layout padrão estático com o poster
  if (reducedMotion) {
    return (
      <section className="relative min-h-[92vh] overflow-hidden bg-slate-950 flex flex-col justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={posterSrc}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-60"
            fetchPriority="high"
          />
          {/* Overlay escuro com alto contraste à esquerda */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 z-10" />
        </div>
        <div className="relative z-20 w-full">
          {children}
        </div>
      </section>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360vh] bg-slate-950"
      data-testid="hero-video-scrub-container"
    >
      {/* Viewport fixado (Pin) durante o scrub */}
      <div
        ref={pinRef}
        className="w-full h-screen relative overflow-hidden flex flex-col justify-center"
      >
        {/* Camada de Mídia (Poster + Vídeo) */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
          {/* Poster inicial com prioridade de fetch alta */}
          <img
            src={posterSrc}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${
              isReady ? 'opacity-0 pointer-events-none' : 'opacity-70'
            }`}
          />

          {/* Vídeo scrubbable */}
          {!hasError && (
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              onLoadedData={() => setIsReady(true)}
              onCanPlayThrough={() => setIsReady(true)}
              onError={() => {
                setHasError(true);
                setIsReady(false);
              }}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                isReady ? 'opacity-70' : 'opacity-0'
              }`}
            />
          )}

          {/* Overlay de gradiente escuro profissional para legibilidade WCAG AA à esquerda */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30 pointer-events-none" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 pointer-events-none" />
          <div
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}
            className="absolute inset-0 z-10 opacity-[0.02] pointer-events-none"
          />
        </div>

        {/* Linhas decorativas sutis de alta sofisticação */}
        <div className="absolute top-[35%] left-[-5%] w-[60%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent rotate-[-12deg] z-10 pointer-events-none" />
        <div className="absolute top-[60%] right-[-5%] w-[50%] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent rotate-[8deg] z-10 pointer-events-none" />

        {/* Conteúdo da Hero posicionado sobre o vídeo com z-index seguro */}
        <div className="relative z-20 w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HeroVideoScrub;
