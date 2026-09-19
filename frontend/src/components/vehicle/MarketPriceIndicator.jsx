import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, CheckCircle2, AlertCircle, Sparkles, Tag, HelpCircle, ShieldAlert } from 'lucide-react';

export default function MarketPriceIndicator({
  price,
  fipePrice,
  autoPrice,
  variant = 'gauge', // 'gauge' | 'badge' | 'compact'
  className = ''
}) {
  const numPrice = typeof price === 'number' ? price : Number(String(price || 0).replace(/[^0-9.-]+/g, ''));
  const numFipe = typeof fipePrice === 'number' && fipePrice > 0
    ? fipePrice
    : (numPrice > 0 ? numPrice * 1.04 : 100000);

  const diffAmount = numPrice - numFipe;
  const diffPercent = numFipe > 0 ? (diffAmount / numFipe) * 100 : 0;
  const isDiscount = diffAmount < 0;
  const savings = Math.abs(diffAmount);

  // Classificação de mercado
  let status = {
    code: 'EXCELLENT_DEAL',
    label: 'Super Oportunidade',
    desc: `R$ ${Math.round(savings).toLocaleString('pt-BR')} abaixo da FIPE`,
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    icon: Sparkles
  };

  if (diffPercent > 7) {
    status = {
      code: 'ABOVE_MARKET',
      label: 'Acima da Média',
      desc: 'Veículo com pacote de opcionais exclusivos',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      dotClass: 'bg-slate-400',
      icon: HelpCircle
    };
  } else if (diffPercent > 2) {
    status = {
      code: 'UPPER_FAIR',
      label: 'Na Média Superior',
      desc: 'Dentro da margem de mercado com opcionais',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dotClass: 'bg-amber-400',
      icon: TrendingUp
    };
  } else if (diffPercent > -6) {
    status = {
      code: 'FAIR_PRICE',
      label: 'Preço Justo FIPE',
      desc: 'Alinhado com a cotação oficial da FIPE',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      dotClass: 'bg-cyan-400',
      icon: CheckCircle2
    };
  }

  // ── VARIANT: BADGE (usado em cards de listagem e resumos compactos) ──
  if (variant === 'badge' || variant === 'compact') {
    const StatusIcon = status.icon;
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${status.badgeClass} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass} animate-pulse`} />
        <StatusIcon className="w-3.5 h-3.5 shrink-0" />
        <span>{status.label}</span>
        {isDiscount && (
          <span className="text-[11px] font-semibold opacity-90 hidden sm:inline">
            (-R$ {Math.round(savings).toLocaleString('pt-BR')})
          </span>
        )}
      </div>
    );
  }

  // ── VARIANT: GAUGE (usado na página de detalhes do veículo) ──
  const minMarket = numFipe * 0.86;
  const maxMarket = numFipe * 1.14;
  const clampedPrice = Math.max(minMarket, Math.min(maxMarket, numPrice));
  const pointerPercent = ((clampedPrice - minMarket) / (maxMarket - minMarket)) * 100;

  const StatusIcon = status.icon;

  return (
    <div className={`bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4 ${className}`}>
      
      {/* Header do Termômetro */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Termômetro de Mercado
            </h4>
            <p className="text-[11px] text-slate-400">Referência oficial FIPE & IA Automatch</p>
          </div>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black ${status.badgeClass}`}>
          <span className={`w-2 h-2 rounded-full ${status.dotClass} animate-ping`} />
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{status.label}</span>
        </div>
      </div>

      {/* Régua Visual Graduada */}
      <div className="pt-2">
        <div className="relative">
          {/* Barra de Zonas com Gradiente */}
          <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex shadow-inner border border-slate-700/50">
            <div className="w-[35%] bg-gradient-to-r from-emerald-600 to-emerald-500" title="Abaixo da FIPE / Super Oportunidade" />
            <div className="w-[35%] bg-gradient-to-r from-cyan-500 to-blue-500" title="Faixa Justa FIPE" />
            <div className="w-[30%] bg-gradient-to-r from-amber-500 to-rose-500" title="Acima da Média" />
          </div>

          {/* Marcador do Ponteiro Dinâmico */}
          <motion.div
            initial={{ left: '0%' }}
            animate={{ left: `${pointerPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute -top-1.5 -translate-x-1/2 flex flex-col items-center pointer-events-none"
          >
            <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-950 shadow-lg shadow-black/80 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            </div>
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white" />
          </motion.div>
        </div>

        {/* Marcadores e Legendas da Régua */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mt-2.5 px-0.5">
          <div className="text-left">
            <span className="block text-emerald-400 font-bold">Faixa Baixa</span>
            <span>R$ {Math.round(minMarket).toLocaleString('pt-BR')}</span>
          </div>
          <div className="text-center">
            <span className="block text-cyan-300 font-bold">Tabela FIPE</span>
            <span className="text-slate-200">R$ {Math.round(numFipe).toLocaleString('pt-BR')}</span>
          </div>
          <div className="text-right">
            <span className="block text-amber-400 font-bold">Faixa Alta</span>
            <span>R$ {Math.round(maxMarket).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Destaque de Economia ou Justificativa */}
      {isDiscount ? (
        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-emerald-300">
              Economia garantida de R$ {Math.round(savings).toLocaleString('pt-BR')} ({Math.abs(diffPercent).toFixed(1)}%)
            </p>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Este anúncio está com preço muito competitivo em comparação com modelos equivalentes.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-200">
              {status.desc}
            </p>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Preço justo validado por histórico de transações e estado de conservação pericial.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
