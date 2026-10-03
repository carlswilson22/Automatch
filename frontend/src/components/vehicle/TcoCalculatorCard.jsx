import React, { useState, useMemo } from 'react';
import {
  Calculator, Fuel, ShieldCheck, Wrench, Building2, ChevronDown,
  Info, Sparkles, Gauge, Zap
} from 'lucide-react';

const UF_RATES = [
  { uf: 'SP', rate: 0.04,   label: 'São Paulo (4,0%)' },
  { uf: 'RJ', rate: 0.04,   label: 'Rio de Janeiro (4,0%)' },
  { uf: 'MG', rate: 0.04,   label: 'Minas Gerais (4,0%)' },
  { uf: 'DF', rate: 0.035,  label: 'Distrito Federal (3,5%)' },
  { uf: 'PR', rate: 0.035,  label: 'Paraná (3,5%)' },
  { uf: 'RS', rate: 0.03,   label: 'Rio Grande do Sul (3,0%)' },
  { uf: 'SC', rate: 0.02,   label: 'Santa Catarina (2,0%)' },
  { uf: 'GO', rate: 0.0345, label: 'Goiás (3,45%)' },
  { uf: 'BA', rate: 0.025,  label: 'Bahia (2,5%)' },
  { uf: 'PE', rate: 0.025,  label: 'Pernambuco (2,5%)' },
];

const FUEL_CONFIGS = {
  gasolina: { name: 'Gasolina',   consumption: 11.5, defaultPrice: 5.89, unit: 'L'   },
  etanol:   { name: 'Etanol',     consumption: 8.5,  defaultPrice: 3.89, unit: 'L'   },
  diesel:   { name: 'Diesel',     consumption: 12.8, defaultPrice: 6.09, unit: 'L'   },
  hibrido:  { name: 'Híbrido',    consumption: 18.5, defaultPrice: 5.89, unit: 'L'   },
  eletrico: { name: 'Elétrico',   consumption: 6.5,  defaultPrice: 0.85, unit: 'kWh' },
};

function parseFuelType(raw) {
  const f = String(raw || '').toLowerCase();
  if (f.includes('elétr') || f.includes('eletri')) return 'eletrico';
  if (f.includes('híbr')  || f.includes('hibr'))  return 'hibrido';
  if (f.includes('diesel'))                        return 'diesel';
  if (f.includes('etanol') || f.includes('álcool')) return 'etanol';
  return 'gasolina';
}

function fmt(n) { return Math.round(n).toLocaleString('pt-BR'); }

