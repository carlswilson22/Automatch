import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Zap, BarChart3, Clock,
  ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp,
  DollarSign, Target, Activity, Info
} from 'lucide-react';

// ─── MOCK FIPE DATA ───────────────────────────────────────────────────────────
const FIPE_REFERENCE = {
  'inv-001': { fipeValue: 198000, marketFinalValue: 215000, avgDaysOnMarket: 18 },
  'inv-002': { fipeValue: 105000, marketFinalValue: 118000, avgDaysOnMarket: 27 },
  'inv-003': { fipeValue: 112000, marketFinalValue: 128000, avgDaysOnMarket: 22 },
  'inv-004': { fipeValue: 162000, marketFinalValue: 175000, avgDaysOnMarket: 14 },
  'inv-005': { fipeValue: 152000, marketFinalValue: 165000, avgDaysOnMarket: 20 },
};
const DEFAULT_FIPE = { fipeValue: 100000, marketFinalValue: 110000, avgDaysOnMarket: 25 };

function LiquidityBadge({ days }) {
  if (days <= 15) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
      <Zap className="w-2.5 h-2.5" /> Alta &lt;15d
    </span>
  );
  if (days <= 25) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/25">
      <Activity className="w-2.5 h-2.5" /> Media {days}d
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/15 text-red-400 border border-red-500/25">
      <Clock className="w-2.5 h-2.5" /> Lenta &gt;25d
    </span>
  );
}

function RepasseCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const ref = FIPE_REFERENCE[item.id] || DEFAULT_FIPE;

  const saleValue = Number(item.sale_value) || 0;
  const floorPrice = Number(item.floor_price) || saleValue * 0.92;
  const grossMarginR = ref.marketFinalValue - saleValue;
  const grossMarginPct = saleValue > 0 ? ((grossMarginR / saleValue) * 100).toFixed(1) : '0.0';
  const discountVsFipe = ref.fipeValue > 0 ? (((ref.fipeValue - saleValue) / ref.fipeValue) * 100).toFixed(1) : '0.0';
  const isBelowFipe = saleValue < ref.fipeValue;

  const opportunityScore = Math.min(100, Math.round(
    (grossMarginR / ref.marketFinalValue) * 60 +
    (isBelowFipe ? 25 : 0) +
    (ref.avgDaysOnMarket <= 15 ? 15 : ref.avgDaysOnMarket <= 25 ? 8 : 0)
  ));

  const scoreColor = opportunityScore >= 70
    ? 'from-emerald-500 to-teal-500'
    : opportunityScore >= 45
    ? 'from-amber-500 to-orange-500'
    : 'from-red-500 to-rose-500';

  const strokePct = (opportunityScore / 100) * 113;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-slate-800/50 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-slate-600 transition-all"
    >
      <div className="p-4 flex items-center gap-3">
        {/* Score Ring */}
        <div className="relative w-12 h-12 shrink-0">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" strokeWidth="4" stroke="#1e293b" fill="none" />
            <circle
              cx="22" cy="22" r="18"
              strokeWidth="4"
              stroke={opportunityScore >= 70 ? '#10b981' : opportunityScore >= 45 ? '#f59e0b' : '#ef4444'}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${strokePct} 113`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white">
            {opportunityScore}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.plate}</p>
          <h4 className="font-black text-white text-sm truncate">{item.brand} {item.model}</h4>
          <p className="text-xs text-slate-400">{item.year} · {Number(item.mileage).toLocaleString('pt-BR')} km</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[10px] text-slate-500 font-bold uppercase">Repasse</p>
          <p className="text-base font-black text-white">R$ {saleValue.toLocaleString('pt-BR')}</p>
          <LiquidityBadge days={ref.avgDaysOnMarket} />
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className="ml-1 p-1.5 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick metrics */}
      <div className="px-4 pb-3 grid grid-cols-3 gap-2">
        {[
          {
            label: 'Margem Bruta',
            main: `${grossMarginR > 0 ? '+' : ''}R$ ${grossMarginR.toLocaleString('pt-BR')}`,
            sub: `${grossMarginPct}%`,
            color: grossMarginR > 0 ? 'text-emerald-400' : 'text-red-400',
          },
          {
            label: 'vs FIPE',
            main: `${Math.abs(Number(discountVsFipe))}%`,
            sub: isBelowFipe ? 'abaixo' : 'acima',
            color: isBelowFipe ? 'text-cyan-400' : 'text-amber-400',
            icon: isBelowFipe ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />,
          },
          {
            label: 'Giro medio',
            main: `${ref.avgDaysOnMarket}d`,
            sub: 'no mercado',
            color: 'text-white',
          },
        ].map((m, i) => (
          <div key={i} className="bg-slate-900/60 rounded-xl p-2.5 text-center">
            <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">{m.label}</p>
            <p className={`text-sm font-black flex items-center justify-center gap-0.5 ${m.color}`}>
              {m.icon}{m.main}
            </p>
            <p className="text-[10px] text-slate-500">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-700/50 pt-3 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analise de Rentabilidade</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Preco de Repasse B2B', value: `R$ ${saleValue.toLocaleString('pt-BR')}`, color: 'text-white' },
                  { label: 'Piso Minimo (Floor)', value: `R$ ${Math.round(floorPrice).toLocaleString('pt-BR')}`, color: 'text-slate-300' },
                  { label: 'Tabela FIPE Referencia', value: `R$ ${ref.fipeValue.toLocaleString('pt-BR')}`, color: 'text-blue-400' },
                  { label: 'Valor Alvo Varejo Final', value: `R$ ${ref.marketFinalValue.toLocaleString('pt-BR')}`, color: 'text-emerald-400' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className={`text-xs font-black ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Score de Oportunidade</span>
                  <span className={`text-[11px] font-black ${
                    opportunityScore >= 70 ? 'text-emerald-400'
                    : opportunityScore >= 45 ? 'text-amber-400'
                    : 'text-red-400'
                  }`}>{opportunityScore}/100</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${opportunityScore}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${scoreColor}`}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  {opportunityScore >= 70
                    ? 'Alta rentabilidade e liquidez elevada. Oportunidade prioritaria de repasse.'
                    : opportunityScore >= 45
                    ? 'Rentabilidade moderada. Avaliar condicoes antes do repasse.'
                    : 'Margem comprimida. Revisar preco de piso ou estrategia de saida.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function B2BRepassePanel({ inventory }) {
  const [sortBy, setSortBy] = useState('score');

  const b2bItems = useMemo(() => {
    return inventory
      .filter(item => item.visible_b2b && item.operational_status !== 'sold')
      .map(item => {
        const ref = FIPE_REFERENCE[item.id] || DEFAULT_FIPE;
        const saleValue = Number(item.sale_value) || 0;
        const grossMarginR = ref.marketFinalValue - saleValue;
        const isBelowFipe = saleValue < ref.fipeValue;
        const opportunityScore = Math.min(100, Math.round(
          (grossMarginR / ref.marketFinalValue) * 60 +
          (isBelowFipe ? 25 : 0) +
          (ref.avgDaysOnMarket <= 15 ? 15 : ref.avgDaysOnMarket <= 25 ? 8 : 0)
        ));
        return { ...item, _score: opportunityScore, _margin: grossMarginR, _days: ref.avgDaysOnMarket };
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b._score - a._score;
        if (sortBy === 'margin') return b._margin - a._margin;
        return a._days - b._days;
      });
  }, [inventory, sortBy]);

  const totals = useMemo(() => b2bItems.reduce((acc, item) => {
    const ref = FIPE_REFERENCE[item.id] || DEFAULT_FIPE;
    acc.totalRepasse += Number(item.sale_value) || 0;
    acc.totalMargin += (ref.marketFinalValue - (Number(item.sale_value) || 0));
    acc.avgScore += item._score;
    return acc;
  }, { totalRepasse: 0, totalMargin: 0, avgScore: 0 }), [b2bItems]);

  const avgScore = b2bItems.length > 0 ? Math.round(totals.avgScore / b2bItems.length) : 0;

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-700/60 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Radar de Repasse B2B</h3>
              <p className="text-[11px] text-slate-400">Lucro estimado · Giro · Score de oportunidade</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
            {[
              { key: 'score', label: 'Score' },
              { key: 'margin', label: 'Margem' },
              { key: 'days', label: 'Giro' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  sortBy === opt.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Portfolio B2B', value: `R$ ${(totals.totalRepasse / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-blue-400' },
            { label: 'Margem Total Estimada', value: `R$ ${(totals.totalMargin / 1000).toFixed(0)}k`, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Score Medio', value: `${avgScore}/100`, icon: Target, color: avgScore >= 70 ? 'text-emerald-400' : avgScore >= 45 ? 'text-amber-400' : 'text-red-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/60 rounded-xl p-3 text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {b2bItems.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Nenhum ativo B2B disponivel no momento.</p>
          </div>
        ) : (
          b2bItems.map((item, i) => <RepasseCard key={item.id} item={item} index={i} />)
        )}
      </div>

      <div className="px-4 py-3 bg-slate-800/40 border-t border-slate-700/40 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Margens estimadas com base na Tabela FIPE e no valor de mercado final. Score calculado pelo algoritmo Automatch B2B. Valores sujeitos a negociacao.
        </p>
      </div>
    </div>
  );
}
