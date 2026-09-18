import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, CheckCircle2, Building2, ShieldCheck, HelpCircle } from 'lucide-react';

const FinancingSimulator = ({ price = 142000, carName = 'Veículo' }) => {
  // Estado Financiamento Padrão
  const [downPayment, setDownPayment] = useState(Math.round(price * 0.3));
  const [months, setMonths] = useState(48);
  const [selectedBank, setSelectedBank] = useState('itau');

  // Bancos e taxas
  const bankOptions = [
    { id: 'itau', name: 'Itaú Auto', rate: 0.0142, labelRate: '1,42% a.m.', badge: 'Menor Taxa' },
    { id: 'santander', name: 'Santander Auto', rate: 0.0145, labelRate: '1,45% a.m.', badge: 'Aprovação Rápida' },
    { id: 'bv', name: 'BV Financeira', rate: 0.0149, labelRate: '1,49% a.m.', badge: 'Entrada Flexível' }
  ];

  const currentBank = bankOptions.find(b => b.id === selectedBank) || bankOptions[0];
  const financedAmount = Math.max(0, price - downPayment);
  const monthlyRate = currentBank.rate;
  const installmentValue = financedAmount > 0 
    ? (financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) / (Math.pow(1 + monthlyRate, months) - 1)
    : 0;

  const handleDownPaymentPreset = (percentage) => {
    setDownPayment(Math.round(price * percentage));
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="font-black text-lg text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            <span>Simulador de Financiamento Bancário</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Condições personalizadas para <strong className="text-slate-200">{carName}</strong> com aprovação online.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Taxas Homologadas Bacen</span>
        </div>
      </div>

      {/* Conteúdo do Simulador */}
      <div className="space-y-6">
        {/* Comparador de Bancos */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Selecione a Instituição Financeira Parceira
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {bankOptions.map(b => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBank(b.id)}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  selectedBank === b.id
                    ? 'bg-blue-950/60 border-blue-500 text-white shadow-lg shadow-blue-950/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">{b.name}</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {b.badge}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-cyan-400 font-semibold">{b.labelRate}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Slider de Entrada e Atalhos */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Valor da Entrada</span>
            <span className="font-bold text-white font-mono">
              R$ {downPayment.toLocaleString('pt-BR')} ({Math.round((downPayment / price) * 100)}%)
            </span>
          </div>
          <input 
            type="range" 
            min={0} 
            max={Math.round(price * 0.8)} 
            step={1000}
            value={downPayment}
            onChange={e => setDownPayment(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
            <span>R$ 0 (Sem Entrada)</span>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => handleDownPaymentPreset(0.2)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                20%
              </button>
              <button 
                type="button" 
                onClick={() => handleDownPaymentPreset(0.3)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                30%
              </button>
              <button 
                type="button" 
                onClick={() => handleDownPaymentPreset(0.5)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                50%
              </button>
            </div>
            <span>R$ {(price * 0.8).toLocaleString('pt-BR')} (80%)</span>
          </div>
        </div>

        {/* Prazo de Parcelas */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Prazo de Pagamento (Meses)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[12, 24, 36, 48, 60].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  months === m 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-black' 
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>

        {/* Resumo da Parcela */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-slate-400">Saldo a financiar via {currentBank.name}:</p>
            <p className="text-base font-bold text-slate-200 font-mono">
              R$ {financedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Sujeito a análise cadastral e aprovação pelo banco.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              {months}x parcelas estimadas de
            </span>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Informação sobre entrada de veículo usado diretamente com o vendedor */}
        <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-slate-400">
          <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong className="text-slate-300">Tem um veículo usado para dar de entrada?</strong> Converse diretamente com a concessionária ou vendedor pelo chat integrado para negociar a avaliação e o abatimento no valor final.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancingSimulator;
