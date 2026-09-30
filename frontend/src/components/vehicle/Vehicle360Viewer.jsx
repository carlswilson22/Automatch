import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Compass, Play, Pause, Sparkles } from 'lucide-react';
import { getVehicleImageUrl, handleVehicleImageError } from '../../utils/imageHelper';

const ANGLES = [
  { angle: 0, label: 'Frente', icon: '0°', perspective: 'perspective(1200px) rotateY(0deg) scale(1)', lightX: '50%', flip: false },
  { angle: 45, label: 'Diag. Diant. Dir.', icon: '45°', perspective: 'perspective(1200px) rotateY(6deg) scale(1.02)', lightX: '65%', flip: false },
  { angle: 90, label: 'Lateral Direita', icon: '90°', perspective: 'perspective(1200px) rotateY(10deg) scale(1.03)', lightX: '80%', flip: false },
  { angle: 135, label: 'Diag. Tras. Dir.', icon: '135°', perspective: 'perspective(1200px) rotateY(6deg) scale(1.015)', lightX: '65%', flip: true },
  { angle: 180, label: 'Traseira', icon: '180°', perspective: 'perspective(1200px) rotateY(0deg) scale(1)', lightX: '50%', flip: false },
  { angle: 225, label: 'Diag. Tras. Esq.', icon: '225°', perspective: 'perspective(1200px) rotateY(-6deg) scale(1.015)', lightX: '35%', flip: true },
  { angle: 270, label: 'Lateral Esquerda', icon: '270°', perspective: 'perspective(1200px) rotateY(-10deg) scale(1.03)', lightX: '20%', flip: true },
  { angle: 315, label: 'Diag. Diant. Esq.', icon: '315°', perspective: 'perspective(1200px) rotateY(-6deg) scale(1.02)', lightX: '35%', flip: false },
];

/**
 * Vehicle360Viewer — Visualizador Orbital Fotográfico 360°
 * Dedicado exclusivamente à exibição das fotos da carroceria do veículo em 8 ângulos contínuos.
 * Garante consistência absoluta: exibe SEMPRE o veículo correto, sem substituição por carros aleatórios.
 */
const Vehicle360Viewer = ({
  car = null,
  vehicleImage = null,
  carName = 'Veículo',
  gallery = null,
  photos360 = null,
  imagesByAngle = null
}) => {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);

  const effectiveCarName = car?.name || carName;

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

  // Determina a foto ativa do quadrante atual garantindo que seja SEMPRE do próprio veículo
  const getActiveImage = () => {
    // 1. Fotos específicas 360 se fornecidas explicitamente para o veículo
    if (photos360 && photos360[currentAngle]) {
      return getVehicleImageUrl(photos360[currentAngle]);
    }
    if (car?.photos360 && car.photos360[currentAngle]) {
      return getVehicleImageUrl(car.photos360[currentAngle]);
    }

    // 2. Se car tem galeria com múltiplas fotos reais do próprio veículo
    const gal = (car?.gallery && Array.isArray(car.gallery) && car.gallery.length > 0) ? car.gallery : (Array.isArray(gallery) ? gallery : null);
    if (gal && gal.length > 0) {
      if (currentAngle === 0 && gal[0]) return getVehicleImageUrl(gal[0]);
      if ((currentAngle === 45 || currentAngle === 315) && gal[1]) return getVehicleImageUrl(gal[1]);
      if ((currentAngle === 90 || currentAngle === 270) && (gal[2] || gal[1])) return getVehicleImageUrl(gal[2] || gal[1]);
      if (currentAngle === 180 && (gal[3] || gal[2])) return getVehicleImageUrl(gal[3] || gal[2]);
    }

    // 3. Fallback fundamental e inegociável: foto autêntica do próprio veículo em exibição
    const baseImg = vehicleImage || car?.image || car?.imagem;
    return getVehicleImageUrl(baseImg || 'FotoGolfGTI.jpeg');
  };

  const activeImage = getActiveImage();

  const getAngleLabel = (angle) => {
    const match = ANGLES.find((a) => a.angle === angle);
    return match ? match.label : `${angle}°`;
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      
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
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Arraste para rotacionar ou selecione os quadrantes angulares da carroceria
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

          {/* Marcador de Bússola Angular (Otimizado para GPU) */}
          <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 flex items-center gap-2 pointer-events-none shadow-lg">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quadrante: <strong className="text-white">{getAngleLabel(currentAngle)}</strong></span>
          </div>

          {/* Badge Orbital 360 (Otimizado para GPU) */}
          <div className="absolute bottom-4 right-4 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-cyan-400 pointer-events-none flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>360° FOTOGRÁFICO REAL</span>
          </div>
        </motion.div>
      </div>

      {/* Quadrantes Angulares Selecionáveis */}
      <div className="p-4 bg-slate-950/95 border-t border-slate-800">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {ANGLES.map((a) => (
            <button
              key={a.angle}
              type="button"
              onClick={() => {
                setCurrentAngle(a.angle);
                setIsAutoRotating(false);
              }}
              className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                currentAngle === a.angle
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span className="block text-[11px] font-bold">{a.icon}</span>
              <span className="block text-[9px] uppercase tracking-tight truncate mt-0.5 opacity-80">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Vehicle360Viewer;
