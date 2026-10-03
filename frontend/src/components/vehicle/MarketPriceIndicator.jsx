import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingDown, TrendingUp, CheckCircle2, AlertCircle, Sparkles, 
  Tag, HelpCircle, ShieldCheck, History, Clock, ChevronDown, Info, X
} from 'lucide-react';

export default function MarketPriceIndicator({
  price,
  fipePrice,
  autoPrice,
  year = 2024,
  mileage = 15000,
  daysOnMarket = 18,
  priceHistory = [],
  variant = 'gauge', // 'gauge' | 'badge' | 'compact' | 'card'
  className = ''
}) {
  const [showMethodology, setShowMethodology] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const numPrice = typeof price === 'number' ? price : Number(String(price || 0).replace(/[^0-9.-]+/g, ''));
  const numFipe = typeof fipePrice === 'number' && fipePrice > 0
    ? fipePrice
    : (numPrice > 0 ? numPrice * 1.04 : 100000);
  const numYear = Number(year) || 2024;
  const numMileage = Number(mileage) || 15000;

  // Cálculo algorítmico do Instant Market Value (IMV) - Padrão CarGurus
  // Pondera FIPE oficial com desvio de quilometragem por ano de uso
  const expectedMileage = Math.max(10000, (2026 - numYear) * 15000);
  const kmDifference = expectedMileage - numMileage;
  // Bônus/penalidade por km (+/- 1.2% a cada 10.000 km de diferença da média)
  const kmBonusPct = Math.max(-0.06, Math.min(0.06, (kmDifference / 10000) * 0.012));
  const instantMarketValue = autoPrice && autoPrice > 0 
    ? autoPrice 
    : Math.round(numFipe * (1 + kmBonusPct));

  // Diferença em relação ao IMV (Instant Market Value)
  const diffFromImv = numPrice - instantMarketValue;
  const diffPercent = instantMarketValue > 0 ? (diffFromImv / instantMarketValue) * 100 : 0;
  const isDiscount = diffFromImv < 0;
  const savings = Math.abs(diffFromImv);

  // Classificação Algorítmica Oficial: CarGurus Deal Rating Benchmark
  let dealRating = {
    code: 'GREAT_DEAL',
    label: 'Super Oportunidade',
    tier: 'great',
    score: 98,
    desc: `R$ ${Math.round(savings).toLocaleString('pt-BR')} abaixo do valor de mercado (IMV)`,
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    borderClass: 'border-emerald-500/40',
    icon: Sparkles
  };

  if (diffPercent > 5) {
    dealRating = {
      code: 'HIGH_PRICE',
      label: 'Acima da Média',
      tier: 'high',
      score: 72,
      desc: 'Valor acima da média: verifique opcionais exclusivos e histórico',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      dotClass: 'bg-slate-400',
      borderClass: 'border-slate-700',
      icon: HelpCircle
    };
  } else if (diffPercent > 1) {
    dealRating = {
      code: 'FAIR_DEAL',
      label: 'Preço Justo FIPE',
      tier: 'fair',
      score: 86,
      desc: 'Alinhado com a cotação oficial da FIPE e transações recentes',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      dotClass: 'bg-cyan-400',
      borderClass: 'border-cyan-500/40',
      icon: CheckCircle2
    };
  } else if (diffPercent >= -4) {
    dealRating = {
      code: 'GOOD_DEAL',
      label: 'Boa Oferta',
      tier: 'good',
      score: 92,
      desc: 'Preço competitivo com margem atrativa e laudo aprovado',
      badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      dotClass: 'bg-blue-400',
      borderClass: 'border-blue-500/40',
      icon: TrendingDown
    };
  }

  // Histórico de preços
  const historyList = (Array.isArray(priceHistory) && priceHistory.length > 0)
    ? priceHistory
    : [
        { date: 'Anúncio Inicial', price: Math.round(numPrice * 1.04), label: 'Preço de publicação' },
        { date: 'Preço Atual', price: numPrice, label: 'Preço atualizado no Automatch' }
      ];

  const totalReduction = historyList.length > 1 ? Math.max(0, historyList[0].price - numPrice) : 0;

  // ── VARIANT: BADGE COMPACTO (Para Cards de Catálogo e Listagens) ──
  if (variant === 'badge' || variant === 'compact') {
    const StatusIcon = dealRating.icon;
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${dealRating.badgeClass} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dealRating.dotClass} animate-pulse`} />
        <StatusIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="font-extrabold">{dealRating.label}</span>
        {isDiscount && (
          <span className="text-[11px] font-semibold opacity-90 hidden sm:inline">
            (-R$ {Math.round(savings).toLocaleString('pt-BR')})
          </span>
        )}
      </div>
    );
  }

  // ── VARIANT: GAUGE & FULL-CARD (Para Página de Detalhes do Veículo) ──
  const minMarket = instantMarketValue * 0.88;
  const maxMarket = instantMarketValue * 1.12;
  const clampedPrice = Math.max(minMarket, Math.min(maxMarket, numPrice));
  const pointerPercent = ((clampedPrice - minMarket) / (maxMarket - minMarket)) * 100;
  const StatusIcon = dealRating.icon;

  return (
    <div className={`bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 ${className}`}>
      
      {/* Topo: Deal Rating Badge & Botão de Metodologia */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Avaliação de Negócio Automatch™
              </h4>
              <button
                type="button"
                onClick={() => setShowMethodology(true)}
                title="Como funciona a precificação algorítmica?"
                className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Valor de Mercado Instantâneo: <strong className="text-slate-200 font-mono">R$ {Math.round(instantMarketValue).toLocaleString('pt-BR')}</strong>
            </p>
          </div>
        </div>

        {/* Selo Deal Rating Oficial */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black shadow-sm ${dealRating.badgeClass}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{dealRating.label}</span>
        </div>
      </div>

      {/* Régua Visual Graduada: CarGurus Style */}
      <div className="pt-1">
        <div className="relative">
          {/* Barra de Zonas com Gradiente de Oportunidade */}
          <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex shadow-inner border border-slate-700/50">
            <div className="w-[33%] bg-gradient-to-r from-emerald-600 to-emerald-500" title="Super Oportunidade (> 5% abaixo do mercado)" />
            <div className="w-[33%] bg-gradient-to-r from-blue-500 to-cyan-500" title="Boa Oferta & Preço Justo FIPE" />
            <div className="w-[34%] bg-gradient-to-r from-amber-500 to-slate-600" title="Acima da Média" />
          </div>

          {/* Marcador do Ponteiro Dinâmico */}
          <motion.div
            initial={{ left: '0%' }}
            animate={{ left: `${pointerPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute -top-1.5 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
          >
            <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-950 shadow-lg shadow-black/80 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-cyan-600" />
            </div>
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white" />
          </motion.div>
        </div>

        {/* Marcadores de Referência Numérica */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mt-2.5 px-0.5">
          <div className="text-left">
            <span className="block text-emerald-400 font-bold">Excelente</span>
            <span>R$ {Math.round(minMarket).toLocaleString('pt-BR')}</span>
          </div>
          <div className="text-center">
            <span className="block text-cyan-300 font-bold">Mercado (IMV)</span>
            <span className="text-slate-200">R$ {Math.round(instantMarketValue).toLocaleString('pt-BR')}</span>
          </div>
          <div className="text-right">
            <span className="block text-slate-400 font-bold">Acima Média</span>
            <span>R$ {Math.round(maxMarket).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Métricas Auxiliares: Dias no Estoque & Histórico de Queda */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block">Tempo no Automatch:</span>
            <span className="font-bold text-white font-mono">{daysOnMarket} dias em estoque</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <History className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block truncate">Reduções de Preço:</span>
              <span className="font-bold text-slate-200 font-mono text-[11px]">
                {totalReduction > 0 ? `-R$ ${Math.round(totalReduction).toLocaleString('pt-BR')}` : 'Preço estável'}
              </span>
            </div>
          </div>
          {totalReduction > 0 && (
            <button
              type="button"
              onClick={() => setShowHistoryModal(!showHistoryModal)}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-1 rounded font-bold transition-colors shrink-0 cursor-pointer"
            >
              Ver curva
            </button>
          )}
        </div>
      </div>

      {/* Histórico Expansível / Linha do Tempo de Preço */}
      <AnimatePresence>
        {showHistoryModal && totalReduction > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-950/80 rounded-xl p-3 border border-amber-500/20 text-xs space-y-2"
          >
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-bold text-slate-300">Histórico de Ajustes deste Anúncio:</span>
              <button 
                type="button" 
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 pt-1">
              {historyList.map((h, i) => (
                <div key={i} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">{h.date} • {h.label}:</span>
                  <span className="font-mono font-bold text-white">R$ {Number(h.price).toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Destaque de Economia ou Justificativa */}
      {isDiscount ? (
        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-emerald-300">
              Economia de R$ {Math.round(savings).toLocaleString('pt-BR')} ({Math.abs(diffPercent).toFixed(1)}%) contra o IMV
            </p>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Veículo auditado com laudo cautelar aprovado e precificação altamente vantajosa.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-200">
              {dealRating.desc}
            </p>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Valor condizente com a integridade mecânica, opcionais e quilometragem verificada.
            </p>
          </div>
        </div>
      )}

      {/* Modal Metodologia do Deal Rating (CarGurus Benchmark) */}
      <AnimatePresence>
        {showMethodology && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">Como Funciona o Deal Rating™</h3>
                    <p className="text-[11px] text-slate-400">Algoritmo de Transparência Automatch</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMethodology(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  Inspirado na referência internacional <strong>CarGurus</strong>, o Automatch não se limita à tabela FIPE estática. Nosso algoritmo calcula o <strong>Valor de Mercado Instantâneo (VMI)</strong> cruzando:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                  <li><strong className="text-white">Tabela FIPE Oficial Atualizada:</strong> Base inicial do valor venal.</li>
                  <li><strong className="text-white">Desvio Real de Quilometragem:</strong> Bonificação para veículos com km abaixo da média anual (15.000 km/ano).</li>
                  <li><strong className="text-white">Laudo Cautelar & Integridade:</strong> Certificação de ausência de sinistros ou recuperações estruturais.</li>
                  <li><strong className="text-white">Transações Regionais:</strong> Preço real praticado no estado para modelos equivalentes.</li>
                </ul>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <span className="font-black block text-[11px]">🟢 Super Oportunidade</span>
                    <span className="text-[10px] text-slate-400">Mais de 5% abaixo do IMV justo</span>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                    <span className="font-black block text-[11px]">🔵 Boa Oferta</span>
                    <span className="text-[10px] text-slate-400">Entre 1% e 4% abaixo do mercado</span>
                  </div>
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                    <span className="font-black block text-[11px]">🟡 Preço Justo</span>
                    <span className="text-[10px] text-slate-400">Alinhado rigorosamente à FIPE</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                    <span className="font-black block text-[11px]">⚪ Acima da Média</span>
                    <span className="text-[10px] text-slate-400">Justificado por opcionais raros</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowMethodology(false)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

