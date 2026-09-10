import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

const FinancingSimulator = ({ price }) => {
  const [downPayment, setDownPayment] = useState(Math.round(price * 0.3));
  const [months, setMonths] = useState(48);

  const financedAmount = Math.max(0, price - downPayment);
  const monthlyInterest = 0.0149; // 1.49% a.m.
  const installmentValue = financedAmount > 0 
    ? (financedAmount * (monthlyInterest * Math.pow(1 + monthlyInterest, months))) / (Math.pow(1 + monthlyInterest, months) - 1)
    : 0;

  return (
    <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700 text-slate-100">
      <div className="flex items-center gap-2 mb-4 text-blue-400">
        <Calculator className="w-5 h-5" />
        <h3 className="font-bold text-base uppercase tracking-wider text-white">Simulador de Financiamento</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Entrada</span>
            <span className="font-bold text-white">R$ {downPayment.toLocaleString('pt-BR')} ({Math.round((downPayment/price)*100)}%)</span>
          </div>
          <input 
            type="range" 
            min={0} 
            max={price * 0.8} 
            step={1000}
            value={downPayment}
            onChange={e => setDownPayment(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Prazo de Parcelas</label>
          <div className="grid grid-cols-4 gap-2">
            {[24, 36, 48, 60].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  months === m 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Parcelas Estimadas</span>
          <span className="text-2xl font-black text-emerald-400">
            {months}x de R$ {Math.round(installmentValue).toLocaleString('pt-BR')}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 max-w-[100px] text-right">Taxa simulada a partir de 1,49% a.m.</span>
      </div>
    </div>
  );
};

export default FinancingSimulator;
