import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCw, Compass, Play, Pause, Sparkles, Camera, ShieldCheck, 
  AlertCircle, Search, Eye, X, ZoomIn, CheckCircle2, ChevronRight, FileText
} from 'lucide-react';
import { getVehicleImageUrl, handleVehicleImageError } from '../../utils/imageHelper';

const ANGLES = [
  { angle: 0, label: 'Frente', icon: '0°', perspective: 'perspective(1200px) rotateY(0deg) scale(1)', lightX: '50%', flip: false },
  { angle: 45, label: 'Diag. Diant. Dir.', icon: '45°', perspective: 'perspective(1200px) rotateY(6deg) scale(1.02)', lightX: '65%', flip: false },
  { angle: 90, label: 'Lateral Direita', icon: '90°', perspective: 'perspective(1200px) rotateY(10deg) scale(1.03)', lightX: '80%', flip: false },
  { angle: 135, label: 'Diag. Tras. Dir.', icon: '135°', perspective: 'perspective(1200px) rotateY(6deg) scale(1.015)', lightX: '65%', flip: false },
  { angle: 180, label: 'Traseira', icon: '180°', perspective: 'perspective(1200px) rotateY(0deg) scale(1)', lightX: '50%', flip: false },
  { angle: 225, label: 'Diag. Tras. Esq.', icon: '225°', perspective: 'perspective(1200px) rotateY(-6deg) scale(1.015)', lightX: '35%', flip: true },
  { angle: 270, label: 'Lateral Esquerda', icon: '270°', perspective: 'perspective(1200px) rotateY(-10deg) scale(1.03)', lightX: '20%', flip: true },
  { angle: 315, label: 'Diag. Diant. Esq.', icon: '315°', perspective: 'perspective(1200px) rotateY(-6deg) scale(1.02)', lightX: '35%', flip: true },
];

/**
 * Vehicle360Viewer — Visualizador Orbital Fotográfico 360° com Hotspots (Carvana Benchmark)
 * Exibe a carroceria do veículo em 8 ângulos contínuos com mapeamento transparente
 * de apontamentos periciais do Laudo Cautelar.
 */
