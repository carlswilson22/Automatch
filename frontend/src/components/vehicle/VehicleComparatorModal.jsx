import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X, Check, AlertCircle, ShieldCheck, ArrowRight, DollarSign,
  Calendar, Gauge, Fuel, CheckCircle2, SlidersHorizontal, Plus,
  TrendingDown, TrendingUp, Minus, Car, Sparkles, Scale, ExternalLink,
  Search
} from 'lucide-react';

export default function VehicleComparatorModal({
  isOpen,
  onClose,
  baseCar = null,
  initialVehicles = [],
  availableCars = [],
  availableVehicles = []
}) {
  const navigate = useNavigate();
  const currentYear = 2026;

  const normalizeCar = (car) => {
    if (!car) return null;
    const name = car.name || `${car.brand || ''} ${car.model || 'Veículo'}`.trim();
    const price = Number(car.price) || 0;
    const mileage = Number(car.mileage || car.km) || 0;
    const image = car.image || car.imagem || '/images/FotoHondaCivic.jpeg';
    const year = Number(car.year) || currentYear;
    return { ...car, name, price, mileage, image, year };
  };

  const allAvailable = useMemo(() => {
    const raw = (availableCars && availableCars.length > 0) ? availableCars : (availableVehicles || []);
    return raw.map(normalizeCar).filter(Boolean);
  }, [availableCars, availableVehicles]);

  // Permite comparar de 2 a 3 veículos simultaneamente com sincronização reativa
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    const normalizedBase = normalizeCar(baseCar);
    const normalizedInit = (initialVehicles || []).map(normalizeCar).filter(Boolean);

    if (normalizedInit.length >= 2) {
      setSelectedVehicles(normalizedInit.slice(0, 3));
    } else if (normalizedBase) {
      const second = allAvailable.find(c => c && String(c.id) !== String(normalizedBase.id));
      setSelectedVehicles(second ? [normalizedBase, second] : [normalizedBase]);
    } else if (allAvailable.length >= 2) {
      setSelectedVehicles(allAvailable.slice(0, 2));
    } else if (allAvailable.length === 1) {
      setSelectedVehicles([allAvailable[0]]);
    } else {
      setSelectedVehicles([]);
    }
  }, [isOpen, baseCar, initialVehicles, allAvailable]);

  const [selectorOpenSlot, setSelectorOpenSlot] = useState(null);
  const [selectorSearch, setSelectorSearch] = useState('');

  if (!isOpen) return null;

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
    if (isNaN(pct)) return null;
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
    if (!price || isNaN(price)) return 0;
    const entry = price * 0.3; // 30% de entrada
    const financed = price - entry;
    // 48x taxa média 1.45% a.m.
    const i = 0.0145;
    const n = 48;
    const pmt = financed * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    return Math.round(pmt) || 0;
  };

  const [debouncedSelectorSearch, setDebouncedSelectorSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSelectorSearch(selectorSearch);
    }, 150);
    return () => clearTimeout(timer);
  }, [selectorSearch]);

  const filteredAvailable = useMemo(() => {
    const unselected = allAvailable.filter(c => c && !selectedVehicles.some(sv => sv && String(sv.id) === String(c.id)));
    if (!debouncedSelectorSearch.trim()) {
      return unselected.slice(0, 15);
    }
    const q = debouncedSelectorSearch.toLowerCase();
    return unselected.filter(c => {
      const carLabel = (c.name || `${c.brand || ''} ${c.model || ''}`).toLowerCase();
      return carLabel.includes(q);
    }).slice(0, 15);
  }, [allAvailable, selectedVehicles, debouncedSelectorSearch]);

  const comparisons = useMemo(() => {
    return (selectedVehicles || []).map(rawCar => {
      const car = normalizeCar(rawCar);
      if (!car) return null;
      const fipe = Number(car.fipePrice || car.fipe_price || (car.price * 1.04)) || 0;
      const fipeComparison = calculateFipeDiff(car.price, fipe);
      const km = Number(car.mileage || car.km || 0);
      const kmPerYear = calculateKmPerYear(km, car.year);
      const monthlyPayment = estimateMonthlyPayment(car.price);
      return {
        fipe,
        fipeComparison,
        km,
        kmPerYear,
        isLowKm: kmPerYear <= 12000,
        monthlyPayment
      };
    });
  }, [selectedVehicles]);

  const handleSelectCarForSlot = (car, slotIndex) => {
    if (!car) return;
    const updated = [...selectedVehicles];
    updated[slotIndex] = normalizeCar(car);
    setSelectedVehicles(updated.filter(Boolean));
    setSelectorOpenSlot(null);
  };

  const handleRemoveSlot = (slotIndex) => {
    if (selectedVehicles.length <= 1) return;
    const updated = selectedVehicles.filter((_, idx) => idx !== slotIndex);
    setSelectedVehicles(updated);
  };

  const handleAddThirdCar = () => {
    if (selectedVehicles.length >= 3) return;
    setSelectorOpenSlot(selectedVehicles.length);
    setSelectorSearch('');
  };

  // Suporte a fechamento pelo teclado (Esc)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
                  <Plus className="w-3.5 h-3.5" /> {selectedVehicles.length === 1 ? 'Adicionar 2º Carro' : 'Adicionar 3º Carro'}
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
            
            {selectedVehicles.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center my-6 bg-slate-950/60 rounded-3xl border border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                  <Scale className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Nenhum veículo selecionado para comparação</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-5">
                  Adicione veículos a partir da vitrine ou selecione na lista abaixo para confrontar preços FIPE, laudos e especificações.
                </p>
                {allAvailable.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedVehicles(allAvailable.slice(0, 2))}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                  >
                    Comparar Veículos Disponíveis
                  </button>
                )}
              </div>
            ) : (
              <>
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

              {/* Empty slot for adding 2nd or 3rd car */}
              {selectedVehicles.length < 3 && (
                <div
                  onClick={handleAddThirdCar}
                  className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 bg-slate-950/40 hover:bg-slate-900/60 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] transition-all cursor-pointer group"
                >
                  <Plus className="w-8 h-8 text-cyan-400 group-hover:scale-125 transition-transform mb-3" />
                  <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {selectedVehicles.length === 1 ? 'Escolher 2° Carro para Comparar' : 'Adicionar 3° Carro'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">Clique para buscar no estoque</span>
                </div>
              )}
            </div>

            {/* Vehicle Selector Popover */}
            <AnimatePresence>
              {selectorOpenSlot !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Escolher Veículo</h4>
                    <button onClick={() => setSelectorOpenSlot(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={selectorSearch}
                      onChange={e => setSelectorSearch(e.target.value)}
                      placeholder="Buscar por nome..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {filteredAvailable.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCarForSlot(c, selectorOpenSlot)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 transition-all text-left group"
                      >
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                          <img
                            src={c.image || c.imagem || '/images/FotoHondaCivic.jpeg'}
                            alt={c.name || c.model}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{c.name || `${c.brand} ${c.model}`}</p>
                          <p className="text-[10px] text-slate-400">{c.year} • {Number(c.mileage || c.km || 0).toLocaleString('pt-BR')} km</p>
                        </div>
                        <span className="text-xs font-bold text-cyan-400 shrink-0">
                          {formatMoney(c.price)}
                        </span>
                      </button>
                    ))}
                    {filteredAvailable.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">Nenhum veículo disponível</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dimension 1: Preço Anunciado vs Tabela FIPE */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> 1. Preço de Mercado vs Tabela FIPE Oficial
              </div>
              <div className={`grid gap-4 ${selectedVehicles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {selectedVehicles.map((car, idx) => {
                  const comp = comparisons[idx] || {};
                  return (
                    <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Tabela FIPE:</span>
                        <span className="font-bold text-slate-200">{formatMoney(comp?.fipe)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Variação:</span>
                        <span className={`font-bold flex items-center gap-1 ${
                          comp?.fipeComparison?.isBelow ? 'text-emerald-400' : 'text-slate-300'
                        }`}>
                          {comp?.fipeComparison?.isBelow ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                          {comp?.fipeComparison?.label || 'Compatível'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-slate-800/80">
                        <span className="text-slate-400">Simulação 48x:</span>
                        <span className="font-bold text-cyan-300">~{formatMoney(comp?.monthlyPayment)}/mês</span>
                      </div>
                    </div>
                  );
                })}
                {selectedVehicles.length === 1 && (
                  <div 
                    onClick={() => { setSelectorOpenSlot(1); setSelectorSearch(''); }}
                    className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-cyan-500/30 hover:border-cyan-400 flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
                  >
                    <Plus className="w-4 h-4 text-cyan-400 group-hover:scale-110 mb-1" />
                    <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-300">Escolha o 2° veículo</span>
                    <span className="text-[10px] text-slate-500">Confronte a Tabela FIPE lado a lado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dimension 2: Quilometragem & Rodagem Anual */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                <Gauge className="w-4 h-4" /> 2. Quilometragem & Intensidade de Uso
              </div>
              <div className={`grid gap-4 ${selectedVehicles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {selectedVehicles.map((car, idx) => {
                  const comp = comparisons[idx] || {};
                  return (
                    <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Total Rodado:</span>
                        <span className="font-bold text-white">{(comp?.km || 0).toLocaleString('pt-BR')} km</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Média Anual:</span>
                        <span className="font-bold text-slate-200">{(comp?.kmPerYear || 0).toLocaleString('pt-BR')} km/ano</span>
                      </div>
                      <div className="pt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          comp?.isLowKm 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {comp?.isLowKm ? '✓ Baixa Quilometragem Anual' : 'Uso Médio Convencional'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {selectedVehicles.length === 1 && (
                  <div 
                    onClick={() => { setSelectorOpenSlot(1); setSelectorSearch(''); }}
                    className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-cyan-500/30 hover:border-cyan-400 flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
                  >
                    <Plus className="w-4 h-4 text-cyan-400 group-hover:scale-110 mb-1" />
                    <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-300">Escolha o 2° veículo</span>
                    <span className="text-[10px] text-slate-500">Confronte o hodômetro e uso anual</span>
                  </div>
                )}
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
                {selectedVehicles.length === 1 && (
                  <div 
                    onClick={() => { setSelectorOpenSlot(1); setSelectorSearch(''); }}
                    className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-cyan-500/30 hover:border-cyan-400 flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
                  >
                    <Plus className="w-4 h-4 text-cyan-400 group-hover:scale-110 mb-1" />
                    <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-300">Escolha o 2° veículo</span>
                    <span className="text-[10px] text-slate-500">Confronte a perícia cautelar</span>
                  </div>
                )}
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
                {selectedVehicles.length === 1 && (
                  <div 
                    onClick={() => { setSelectorOpenSlot(1); setSelectorSearch(''); }}
                    className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-cyan-500/30 hover:border-cyan-400 flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
                  >
                    <Plus className="w-4 h-4 text-cyan-400 group-hover:scale-110 mb-1" />
                    <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-300">Escolha o 2° veículo</span>
                    <span className="text-[10px] text-slate-500">Confronte débitos e gravame DETRAN</span>
                  </div>
                )}
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
                {selectedVehicles.length === 1 && (
                  <div 
                    onClick={() => { setSelectorOpenSlot(1); setSelectorSearch(''); }}
                    className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-cyan-500/30 hover:border-cyan-400 flex flex-col items-center justify-center text-center cursor-pointer group transition-all"
                  >
                    <Plus className="w-4 h-4 text-cyan-400 group-hover:scale-110 mb-1" />
                    <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-300">Escolha o 2° veículo</span>
                    <span className="text-[10px] text-slate-500">Confronte itens de série e câmbio</span>
                  </div>
                )}
              </div>
            </div>
            </>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
