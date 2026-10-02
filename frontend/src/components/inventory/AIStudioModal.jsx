import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Upload, ImageIcon, CheckCircle2,
  RotateCcw, Download, Wand2, Building2, Sun, Trees, Waves
} from 'lucide-react';

// ─── BACKGROUND PRESETS ───────────────────────────────────────────────────────
const BG_PRESETS = [
  {
    id: 'studio-white',
    label: 'Estúdio Branco',
    icon: Sun,
    description: 'Fundo neutro profissional',
    gradient: 'from-slate-100 to-white',
    previewBg: '#f1f5f9',
    textColor: 'text-slate-600',
  },
  {
    id: 'studio-dark',
    label: 'Estúdio Dark',
    icon: Building2,
    description: 'Fundo escuro premium',
    gradient: 'from-slate-900 to-slate-800',
    previewBg: '#0f172a',
    textColor: 'text-white',
  },
  {
    id: 'outdoor-sky',
    label: 'Céu Limpo',
    icon: Sun,
    description: 'Outdoor com horizonte',
    gradient: 'from-sky-400 to-blue-600',
    previewBg: '#0ea5e9',
    textColor: 'text-white',
  },
  {
    id: 'urban',
    label: 'Urbano',
    icon: Building2,
    description: 'Cenário urbano moderno',
    gradient: 'from-slate-600 to-slate-800',
    previewBg: '#475569',
    textColor: 'text-white',
  },
  {
    id: 'nature',
    label: 'Natureza',
    icon: Trees,
    description: 'Bosque e vegetação',
    gradient: 'from-emerald-600 to-green-800',
    previewBg: '#059669',
    textColor: 'text-white',
  },
  {
    id: 'beach',
    label: 'Praia',
    icon: Waves,
    description: 'Areia e mar ao fundo',
    gradient: 'from-cyan-400 to-teal-600',
    previewBg: '#0891b2',
    textColor: 'text-white',
  },
];

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ['Upload', 'Estilo', 'Resultado'];
  return (
    <div className="flex items-center gap-2 mb-5">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
              i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-500'
            }`}>
              {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-[11px] font-bold ${i === step ? 'text-white' : 'text-slate-500'}`}>{label}</span>
          </div>
          {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── PREVIEW CARD ─────────────────────────────────────────────────────────────
function PreviewCard({ originalSrc, selectedBg, processing }) {
  const bg = BG_PRESETS.find(b => b.id === selectedBg);
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {/* Original */}
      <div className="relative rounded-xl overflow-hidden border border-slate-700/60 aspect-[16/10] bg-slate-800">
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-slate-900/80 text-slate-400 text-[9px] font-bold rounded-full border border-slate-700">
          Original
        </div>
        {originalSrc ? (
          <img src={originalSrc} alt="Original" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-slate-600" />
          </div>
        )}
      </div>

      {/* Result */}
      <div className={`relative rounded-xl overflow-hidden border aspect-[16/10] bg-gradient-to-br ${bg?.gradient || 'from-slate-700 to-slate-800'} border-blue-500/30`}>
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-slate-900/80 text-blue-400 text-[9px] font-bold rounded-full border border-blue-500/30">
          IA Processado
        </div>
        {processing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/70 z-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            >
              <Sparkles className="w-6 h-6 text-blue-400" />
            </motion.div>
            <p className="text-[10px] text-blue-300 font-bold">Processando IA...</p>
          </div>
        )}
        {originalSrc && !processing && (
          <img
            src={originalSrc}
            alt="Processed"
            className="w-full h-full object-cover opacity-90"
            style={{ mixBlendMode: 'luminosity', filter: 'contrast(1.05) saturate(1.1)' }}
          />
        )}
        {!originalSrc && !processing && (
          <div className={`w-full h-full flex items-center justify-center ${bg?.textColor || 'text-white'}`}>
            <Sparkles className="w-8 h-8 opacity-40" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AIStudioModal({ isOpen, onClose, vehicleName }) {
  const [step, setStep] = useState(0); // 0=upload, 1=style, 2=result
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [selectedBg, setSelectedBg] = useState('studio-white');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = e => {
      setPreviewSrc(e.target.result);
      setStep(1);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const handleProcess = () => {
    setProcessing(true);
    setStep(2);
    // Simula processamento IA (1.5s)
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 1800);
  };

  const handleReset = () => {
    setStep(0);
    setUploadedFile(null);
    setPreviewSrc(null);
    setSelectedBg('studio-white');
    setProcessing(false);
    setDone(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-br from-blue-950/60 to-slate-900 border-b border-slate-700/60 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-500/30">
              <Wand2 className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Estúdio Virtual IA</h3>
              <p className="text-xs text-slate-400">
                Remoção de fundo para {vehicleName || 'seu veículo'} — powered by Automatch AI
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <StepIndicator step={step} />

          <AnimatePresence mode="wait">
            {/* STEP 0: Upload */}
            {step === 0 && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFileChange(e.target.files?.[0])}
                  />
                  <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm font-bold text-white">Arraste ou clique para enviar</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP — máx. 10MB</p>
                </div>
                <div className="mt-4 p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-xs text-blue-300 leading-relaxed">
                    <Sparkles className="w-3.5 h-3.5 inline mr-1 text-blue-400" />
                    A IA detecta automaticamente o veículo e remove o fundo de pátio, aplicando o cenário profissional Automatch em segundos.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 1: Style Selection */}
            {step === 1 && (
              <motion.div key="style" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PreviewCard originalSrc={previewSrc} selectedBg={selectedBg} processing={false} />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Escolha o cenário:</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {BG_PRESETS.map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBg(bg.id)}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        selectedBg === bg.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className={`w-full h-8 rounded-lg bg-gradient-to-br ${bg.gradient} mb-1.5`}
                      />
                      <p className="text-[10px] font-bold text-white truncate">{bg.label}</p>
                      <p className="text-[9px] text-slate-500 truncate">{bg.description}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Trocar foto
                  </button>
                  <button
                    onClick={handleProcess}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Aplicar IA
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Result */}
            {step === 2 && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PreviewCard originalSrc={previewSrc} selectedBg={selectedBg} processing={processing} />

                {done && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <p className="text-xs text-emerald-300 font-bold">Fundo removido e cenário aplicado com sucesso!</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleReset}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Nova foto
                      </button>
                      <button
                        onClick={handleClose}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Usar no Anúncio
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
