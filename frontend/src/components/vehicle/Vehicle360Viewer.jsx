import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Compass, Play, Pause, Sparkles } from 'lucide-react';
import { getVehicleImageUrl, handleVehicleImageError } from '../../utils/imageHelper';

// Sequência orbital contínua de 24 fotogramas (resolução a cada 15° cobrindo 360° completos)
const ORBITAL_SEQUENCE = [
  { angle: 0, label: 'Frente Frontal', cardinal: '0° (Frente)', perspective: 'perspective(1200px) rotateY(0deg) scale(1)', lightX: '50%', flip: false },
  { angle: 15, label: 'Frente Diant. Dir. 15°', cardinal: '15°', perspective: 'perspective(1200px) rotateY(3deg) scale(1.01)', lightX: '56%', flip: false },
  { angle: 30, label: 'Diag. Diant. Dir. 30°', cardinal: '30°', perspective: 'perspective(1200px) rotateY(6deg) scale(1.018)', lightX: '63%', flip: false },
  { angle: 45, label: 'Diag. Diant. Dir. 45°', cardinal: '45° (Diag. Diant. Dir.)', perspective: 'perspective(1200px) rotateY(9deg) scale(1.025)', lightX: '70%', flip: false },
  { angle: 60, label: 'Lateral Diant. Dir. 60°', cardinal: '60°', perspective: 'perspective(1200px) rotateY(11deg) scale(1.03)', lightX: '76%', flip: false },
  { angle: 75, label: 'Lateral Dir. 75°', cardinal: '75°', perspective: 'perspective(1200px) rotateY(12deg) scale(1.032)', lightX: '81%', flip: false },
  { angle: 90, label: 'Lateral Direita 90°', cardinal: '90° (Lateral Dir.)', perspective: 'perspective(1200px) rotateY(12.5deg) scale(1.035)', lightX: '85%', flip: false },
  { angle: 105, label: 'Lateral Tras. Dir. 105°', cardinal: '105°', perspective: 'perspective(1200px) rotateY(11deg) scale(1.03)', lightX: '80%', flip: false },
  { angle: 120, label: 'Diag. Tras. Dir. 120°', cardinal: '120°', perspective: 'perspective(1200px) rotateY(8deg) scale(1.02)', lightX: '73%', flip: true },
  { angle: 135, label: 'Diag. Tras. Dir. 135°', cardinal: '135° (Diag. Tras. Dir.)', perspective: 'perspective(1200px) rotateY(6deg) scale(1.015)', lightX: '65%', flip: true },
  { angle: 150, label: 'Traseira Ligeira Dir. 150°', cardinal: '150°', perspective: 'perspective(1200px) rotateY(3deg) scale(1.01)', lightX: '58%', flip: true },
  { angle: 165, label: 'Traseira Dir. 165°', cardinal: '165°', perspective: 'perspective(1200px) rotateY(1deg) scale(1.005)', lightX: '53%', flip: false },
  { angle: 180, label: 'Traseira Total 180°', cardinal: '180° (Traseira)', perspective: 'perspective(1200px) rotateY(0deg) scale(1)', lightX: '50%', flip: false },
  { angle: 195, label: 'Traseira Esq. 195°', cardinal: '195°', perspective: 'perspective(1200px) rotateY(-1deg) scale(1.005)', lightX: '47%', flip: false },
  { angle: 210, label: 'Traseira Ligeira Esq. 210°', cardinal: '210°', perspective: 'perspective(1200px) rotateY(-3deg) scale(1.01)', lightX: '42%', flip: true },
  { angle: 225, label: 'Diag. Tras. Esq. 225°', cardinal: '225° (Diag. Tras. Esq.)', perspective: 'perspective(1200px) rotateY(-6deg) scale(1.015)', lightX: '35%', flip: true },
  { angle: 240, label: 'Diag. Tras. Esq. 240°', cardinal: '240°', perspective: 'perspective(1200px) rotateY(-8deg) scale(1.02)', lightX: '27%', flip: true },
  { angle: 255, label: 'Lateral Tras. Esq. 255°', cardinal: '255°', perspective: 'perspective(1200px) rotateY(-11deg) scale(1.03)', lightX: '20%', flip: true },
  { angle: 270, label: 'Lateral Esquerda 270°', cardinal: '270° (Lateral Esq.)', perspective: 'perspective(1200px) rotateY(-12.5deg) scale(1.035)', lightX: '15%', flip: true },
  { angle: 285, label: 'Lateral Diant. Esq. 285°', cardinal: '285°', perspective: 'perspective(1200px) rotateY(-12deg) scale(1.032)', lightX: '19%', flip: false },
  { angle: 300, label: 'Lateral Diant. Esq. 300°', cardinal: '300°', perspective: 'perspective(1200px) rotateY(-11deg) scale(1.03)', lightX: '24%', flip: false },
  { angle: 315, label: 'Diag. Diant. Esq. 315°', cardinal: '315° (Diag. Diant. Esq.)', perspective: 'perspective(1200px) rotateY(-9deg) scale(1.025)', lightX: '30%', flip: false },
  { angle: 330, label: 'Diag. Diant. Esq. 330°', cardinal: '330°', perspective: 'perspective(1200px) rotateY(-6deg) scale(1.018)', lightX: '37%', flip: false },
  { angle: 345, label: 'Frente Ligeira Esq. 345°', cardinal: '345°', perspective: 'perspective(1200px) rotateY(-3deg) scale(1.01)', lightX: '44%', flip: false },
];

