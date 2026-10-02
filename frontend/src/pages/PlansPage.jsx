import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Check, Zap, Sparkles, Building2, User, 
  ArrowRight, HelpCircle, ChevronDown, ChevronUp, Star,
  Award, Scan, MessageSquare, ArrowLeft, CheckCircle2,
  Lock, ArrowUpRight, TrendingUp, Layers
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PLANS_DATA, FAQS } from '../data/plansData';
import SpotlightCard from '../components/ui/microkit/SpotlightCard';
import GlowButton from '../components/ui/microkit/GlowButton';
import WipeButton from '../components/ui/microkit/WipeButton';
import AutomatchLogo from '../components/ui/microkit/AutomatchLogo';

export { PLANS_DATA, FAQS };

export default function PlansPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'annual'
  const [openFaq, setOpenFaq] = useState(null);

  const handleSelectPlan = (plan) => {
    if (plan.id === 'free') {
      if (isAuthenticated) {
        navigate('/novo-anuncio');
      } else {
        navigate('/login', { state: { planId: 'free' } });
      }
      return;
    }

    // Redirect to checkout with plan info
    navigate(`/checkout?type=plan&planId=${plan.id}&billing=${billingPeriod}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Ambient Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-blue-600/15 via-indigo-600/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Navigation Header */}
      <nav className="w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-800 cursor-pointer active:scale-95"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <AutomatchLogo isDark={true} size="md" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/encontrar')}
              className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors px-3 py-2 cursor-pointer"
            >
              Ver Estoque
            </button>
            <button 
              onClick={() => navigate(isAuthenticated ? '/perfil' : '/login')}
              className="text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
            >
              {isAuthenticated ? 'Meu Painel' : 'Entrar'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-14 px-4 sm:px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Planos Automatch & Tecnologia IA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            Escolha o Plano Ideal para o Seu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
              Crescimento
            </span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed mb-10 max-w-2xl mx-auto">
            Tenha em mãos inteligência artificial para inspeção visual, precificação assertiva com AutoPrice™ e alcance milhares de compradores qualificados todos os dias.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Faturamento Mensal
            </button>

            <button
              onClick={() => setBillingPeriod('annual')}
              className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                billingPeriod === 'annual'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Faturamento Anual</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-emerald-500/30">
                -20% OFF
              </span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS_DATA.map((plan, index) => {
            const price = billingPeriod === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col"
              >
                <div
                  className={`h-full rounded-3xl p-7 sm:p-8 flex flex-col justify-between relative transition-all duration-300 ${
                    isPopular
                      ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-blue-500 shadow-2xl shadow-blue-500/20 lg:-translate-y-3'
                      : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700 shadow-lg'
                  }`}
                >
                  {/* Popular Floating Badge */}
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/30 flex items-center gap-1.5 whitespace-nowrap">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>{plan.badge}</span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-2xl font-black text-white tracking-tight">{plan.name}</h3>
                        {!isPopular && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 min-h-[38px] leading-relaxed">
                        {plan.target}
                      </p>
                    </div>

                    {/* Price Block */}
                    <div className="mb-8 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-baseline gap-1.5">
                      <span className="text-sm text-slate-400 font-semibold">R$</span>
                      <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                        {price}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {price === 0 ? ' para sempre' : '/mês'}
                      </span>
                      {billingPeriod === 'annual' && price > 0 && (
                        <span className="ml-auto text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          Plano Anual
                        </span>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                        Recursos inclusos:
                      </p>
                      
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-xs sm:text-sm text-slate-300 leading-snug">{feat}</span>
                        </div>
                      ))}

                      {plan.limitations.map((lim, i) => (
                        <div key={`lim-${i}`} className="flex items-start gap-3 opacity-40">
                          <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold leading-none">-</span>
                          </div>
                          <span className="text-xs sm:text-sm text-slate-400 line-through leading-snug">{lim}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-2">
                    {isPopular ? (
                      <GlowButton
                        onClick={() => handleSelectPlan(plan)}
                        size="lg"
                        className="w-full text-xs sm:text-sm font-black uppercase tracking-wider"
                      >
                        {plan.buttonText}
                      </GlowButton>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white transition-all duration-200 border border-slate-700/80 hover:border-slate-600 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span>{plan.buttonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-slate-900/60 py-20 px-4 sm:px-6 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-500/20">
              <Zap className="w-3.5 h-3.5" />
              <span>Diferenciais Exclusivos</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Por que Assinar a Automatch?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              A única plataforma que une transparência radical, perícia por inteligência artificial e alta conversão para compradores e lojistas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <SpotlightCard 
              spotlightColor="rgba(59, 130, 246, 0.15)"
              className="p-8 bg-slate-900 border-slate-800 hover:border-blue-500/40 text-left transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-6">
                <Scan className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">IA Damage Scanner</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Nossa IA pericial detecta arranhões, repinturas e amassados automaticamente pelas fotos, precificando reparos na hora e gerando confiança imediata nos clientes.
              </p>
            </SpotlightCard>

            <SpotlightCard 
              spotlightColor="rgba(16, 185, 129, 0.15)"
              className="p-8 bg-slate-900 border-slate-800 hover:border-emerald-500/40 text-left transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Preço FIPE Automatch</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Carros com Preço FIPE Automatch vendem em média 3.8x mais rápido porque eliminam a desconfiança e garantem avaliação em tempo real baseada no estado verificado.
              </p>
            </SpotlightCard>

            <SpotlightCard 
              spotlightColor="rgba(6, 182, 212, 0.15)"
              className="p-8 bg-slate-900 border-slate-800 hover:border-cyan-500/40 text-left transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Painel B2B para Lojas</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Monitore o valor total do seu pátio, status financeiro (quitado/financiado), placas e receba propostas diretas de compradores em tempo real com Hold Lock.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 max-w-3xl mx-auto w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider mb-3 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Tire suas Dúvidas</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Perguntas Frequentes</h2>
          <p className="text-slate-400 text-sm">Tudo o que você precisa saber sobre as assinaturas e planos da Automatch.</p>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen 
                    ? 'bg-slate-900 border-blue-500/40 shadow-lg shadow-blue-500/5' 
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center text-white font-bold text-sm sm:text-base cursor-pointer"
                >
                  <span className="pr-4 leading-snug">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3.5"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
