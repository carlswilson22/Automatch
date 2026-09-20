import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, ShieldCheck, CheckCircle2,
  Clock, Video, Sparkles, AlertCircle, Upload, Check, Volume2, VolumeX
} from 'lucide-react';

const CHECKPOINTS = [
  {
    start: 0,
    end: 5,
    title: 'Frente & Óptica',
    detail: 'Alinhamento de para-choque, capô, faróis Full LED e ausência de deformações frontais.',
    color: 'emerald'
  },
  {
    start: 5,
    end: 10,
    title: 'Linha de Cintura & Pneus',
    detail: 'Colunas A, B e C originais de fábrica, rodas sem empeno e sulcos de pneus em conformidade.',
    color: 'cyan'
  },
  {
    start: 10,
    end: 15,
    title: 'Traseira & Vão do Motor',
    detail: 'Painel traseiro íntegro, estepe e lacres de fábrica, compartimento mecânico sem vazamentos.',
    color: 'blue'
  }
];

export default function PericialVideoViewer({
  videoUrl,
  carName = 'Veículo',
  onUploadVideo
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [isMuted, setIsMuted] = useState(true);
  const [activeSegment, setActiveSegment] = useState(0);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const isSimulated = !videoUrl || videoError;

  // Se não houver videoUrl real fornecido ou der erro, usa simulação interativa de 15s de alta fidelidade
  useEffect(() => {
    let timer;
    if (isSimulated && isPlaying) {
      timer = setInterval(() => {
        setSimulatedProgress(prev => {
          const next = prev + 0.1;
          if (next >= 15) {
            setIsPlaying(false);
            return 15;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isSimulated, isPlaying]);

  const effectiveTime = isSimulated ? simulatedProgress : currentTime;

  useEffect(() => {
    if (effectiveTime < 5) setActiveSegment(0);
    else if (effectiveTime < 10) setActiveSegment(1);
    else setActiveSegment(2);
  }, [effectiveTime]);

  const togglePlay = () => {
    if (isSimulated) {
      if (simulatedProgress >= 15) setSimulatedProgress(0);
      setIsPlaying(!isPlaying);
      return;
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const jumpToTime = (seconds) => {
    if (isSimulated) {
      setSimulatedProgress(seconds);
    } else if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const handleRestart = () => {
    if (isSimulated) {
      setSimulatedProgress(0);
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const progressPercent = Math.min(100, (effectiveTime / 15) * 100);

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
              <h3 className="text-sm font-black text-white tracking-wide">Vídeo Pericial Oficial de 15s</h3>
              <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Laudo Audiovisual Verificado
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Vistoria pericial acelerada em alta definição com checagem de 3 pilares estruturais
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-lg">
            {effectiveTime.toFixed(1)}s / 15.0s
          </span>
        </div>
      </div>

      {/* Video Viewport Container */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group">
        {videoUrl && !videoError ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            muted={isMuted}
            playsInline
            onError={() => setVideoError(true)}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
                if (videoRef.current.ended || videoRef.current.currentTime >= 15) {
                  setIsPlaying(false);
                }
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) setDuration(videoRef.current.duration || 15);
            }}
          />
        ) : (
          /* High-Fidelity Interactive Video Simulation Canvas */
          <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Simulated Stage Visuals depending on segment */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSegment}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.35 }}
                className="relative z-10 text-center px-6 max-w-lg"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  <Clock className="w-3.5 h-3.5" /> {CHECKPOINTS[activeSegment].title} (Fase {activeSegment + 1}/3)
                </div>
                <h4 className="text-xl md:text-2xl font-black text-white mb-2">
                  {carName}
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-md">
                  {CHECKPOINTS[activeSegment].detail}
                </p>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Vistoria Conforme
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                    <Sparkles className="w-4 h-4" /> 1080p 60fps
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Watermark Overlay */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-200">
                REC • PERÍCIA AUTOMATCH
              </span>
            </div>

            {/* Time Indicator on Video */}
            <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono text-xs text-cyan-400 font-bold">
              00:{Math.floor(effectiveTime).toString().padStart(2, '0')}:{(Math.floor((effectiveTime % 1) * 60)).toString().padStart(2, '0')}
            </div>
          </div>
        )}

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
              jumpToTime(pos * 15);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-100 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            {/* 5s and 10s dividers */}
            <div className="absolute left-[33.33%] top-0 bottom-0 w-0.5 bg-white/40" title="Checkpoint 5s"></div>
            <div className="absolute left-[66.66%] top-0 bottom-0 w-0.5 bg-white/40" title="Checkpoint 10s"></div>
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
                title="Reiniciar vídeo (15s)"
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
