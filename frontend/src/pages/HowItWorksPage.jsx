import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Search, 
  SlidersHorizontal, 
  Tag, 
  RotateCw, 
  Calculator, 
  Bot, 
  PlusCircle, 
  Store, 
  ChevronDown, 
  CheckCircle2, 
  Lightbulb, 
  HelpCircle, 
  Building2,
  Lock,
  Compass
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  howItWorksSections, 
  b2bSectionNotice, 
  generalFaqList, 
  b2bFaqList 
} from '../data/howItWorksData';

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Verificação de autorização B2B no padrão do projeto (admin, lojista ou store)
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <nav className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Voltar para a página anterior"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase italic">
                Automatch
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/encontrar')}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl transition-all cursor-pointer hidden sm:flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            Explorar Vitrine
          </button>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Compass className="w-4 h-4 text-blue-400" />
            Guia Completo da Plataforma
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Como a Automatch Funciona?
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Seu guia prático para buscar, inspecionar e negociar veículos seminovos e novos com transparência pericial, 
            laudos auditados e inteligência artificial em todas as etapas.
          </p>
        </div>
      </header>

      {/* Quick Index Menu */}
      <section className="bg-white border-b border-slate-200 px-6 py-4 sticky top-16 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Índice:</span>
          {howItWorksSections.map((sec, idx) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-semibold whitespace-nowrap transition-colors"
            >
              {idx + 1}. {sec.badge}
            </a>
          ))}
          {isB2BAuthorized && (
            <a
              href="#recursos-b2b"
              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold whitespace-nowrap transition-colors flex items-center gap-1"
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
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full space-y-12">
        {howItWorksSections.map((sec) => {
          const IconComponent = sectionIcons[sec.id] || CheckCircle2;
          return (
            <article 
              key={sec.id} 
              id={sec.id} 
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-9 shadow-sm hover:shadow-md transition-shadow scroll-mt-36"
            >
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-xs">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
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
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  O que é e para que serve
                </h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                  {sec.whatIsIt}
                </p>
              </div>

              {/* Step by step */}
              <div className="mb-6 bg-slate-50/70 rounded-2xl p-5 sm:p-6 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Passo a Passo de Uso
                </h3>
                <ul className="space-y-2.5">
                  {sec.steps.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-3 text-sm text-slate-700 leading-snug">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        {sIdx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practical tips */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  Dicas Práticas
                </h3>
                <ul className="space-y-1.5">
                  {sec.tips.map((tip, tIdx) => (
                    <li key={tIdx} className="text-xs sm:text-sm text-amber-950/80 leading-relaxed flex items-start gap-2">
                      <span className="text-amber-500 font-bold shrink-0">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}

        {/* Exclusive B2B Section (Renderizado estritamente para admin / lojista) */}
        {isB2BAuthorized && (
          <article 
            id="recursos-b2b" 
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
          </article>
        )}

        {/* FAQ Section */}
        <section id="faq" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-9 shadow-sm scroll-mt-36">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Perguntas Frequentes (FAQ)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Respostas diretas e objetivas sobre o funcionamento da plataforma
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeFaqList.map((faq, fIdx) => {
              const isOpen = openFaqIndex === fIdx;
              return (
                <div 
                  key={fIdx} 
                  className={`border rounded-2xl transition-all ${
                    isOpen ? 'border-blue-300 bg-blue-50/20 shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(fIdx)}
                    aria-expanded={isOpen}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="font-bold text-sm sm:text-base text-slate-800 leading-snug">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100/60 mt-1">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-8 sm:p-10 text-center shadow-xl shadow-blue-500/20">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">Pronto para encontrar seu próximo carro?</h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto mb-6">
            Navegue pela Vitrine Digital com laudos 100% aprovados ou anuncie seu veículo sem burocracia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/encontrar')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Acessar Vitrine Digital
            </button>
            <button
              onClick={() => navigate('/novo-anuncio')}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-800/60 hover:bg-blue-800 text-white border border-white/20 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              Anunciar meu Veículo
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
