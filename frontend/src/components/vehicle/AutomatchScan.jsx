import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Scan, AlertCircle, Wrench } from 'lucide-react';

const AutomatchScan = ({ vehicleImage, damagePoints = [] }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(vehicleImage || null);
  const [activeDamage, setActiveDamage] = useState(null);

  useEffect(() => {
    setUploadedImage(vehicleImage);
    if (damagePoints && damagePoints.length > 0) {
      setScanComplete(true);
      setIsScanning(false);
      setActiveDamage(damagePoints[0].id);
    } else {
      setScanComplete(false);
      setIsScanning(false);
      setActiveDamage(null);
    }
  }, [vehicleImage, damagePoints]);

  const handleScan = () => {
    if (!uploadedImage) return;
    setIsScanning(true);
    setScanComplete(false);
    
    // Simula tempo de escaneamento visual
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      if (damagePoints && damagePoints.length > 0) {
        setActiveDamage(damagePoints[0].id);
      }
    }, 1800);
  };

  const severityColors = {
    low: 'bg-amber-400',
    medium: 'bg-amber-500',
    high: 'bg-red-500'
  };

  return (
    <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/80">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Scan className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm">Scanner Pericial Automatch IA</h2>
        </div>
        {!scanComplete && (
          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-medium border border-slate-700">Pronto</span>
        )}
        {scanComplete && (
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Perícia Concluída
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Upload / Image Area */}
        <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
          
          {!uploadedImage ? (
            <div className="flex flex-col items-center justify-center text-slate-500">
              <UploadCloud className="w-10 h-10 mb-2 opacity-50 text-slate-400" />
              <p className="text-sm font-medium">Nenhuma foto selecionada</p>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img 
                src={uploadedImage} 
                alt="Alvo do Scanner" 
                className="w-full h-full object-cover"
              />
              
              <AnimatePresence>
                {/* Laser Scanner Effect */}
                {isScanning && (
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1.8, ease: "linear", repeat: 0 }}
                    className="absolute left-0 right-0 h-1 z-10 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.9)]"
                  />
                )}
                {isScanning && (
                   <motion.div
                   initial={{ top: '0%', opacity: 0.3 }}
                   animate={{ top: '100%', opacity: 0.3 }}
                   transition={{ duration: 1.8, ease: "linear", repeat: 0 }}
                   className="absolute left-0 right-0 h-32 -mt-32 z-0 bg-gradient-to-b from-transparent to-cyan-500"
                 />
                )}
              </AnimatePresence>

              {/* Damage Hotspots */}
              <AnimatePresence>
                {scanComplete && damagePoints.map((point) => (
                  <motion.div
                    key={point.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute z-20"
                    style={{ left: `${point.x}%`, top: `${point.y}%`, transform: 'translate(-50%, -50%)' }}
                    onClick={() => setActiveDamage(activeDamage === point.id ? null : point.id)}
                  >
                    <div className="relative group cursor-pointer">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white cursor-pointer hover:scale-125 transition-transform ${severityColors[point.severity] || 'bg-blue-600'}`}>
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      
                      {/* Pulse effect */}
                      <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${severityColors[point.severity] || 'bg-blue-600'}`}></div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Action Button & Context */}
        <div className="mt-4 mt-auto">
          {!scanComplete ? (
            <button 
              type="button"
              onClick={handleScan}
              disabled={isScanning || !uploadedImage}
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all flex justify-center items-center gap-2 ${
                isScanning ? 'bg-slate-800' : 'bg-blue-600 hover:bg-blue-500'
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
            >
               {isScanning ? (
                 <>
                   <Scan className="w-4 h-4 animate-spin text-cyan-300" />
                   <span>Analisando estruturas com IA...</span>
                 </>
               ) : (
                 <>Executar Diagnóstico Visual</>
               )}
            </button>
          ) : (
            <div className="space-y-3">
               {/* Details card for active damage */}
               <AnimatePresence>
                  {activeDamage && (
                    <motion.div 
                      key="damage-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs flex items-start gap-3 shadow-md"
                    >
                      <div className="pt-0.5">
                        <Wrench className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        {damagePoints.filter(d => d.id === activeDamage).map(d => (
                           <div key={d.id}>
                             <div className="flex items-center justify-between gap-2 mb-1">
                               <p className="font-bold text-white">{d.description}</p>
                               <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${d.severity === 'high' ? 'bg-red-500/20 text-red-400' : d.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                 Gravidade {d.severity === 'high' ? 'Alta' : d.severity === 'medium' ? 'Média' : 'Leve'}
                               </span>
                             </div>
                             <p className="text-slate-400">Reparo estimado: <strong className="text-rose-400 font-bold">R$ {d.repairCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
                           </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
               </AnimatePresence>

               {damagePoints.length === 0 && (
                  <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-3 text-xs flex items-start gap-3 shadow-sm">
                     <div className="pt-0.5">
                        <Scan className="w-5 h-5 text-emerald-400" />
                     </div>
                     <div className="flex-1">
                        <p className="font-bold text-emerald-300">Nenhum dano detectado na lataria</p>
                        <p className="text-emerald-400/80 mt-0.5">Veículo aprovado nos padrões periciais de alinhamento e uniformidade de pintura.</p>
                     </div>
                  </div>
               )}

              <button 
                type="button"
                onClick={() => {
                  setScanComplete(false);
                  setActiveDamage(null);
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                Escanear Novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomatchScan;
