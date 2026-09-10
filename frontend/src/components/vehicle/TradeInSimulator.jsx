import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowLeftRight, CheckCircle2, DollarSign, Building2, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import axios from 'axios';

const TradeInSimulator = ({ price = 142000, carName = 'Veículo' }) => {
  const [activeTab, setActiveTab] = useState('financing'); // 'financing' | 'tradein'

  // Estado Financiamento Padrão
  const [downPayment, setDownPayment] = useState(Math.round(price * 0.3));
  const [months, setMonths] = useState(48);
  const [selectedBank, setSelectedBank] = useState('itau');

  // Estado Troca com Troco
  const [tradeinPlate, setTradeinPlate] = useState('');
  const [tradeinBrand, setTradeinBrand] = useState('Volkswagen');
  const [tradeinModel, setTradeinModel] = useState('Polo 1.0 TSI');
  const [tradeinYear, setTradeinYear] = useState(2020);
  const [tradeinKm, setTradeinKm] = useState(45000);
  const [tradeinCondition, setTradeinCondition] = useState('bom');
  const [isCalculating, setIsCalculating] = useState(false);
  const [tradeinResult, setTradeinResult] = useState(null);

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

  // Cálculo da Troca com Troco via API
  const handleCalculateTradeIn = async (e) => {
    if (e) e.preventDefault();
    setIsCalculating(true);
    try {
      const resp = await axios.post('/api/troca-com-troco', {
        target_price: price,
        tradein_plate: tradeinPlate || 'BRA-2E19',
        tradein_brand: tradeinBrand,
        tradein_model: tradeinModel,
        tradein_year: Number(tradeinYear),
        tradein_km: Number(tradeinKm),
        condition: tradeinCondition
      });
      if (resp.data && resp.data.status === 'success') {
        setTradeinResult(resp.data);
      }
    } catch (err) {
      console.warn('Fallback cálculo troca com troco:', err);
      // Fallback local seguro
      const fipeEstimate = Math.max(25000, 85000 - ((2024 - tradeinYear) * 7000));
      const factor = tradeinCondition === 'excelente' ? 0.90 : (tradeinCondition === 'bom' ? 0.85 : 0.78);
      const aval = Math.round(fipeEstimate * factor);
      const diff = aval - price;

      if (diff > 0) {
        setTradeinResult({
          status: 'success',
          tipo_operacao: 'troco_a_receber',
          veiculo_entrada: {
            modelo: `${tradeinBrand} ${tradeinModel} ${tradeinYear}`,
            valor_avaliacao: aval,
            percentual_fipe: `${Math.round(factor * 100)}%`
          },
          troco_pix: diff,
          saldo_financiar: 0,
          mensagem: `Parabéns! Seu veículo vale mais que o anunciado. Você sai de carro novo e recebe R$ ${diff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} direto no Pix!`,
          bancos: []
        });
      } else {
        const saldo = Math.abs(diff);
        setTradeinResult({
          status: 'success',
          tipo_operacao: 'saldo_a_financiar',
          veiculo_entrada: {
            modelo: `${tradeinBrand} ${tradeinModel} ${tradeinYear}`,
            valor_avaliacao: aval,
            percentual_fipe: `${Math.round(factor * 100)}%`
          },
          troco_pix: 0,
          saldo_financiar: saldo,
          mensagem: `Seu carro entra como entrada de R$ ${aval.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} e você financia apenas a diferença!`,
          bancos: bankOptions.map(b => ({
            banco: b.name,
            taxa_mensal: b.labelRate,
            destaque: b.badge,
            parcelas: {
              '24x': Math.round((saldo * (b.rate * Math.pow(1 + b.rate, 24))) / (Math.pow(1 + b.rate, 24) - 1)),
              '36x': Math.round((saldo * (b.rate * Math.pow(1 + b.rate, 36))) / (Math.pow(1 + b.rate, 36) - 1)),
              '48x': Math.round((saldo * (b.rate * Math.pow(1 + b.rate, 48))) / (Math.pow(1 + b.rate, 48) - 1)),
              '60x': Math.round((saldo * (b.rate * Math.pow(1 + b.rate, 60))) / (Math.pow(1 + b.rate, 60) - 1)),
            }
          }))
        });
      }
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 text-slate-100 shadow-xl space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="font-black text-lg text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            <span>Condições de Aquisição & Crédito</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Simule o financiamento bancário ou use seu carro atual como entrada com troco.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('financing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'financing'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Financiamento</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tradein')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'tradein'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Troca com Troco</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: FINANCIAMENTO INTELIGENTE MULTI-BANCOS ─── */}
      {activeTab === 'financing' && (
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

          {/* Slider de Entrada */}
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
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>R$ 0 (Sem Entrada)</span>
              <span>R$ {(price * 0.8).toLocaleString('pt-BR')} (80%)</span>
            </div>
          </div>

          {/* Prazo de Parcelas */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Prazo de Pagamento
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[24, 36, 48, 60].map(m => (
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
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-400">Saldo Financiado no {currentBank.name}:</p>
              <p className="text-sm font-bold text-slate-300 font-mono">
                R$ {financedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                {months}x parcelas estimadas de
              </span>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: TROCA COM TROCO ─── */}
      {activeTab === 'tradein' && (
        <div className="space-y-6">
          <div className="bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-2xl flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs text-emerald-300">
              <p className="font-bold">Como funciona a Troca com Troco?</p>
              <p className="text-emerald-400/80 text-[11px] mt-0.5 leading-relaxed">
                Avaliamos seu carro atual na hora. Se ele valer mais do que o {carName}, você recebe o saldo em dinheiro via Pix. Se valer menos, o valor entra como entrada de 100% e você financia apenas o restante!
              </p>
            </div>
          </div>

          <form onSubmit={handleCalculateTradeIn} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Placa do Seu Veículo</label>
                <input
                  type="text"
                  placeholder="Ex: ABC-1D23"
                  value={tradeinPlate}
                  onChange={e => setTradeinPlate(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Marca</label>
                <input
                  type="text"
                  placeholder="Ex: Volkswagen"
                  value={tradeinBrand}
                  onChange={e => setTradeinBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Modelo / Versão</label>
                <input
                  type="text"
                  placeholder="Ex: Polo 1.0 TSI"
                  value={tradeinModel}
                  onChange={e => setTradeinModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Ano de Fabricação</label>
                <input
                  type="number"
                  placeholder="2020"
                  value={tradeinYear}
                  onChange={e => setTradeinYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Quilometragem Atual</label>
                <input
                  type="number"
                  placeholder="45000"
                  value={tradeinKm}
                  onChange={e => setTradeinKm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Estado de Conservação</label>
                <select
                  value={tradeinCondition}
                  onChange={e => setTradeinCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 outline-none"
                >
                  <option value="excelente">Excelente (Sem detalhes)</option>
                  <option value="bom">Bom (Pequenas marcas de uso)</option>
                  <option value="regular">Regular (Necessita reparos)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCalculating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-900/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isCalculating ? 'Calculando Avaliação & Troco...' : 'Calcular Troca com Troco Agora'}
            </button>
          </form>

          {/* Resultado da Avaliação da Troca */}
          <AnimatePresence>
            {tradeinResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Avaliação do Seu Veículo</span>
                    <p className="text-base font-black text-white">{tradeinResult.veiculo_entrada?.modelo}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Valor de Entrada:</span>
                    <p className="text-lg font-black text-cyan-400">
                      R$ {tradeinResult.veiculo_entrada?.valor_avaliacao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Caso 1: Troco a Receber */}
                {tradeinResult.tipo_operacao === 'troco_a_receber' && (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-300">Troco a Receber no Pix:</span>
                      <p className="text-2xl font-black text-emerald-400">
                        R$ {tradeinResult.troco_pix?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
                      Pix Imediato
                    </span>
                  </div>
                )}

                {/* Caso 2: Saldo a Financiar */}
                {tradeinResult.tipo_operacao === 'saldo_a_financiar' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Diferença Restante para Quitar o Carro:</span>
                      <span className="font-bold text-rose-400 font-mono">
                        R$ {tradeinResult.saldo_financiar?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {(tradeinResult.bancos || []).map((b, idx) => (
                        <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                          <p className="font-bold text-white text-[11px]">{b.banco}</p>
                          <p className="text-[10px] text-slate-400">Taxa: {b.taxa_mensal}</p>
                          <div className="mt-2 text-right">
                            <span className="text-[9px] text-slate-500">48x de</span>
                            <p className="font-black text-cyan-400 text-sm">
                              R$ {b.parcelas?.['48x']?.toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  {tradeinResult.mensagem}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TradeInSimulator;
