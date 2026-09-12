import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Compass, AlertCircle, Wrench, Play, Pause } from 'lucide-react';

const ANGLES = [
  { angle: 0, label: 'Frente', icon: '0°' },
  { angle: 45, label: 'Diag. Diant. Dir.', icon: '45°' },
  { angle: 90, label: 'Lateral Direita', icon: '90°' },
  { angle: 135, label: 'Diag. Tras. Dir.', icon: '135°' },
  { angle: 180, label: 'Traseira', icon: '180°' },
  { angle: 225, label: 'Diag. Tras. Esq.', icon: '225°' },
  { angle: 270, label: 'Lateral Esquerda', icon: '270°' },
  { angle: 315, label: 'Diag. Diant. Esq.', icon: '315°' },
];

const Vehicle360Viewer = ({ vehicleImage, carName = 'Veículo', damagePoints = [] }) => {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
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
    // Every 30px dragged rotates 45 degrees
    const step = Math.round(deltaX / 30);
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

  // Map damages to nearest angle or show all on front/sides
  const visibleHotspots = damagePoints.filter((dp, idx) => {
    const assignedAngle = (idx * 90) % 360;
    const diff = Math.abs(currentAngle - assignedAngle);
    return diff <= 45 || diff >= 315;
  });

  const getAngleLabel = (angle) => {
    const match = ANGLES.find((a) => a.angle === angle);
    return match ? match.label : `${angle}°`;
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      {/* Top Header Bar */}
      <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <RotateCw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Varredura 360° Interativa</h4>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-extrabold">
                {currentAngle}° • {getAngleLabel(currentAngle)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Arraste para girar a carroceria ou use os quadrantes abaixo.
            </p>
          </div>
        </div>

        {/* Auto rotate toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isAutoRotating
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoRotating ? 'Pausar Giro' : 'Giro 360°'}</span>
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
            src={vehicleImage || '/images/FotoGolfGTI.jpeg'}
            alt={`${carName} - Ângulo ${currentAngle}°`}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              currentAngle >= 90 && currentAngle <= 270 ? 'scale-x-[-1]' : ''
            }`}
            draggable={false}
          />

          {/* Perspective overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

          {/* Angle Watermark Indicator */}
          <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 flex items-center gap-2 pointer-events-none">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Vista: <strong className="text-white">{getAngleLabel(currentAngle)}</strong></span>
          </div>

          {/* 360 Turntable Ring at bottom */}
          <div className="absolute bottom-3 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-xl text-[10px] font-mono text-cyan-400 pointer-events-none">
            360° TURNTABLE ACTIVE
          </div>

          {/* Damage Hotspots Plotted for this visible angle */}
          <AnimatePresence>
            {visibleHotspots.map((pt) => (
              <motion.div
                key={`${pt.id}-${currentAngle}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute z-20"
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
                <div className="relative group/pin cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 font-black text-xs hover:scale-125 transition-transform">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75"></div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Drag Hint overlay on hover */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-950/70 backdrop-blur-md border border-slate-800 px-3 py-1 rounded-full text-[10px] text-slate-400 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          ↔ Arraste horizontalmente para girar
        </div>
      </div>

      {/* Angle Selector Pills Bar */}
      <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between gap-1.5 overflow-x-auto">
        {ANGLES.map((ang) => (
          <button
            key={ang.angle}
            type="button"
            onClick={() => {
              setCurrentAngle(ang.angle);
              setIsAutoRotating(false);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              currentAngle === ang.angle
                ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>{ang.icon}</span>
            <span className="hidden sm:inline text-[10px]">{ang.label}</span>
          </button>
        ))}
      </div>

      {/* Active Hotspot Details Popup */}
      {activeHotspot && (
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            {damagePoints.filter((d) => d.id === activeHotspot).map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-white">{d.description}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Mapeado no quadrante <strong>{getAngleLabel(currentAngle)}</strong>.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-rose-400 font-bold text-xs">
                    R$ {d.repairCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicle360Viewer;
