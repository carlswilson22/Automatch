import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Check, Zap, Sparkles, Building2, User, 
  ArrowRight, HelpCircle, ChevronDown, ChevronUp, Star,
  Award, Scan, MessageSquare, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const PLANS_DATA = [
  {
    id: 'free',
    name: 'Particular Básico',
    badge: 'Iniciante',
    target: 'Para quem quer vender seu próprio carro',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      '1 anúncio de veículo ativo',
      'Dossiê de Procedência Básico',
      'Chat direto com compradores',
      'Fotos em alta resolução (até 5)',
      'Validação de CPF e Segurança',
    ],
    limitations: [
      'Sem IA Damage Scanner',
      'Sem destaque na vitrine',
      'Sem painel multi-estoque',
    ],
    popular: false,
    color: 'slate',
    buttonText: 'Começar Grátis',
  },
  {
    id: 'pro',
    name: 'Lojista Pro',
    badge: 'Mais Escolhido',
    target: 'Para lojistas independentes e revendas',
    monthlyPrice: 149,
    annualPrice: 119, // por mês no anual
    features: [
      'Até 15 anúncios ativos simultâneos',
      'IA Damage Scanner ilimitado',
      'Selo Preço Justo Automatch',
      '3x Veículos em Destaque na Vitrine',
      'Comparador FIPE em tempo real',
      'Painel de Gestão de Leads e Propostas',
      'Suporte VIP via WhatsApp',
    ],
    limitations: [
      'Gestão multi-loja não inclusa',
    ],
    popular: true,
    color: 'blue',
    buttonText: 'Assinar Plano Pro',
  },
  {
    id: 'prime',
    name: 'Prime Concessionária',
    badge: 'Empresarial',
    target: 'Para grandes redes, frotistas e concessionárias',
    monthlyPrice: 399,
    annualPrice: 319, // por mês no anual
    features: [
      'Anúncios ILIMITADOS',
      'Painel B2B Multi-unidades / Lojas',
      'IA Damage Scanner + Vistoria 3D Avançada',
      'Destaque Ouro no Topo da Vitrine',
      'CRM de Vendas com Gestão de Equipe',
      'Integração via API com seu estoque/ERP',
      'Gerente de Contas Automatch dedicado',
      'Garantia Mecânica Estendida para clientes',
    ],
    limitations: [],
    popular: false,
    color: 'emerald',
    buttonText: 'Contratar Prime',
  },
];

const FAQS = [
  {
    q: 'Como funciona o pagamento dos planos?',
    a: 'Você pode pagar via Cartão de Crédito (com renovação automática mensal ou anual em até 12x) ou PIX com desconto adicional. O cancelamento pode ser feito a qualquer momento sem multas.'
  },
  {
    q: 'O que é o IA Damage Scanner?',
    a: 'É nossa tecnologia exclusiva de visão computacional que analisa fotos dos veículos, identifica pequenas avarias na lataria e gera um orçamento estimado de reparo com precisão profissional.'
  },
  {
    q: 'Posso fazer upgrade ou downgrade de plano depois?',
    a: 'Sim! A qualquer momento você pode alterar seu plano no seu painel de perfil. O valor proporcional restante será compensado automaticamente.'
  },
  {
    q: 'Pessoas físicas podem contratar o Plano Pro?',
    a: 'Com certeza! Se você compra e vende carros com frequência como particular ou consultor automotivo, o Plano Pro oferece todos os recursos que você precisa.'
  },
];

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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <nav className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <ShieldCheck className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-black tracking-tight text-white uppercase italic">
                Automatch
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/encontrar')}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Ver Carros
            </button>
            <button 
              onClick={() => navigate(isAuthenticated ? '/perfil' : '/login')}
              className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full transition-all shadow-lg shadow-blue-900/40"
            >
              {isAuthenticated ? 'Meu Painel' : 'Entrar'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-4 h-4" />
            Potencialize suas Vendas de Carros
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            Escolha o Plano Ideal para o Seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Sucesso</span>.
          </h1>
          <p className="text-lg text-slate-400 font-light leading-relaxed mb-10">
            Tenha em mãos inteligência artificial para inspeção, precificação precisa com AutoPrice™ e alcance milhares de compradores qualificados todos os dias.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700 backdrop-blur-sm shadow-xl">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Faturamento Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                billingPeriod === 'annual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
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
      <section className="max-w-7xl mx-auto px-6 pb-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS_DATA.map((plan, index) => {
            const price = billingPeriod === 'annual' ? plan.annualPrice : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 ${
                  plan.popular
                    ? 'bg-slate-800/90 border-2 border-blue-500 shadow-2xl shadow-blue-500/20 lg:-translate-y-4'
                    : 'bg-slate-800/40 border border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Popular Pill */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    {plan.badge}
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                    <p className="text-sm text-slate-400 mt-1 min-h-[40px]">{plan.target}</p>
                  </div>

                  {/* Price Block */}
                  <div className="mb-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-baseline gap-1">
                    <span className="text-sm text-slate-400 font-medium">R$</span>
                    <span className="text-4xl sm:text-5xl font-black text-white">
                      {price}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">
                      {price === 0 ? '' : '/mês'}
                    </span>
                    {billingPeriod === 'annual' && price > 0 && (
                      <span className="ml-auto text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md">
                        Cobrado anualmente
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      Recursos Inclusos:
                    </p>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm text-slate-300">{feat}</span>
                      </div>
                    ))}

                    {plan.limitations.map((lim, i) => (
                      <div key={`lim-${i}`} className="flex items-start gap-3 opacity-40">
                        <div className="w-5 h-5 rounded-full bg-slate-700 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold">-</span>
                        </div>
                        <span className="text-sm text-slate-400 line-through">{lim}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 transform active:scale-95 ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-slate-950 py-20 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-white tracking-tight mb-4">
              Por que Assinar a Automatch?
            </h2>
            <p className="text-slate-400 text-base">
              A única plataforma que une transparência radical, perícia por inteligência artificial e alta conversão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                <Scan className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">IA Damage Scanner</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Nossa IA pericial detecta arranhões, repinturas e amassados automaticamente pelas fotos, precificando reparos na hora e gerando confiança imediata.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Preço Justo Automatch</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Carros com Preço Justo Automatch vendem em média 3.8x mais rápido porque eliminam a desconfiança e garantem avaliação em tempo real baseada na FIPE e no estado do veículo.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Painel B2B para Lojas</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Monitore o valor total do seu pátio, status financeiro (quitado/financiado), placas e receba propostas diretas de compradores em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Perguntas Frequentes</h2>
          <p className="text-slate-400 text-sm">Tudo o que você precisa saber sobre as assinaturas</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-slate-800/60 border border-slate-700/80 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center text-white font-bold text-base"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-700/50 pt-3"
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
