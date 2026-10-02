import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, X, CheckCircle2, ChevronDown, ChevronUp,
  Wrench, Zap, Droplets, Settings2, Star, Clock, AlertTriangle
} from 'lucide-react';

// ─── COVERAGE DATA ────────────────────────────────────────────────────────────
const COVERAGE_SECTIONS = [
  {
    title: 'Motor',
    icon: Settings2,
    color: 'text-blue-400',
    items: [
      'Bloco do motor e cabeçote', 'Pistões, anéis e bielas', 'Árbol de cames e tuchos',
      'Bomba d\'água e de óleo', 'Coletor de admissão e escapamento', 'Juntas e retentores internos'
    ]
  },
  {
    title: 'Transmissão',
    icon: Wrench,
    color: 'text-purple-400',
    items: [
      'Caixa de câmbio manual e automático', 'Embreagem (disco, plato e rolamento)',
      'Eixo de transmissão e juntas homocinéticas', 'Diferencial e semi-eixos',
      'Módulo eletrônico da transmissão (TCU)'
    ]
  },
  {
    title: 'Arrefecimento',
    icon: Droplets,
    color: 'text-cyan-400',
    items: [
      'Radiador e reservatório de expansão', 'Termostato e mangueiras',
      'Bomba de arrefecimento', 'Ventiladores e acionadores elétricos'
    ]
  },
  {
    title: 'Sistema Elétrico',
    icon: Zap,
    color: 'text-yellow-400',
    items: [
      'Central eletrônica do motor (ECU)', 'Alternador e motor de arranque',
      'Módulos de conforto (BCM)', 'Sensores de emissão (sonda lambda, MAP, MAF)',
      'Sistema de injeção eletrônica'
    ]
  },
];

const PLANS = [
  {
    months: 3,
    label: '3 Meses',
    price: 'R$ 1.290',
    priceRaw: 1290,
    description: 'Proteção básica para revisão pós-compra.',
    highlight: false,
    perks: ['Cobertura motor + transmissão', 'Suporte 0800 24h/7d', 'Franquia R$ 350'],
  },
  {
    months: 6,
    label: '6 Meses',
    price: 'R$ 2.190',
    priceRaw: 2190,
    description: 'Equilíbrio custo-benefício. O mais escolhido.',
    highlight: true,
    perks: ['Cobertura completa 100+ itens', 'Suporte 0800 24h/7d', 'Franquia R$ 250', 'Carro reserva por 3 dias/sinistro'],
  },
  {
    months: 12,
    label: '12 Meses',
    price: 'R$ 3.690',
    priceRaw: 3690,
    description: 'Tranquilidade total por 1 ano.',
    highlight: false,
    perks: ['Cobertura completa 100+ itens', 'Suporte 0800 24h/7d', 'Franquia R$ 150', 'Carro reserva por 5 dias/sinistro', 'Visita mecânico a domicílio (1x)'],
  },
];

function CoverageSection({ section, isOpen, onToggle }) {
  const Icon = section.icon;
  return (
    <div className="border border-slate-700/60 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${section.color}`} />
          <span className="text-sm font-bold text-white">{section.title}</span>
          <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full font-bold">
            {section.items.length} itens
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-3 space-y-1.5 border-t border-slate-700/40 pt-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WarrantyBadgeModal({ isOpen, onClose, car }) {
  const [selectedPlan, setSelectedPlan] = useState(1); // default: 6 meses
  const [openSection, setOpenSection] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'coverage'

  if (!isOpen) return null;

  const isEligible = !!(car?.laudoCautelar?.status === 'aprovado' || car?.laudo_status === 'aprovado' || true); // demo: always eligible for showcase

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-br from-emerald-950/80 to-slate-900 border-b border-slate-700/60 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Garantia Mecânica Estendida</h3>
              <p className="text-xs text-slate-400">Automatch Protect — cobertura de 100+ itens</p>
            </div>
          </div>

          {/* Eligibility Badge */}
          <div className="mt-4">
            {isEligible ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Veículo elegível — Laudo Cautelar Aprovado
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                Elegibilidade condicionada à aprovação do laudo
              </div>
            )}
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-slate-700/60">
          {[
            { key: 'plans', label: 'Planos' },
            { key: 'coverage', label: 'Cobertura Detalhada' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 max-h-[440px] overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'plans' ? (
              <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {!confirmed ? (
                  <>
                    <p className="text-xs text-slate-400 mb-4">Selecione o período de cobertura para <strong className="text-white">{car?.name || 'este veículo'}</strong>:</p>
                    {PLANS.map((plan, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPlan(i)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          selectedPlan === i
                            ? plan.highlight
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700/60 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">{plan.label}</span>
                              {plan.highlight && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Mais Escolhido
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{plan.description}</p>
                          </div>
                          <span className={`text-base font-black ${selectedPlan === i ? 'text-emerald-400' : 'text-white'}`}>
                            {plan.price}
                          </span>
                        </div>
                        <ul className="mt-3 space-y-1">
                          {plan.perks.map((perk, j) => (
                            <li key={j} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                              {perk}
                            </li>
                          ))}
                        </ul>
                      </button>
                    ))}
                    <button
                      onClick={() => setConfirmed(true)}
                      className="w-full mt-2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Contratar — {PLANS[selectedPlan].price}
                    </button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white">Garantia Ativada!</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">
                        Sua cobertura de <strong className="text-white">{PLANS[selectedPlan].months} meses</strong> está confirmada. 
                        Você receberá o certificado por e-mail em até 24h.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Vigência: {PLANS[selectedPlan].months} meses a partir da entrega
                    </div>
                    <button
                      onClick={() => { setConfirmed(false); onClose(); }}
                      className="block mx-auto px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Concluir
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div key="coverage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                <p className="text-xs text-slate-400 mb-3">
                  <strong className="text-white">100+ itens cobertos</strong> pela Garantia Mecânica Estendida Automatch:
                </p>
                {COVERAGE_SECTIONS.map((section, i) => (
                  <CoverageSection
                    key={i}
                    section={section}
                    isOpen={openSection === i}
                    onToggle={() => setOpenSection(openSection === i ? null : i)}
                  />
                ))}
                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[11px] text-amber-300 leading-relaxed">
                    <strong>Não coberto:</strong> Desgaste natural de pneus, pastilhas de freio, filtros e fluidos. 
                    Danos por acidentes, alagamentos ou uso irregular.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
