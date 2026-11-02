/**
 * HowItWorksPage.jsx — Página interativa de introdução e tour guiado do Automatch.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para oferecer uma entrada leve e intuitiva ao sistema, substituindo textos cansativos
 *     por tours guiados interativos por objetivo, pilares essenciais e FAQ enxuto.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, RotateCw, Bot, PlusCircle, ChevronDown,
  CheckCircle2, HelpCircle, Lock, Compass, Sparkles, Car,
  ShieldCheck, Clock, PlayCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTour } from '../contexts/TourContext';
import {
  howItWorksSections, b2bSectionNotice,
  generalFaqList, b2bFaqList, quickPillars
} from '../data/howItWorksData';
import { getAvailableTours } from '../data/tourGuideData';
import AutomatchLogo from '../components/ui/AutomatchLogo';
import GlowButton from '../components/ui/GlowButton';
import WipeButton from '../components/ui/WipeButton';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { openTourIntro } = useTour();

  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [openDetailSectionId, setOpenDetailSectionId] = useState(null);

  const isB2BAuthorized = Boolean(
    isAuthenticated &&
    (user?.role === 'admin' || user?.role === 'lojista' || user?.accountType === 'store')
  );

  const availableTours = getAvailableTours(user?.role);

  const toggleFaq = (index) => {
    setOpenFaqIndex(prev => prev === index ? null : index);
  };

  const toggleDetailSection = (id) => {
    setOpenDetailSectionId(prev => prev === id ? null : id);
  };

  const activeFaqList = isB2BAuthorized
    ? [...generalFaqList, ...b2bFaqList]
    : generalFaqList;

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

      {/* Hero Header Leve */}
      <header className="relative bg-slate-900 text-white py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/80 to-slate-900 z-10" />
          <div
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '48px 48px'
            }}
            className="absolute inset-0 z-5 opacity-[0.03]"
          />
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center relative z-20"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Compass className="w-4 h-4 text-cyan-400" />
              Tour Interativo & Metodologia
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Conheça o Automatch<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">na Prática.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-light">
            Sem textos longos ou burocracia. Escolha seu objetivo abaixo e veja a demonstração passo a passo pelas telas reais do sistema.
          </motion.p>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full space-y-16">
        {/* Seletor de Tours Guiados */}
        <section aria-labelledby="tours-title">
          <div className="text-center mb-8">
            <h2 id="tours-title" className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Tours Guiados por Objetivo
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Destaques visuais interativos que apontam cada botão e funcionalidade em tempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTours.map((tour) => {
              const isB2BTour = tour.id === 'lojista';
              return (
                <div
                  key={tour.id}
                  className={`rounded-3xl p-6 sm:p-7 border flex flex-col justify-between shadow-card ${
                    isB2BTour
                      ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border-indigo-500/40 text-white'
                      : 'bg-white border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        isB2BTour
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {tour.badge}
                      </span>
                      <span className="text-xs font-semibold flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" /> {tour.duration}
                      </span>
                    </div>

                    <h3 className={`text-xl font-black tracking-tight mb-2 ${isB2BTour ? 'text-white' : 'text-slate-800'}`}>
                      {tour.title}
                    </h3>
                    <p className={`text-xs sm:text-sm leading-relaxed mb-6 font-light ${
                      isB2BTour ? 'text-indigo-200' : 'text-slate-600'
                    }`}>
                      {tour.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openTourIntro(tour.id)}
                    className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                      isB2BTour
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-blue-500/20'
                    }`}
                  >
                    <PlayCircle className="w-4 h-4" />
                    Iniciar Tour ({tour.duration})
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3 Pilares Rápidos da Tecnologia */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-card">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
              Diferenciais Automatch
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Tecnologia e Segurança em 3 Pilares
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">
                Laudo Pericial 100% Auditado
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                Inspeção cautelar completa de chassi, longarinas e espessura uniforme de pintura, sem histórico de leilão.
              </p>
            </div>

            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center mb-4 shadow-xs">
                <RotateCw className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">
                Varredura 360° & Vídeo de 20s
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                Gire o veículo em 8 ângulos reais de 45° e confira o laudo audiovisual gravado em alta definição.
              </p>
            </div>

            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">
                Consultor IA com Ausência Honesta
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                Assistente técnico treinado estritamente nos laudos e na ficha oficial, sem inventar dados não periciados.
              </p>
            </div>
          </div>
        </section>

        {/* Detalhes Úteis Recolhidos (Acordeões) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                Detalhes das Funcionalidades
              </h2>
              <p className="text-xs text-slate-500">
                Clique para expandir especificações e passos detalhados de cada módulo.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {howItWorksSections.map((sec) => {
              const isOpen = openDetailSectionId === sec.id;
              return (
                <div
                  key={sec.id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleDetailSection(sec.id)}
                    aria-expanded={isOpen}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md uppercase">
                        {sec.badge}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-800">
                        {sec.title}
                      </h3>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-5 pb-6 pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
                          <p className="font-medium text-slate-700">{sec.whatIsIt}</p>
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Passo a Passo</h4>
                            <ul className="space-y-1.5 list-disc list-inside text-slate-600">
                              {sec.steps.map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Recurso B2B Exclusivo no Acordeão */}
            {isB2BAuthorized && (
              <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-2xl border border-indigo-500/30 overflow-hidden text-white shadow-xs">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-md uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {b2bSectionNotice.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mb-2">
                    {b2bSectionNotice.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-200 font-light leading-relaxed mb-4">
                    {b2bSectionNotice.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => openTourIntro('lojista')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5" /> Fazer Tour B2B (50s)
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Enxuto */}
        <section id="faq" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-xs">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                Perguntas Frequentes (FAQ)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Respostas diretas sobre o funcionamento e tecnologia da plataforma
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeFaqList.map((faq, fIdx) => {
              const isOpen = openFaqIndex === fIdx;
              return (
                <div
                  key={fIdx}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isOpen ? 'border-blue-300 bg-blue-50/20 shadow-xs' : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(fIdx)}
                    aria-expanded={isOpen}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className={`font-bold text-xs sm:text-sm leading-snug transition-colors ${isOpen ? 'text-blue-700' : 'text-slate-800'}`}>
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-blue-100/50">
                          <div className="pt-3">{faq.a}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-3xl p-8 sm:p-10 text-center shadow-xl shadow-blue-500/20 overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
              Pronto para Navegar pelo Automatch?
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-md mx-auto mb-6 font-light leading-relaxed">
              Explore o catálogo completo com laudos auditados ou anuncie seu carro sem burocracia.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <GlowButton onClick={() => navigate('/encontrar')} size="md" icon={Search} className="shadow-lg">
                Ver Vitrine Digital
              </GlowButton>
              <WipeButton
                onClick={() => navigate('/novo-anuncio')}
                size="md"
                variant="slate"
                className="text-white border-white/25 bg-white/10 hover:border-white/40"
              >
                Anunciar meu Veículo
              </WipeButton>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
