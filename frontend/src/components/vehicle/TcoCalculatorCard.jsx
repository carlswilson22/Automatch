import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator, Fuel, ShieldCheck, Wrench, Building2, ChevronDown,
  Info, Sparkles, TrendingUp, Gauge, HelpCircle, Zap
} from 'lucide-react';

const UF_RATES = [
  { uf: 'SP', rate: 0.04, label: 'São Paulo (4,0%)' },
  { uf: 'RJ', rate: 0.04, label: 'Rio de Janeiro (4,0%)' },
  { uf: 'MG', rate: 0.04, label: 'Minas Gerais (4,0%)' },
  { uf: 'DF', rate: 0.035, label: 'Distrito Federal (3,5%)' },
  { uf: 'PR', rate: 0.035, label: 'Paraná (3,5%)' },
  { uf: 'RS', rate: 0.03, label: 'Rio Grande do Sul (3,0%)' },
  { uf: 'SC', rate: 0.02, label: 'Santa Catarina (2,0%)' },
  { uf: 'GO', rate: 0.0345, label: 'Goiás (3,45%)' },
  { uf: 'BA', rate: 0.025, label: 'Bahia (2,5%)' },
  { uf: 'PE', rate: 0.025, label: 'Pernambuco (2,5%)' },
];

export default function TcoCalculatorCard({
  price = 90000,
  fipePrice,
  fuelType = 'Flex',
  carYear,
  className = ''
}) {
  const [selectedUf, setSelectedUf] = useState('SP');
  const [monthlyKm, setMonthlyKm] = useState(1000);
  const [activeFuel, setActiveFuel] = useState(() => {
    const f = String(fuelType || '').toLowerCase();
    if (f.includes('elétr') || f.includes('eletri')) return 'eletrico';
    if (f.includes('híbr') || f.includes('hibr')) return 'hibrido';
    if (f.includes('diesel')) return 'diesel';
    if (f.includes('etanol') || f.includes('álcool')) return 'etanol';
    return 'gasolina';
  });

  const numPrice = typeof price === 'number' ? price : Number(String(price || 0).replace(/[^0-9.-]+/g, '')) || 90000;
  const numFipe = typeof fipePrice === 'number' && fipePrice > 0 ? fipePrice : numPrice;

  // Defaults por combustível
  const fuelConfigs = {
    gasolina: { name: 'Gasolina', consumption: 11.5, defaultPrice: 5.89, unit: 'L' },
    etanol: { name: 'Etanol', consumption: 8.5, defaultPrice: 3.89, unit: 'L' },
    diesel: { name: 'Diesel', consumption: 12.8, defaultPrice: 6.09, unit: 'L' },
    hibrido: { name: 'Híbrido', consumption: 18.5, defaultPrice: 5.89, unit: 'L' },
    eletrico: { name: 'Elétrico', consumption: 6.5, defaultPrice: 0.85, unit: 'kWh' }
  };

  const [fuelPrices, setFuelPrices] = useState({
    gasolina: 5.89,
    etanol: 3.89,
    diesel: 6.09,
    hibrido: 5.89,
    eletrico: 0.85
  });

  // Cálculo reativo de TCO
  const calculations = useMemo(() => {
    const ufObj = UF_RATES.find(u => u.uf === selectedUf) || UF_RATES[0];
    const ipvaAnual = numFipe * ufObj.rate;
    const ipvaMensal = ipvaAnual / 12;

    const seguroAnual = numPrice * 0.045; // Média de mercado 4.5% a.a.
    const seguroMensal = seguroAnual / 12;

    const manutencaoBase = 125.0;
    // Veículos elétricos têm manutenção ~45% menor (sem óleo, filtros, velas)
    const isEletrico = activeFuel === 'eletrico';
    const manutencaoMensal = isEletrico ? Math.round(manutencaoBase * 0.55) : manutencaoBase;

    const currentFuelConf = fuelConfigs[activeFuel] || fuelConfigs.gasolina;
    const currentPricePerUnit = fuelPrices[activeFuel] || currentFuelConf.defaultPrice;
    const unitsPerMonth = monthlyKm / currentFuelConf.consumption;
    const combustivelMensal = unitsPerMonth * currentPricePerUnit;

    const totalMensal = ipvaMensal + seguroMensal + manutencaoMensal + combustivelMensal;
    const totalAnual = totalMensal * 12;
    const custoDiario = totalMensal / 30;

    // Format rate to avoid floating-point artifacts (e.g., 3.5000000000000004 → 3.5)
    const formattedRate = parseFloat((ufObj.rate * 100).toFixed(2));

    return {
      ufRate: formattedRate,
      ipvaMensal: Math.round(ipvaMensal),
      ipvaAnual: Math.round(ipvaAnual),
      seguroMensal: Math.round(seguroMensal),
      seguroAnual: Math.round(seguroAnual),
      manutencaoMensal: Math.round(manutencaoMensal),
      manutencaoAnual: Math.round(manutencaoMensal * 12),
      combustivelMensal: Math.round(combustivelMensal),
      combustivelAnual: Math.round(combustivelMensal * 12),
      unitsConsumed: Math.round(unitsPerMonth),
      fuelUnit: currentFuelConf.unit,
      fuelName: currentFuelConf.name,
      isEletrico,
      totalMensal: Math.round(totalMensal),
      totalAnual: Math.round(totalAnual),
      custoDiario: Math.round(custoDiario)
    };
  }, [selectedUf, monthlyKm, activeFuel, fuelPrices, numPrice, numFipe]);

  return (
    <div className={`bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-6 ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-900/30">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Custo Total de Posse (TCO)</span>
              <span className="text-[10px] uppercase font-black tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                Estimativa Real
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Quanto este carro realmente custa por mês na sua garagem
            </p>
          </div>
        </div>

        {/* Card de Destaque Custo Diário */}
        <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Custo Diário</span>
          <span className="text-base font-black text-cyan-400 whitespace-nowrap">
            R$ {calculations.custoDiario.toLocaleString('pt-BR')} / dia
          </span>
        </div>
      </div>

      {/* Controles de Simulação Interativos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
        
        {/* Seletor de UF */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Estado (IPVA)</span>
          </label>
          <div className="relative">
            <select
              value={selectedUf}
              onChange={(e) => setSelectedUf(e.target.value)}
              aria-label="Estado para cálculo do IPVA"
              className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 pr-8 cursor-pointer"
            >
              {UF_RATES.map((u) => (
                <option key={u.uf} value={u.uf} className="bg-slate-900 text-slate-200">
                  {u.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Quilometragem Mensal com Slider */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Uso Mensal</span>
            </span>
            <span className="text-cyan-400 font-bold lowercase whitespace-nowrap">{monthlyKm.toLocaleString('pt-BR')} km/mês</span>
          </div>
          <input
            type="range"
            min="300"
            max="3000"
            step="100"
            value={monthlyKm}
            onChange={(e) => setMonthlyKm(Number(e.target.value))}
            aria-label="Quilometragem mensal estimada"
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-semibold">
            <span>300 km</span>
            <span>1.500 km</span>
            <span>3.000 km</span>
          </div>
        </div>

        {/* Tipo de Combustível */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-emerald-400" />
            <span>Combustível</span>
          </label>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {['gasolina', 'etanol', 'diesel', 'eletrico'].map((fKey) => (
              <button
                key={fKey}
                type="button"
                onClick={() => setActiveFuel(fKey)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  activeFuel === fKey
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fKey === 'eletrico' ? 'Elétr.' : fKey}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Lista Analítica Hierárquica de Custos (Anti-Quebra & Responsiva) */}
      <div className="space-y-2.5">
        
        {/* Item 1: IPVA */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white">IPVA Estimado</h4>
                <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {selectedUf} ({String(calculations.ufRate).replace('.', ',')}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 break-words [overflow-wrap:anywhere]">
                Calculado com base no valor venal FIPE oficial (R$ {numFipe.toLocaleString('pt-BR')})
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
            <div className="text-base sm:text-lg font-black text-white whitespace-nowrap tabular-nums">
              R$ {calculations.ipvaMensal.toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">/mês</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap tabular-nums mt-0.5">
              R$ {calculations.ipvaAnual.toLocaleString('pt-BR')} /ano
            </div>
          </div>
        </div>

        {/* Item 2: Seguro Médio */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white">Seguro Auto Compreensivo</h4>
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                  4,5% a.a.
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 break-words [overflow-wrap:anywhere]">
                Estimativa para cobertura total (colisão, roubo/furto, terceiros e guincho 24h)
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
            <div className="text-base sm:text-lg font-black text-white whitespace-nowrap tabular-nums">
              R$ {calculations.seguroMensal.toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">/mês</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap tabular-nums mt-0.5">
              R$ {calculations.seguroAnual.toLocaleString('pt-BR')} /ano
            </div>
          </div>
        </div>

        {/* Item 3: Manutenção Preventiva */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white">Manutenção Preventiva</h4>
                {calculations.isEletrico ? (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-3 h-3 text-emerald-400" /> VE: -45%
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                    Revisões Periódicas
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 break-words [overflow-wrap:anywhere]">
                {calculations.isEletrico
                  ? 'Filtro de cabine, arrefecimento da bateria, pastilhas regenerativas e pneus'
                  : 'Troca de óleo, filtros, velas, pastilhas de freio e alinhamento'
                }
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
            <div className="text-base sm:text-lg font-black text-white whitespace-nowrap tabular-nums">
              R$ {calculations.manutencaoMensal.toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">/mês</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap tabular-nums mt-0.5">
              R$ {calculations.manutencaoAnual.toLocaleString('pt-BR')} /ano
            </div>
          </div>
        </div>

        {/* Item 4: Combustível / Energia */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              {calculations.isEletrico ? <Zap className="w-5 h-5 text-emerald-400" /> : <Fuel className="w-5 h-5 text-cyan-400" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white">
                  {calculations.isEletrico ? 'Energia / Recarga' : `Combustível (${calculations.fuelName})`}
                </h4>
                <span className="text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {calculations.unitsConsumed} {calculations.fuelUnit} / mês
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 break-words [overflow-wrap:anywhere]">
                Projeção baseada em {monthlyKm.toLocaleString('pt-BR')} km rodados por mês
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
            <div className="text-base sm:text-lg font-black text-white whitespace-nowrap tabular-nums">
              R$ {calculations.combustivelMensal.toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">/mês</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap tabular-nums mt-0.5">
              R$ {calculations.combustivelAnual.toLocaleString('pt-BR')} /ano
            </div>
          </div>
        </div>

      </div>

      {/* Card Totalizador Principal */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-2xl border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
            Custo Total Mensal Estimado
          </span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-3xl sm:text-4xl font-black text-white whitespace-nowrap tabular-nums">
              R$ {calculations.totalMensal.toLocaleString('pt-BR')}
            </p>
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">/ mês (TCO)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 break-words [overflow-wrap:anywhere]">
            Soma de IPVA mensal + Seguro + Manutenção + Combustível projetado
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80">
          <span className="text-xs text-slate-400 block font-semibold">Compromisso Anual</span>
          <span className="text-xl font-black text-slate-200 whitespace-nowrap tabular-nums">
            R$ {calculations.totalAnual.toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">/ano</span>
          </span>
        </div>
      </div>

      {/* Rodapé explicativo */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/40 px-3.5 py-2.5 rounded-xl border border-slate-800/60">
        <Info className="w-4 h-4 shrink-0 text-cyan-400" />
        <span className="break-words [overflow-wrap:anywhere]">
          Valores projetados para fins de planejamento financeiro. Seguros e revisões dependem do perfil do condutor e concessionária.
        </span>
      </div>

    </div>
  );
}
