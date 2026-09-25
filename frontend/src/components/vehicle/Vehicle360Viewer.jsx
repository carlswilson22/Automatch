import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Compass, AlertCircle, Wrench, Play, Pause, Eye, Sparkles } from 'lucide-react';
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


const DEFAULT_SAMPLE_HOTSPOTS = [
  {
    id: 'hs-1',
    angle: 90,
    x: 62,
    y: 50,
    type: 'amassado',
    severity: 'high',
    description: 'Amassado na lataria da porta dianteira',
    repairCost: 1200
  },
  {
    id: 'hs-2',
    angle: 0,
    x: 48,
    y: 72,
    type: 'parachoque',
    severity: 'medium',
    description: 'Arranhão leve no spoiler frontal',
    repairCost: 350
  },
  {
    id: 'hs-3',
    angle: 180,
    x: 52,
    y: 60,
    type: 'pintura',
    severity: 'low',
    description: 'Micro-risco de chave na tampa traseira',
    repairCost: 200
  }
];

const Vehicle360Viewer = ({
  vehicleImage,
  carName = 'Veículo',
  damagePoints = [],
  imagesByAngle = null
}) => {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [prevImage, setPrevImage] = useState(null);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);

  // Auto-rotation effect
  useEffect(() => {
    let interval = null;
    if (isAutoRotating) {
      interval = setInterval(() => {
        setCurrentAngle((prev) => (prev + 45) % 360);
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  // Drag controls for mouse / touch
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

  // Determine the active image: prioritize car-specific images that differ from generic defaults
  const genericImages = ['/images/carro_360_frente.jpg', '/images/carro_360_diagonal.jpg', '/images/carro_360_lateral.jpg', '/images/carro_360_traseira.jpg'];
  const getActiveImage = () => {
    if (imagesByAngle && imagesByAngle[currentAngle]) {
      const angleSrc = imagesByAngle[currentAngle];
      // If the image is a generic placeholder AND we have a real vehicle photo, use the vehicle photo
      if (genericImages.includes(angleSrc) && vehicleImage) {
        return getVehicleImageUrl(vehicleImage);
      }
      return getVehicleImageUrl(angleSrc);
    }
    // Always fall back to the vehicle's own main photo to avoid showing other cars
    return getVehicleImageUrl(vehicleImage || currentAngleObj.defaultImg || 'FotoCorollaCross.jpg');
  };
  const activeImage = getActiveImage();

  // Cross-fade: track previous image for smooth transition
  useEffect(() => {
    const timer = setTimeout(() => setPrevImage(activeImage), 300);
    return () => clearTimeout(timer);
  }, [activeImage]);

  // Hotspots vinculados ao ângulo atual
  const allHotspots = (damagePoints && damagePoints.length > 0) ? damagePoints : DEFAULT_SAMPLE_HOTSPOTS;
  const visibleHotspots = allHotspots.filter((dp) => {
    const targetAngle = dp.angle !== undefined ? dp.angle : 0;
    const diff = Math.abs(currentAngle - targetAngle);
    return diff === 0 || diff === 45 || diff === 315;
  });

  const getAngleLabel = (angle) => {
    const match = ANGLES.find((a) => a.angle === angle);
    return match ? match.label : `${angle}°`;
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <RotateCw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Varredura 360° Interativa</h4>
              <span className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-black">
                {currentAngle}° • {getAngleLabel(currentAngle)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Arraste para rotacionar a carroceria ou clique nos quadrantes angulares abaixo
            </p>
          </div>
        </div>

        {/* Auto rotate toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
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

      {/* Main 360 Interactive Canvas */}
      <div
        className="relative aspect-[16/10] bg-slate-950 select-none overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center group"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Car visual container */}
        <motion.div
          key={currentAngle}
          initial={{ opacity: 0.85, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <img
            src={activeImage}
            alt={`${carName} - Ângulo ${currentAngle}°`}
            onError={handleVehicleImageError}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              currentAngleObj.flip ? 'scale-x-[-1]' : ''
            }`}
            draggable={false}
          />

          {/* Perspective overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

          {/* Angle Watermark Indicator */}
          <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 flex items-center gap-2 pointer-events-none shadow-lg">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quadrante: <strong className="text-white">{getAngleLabel(currentAngle)}</strong></span>
          </div>

          {/* 360 Turntable Badge */}
          <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-cyan-400 pointer-events-none flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>360° ORBITAL ATIVO</span>
          </div>

          {/* Damage Hotspots Plotted for this visible angle */}
          <AnimatePresence>
            {visibleHotspots.map((pt) => (
              <motion.div
                key={`${pt.id}-${currentAngle}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute z-20 cursor-pointer"
                style={{
                  left: `${pt.x || 50}%`,
                  top: `${pt.y || 50}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(activeHotspot === pt.id ? null : pt.id);
                }}
              >
                <div className="relative group">
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-rose-950/80 border-2 border-white hover:scale-125 transition-transform">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-60" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Popover de Detalhe do Hotspot Clicado */}
          <AnimatePresence>
            {activeHotspot && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-slate-950/95 backdrop-blur-md border border-rose-500/40 rounded-2xl p-4 shadow-2xl z-30 text-xs"
              >
                {allHotspots.filter((h) => h.id === activeHotspot).map((h) => (
                  <div key={h.id}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-black text-rose-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5" /> Avaria no Quadrante {h.angle}°
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveHotspot(null)}
                        className="text-slate-400 hover:text-white text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="font-bold text-white text-sm">{h.description}</p>
                    <p className="text-slate-400 mt-1">
                      Custo estimado de reparo: <strong className="text-rose-400 font-bold">R$ {h.repairCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

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
              className={`py-2 px-1 rounded-xl text-center transition-all ${
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