const Vehicle360Viewer = ({
  car = null,
  vehicleImage = null,
  carName = 'Veículo',
  gallery = null,
  photos360 = null,
  damagePoints = null,
  imagesByAngle = null,
  onOpenLaudo = null
}) => {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);

  const effectiveCarName = car?.name || carName;

  // Pontos de avaria/laudo cautelar mapeados
  const effectiveDamagePoints = useMemo(() => {
    if (Array.isArray(damagePoints)) return damagePoints;
    if (Array.isArray(car?.damagePoints)) return car.damagePoints;
    return [];
  }, [damagePoints, car?.damagePoints]);

  // Pontos de avaria visíveis no ângulo atual
  const activeAngleDamagePoints = useMemo(() => {
    return effectiveDamagePoints.filter(dp => Number(dp.angle) === currentAngle);
  }, [effectiveDamagePoints, currentAngle]);

  // Efeito de auto-rotação orbital
  useEffect(() => {
    let interval = null;
    if (isAutoRotating) {
      interval = setInterval(() => {
        setCurrentAngle((prev) => (prev + 45) % 360);
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  // Controles de rotação por arraste (mouse ou touch)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startAngleRef.current = currentAngle;
    setIsAutoRotating(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - startXRef.current;
    const step = Math.round(deltaX / 35);
    let newAngle = (startAngleRef.current - step * 45) % 360;
    if (newAngle < 0) newAngle += 360;
    const snapped = Math.round(newAngle / 45) * 45 % 360;
    if (snapped !== currentAngle) {
      setCurrentAngle(snapped);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const currentAngleObj = ANGLES.find((a) => a.angle === currentAngle) || ANGLES[0];

  // Monta mapa completo de imagens por ângulo
  const imageMap = useMemo(() => {
    const map = {};
    const baseImg = vehicleImage || car?.image || car?.imagem;
    const gal = (car?.gallery && Array.isArray(car.gallery) && car.gallery.length > 0) 
      ? car.gallery 
      : (Array.isArray(gallery) && gallery.length > 0 ? gallery : null);
    const p360 = photos360 || car?.photos360 || null;

    ANGLES.forEach(({ angle }) => {
      if (p360 && p360[angle]) {
        map[angle] = getVehicleImageUrl(p360[angle]);
        return;
      }

      if (gal && gal.length > 0) {
        const galLen = gal.length;
        if (angle === 0 && galLen > 0) { map[angle] = getVehicleImageUrl(gal[0]); return; }
        if (angle === 45 && galLen > 1) { map[angle] = getVehicleImageUrl(gal[1]); return; }
        if (angle === 90 && galLen > 2) { map[angle] = getVehicleImageUrl(gal[2]); return; }
        if (angle === 135 && galLen > 3) { map[angle] = getVehicleImageUrl(gal[3]); return; }
        if (angle === 180 && galLen > 4) { map[angle] = getVehicleImageUrl(gal[4]); return; }
        if (angle === 225) {
          const src = galLen > 5 ? gal[5] : (galLen > 3 ? gal[3] : gal[0]);
          map[angle] = getVehicleImageUrl(src);
          return;
        }
        if (angle === 270) {
          const src = galLen > 6 ? gal[6] : (galLen > 2 ? gal[2] : gal[0]);
          map[angle] = getVehicleImageUrl(src);
          return;
        }
        if (angle === 315) {
          const src = galLen > 7 ? gal[7] : (galLen > 1 ? gal[1] : gal[0]);
          map[angle] = getVehicleImageUrl(src);
          return;
        }
        map[angle] = getVehicleImageUrl(gal[0] || baseImg || 'placeholder-carro.jpg');
        return;
      }

      map[angle] = getVehicleImageUrl(baseImg || 'placeholder-carro.jpg');
    });

    return map;
  }, [car?.id, car?.image, car?.imagem, car?.gallery, car?.photos360, vehicleImage, gallery, photos360]);

  const activeImage = imageMap[currentAngle] || imageMap[0];

  const uniquePhotoCount = useMemo(() => {
    const unique = new Set(Object.values(imageMap));
    return unique.size;
  }, [imageMap]);

  const isAngleProjected = useMemo(() => {
    const p360 = photos360 || car?.photos360 || null;
    if (p360 && p360[currentAngle]) return false;
    const gal = (car?.gallery && Array.isArray(car.gallery) && car.gallery.length > 0) 
      ? car.gallery 
      : (Array.isArray(gallery) && gallery.length > 0 ? gallery : null);
    if (!gal || gal.length <= 1) return currentAngle !== 0;
    const galLen = gal.length;
    if (currentAngle === 0) return false;
    if (currentAngle === 45 && galLen > 1) return false;
    if (currentAngle === 90 && galLen > 2) return false;
    if (currentAngle === 135 && galLen > 3) return false;
    if (currentAngle === 180 && galLen > 4) return false;
    if (currentAngle === 225 && galLen > 5) return false;
    if (currentAngle === 270 && galLen > 6) return false;
    if (currentAngle === 315 && galLen > 7) return false;
    return true;
  }, [currentAngle, photos360, car?.photos360, car?.gallery, gallery]);

  const getAngleLabel = (angle) => {
    const match = ANGLES.find((a) => a.angle === angle);
    return match ? match.label : `${angle}°`;
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl relative">
      
      {/* Barra de Topo do Visualizador */}
      <div className="p-4 sm:p-5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <RotateCw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {effectiveCarName} • 360°
              </h4>
              <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-black">
                {currentAngle}° • {getAngleLabel(currentAngle)}
              </span>

              {/* Status de Integridade: Badge Socratic Gate A1 */}
              {effectiveDamagePoints.length === 0 ? (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Íntegro: Nenhuma avaria ou retoque detectado
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowHotspots(!showHotspots)}
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    showHotspots
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Clique para alternar a exibição dos marcadores de avarias do laudo"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {effectiveDamagePoints.length} {effectiveDamagePoints.length === 1 ? 'detalhe periciado' : 'detalhes periciados'}
                  </span>
                  <span className="opacity-75">{showHotspots ? '(Visível)' : '(Oculto)'}</span>
                </button>
              )}

              <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Camera className="w-3 h-3 text-cyan-400" />
                {uniquePhotoCount} {uniquePhotoCount > 1 ? 'fotos do veículo' : 'foto do veículo'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {effectiveDamagePoints.length > 0
                ? 'Varredura orbital com marcadores periciais interativos (Carvana Benchmark). Clique nos pontos para inspecionar em alta definição.'
                : 'Varredura com inspeção pericial 100% íntegra. Carroceria sem retoques ou avarias registradas.'}
            </p>
          </div>
        </div>

        {/* Botão de Giro 360 Automático */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isAutoRotating
                ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/20 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoRotating ? 'Pausar Rotação' : 'Giro 360°'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Fotográfico Orbital 360 */}
      <div
        className="relative aspect-[16/10] bg-slate-950 select-none overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center group"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <motion.div
          key={currentAngle}
          initial={{ opacity: 0.92, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
        >
          {/* Foto Real do Veículo com Perspectiva 3D Orbital */}
          <img
            src={activeImage}
            alt={`${effectiveCarName} - Ângulo ${currentAngle}° (${currentAngleObj.label})`}
            onError={handleVehicleImageError}
            className="w-full h-full object-cover transition-transform duration-300 pointer-events-none"
            style={{
              transform: currentAngleObj.perspective + (currentAngleObj.flip ? ' scaleX(-1)' : ''),
              filter: 'contrast(1.02) saturate(1.04)'
            }}
            draggable={false}
          />

          {/* Gradiente de Iluminação de Estúdio Direcional */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-500"
            style={{
              background: `radial-gradient(circle at ${currentAngleObj.lightX} 45%, rgba(255,255,255,0.09) 0%, transparent 65%), linear-gradient(to top, rgba(2,6,23,0.85) 0%, transparent 40%, rgba(2,6,23,0.3) 100%)`
            }}
          />

          {/* ── HOTSPOTS DE AVARIAS DO LAUDO (Carvana Style) ── */}
          {showHotspots && activeAngleDamagePoints.length > 0 && activeAngleDamagePoints.map((dp) => (
            <div
              key={dp.id}
              style={{ left: `${dp.x}%`, top: `${dp.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotspot(dp);
                }}
                className="group/pin relative flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full font-black text-[11px] shadow-xl shadow-amber-500/50 border-2 border-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
              >
                {/* Ondas pulsantes de radar */}
                <span className="absolute -inset-1 rounded-full bg-amber-400 animate-ping opacity-75 pointer-events-none" />
                <Search className="w-3.5 h-3.5 relative z-10 shrink-0" />
                <span className="relative z-10 whitespace-nowrap">{dp.part}</span>
              </button>
            </div>
          ))}

          {/* Marcador de Bússola Angular */}
          <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 flex items-center gap-2 pointer-events-none shadow-lg">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quadrante: <strong className="text-white">{getAngleLabel(currentAngle)}</strong></span>
          </div>

          {/* Overlay: Ângulo sem foto real */}
          {isAngleProjected && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-[2px] pointer-events-none">
              <div className="flex flex-col items-center gap-2 text-center px-4">
                <span className="text-3xl">📷</span>
                <span className="text-sm font-bold text-white">Ângulo indisponível</span>
                <span className="text-[11px] text-slate-400">Foto não cadastrada para este quadrante</span>
              </div>
            </div>
          )}

          {/* Badge Orbital 360 */}
          <div className="absolute bottom-4 right-4 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-cyan-400 pointer-events-none flex items-center gap-1.5 shadow-lg">
            <span className={`w-2 h-2 rounded-full ${isAngleProjected ? 'bg-slate-500' : 'bg-cyan-400 animate-ping'}`} />
            <span>{isAngleProjected ? 'SEM FOTO NESTE ÂNGULO' : '360° FOTOGRÁFICO REAL'}</span>
          </div>
        </motion.div>
      </div>

      {/* Miniatura de Navegação Visual — Indicadores de Foto por Ângulo com Marcador de Hotspot */}
      <div className="px-4 pt-3 pb-1 bg-slate-950/95 border-t border-slate-800">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {ANGLES.map((a) => {
            const hasDamageOnAngle = effectiveDamagePoints.some(dp => Number(dp.angle) === a.angle);
            return (
              <button
                key={`thumb-${a.angle}`}
                type="button"
                onClick={() => { setCurrentAngle(a.angle); setIsAutoRotating(false); }}
                className={`relative w-16 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  currentAngle === a.angle
                    ? 'border-cyan-400 shadow-md shadow-cyan-500/30 scale-105'
                    : 'border-slate-800 hover:border-slate-600 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={imageMap[a.angle]}
                  alt={`${a.label}`}
                  className="w-full h-full object-cover"
                  style={{ transform: a.flip ? 'scaleX(-1)' : 'none' }}
                  draggable={false}
                  loading="lazy"
                />
                {hasDamageOnAngle && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 shadow-sm" title="Possui detalhe pericial registrado neste ângulo" />
                )}
                {currentAngle === a.angle && (
                  <div className="absolute inset-0 bg-cyan-400/10 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quadrantes Angulares Selecionáveis */}
      <div className="p-4 bg-slate-950/95 border-t border-slate-800/50">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {ANGLES.map((a) => {
            const hasDamageOnAngle = effectiveDamagePoints.some(dp => Number(dp.angle) === a.angle);
            return (
              <button
                key={a.angle}
                type="button"
                onClick={() => {
                  setCurrentAngle(a.angle);
                  setIsAutoRotating(false);
                }}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer relative ${
                  currentAngle === a.angle
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20 scale-105'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span className="block text-[11px] font-bold">{a.icon}</span>
                <span className="block text-[9px] uppercase tracking-tight truncate mt-0.5 opacity-80">{a.label}</span>
                {hasDamageOnAngle && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900" title="Apontamento no laudo" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MODAL DE DETALHAMENTO DE HOTSPOT (CARVANA STYLE) ── */}
      <AnimatePresence>
        {selectedHotspot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-slate-100 space-y-0"
            >
              {/* Header do Modal */}
              <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white flex items-center gap-2">
                      <span>{selectedHotspot.part}</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                        {selectedHotspot.severity}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Mapeamento Transparente 360° • Carvana Benchmark
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedHotspot(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Foto Macro com Zoom em Alta Resolução */}
              <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden border-b border-slate-800 flex items-center justify-center">
                <img
                  src={selectedHotspot.macroImage || activeImage}
                  alt={selectedHotspot.part}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Régua de Escala / Selo Pericial */}
                <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-lg">
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspeção Macro: <strong>Régua Pericial 1:1</strong></span>
                </div>
              </div>

              {/* Descrição e Parecer do Perito */}
              <div className="p-5 space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Parecer Oficial do Perito Automatch:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    "{selectedHotspot.desc}"
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Estrutura Monobloco 100% Intacta
                    </span>
                    <span>{selectedHotspot.inspector || 'Perito Cautelar Homologado'}</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-slate-400">
                    Aprovado para circulação e transferência
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHotspot(null);
                      if (onOpenLaudo) onOpenLaudo();
                    }}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ver Laudo Completo</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Vehicle360Viewer;

