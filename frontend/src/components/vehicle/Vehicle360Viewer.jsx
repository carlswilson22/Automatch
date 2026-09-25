import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Compass, Play, Pause, Sparkles } from 'lucide-react';
import { getVehicleImageUrl, handleVehicleImageError } from '../../utils/imageHelper';

const ANGLES = [
  { angle: 0, label: 'Frente', icon: '0°', defaultImg: 'carro_360_frente.jpg', flip: false },
  { angle: 45, label: 'Diag. Diant. Dir.', icon: '45°', defaultImg: 'carro_360_diagonal.jpg', flip: false },
  { angle: 90, label: 'Lateral Direita', icon: '90°', defaultImg: 'carro_360_lateral.jpg', flip: false },
  { angle: 135, label: 'Diag. Tras. Dir.', icon: '135°', defaultImg: 'carro_360_diagonal.jpg', flip: true },
  { angle: 180, label: 'Traseira', icon: '180°', defaultImg: 'carro_360_traseira.jpg', flip: false },
  { angle: 225, label: 'Diag. Tras. Esq.', icon: '225°', defaultImg: 'carro_360_diagonal.jpg', flip: true },
  { angle: 270, label: 'Lateral Esquerda', icon: '270°', defaultImg: 'carro_360_lateral.jpg', flip: true },
  { angle: 315, label: 'Diag. Diant. Esq.', icon: '315°', defaultImg: 'carro_360_diagonal.jpg', flip: false },
];

/**
 * Vehicle360Viewer — Visualizador Orbital Fotográfico 360°
 * Dedicado exclusivamente à exibição das fotos da carroceria do veículo em 8 ângulos contínuos.
 * Desacoplado de marcações de danos ou diagramas esquemáticos (tratados na Perícia Visual IA).
 */
const Vehicle360Viewer = ({
  vehicleImage,
  carName = 'Veículo',
  imagesByAngle = null
}) => {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);

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

  // Determina a foto ativa do quadrante atual
  const getActiveImage = () => {
    if (imagesByAngle && imagesByAngle[currentAngle]) {
      return getVehicleImageUrl(imagesByAngle[currentAngle]);
    }
    return getVehicleImageUrl(vehicleImage || currentAngleObj.defaultImg || 'carro_360_frente.jpg');
  };

  const activeImage = getActiveImage();

  const getAngleLabel = (angle) => {
    const match = ANGLES.find((a) => a.angle === angle);
    return match ? match.label : `${angle}°`;
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      
      {/* Barra de Topo do Visualizador */}
      <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <RotateCw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Varredura 360° Fotográfica</h4>
              <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-black">
                {currentAngle}° • {getAngleLabel(currentAngle)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Arraste para rotacionar a carroceria ou selecione os quadrantes angulares abaixo
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
          initial={{ opacity: 0.9, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Foto Real do Veículo no Ângulo Selecionado */}
          <img
            src={activeImage}
            alt={`${carName} - Ângulo ${currentAngle}°`}
            onError={handleVehicleImageError}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              currentAngleObj.flip ? 'scale-x-[-1]' : ''
            }`}
            draggable={false}
          />

          {/* Gradiente de Iluminação de Estúdio */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 pointer-events-none" />

          {/* Marcador de Bússola Angular */}
          <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 flex items-center gap-2 pointer-events-none shadow-lg">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quadrante: <strong className="text-white">{getAngleLabel(currentAngle)}</strong></span>
          </div>

          {/* Badge Orbital 360 */}
          <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-cyan-400 pointer-events-none flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>360° FOTOGRÁFICO REAL</span>
          </div>
        </motion.div>
      </div>

      {/* Quadrantes Angulares Selecionáveis */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800">
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
