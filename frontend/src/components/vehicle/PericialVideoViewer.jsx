import { VIDEO_DURATION, VIDEO_SUMMARY, CHECKPOINTS } from '../../data/pericialTimeline.generated.js';
/**
 * PericialVideoViewer.jsx — Reprodutor interativo de vídeo da vistoria pericial do veículo.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para oferecer máxima segurança ao comprador que deseja ver o veículo em alta resolução,
 *     com marcações de tempo nos pontos inspecionados (motor, suspensão, interior e lataria).
 */
import React, { useState, useRef, useEffect } from 'react';
import { getVideoUrl } from '../../utils/imageHelper';
import { Play, Pause, RotateCcw, ShieldCheck, Clock, Video, Check, Volume2, VolumeX } from 'lucide-react';

export default function PericialVideoViewer({
  videoUrl,
  carName = 'Veículo'
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [activeSegment, setActiveSegment] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const isUnavailable = !videoUrl || videoError;

  // Reseta estado ao alternar de veiculo ou URL
  useEffect(() => {
    setVideoError(false);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [videoUrl]);

  const effectiveTime = currentTime;

  useEffect(() => {
    const segIdx = CHECKPOINTS.findIndex(cp => effectiveTime >= cp.start && effectiveTime < cp.end);
    setActiveSegment(segIdx >= 0 ? segIdx : CHECKPOINTS.length - 1);
  }, [effectiveTime]);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause(); setIsPlaying(false);
    } else {
      try { await videoRef.current.play(); setIsPlaying(true); }
      catch { setVideoError(true); }
    }
  };
  const jumpToTime = seconds => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds; setCurrentTime(seconds);
  };
  const handleRestart = async () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    try { await videoRef.current.play(); setIsPlaying(true); }
    catch { setVideoError(true); }
  };

  const progressPercent = Math.min(100, (effectiveTime / VIDEO_DURATION) * 100);
  if (isUnavailable) return (
    <section role="status" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-200 space-y-2">
      <h3 className="font-bold">Vídeo indisponível</h3>
      <p>Este anúncio ainda não possui um vídeo válido disponível para reprodução.</p>
      <p className="text-xs text-slate-400">{VIDEO_SUMMARY}</p>
      {videoError && <button type="button" onClick={() => setVideoError(false)} className="text-cyan-300">Tentar novamente</button>}
    </section>
  );


  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Header Badge */}
      <div className="p-4 bg-slate-950/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-white tracking-wide">Vídeo Pericial Oficial de 20s</h3>
              <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Sequência demonstrativa
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {carName} - {VIDEO_SUMMARY}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-lg">
            {effectiveTime.toFixed(1)}s / {VIDEO_DURATION}.0s
          </span>
        </div>
      </div>

      {/* Video Viewport Container */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group">
          <video
            ref={videoRef}
            src={getVideoUrl(videoUrl)}
            className="w-full h-full object-cover"
            muted={isMuted}
            playsInline
            onError={() => setVideoError(true)}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
                if (videoRef.current.ended || videoRef.current.currentTime >= VIDEO_DURATION) {
                  setIsPlaying(false);
                }
              }
            }}
          />

        {/* Watermark Overlay (ativo tanto no vídeo real quanto na simulação) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-200">
            REC • PERÍCIA AUTOMATCH
          </span>
        </div>

        {/* HUD de Checkpoint Ativo */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden sm:block">
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/70 border border-cyan-500/30 text-cyan-300 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
            <Clock className="w-3 h-3 text-cyan-400" /> {CHECKPOINTS[activeSegment].title} (Fase {activeSegment + 1}/3)
          </span>
        </div>

        {/* Time Indicator on Video */}
        <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono text-xs text-cyan-400 font-bold pointer-events-none">
          00:{Math.floor(effectiveTime).toString().padStart(2, '0')}:{(Math.floor((effectiveTime % 1) * 60)).toString().padStart(2, '0')}
        </div>

        {/* Center Big Play Button when paused */}
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/30 hover:scale-110 active:scale-95 transition-all z-20"
          >
            <Play className="w-7 h-7 ml-1 fill-slate-950" />
          </button>
        )}

        {/* Bottom Video Controls Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 z-20">
          {/* Progress Timeline with Checkpoint markers */}
          <div className="relative w-full h-2.5 bg-slate-800 rounded-full mb-3 cursor-pointer overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              jumpToTime(pos * VIDEO_DURATION);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-100 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Divisores: 5s (Fim da Frente) e 15s (Fim das Laterais & 4 Pneus - 10s dedicados) */}
            <div className="absolute left-[25%] top-0 bottom-0 w-0.5 bg-white/40" title="Checkpoint 5s: Frente (5s)"></div>
            <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-white/40" title="Checkpoint 15s: Laterais e 4 Pneus (10s)"></div>
          </div>

          <div className="flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
                title="Reiniciar vídeo (20s)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {CHECKPOINTS.map((cp, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => jumpToTime(cp.start)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeSegment === idx
                      ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/40 font-black'
                      : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cp.start}s: {cp.title.split('&')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Checkpoint Inspection Summary Strip */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/60 border-t border-slate-800/80">
        {CHECKPOINTS.map((cp, idx) => {
          const isActive = activeSegment === idx;
          const isPassed = effectiveTime >= cp.end;
          return (
            <div
              key={idx}
              onClick={() => jumpToTime(cp.start)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  {cp.start}s – {cp.end}s
                </span>
                {isPassed ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verificado
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                    Etapa {idx + 1}
                  </span>
                )}
              </div>
              <h5 className="text-xs font-bold text-white mb-1">{cp.title}</h5>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {cp.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
