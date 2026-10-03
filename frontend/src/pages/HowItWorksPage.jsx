import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, SlidersHorizontal, Tag, RotateCw, Calculator,
  Bot, PlusCircle, ChevronDown, CheckCircle2, Lightbulb, HelpCircle,
  Building2, Lock, Compass, ChevronRight, Sparkles, Car
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  howItWorksSections, b2bSectionNotice,
  generalFaqList, b2bFaqList
} from '../data/howItWorksData';
import AutomatchLogo from '../components/ui/AutomatchLogo';
import GlowButton from '../components/ui/GlowButton';
import WipeButton from '../components/ui/WipeButton';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const isB2BAuthorized = Boolean(
    isAuthenticated &&
    (user?.role === 'admin' || user?.role === 'lojista' || user?.accountType === 'store')
  );

  const toggleFaq = (index) => {
    setOpenFaqIndex(prev => prev === index ? null : index);
  };

  const activeFaqList = isB2BAuthorized
    ? [...generalFaqList, ...b2bFaqList]
    : generalFaqList;

  const sectionIcons = {
    'navegacao-vitrine': Search,
    'filtros-busca': SlidersHorizontal,
    'leitura-anuncios': Tag,
    'detalhes-veiculo': RotateCw,
    'tco-simuladores': Calculator,
    'consultor-ia': Bot,
    'anunciar-gerenciar': PlusCircle
  };

  const sectionColors = {
    'navegacao-vitrine': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', accent: 'bg-blue-600' },
    'filtros-busca': { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', accent: 'bg-violet-600' },
    'leitura-anuncios': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', accent: 'bg-emerald-600' },
    'detalhes-veiculo': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', accent: 'bg-amber-600' },
    'tco-simuladores': { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100', accent: 'bg-cyan-600' },
    'consultor-ia': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', accent: 'bg-rose-600' },
    'anunciar-gerenciar': { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100', accent: 'bg-teal-600' },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <nav className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 hover:text-slate-900"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <AutomatchLogo size="md" theme="light" onClick={() => navigate('/')} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/encontrar')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl transition-all"
            >
              <Search className="w-4 h-4" />
              Explorar Vitrine
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative bg-slate-900 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/80 to-slate-900 z-10" />
          <div
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '48px 48px'
            }}
            className="absolute inset-0 z-5 opacity-[0.03]"
          />
          {/* Accent lines */}
          <div className="absolute top-[30%] left-[-10%] w-[70%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent rotate-[-8deg] z-10" />
          <div className="absolute top-[70%] right-[-10%] w-[60%] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent rotate-[6deg] z-10" />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center relative z-20"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-blue-300 border border-white/15 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
              <Compass className="w-4 h-4 text-blue-400" />
              Guia Completo da Plataforma
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl font-black tracking-tight mb-5">
            Como a Automatch<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Funciona?</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Seu guia pratico para buscar, inspecionar e negociar veiculos seminovos e novos com transparencia pericial,
            laudos auditados e inteligencia artificial em todas as etapas.
          </motion.p>
        </motion.div>
      </header>

      {/* Quick Index Menu */}
      <section className="bg-white border-b border-slate-200 px-6 py-4 sticky top-[65px] z-40 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-hide">
          <span className="font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Indice:</span>
          {howItWorksSections.map((sec, idx) => {
            const colors = sectionColors[sec.id] || sectionColors['navegacao-vitrine'];
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={`px-3 py-1.5 rounded-lg ${colors.bg} hover:opacity-80 ${colors.text} font-semibold whitespace-nowrap transition-all border ${colors.border}`}
              >
                {idx + 1}. {sec.badge}
              </a>
            );
          })}
          {isB2BAuthorized && (
            <a
              href="#recursos-b2b"
              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold whitespace-nowrap transition-colors flex items-center gap-1 border border-indigo-200"
            >
              <Lock className="w-3 h-3 text-indigo-600" /> B2B
            </a>
          )}
          <a
            href="#faq"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-semibold whitespace-nowrap transition-colors"
          >
            FAQ
          </a>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-14 w-full space-y-10">
        {howItWorksSections.map((sec, sectionIdx) => {
          const IconComponent = sectionIcons[sec.id] || CheckCircle2;
          const colors = sectionColors[sec.id] || sectionColors['navegacao-vitrine'];

          return (
            <motion.article
              key={sec.id}
              id={sec.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: sectionIdx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-card hover:shadow-card-hover transition-all scroll-mt-36 group"
            >
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0 border ${colors.border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <div>
                    <span className={`text-[11px] font-bold ${colors.text} uppercase tracking-wider block`}>
                      {sec.badge}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                      {sec.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* What is it */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  O que e e para que serve
                </h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                  {sec.whatIsIt}
                </p>
              </div>

              {/* Step by step */}
              <div className="mb-6 bg-slate-50/70 rounded-2xl p-5 sm:p-6 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Passo a Passo de Uso
                </h3>
                <ul className="space-y-3">
                  {sec.steps.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-3 text-sm text-slate-700 leading-snug">
                      <span className={`w-6 h-6 rounded-full ${colors.accent} text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
                        {sIdx + 1}
                      </span>
                      <span className="font-medium">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practical tips */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Dicas Praticas
                </h3>
                <ul className="space-y-2">
                  {sec.tips.map((tip, tIdx) => (
                    <li key={tIdx} className="text-xs sm:text-sm text-amber-950/80 leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          );
        })}

        {/* Exclusive B2B Section */}
        {isB2BAuthorized && (
          <motion.article
            id="recursos-b2b"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-9 shadow-xl border border-indigo-500/30 scroll-mt-36 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Building2 className="w-48 h-48 text-white" />
            </div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                {b2bSectionNotice.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                {b2bSectionNotice.title}
              </h2>
              <p className="text-indigo-200 text-sm sm:text-base font-medium mb-4 leading-relaxed max-w-3xl">
                {b2bSectionNotice.summary}
              </p>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-sm text-slate-200 leading-relaxed">
                {b2bSectionNotice.description}
              </div>
            </div>
          </motion.article>
        )}

        {/* FAQ Section */}
        <motion.section
          id="faq"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-card scroll-mt-36"
        >
          <div className="flex items-center gap-3 mb-7 pb-5 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Perguntas Frequentes (FAQ)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Respostas diretas e objetivas sobre o funcionamento da plataforma
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeFaqList.map((faq, fIdx) => {
              const isOpen = openFaqIndex === fIdx;
              return (
                <motion.div
                  key={fIdx}
                  layout
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isOpen ? 'border-blue-300 bg-blue-50/30 shadow-sm' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(fIdx)}
                    aria-expanded={isOpen}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className={`font-bold text-sm sm:text-base leading-snug transition-colors ${isOpen ? 'text-blue-700' : 'text-slate-800'}`}>
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="shrink-0"
                    >
                      <ChevronDown className={`w-5 h-5 transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="px-4 pb-5 sm:px-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-blue-100/60">
                          <div className="pt-3">{faq.a}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Bottom CTA Banner */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl shadow-blue-500/20 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 border border-white/20">
              <Car className="w-3.5 h-3.5" /> Comece Agora
            </div>
            <h2 className="text-2xl sm:text-4xl font-black mb-3 tracking-tight">
              Pronto para encontrar seu<br className="hidden sm:block" /> proximo carro?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto mb-8 font-light leading-relaxed">
              Navegue pela Vitrine Digital com laudos 100% aprovados ou anuncie seu veiculo sem burocracia.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <GlowButton onClick={() => navigate('/encontrar')} size="lg" icon={Search} className="shadow-lg">
                Acessar Vitrine Digital
              </GlowButton>
              <WipeButton
                onClick={() => navigate('/novo-anuncio')}
                size="lg"
                variant="slate"
                className="text-white border-white/25 bg-white/10 hover:border-white/40"
              >
                Anunciar meu Veiculo
              </WipeButton>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
