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
    setScanComplete(false);
    setIsScanning(false);
  }, [vehicleImage]);

  const handleScan = () => {
    if (!uploadedImage) return;
    setIsScanning(true);
    setScanComplete(false);
    
    // Simulate scan time
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 2500);
  };

  const severityColors = {
    low: 'bg-amber-400',
    medium: 'bg-amber-500',
    high: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2 text-brand-navy font-semibold">
          <Scan className="w-5 h-5 text-brand-blue" />
          <h2>Automatch AI Scanner</h2>
        </div>
        {!scanComplete && (
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-medium">Ready</span>
        )}
        {scanComplete && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Scan Complete
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Upload / Image Area */}
        <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center">
          
          {!uploadedImage ? (
            <div className="flex flex-col items-center justify-center text-slate-500">
              <UploadCloud className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm font-medium">Drag & Drop vehicle photo</p>
              <p className="text-xs opacity-70">or click to upload</p>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img 
                src={uploadedImage} 
                alt="Vehicle scan target" 
                className="w-full h-full object-cover"
              />
              
              <AnimatePresence>
                {/* Laser Scanner Effect */}
                {isScanning && (
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 2.5, ease: "linear", repeat: 0 }}
                    className="absolute left-0 right-0 h-1 z-10 bg-brand-blue shadow-[0_0_15px_rgba(37,99,235,0.8)]"
                  />
                )}
                {isScanning && (
                   <motion.div
                   initial={{ top: '0%', opacity: 0.2 }}
                   animate={{ top: '100%', opacity: 0.2 }}
                   transition={{ duration: 2.5, ease: "linear", repeat: 0 }}
                   className="absolute left-0 right-0 h-32 -mt-32 z-0 bg-gradient-to-b from-transparent to-brand-blue"
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
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform ${severityColors[point.severity] || 'bg-brand-blue'}`}>
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      
                      {/* Pulse effect */}
                      <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${severityColors[point.severity] || 'bg-brand-blue'}`}></div>
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
              onClick={handleScan}
              disabled={isScanning || !uploadedImage}
              className={`w-full py-3 rounded-lg font-medium text-white transition-all flex justify-center items-center gap-2 ${
                isScanning ? 'bg-slate-800' : 'bg-brand-blue hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
               {isScanning ? (
                 <>
                   <Scan className="w-5 h-5 animate-spin" />
                   Analysing structures...
                 </>
               ) : (
                 <>Run Full Diagnostics</>
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
                      className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm flex items-start gap-3 shadow-sm"
                    >
                      <div className="pt-0.5">
                        <Wrench className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        {damagePoints.filter(d => d.id === activeDamage).map(d => (
                           <div key={d.id}>
                             <p className="font-semibold text-brand-navy">{d.description}</p>
                             <p className="text-slate-500">Reparo estimado: <span className="text-slate-700 font-medium">R$ {d.repairCost}</span></p>
                           </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
               </AnimatePresence>

               {damagePoints.length === 0 && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-sm flex items-start gap-3 shadow-sm">
                     <div className="pt-0.5">
                        <Scan className="w-5 h-5 text-brand-emerald" />
                     </div>
                     <div className="flex-1">
                        <p className="font-semibold text-brand-emerald">Nenhum dano detectado</p>
                        <p className="text-emerald-700">A lataria encontra-se íntegra segundo os padrões Automatch.</p>
                     </div>
                  </div>
               )}

              <button 
                onClick={() => {
                  setScanComplete(false);
                  setActiveDamage(null);
                }}
                className="w-full py-3 rounded-lg font-medium text-brand-blue bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all"
              >
                Scan Another Area
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomatchScan;