const PRIMARY_QUADRANTS = [
  { angle: 0, label: 'Frente', icon: '0°' },
  { angle: 45, label: 'Diag. Dir.', icon: '45°' },
  { angle: 90, label: 'Lateral Dir.', icon: '90°' },
  { angle: 135, label: 'Tras. Dir.', icon: '135°' },
  { angle: 180, label: 'Traseira', icon: '180°' },
  { angle: 225, label: 'Tras. Esq.', icon: '225°' },
  { angle: 270, label: 'Lateral Esq.', icon: '270°' },
  { angle: 315, label: 'Diag. Esq.', icon: '315°' },
];

/**
 * Vehicle360Viewer — Visualizador Orbital Fotográfico 360° Fluido
 * Rotação em 24 fotogramas dinâmicos com mapeamento contínuo de arraste.
 * Suporta sequências fotográficas de 24 a 36 fotos e fallback gracioso sem saltos abruptos.
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

  // Efeito de auto-rotação orbital suave (avança de 15° em 15°)
  useEffect(() => {
    let interval = null;
    if (isAutoRotating) {
      interval = setInterval(() => {
        setCurrentAngle((prev) => (prev + 15) % 360);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  // Controles de rotação por arraste com mapeamento contínuo proporcional
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
    
    // Mapeamento proporcional contínuo: sensibilidade balanceada
    const degDelta = Math.round(deltaX * 0.75);
    let newAngle = (startAngleRef.current - degDelta) % 360;
    if (newAngle < 0) newAngle += 360;

    // Encaixe nos 24 fotogramas (passos de 15 graus)
    const stepSize = 15;
    const snapped = (Math.round(newAngle / stepSize) * stepSize) % 360;
    if (snapped !== currentAngle) {
      setCurrentAngle(snapped);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const currentAngleObj = ORBITAL_SEQUENCE.find((a) => a.angle === currentAngle) || ORBITAL_SEQUENCE[0];

  // Determina a foto ativa mapeando proporcionalmente para as fotos disponíveis
  const getActiveImage = () => {
    // 1. Sequência completa de fotos 360 (ex: 24, 36 ou N fotos do veículo)
    const photoArray = Array.isArray(photos360) ? photos360 : (Array.isArray(car?.photos360) ? car.photos360 : null);
    if (photoArray && photoArray.length > 0) {
      const idx = Math.floor((currentAngle / 360) * photoArray.length) % photoArray.length;
      if (photoArray[idx]) {
        return getVehicleImageUrl(photoArray[idx]);
      }
    }

    // 2. Dicionário de fotos por ângulo explícito (ex: { 0: '...', 45: '...', ... })
    const photoMap = (!Array.isArray(photos360) && photos360) || (!Array.isArray(car?.photos360) && car?.photos360);
    if (photoMap && photoMap[currentAngle]) {
      return getVehicleImageUrl(photoMap[currentAngle]);
    }

    // 3. Galeria fotográfica real do veículo
    const gal = (car?.gallery && Array.isArray(car.gallery) && car.gallery.length > 0) 
      ? car.gallery 
      : (Array.isArray(gallery) ? gallery : null);

    if (gal && gal.length > 0) {
      const idx = Math.floor((currentAngle / 360) * gal.length) % gal.length;
      if (gal[idx]) return getVehicleImageUrl(gal[idx]);
    }

    // 4. Imagem autêntica do próprio veículo
    const baseImg = vehicleImage || car?.image || car?.imagem;
    return getVehicleImageUrl(baseImg || 'FotoGolfGTI.jpeg');
  };

  const activeImage = getActiveImage();

  const getAngleLabel = (angle) => {
    const match = ORBITAL_SEQUENCE.find((a) => a.angle === angle);
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
              Arraste suavemente para rotacionar a 360° ou clique nos quadrantes da carroceria
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
          initial={{ opacity: 0.94, scale: 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
        >
          {/* Foto Real do Veículo com Perspectiva 3D Orbital */}
          <img
            src={activeImage}
            alt={`${effectiveCarName} - Ângulo ${currentAngle}° (${currentAngleObj.label})`}
            onError={handleVehicleImageError}
            className="w-full h-full object-cover transition-transform duration-200 pointer-events-none"
            style={{
              transform: currentAngleObj.perspective + (currentAngleObj.flip ? ' scaleX(-1)' : ''),
              filter: 'contrast(1.02) saturate(1.04)'
            }}
            draggable={false}
          />

          {/* Gradiente de Iluminação de Estúdio Direcional */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{
              background: `radial-gradient(circle at ${currentAngleObj.lightX} 45%, rgba(255,255,255,0.09) 0%, transparent 65%), linear-gradient(to top, rgba(2,6,23,0.85) 0%, transparent 40%, rgba(2,6,23,0.3) 100%)`
            }}
          />

          {/* Marcador de Bússola Angular (Otimizado para GPU) */}
          <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-800 px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 flex items-center gap-2 pointer-events-none shadow-lg">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quadrante: <strong className="text-white">{currentAngleObj.cardinal}</strong></span>
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
          {PRIMARY_QUADRANTS.map((a) => {
            const isMatch = Math.abs(currentAngle - a.angle) <= 20 || (a.angle === 0 && currentAngle >= 340);
            return (
              <button
                key={a.angle}
                type="button"
                onClick={() => {
                  setCurrentAngle(a.angle);
                  setIsAutoRotating(false);
                }}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  isMatch
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20 scale-105'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span className="block text-[11px] font-bold">{a.icon}</span>
                <span className="block text-[9px] uppercase tracking-tight truncate mt-0.5 opacity-80">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Vehicle360Viewer;
