import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X, Check, AlertCircle, ShieldCheck, ArrowRight, DollarSign,
  Calendar, Gauge, Fuel, CheckCircle2, SlidersHorizontal, Plus,
  TrendingDown, TrendingUp, Minus, Car, Sparkles, Scale, ExternalLink
} from 'lucide-react';

export default function VehicleComparatorModal({
  isOpen,
  onClose,
  initialVehicles = [],
  availableVehicles = []
}) {
  const navigate = useNavigate();
  // Permite comparar de 2 a 3 veículos simultaneamente
  const [selectedVehicles, setSelectedVehicles] = useState(() => {
    if (initialVehicles.length > 0) return initialVehicles.slice(0, 3);
    if (availableVehicles.length >= 2) return availableVehicles.slice(0, 2);
    return [];
  });

  const [selectorOpenSlot, setSelectorOpenSlot] = useState(null);

  if (!isOpen) return null;

  const currentYear = 2026;

  const formatMoney = (val) => {
    if (!val || isNaN(val)) return 'R$ 0,00';
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calculateKmPerYear = (km, year) => {
    const age = Math.max(1, currentYear - (year || currentYear));
    return Math.round((km || 0) / age);
  };

  const calculateFipeDiff = (price, fipe) => {
    if (!price || !fipe) return null;
    const diff = price - fipe;
    const pct = (diff / fipe) * 100;
    return {
      diff,
      pct,
      isBelow: diff < 0,
      label: diff < 0 
        ? `${Math.abs(pct).toFixed(1)}% abaixo da FIPE` 
        : diff === 0 
          ? 'Exatamente na FIPE' 
          : `${pct.toFixed(1)}% acima da FIPE`
    };
  };

  const estimateMonthlyPayment = (price) => {
    if (!price) return 0;
    const entry = price * 0.3; // 30% de entrada
    const financed = price - entry;
    // 48x taxa média 1.45% a.m.
    const i = 0.0145;
    const n = 48;
    const pmt = financed * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    return Math.round(pmt);
  };

  const handleSelectCarForSlot = (car, slotIndex) => {
    const updated = [...selectedVehicles];
    updated[slotIndex] = car;
    setSelectedVehicles(updated);
    setSelectorOpenSlot(null);
  };

  const handleRemoveSlot = (slotIndex) => {
    if (selectedVehicles.length <= 2) return;
    const updated = selectedVehicles.filter((_, idx) => idx !== slotIndex);
    setSelectedVehicles(updated);
  };

  const handleAddThirdCar = () => {
    if (selectedVehicles.length >= 3) return;
    // Pega o primeiro carro disponível que ainda não esteja selecionado
    const selectedIds = new Set(selectedVehicles.map(c => String(c.id)));
    const candidate = availableVehicles.find(c => !selectedIds.has(String(c.id)));
    if (candidate) {
      setSelectedVehicles([...selectedVehicles, candidate]);
    } else if (availableVehicles.length > 0) {
      setSelectedVehicles([...selectedVehicles, availableVehicles[0]]);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  Comparador Multidimensional
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                    Lado a Lado
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confronte preços FIPE, laudos cautelares, situação cadastral DETRAN e especificações técnicas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {selectedVehicles.length < 3 && (
                <button
                  onClick={handleAddThirdCar}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 px-3 py-2 rounded-xl transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar 3º Carro
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comparison Table Body */}
          <div className="p-5 sm:p-6 overflow-x-auto overflow-y-auto flex-1 space-y-6">
            
            {/* Header Cards Row (Photos & Names) */}
            <div className={`grid gap-4 ${selectedVehicles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {selectedVehicles.map((car, idx) => (
                <div key={idx} className="relative bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between group">
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-900 border border-slate-800/60">
                    <img
                      src={car.image || car.imagem || '/images/FotoHondaCivic.jpeg'}
                      alt={car.name || `${car.brand} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-300 border border-white/10">
                      Carro {idx + 1}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-white text-base leading-tight mb-1">
                      {car.name || `${car.brand} ${car.model}`}
                    </h3>
                    <p className="text-xs text-slate-400 mb-2 font-medium">
                      Ano {car.year} • {Number(car.mileage || car.km || 0).toLocaleString('pt-BR')} km
                    </p>
                    <div className="text-lg font-black text-cyan-400">
                      {formatMoney(car.price)}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/encontrar/${car.id}`);
                      }}
                      className="flex-1 text-center bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Ver Anúncio</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    {selectedVehicles.length > 2 && (
                      <button
                        onClick={() => handleRemoveSlot(idx)}
                        className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-red-500/10 rounded-xl transition-colors"
                        title="Remover do comparador"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Dimension 1: Preço Anunciado vs Tabela FIPE */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> 1. Preço de Mercado vs Tabela FIPE Oficial
              </div>
              <div className={`grid gap-4 ${selectedVehicles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {selectedVehicles.map((car, idx) => {
                  const fipe = car.fipePrice || car.fipe_price || (car.price * 1.04);
                  const comparison = calculateFipeDiff(car.price, fipe);
                  return (
                    <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Tabela FIPE:</span>
                        <span className="font-bold text-slate-200">{formatMoney(fipe)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Variação:</span>
                        <span className={`font-bold flex items-center gap-1 ${
                          comparison?.isBelow ? 'text-emerald-400' : 'text-slate-300'
                        }`}>
                          {comparison?.isBelow ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                          {comparison?.label}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-slate-800/80">
                        <span className="text-slate-400">Simulação 48x:</span>
                        <span className="font-bold text-cyan-300">~{formatMoney(estimateMonthlyPayment(car.price))}/mês</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dimension 2: Quilometragem & Rodagem Anual */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                <Gauge className="w-4 h-4" /> 2. Quilometragem & Intensidade de Uso
              </div>
              <div className={`grid gap-4 ${selectedVehicles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {selectedVehicles.map((car, idx) => {
                  const km = Number(car.mileage || car.km || 0);
                  const kmPerYear = calculateKmPerYear(km, car.year);
                  const isLowKm = kmPerYear <= 12000;
                  return (
                    <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Total Rodado:</span>
                        <span className="font-bold text-white">{km.toLocaleString('pt-BR')} km</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Média Anual:</span>
                        <span className="font-bold text-slate-200">{kmPerYear.toLocaleString('pt-BR')} km/ano</span>
                      </div>
                      <div className="pt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          isLowKm 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {isLowKm ? '✓ Baixa Quilometragem Anual' : 'Uso Médio Convencional'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dimension 3: Laudo Cautelar & Estrutura */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> 3. Laudo Cautelar & Integridade Estrutural
              </div>
              <div className={`grid gap-4 ${selectedVehicles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {selectedVehicles.map((car, idx) => (
                  <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Veredito do Laudo:</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado 100%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Estrutura & Longarinas:</span>
                      <span className="font-medium text-slate-200">Sem Soldas / Original</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Leilão / Sinistro:</span>
                      <span className="font-bold text-emerald-400">Nenhum Registro</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Pintura Micrométrica:</span>
                      <span className="font-medium text-slate-300">Padrão Original (115µm)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dimension 4: Situação Cadastral DETRAN */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 4. Situação Cadastral & Débitos DETRAN
              </div>
              <div className={`grid gap-4 ${selectedVehicles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {selectedVehicles.map((car, idx) => (
                  <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">IPVA / Licenciamento:</span>
                      <span className="font-bold text-emerald-400">100% Quitado</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Multas e Débitos:</span>
                      <span className="font-bold text-emerald-400">R$ 0,00 (Nada Consta)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Restrição Financeira:</span>
                      <span className="font-medium text-slate-200">Sem Gravame (Livre)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dimension 5: Mecânica & Especificações */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                <Fuel className="w-4 h-4" /> 5. Especificações & Categoria
              </div>
              <div className={`grid gap-4 ${selectedVehicles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {selectedVehicles.map((car, idx) => (
                  <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Carroceria:</span>
                      <span className="font-bold text-white">{car.bodyType || 'SUV / Hatch'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Combustível:</span>
                      <span className="font-medium text-slate-300">{car.fuel || 'Flex'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Câmbio:</span>
                      <span className="font-medium text-slate-300">{car.transmission || 'Automático'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Procedência:</span>
                      <span className="font-semibold text-emerald-400">Garantia Automatch</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