export default function TcoCalculatorCard({
  price     = 90000,
  fipePrice,
  fuelType  = 'Flex',
  carYear,
  className = ''
}) {
  const [selectedUf,  setSelectedUf]  = useState('SP');
  const [monthlyKm,   setMonthlyKm]   = useState(1000);
  const [activeFuel,  setActiveFuel]  = useState(() => parseFuelType(fuelType));
  const [fuelPrices]                  = useState({
    gasolina: 5.89, etanol: 3.89, diesel: 6.09, hibrido: 5.89, eletrico: 0.85
  });

  const numPrice = typeof price    === 'number' && price    > 0 ? price    : 90000;
  const numFipe  = typeof fipePrice === 'number' && fipePrice > 0 ? fipePrice : numPrice;

  const c = useMemo(() => {
    const ufObj        = UF_RATES.find(u => u.uf === selectedUf) || UF_RATES[0];
    const ipvaAnual    = numFipe  * ufObj.rate;
    const seguroAnual  = numPrice * 0.045;
    const isEletrico   = activeFuel === 'eletrico';
    const manutMensal  = isEletrico ? 69 : 125;
    const fuel         = FUEL_CONFIGS[activeFuel] || FUEL_CONFIGS.gasolina;
    const pricePerUnit = fuelPrices[activeFuel]   ?? fuel.defaultPrice;
    const unitsMonth   = monthlyKm / fuel.consumption;
    const fuelMensal   = unitsMonth * pricePerUnit;
    const ipvaMensal   = ipvaAnual  / 12;
    const seguroMensal = seguroAnual / 12;
    const totalMensal  = ipvaMensal + seguroMensal + manutMensal + fuelMensal;
    const rate         = parseFloat((ufObj.rate * 100).toFixed(2));

    return {
      ufRate:       rate,
      ipvaMensal:   Math.round(ipvaMensal),
      ipvaAnual:    Math.round(ipvaAnual),
      seguroMensal: Math.round(seguroMensal),
      seguroAnual:  Math.round(seguroAnual),
      manutMensal:  Math.round(manutMensal),
      manutAnual:   Math.round(manutMensal * 12),
      fuelMensal:   Math.round(fuelMensal),
      fuelAnual:    Math.round(fuelMensal  * 12),
      units:        Math.round(unitsMonth),
      fuelUnit:     fuel.unit,
      fuelName:     fuel.name,
      isEletrico,
      totalMensal:  Math.round(totalMensal),
      totalAnual:   Math.round(totalMensal * 12),
      custodia:     Math.round(totalMensal / 30),
    };
  }, [selectedUf, monthlyKm, activeFuel, fuelPrices, numPrice, numFipe]);

  /* ── helpers de texto contextual ───────────────────────────────────── */
  const ipvaDesc = () =>
    `IPVA ${selectedUf} sobre FIPE de R$ ${fmt(numFipe)} — alíquota ${String(c.ufRate).replace('.', ',')}%`;

  const seguroDesc = () =>
    `Referência de mercado para ${numPrice >= 150000 ? 'SUV ou sedan premium' : 'hatch ou sedan compacto'}: `
    + `cobertura compreensiva (colisão, furto/roubo, danos a terceiros e assistência 24h)`;

  const manutDesc = () => c.isEletrico
    ? `Itens específicos de VE: filtro de cabine, fluido de freio, inspeção do módulo de tração e rodagem`
    : `Óleo do motor, filtros (ar, combustível e habitáculo), velas, fluidos e revisão de freios`;

  const fuelDesc = () => {
    const eficiencia = FUEL_CONFIGS[activeFuel].consumption;
    if (c.isEletrico)
      return `${monthlyKm.toLocaleString('pt-BR')} km/mês · ${eficiencia} km/kWh · R$ ${fuelPrices.eletrico.toFixed(2).replace('.', ',')}/kWh`;
    return `${monthlyKm.toLocaleString('pt-BR')} km/mês · ${eficiencia} km/L · R$ ${fuelPrices[activeFuel].toFixed(2).replace('.', ',')}/L`;
  };

  return (
    <div className={`bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-6 ${className}`}>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-900/30">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Simulador de Custo Mensal</h3>
            <p className="text-xs text-slate-400">
              Ajuste o estado e a quilometragem para ver a projeção do seu bolso
            </p>
          </div>
        </div>

        {/* Custo Diário */}
        <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Por dia</span>
          <span className="text-base font-black text-cyan-400 whitespace-nowrap">
            R$ {fmt(c.custodia)} / dia
          </span>
        </div>
      </div>

      {/* ── Controles ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">

        {/* Estado */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Estado (IPVA)</span>
          </label>
          <div className="relative">
            <select
              value={selectedUf}
              onChange={e => setSelectedUf(e.target.value)}
              aria-label="Estado para cálculo do IPVA"
              className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 pr-8 cursor-pointer"
            >
              {UF_RATES.map(u => (
                <option key={u.uf} value={u.uf} className="bg-slate-900 text-slate-200">
                  {u.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Km mensal */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Uso Mensal</span>
            </span>
            <span className="text-cyan-400 font-bold lowercase whitespace-nowrap">
              {monthlyKm.toLocaleString('pt-BR')} km/mês
            </span>
          </div>
          <input
            type="range" min="300" max="3000" step="100"
            value={monthlyKm}
            onChange={e => setMonthlyKm(Number(e.target.value))}
            aria-label="Quilometragem mensal estimada"
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-semibold">
            <span>300 km</span><span>1.500 km</span><span>3.000 km</span>
          </div>
        </div>

        {/* Combustível */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-emerald-400" />
            <span>Combustível</span>
          </label>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {['gasolina', 'etanol', 'diesel', 'eletrico'].map(fk => (
              <button
                key={fk}
                type="button"
                onClick={() => setActiveFuel(fk)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  activeFuel === fk
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fk === 'eletrico' ? 'Elétr.' : fk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Itens de Custo ───────────────────────────────────────────── */}
      <div className="space-y-2.5">

        {/* IPVA */}
        <CostRow
          icon={<Building2 className="w-5 h-5" />}
          iconBg="bg-blue-500/10 border-blue-500/20 text-blue-400"
          title="IPVA"
          badge={`${selectedUf} · ${String(c.ufRate).replace('.', ',')}%`}
          badgeStyle="bg-blue-500/10 text-blue-300 border-blue-500/30"
          desc={ipvaDesc()}
          mensal={c.ipvaMensal}
          anual={c.ipvaAnual}
        />

        {/* Seguro */}
        <CostRow
          icon={<ShieldCheck className="w-5 h-5" />}
          iconBg="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          title="Seguro Auto"
          badge="Compreensivo · 4,5% a.a."
          badgeStyle="bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
          desc={seguroDesc()}
          mensal={c.seguroMensal}
          anual={c.seguroAnual}
        />

        {/* Manutenção */}
        <CostRow
          icon={<Wrench className="w-5 h-5" />}
          iconBg="bg-amber-500/10 border-amber-500/20 text-amber-400"
          title="Manutenção Preventiva"
          badge={
            c.isEletrico
              ? <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-400" />VE — 45% menos</span>
              : 'Revisões periódicas'
          }
          badgeStyle={c.isEletrico
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'}
          desc={manutDesc()}
          mensal={c.manutMensal}
          anual={c.manutAnual}
        />

        {/* Combustível / Energia */}
        <CostRow
          icon={c.isEletrico ? <Zap className="w-5 h-5 text-emerald-400" /> : <Fuel className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
          title={c.isEletrico ? 'Recarga (Energia)' : `Combustível · ${c.fuelName}`}
          badge={`${fmt(c.units)} ${c.fuelUnit}/mês`}
          badgeStyle="bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
          desc={fuelDesc()}
          mensal={c.fuelMensal}
          anual={c.fuelAnual}
        />
      </div>

      {/* ── Totalizador ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-2xl border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-1">
            Estimativa Mensal Total
          </span>
          <p className="text-3xl sm:text-4xl font-black text-white whitespace-nowrap tabular-nums">
            R$ {fmt(c.totalMensal)}
            <span className="text-sm text-slate-400 font-normal ml-2">/ mês</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            IPVA + Seguro + Manutenção + {c.isEletrico ? 'Energia' : c.fuelName}
          </p>
        </div>
        <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80">
          <span className="text-xs text-slate-400 block font-semibold">Projeção Anual</span>
          <span className="text-xl font-black text-slate-200 whitespace-nowrap tabular-nums">
            R$ {fmt(c.totalAnual)}<span className="text-xs text-slate-400 font-normal ml-1">/ano</span>
          </span>
        </div>
      </div>

      {/* ── Rodapé ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/40 px-3.5 py-2.5 rounded-xl border border-slate-800/60">
        <Info className="w-4 h-4 shrink-0 text-cyan-400" />
        <span>
          Projeção para planejamento financeiro. O seguro real varia conforme perfil do condutor, CEP e histórico de sinistros.
        </span>
      </div>

    </div>
  );
}

/* ── Sub-componente CostRow ────────────────────────────────────────────── */
function CostRow({ icon, iconBg, title, badge, badgeStyle, desc, mensal, anual }) {
  return (
    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-white">{title}</h4>
            <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1 ${badgeStyle}`}>
              {badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 break-words [overflow-wrap:anywhere]">{desc}</p>
        </div>
      </div>
      <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
        <div className="text-base sm:text-lg font-black text-white whitespace-nowrap tabular-nums">
          R$ {Math.round(mensal).toLocaleString('pt-BR')}
          <span className="text-xs text-slate-400 font-normal"> /mês</span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap tabular-nums mt-0.5">
          R$ {Math.round(anual).toLocaleString('pt-BR')} /ano
        </div>
      </div>
    </div>
  );
}
