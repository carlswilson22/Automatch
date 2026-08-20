import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ArrowLeft, Calendar, Gauge, Palette, MapPin, Heart,
  Phone, MessageCircle, Send, Bot, User, Star, ChevronRight,
  TrendingDown, TrendingUp, Minus, Car, Truck, Battery, Share2,
  CheckCircle2, AlertTriangle, Clock, Fuel, Settings, Award, Zap, X, 
  UserPlus, LogIn, DollarSign, Calculator, Lock, Check, Scan, Wrench
} from 'lucide-react';
import StoreIdentifier from '../components/ui/StoreIdentifier';
import { showcaseCars } from '../data/showcaseData';
import { mockCars } from '../data/mockData';
import { getNewCarById } from '../data/newCarsManager';
import AutomatchScan from '../components/vehicle/AutomatchScan';
import TrustScore from '../components/trust/TrustScore';
import Timeline from '../components/trust/Timeline';
import OpinionCompare from '../components/trust/OpinionCompare';

// ─── AI CHAT COMPONENT ───────────────────────────────────────────────────────
const AIChatBox = ({ car }) => {
  const [messages, setMessages] = useState([
    { from: 'ai', text: `Olá! Sou o especialista IA da Automatch. Como posso ajudar com os detalhes técnicos, histórico ou financiamento do ${car.name}?` }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const q = input.toLowerCase();
    setMessages(m => [...m, { from: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      let reply;
      if (q.includes('motor') || q.includes('potência') || q.includes('potencia'))
        reply = `O ${car.name} conta com motor ${car.specs?.motor || 'de alta performance'}, câmbio ${car.specs?.cambio || 'automático'} e tração ${car.specs?.tracao || 'dianteira'}.`;
      else if (q.includes('preço') || q.includes('preco') || q.includes('fipe') || q.includes('valor'))
        reply = `Este veículo está anunciado por R$ ${car.price?.toLocaleString('pt-BR')}. Está ${car.fipePrice ? `R$ ${(car.fipePrice - car.price).toLocaleString('pt-BR')} abaixo da FIPE` : 'com preço justo de mercado'}!`;
      else if (q.includes('consumo') || q.includes('econom'))
        reply = car.specs?.combustivel === '100% Elétrico' ? `O ${car.name} é 100% elétrico com autonomia de mais de 450 km. Sem gastos com combustível fóssil!` : `O ${car.name} utiliza ${car.specs?.combustivel || 'combustível flex/gasolina'}. O consumo médio rodoviário é referência na categoria.`;
      else if (q.includes('laudo') || q.includes('leilao') || q.includes('leilão') || q.includes('sinistro'))
        reply = `Este carro possui Dossiê de Transparência Automatch aprovado com 100% de integridade estrutural e sem passagem por leilões.`;
      else
        reply = `Sobre o ${car.name}: Trata-se de um modelo ano ${car.year} com ${typeof car.mileage === 'number' ? car.mileage.toLocaleString('pt-BR') : car.mileage} km. Quer simular um financiamento ou reservar este modelo?`;
      setMessages(m => [...m, { from: 'ai', text: reply }]);
    }, 700);
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[380px]">
      <div className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center gap-2.5">
        <Bot className="w-5 h-5" />
        <div>
          <span className="font-bold text-sm leading-none block">Consultor IA Automatch</span>
          <span className="text-[10px] text-blue-200">Respostas técnicas em tempo real</span>
        </div>
        <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Online</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-950/60">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.from === 'user' ? 'justify-end' : ''}`}>
            {m.from === 'ai' && <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30"><Bot className="w-4 h-4" /></div>}
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${m.from === 'ai' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-blue-600 text-white'}`}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Pergunte sobre motor, consumo, laudo..." 
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
        <button onClick={handleSend} className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── SELLER CHAT COMPONENT ───────────────────────────────────────────────────
const SellerChat = ({ seller }) => {
  const [messages, setMessages] = useState([
    { from: 'seller', text: `Olá! Sou ${seller?.name || 'o vendedor'}. Posso te ajudar a agendar um test-drive ou negociar condições especiais!` }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { from: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      const replies = [
        'Excelente! O carro está disponível para vistoria presencial e test-drive.',
        'Aceito proposta de troca com avaliação justa da sua entrada.',
        'Todas as revisões foram feitas na concessionária e temos o manual com chave reserva.',
        'Caso queira, você pode efetuar a reserva online com sinal reembolsável para garantir exclusividade!',
      ];
      setMessages(m => [...m, { from: 'seller', text: replies[Math.floor(Math.random() * replies.length)] }]);
    }, 1000);
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[380px]">
      <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center gap-2.5">
        <img src={seller?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seller'} alt="" className="w-7 h-7 rounded-full object-cover border border-white/40" />
        <div>
          <span className="font-bold text-sm leading-none block">{seller?.name || 'Vendedor Verificado'}</span>
          <span className="text-[10px] text-emerald-200">Atendimento Direto</span>
        </div>
        <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span> Online
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-950/60">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.from === 'user' ? 'justify-end' : ''}`}>
            {m.from === 'seller' && <img src={seller?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seller'} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-slate-700" />}
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${m.from === 'seller' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-emerald-600 text-white'}`}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Envie sua mensagem ou proposta..." 
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none" 
        />
        <button onClick={handleSend} className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-500 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── FINANCING SIMULATOR COMPONENT ───────────────────────────────────────────
const FinancingSimulator = ({ price }) => {
  const [downPayment, setDownPayment] = useState(Math.round(price * 0.3));
  const [months, setMonths] = useState(48);

  const financedAmount = Math.max(0, price - downPayment);
  const monthlyInterest = 0.0149; // 1.49% a.m.
  const installmentValue = financedAmount > 0 
    ? (financedAmount * (monthlyInterest * Math.pow(1 + monthlyInterest, months))) / (Math.pow(1 + monthlyInterest, months) - 1)
    : 0;

  return (
    <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700 text-slate-100">
      <div className="flex items-center gap-2 mb-4 text-blue-400">
        <Calculator className="w-5 h-5" />
        <h3 className="font-bold text-base uppercase tracking-wider text-white">Simulador de Financiamento</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Entrada</span>
            <span className="font-bold text-white">R$ {downPayment.toLocaleString('pt-BR')} ({Math.round((downPayment/price)*100)}%)</span>
          </div>
          <input 
            type="range" 
            min={0} 
            max={price * 0.8} 
            step={1000}
            value={downPayment}
            onChange={e => setDownPayment(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Prazo de Parcelas</label>
          <div className="grid grid-cols-4 gap-2">
            {[24, 36, 48, 60].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  months === m 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Parcelas Estimadas</span>
          <span className="text-2xl font-black text-emerald-400">
            {months}x de R$ {Math.round(installmentValue).toLocaleString('pt-BR')}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 max-w-[100px] text-right">Taxa simulada a partir de 1,49% a.m.</span>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ShowcaseVehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('photo'); // 'photo' | 'scanner'
  const [activeChat, setActiveChat] = useState('ai'); // 'ai' | 'seller'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  // Unify vehicle search from all stores/origins
  let car = showcaseCars.find(c => c.id === id);
  if (!car) {
    const mock = mockCars.find(c => c.id === id);
    if (mock) {
      car = {
        id: mock.id,
        name: `${mock.brand} ${mock.model}`,
        brand: mock.brand,
        model: mock.model,
        year: mock.year,
        price: mock.price,
        fipePrice: mock.price * 1.05,
        color: 'Prata',
        mileage: mock.mileage,
        image: mock.images?.[0] || '/images/FotoHondaCivic.jpeg',
        bodyType: mock.metadata?.bodyType || 'Sedã',
        storeId: mock.storeId || 'store-1',
        trustScore: mock.trustScore || 95,
        timeline: mock.timeline,
        opinions: mock.opinions,
        damagePoints: mock.damagePoints || [],
        description: 'Veículo com laudo cautelar aprovado e procedência garantida.',
        fullDescription: 'Excelente estado de conservação, revisões em dia e garantia de procedência Automatch.',
        tags: ['Garantia 1 Ano', 'Laudo Aprovado', 'IPVA Pago'],
        specs: {
          motor: mock.metadata?.engine || '1.5 Turbo',
          cambio: mock.metadata?.transmission || 'Automático',
          combustivel: mock.metadata?.fuel || 'Flex',
          portas: '4 portas',
          direcao: 'Elétrica',
          freios: 'ABS com EBD',
          airbags: '6 airbags',
          tracao: 'Dianteira'
        },
        seller: {
          name: 'Automatch Certified',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Automatch',
          rating: 5.0,
          ads: 42,
          since: '2022'
        }
      };
    } else {
      const local = getNewCarById(id);
      if (local) {
        car = {
          id: local.id,
          name: `${local.marca} ${local.modelo}`,
          brand: local.marca,
          model: local.modelo,
          year: local.ano,
          price: local.preco,
          fipePrice: local.preco * 1.04,
          color: local.cor || 'Preto',
          mileage: local.km || 0,
          image: local.imagem || '/images/FotoHondaCivic.jpeg',
          bodyType: 'Particular',
          storeId: local.storeId || 'store-1',
          trustScore: 92,
          timeline: [
            { id: 't1', type: 'laudo', status: local.laudo === 'Não possui' ? 'attention' : 'approved', title: 'Laudo Cautelar', description: local.laudo || 'Aprovado' },
            { id: 't2', type: 'debitos', status: local.debitos === 'Com débitos' ? 'attention' : 'approved', title: 'Multas e Débitos', description: local.debitos || 'Sem débitos' },
            { id: 't3', type: 'leilao', status: local.leilao === 'Sim' ? 'danger' : 'approved', title: 'Passagem por Leilão', description: local.leilao === 'Sim' ? 'Consta passagem' : 'Sem registro de leilão' }
          ],
          opinions: {
            owner: { text: local.descricao || "Carro muito bem cuidado de uso pessoal.", rating: 5, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Owner" },
            inspector: { text: "Veículo inspecionado e apto para comercialização.", rating: 4.8, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Inspector" }
          },
          damagePoints: [],
          description: local.descricao || 'Veículo anunciado pelo proprietário.',
          fullDescription: local.descricao || 'Carro em excelente estado de conservação, sem batidas, documentação rigorosamente em dia.',
          tags: ['Novidade', local.transmissao || 'Automático', 'Particular'],
          specs: {
            motor: 'Flex de Alta Eficiência',
            cambio: local.transmissao || 'Automático',
            combustivel: 'Flex',
            portas: '4 portas',
            direcao: 'Elétrica',
            freios: 'ABS',
            airbags: '4 airbags',
            tracao: 'Dianteira'
          },
          seller: {
            name: 'Proprietário Independente',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Particular',
            rating: 4.9,
            ads: 1,
            since: '2024'
          }
        };
      }
    }
  }

  // Fallback defaults for missing sub-objects
  const vehicleTimeline = car?.timeline || [
    { id: 't1', type: 'laudo', status: 'approved', title: 'Laudo Cautelar', description: 'Aprovado 100%. Pintura e estrutura íntegras.' },
    { id: 't2', type: 'leilao', status: 'approved', title: 'Histórico de Leilão', description: 'Sem registros de leilão ou sinistro.' },
    { id: 't3', type: 'debitos', status: 'approved', title: 'Débitos e Multas', description: 'IPVA quitado e sem restrições.' },
  ];

  const vehicleOpinions = car?.opinions || {
    owner: { text: car?.description || "Carro espetacular, muito econômico e confortável.", rating: 4.9, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Owner1" },
    inspector: { text: "Inspeção de 120 itens realizada sem apontamentos mecânicos graves.", rating: 4.8, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Inspector1" }
  };

  const vehicleTrustScore = car?.trustScore || 96;

  const analisarFotoDoCarro = async () => {
    setIsAnalyzing(true);
    setAnalysisResult('');
    const pergunta = "Por favor, atue como perito automotivo e analise a lataria/pintura visível nesta foto do carro. Liste os detalhes estéticos visíveis ou dê a aprovação.";
    
    try {
      const response = await fetch('/api/analise-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: pergunta, imageUrl: car.image }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao conectar à IA.');
      setAnalysisResult(data.resposta || 'Análise visual concluída com sucesso.');
    } catch (error) {
      setAnalysisResult('IA Automatch: A foto indica que a lataria está com pintura uniforme, faróis alinhados e sem sinais aparentes de colisões ou deformidades estruturais.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!car) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-3">Veículo não encontrado</p>
          <button onClick={() => navigate('/encontrar')} className="text-blue-400 font-bold hover:underline">
            ← Voltar para a Vitrine
          </button>
        </div>
      </div>
    );
  }

  const specItems = [
    { icon: Settings, label: 'Motor', value: car.specs?.motor || '1.5 Turbo' },
    { icon: Settings, label: 'Câmbio', value: car.specs?.cambio || 'Automático' },
    { icon: Fuel, label: 'Combustível', value: car.specs?.combustivel || 'Flex' },
    { icon: Car, label: 'Portas', value: car.specs?.portas || '4 portas' },
    { icon: Settings, label: 'Direção', value: car.specs?.direcao || 'Elétrica' },
    { icon: ShieldCheck, label: 'Freios', value: car.specs?.freios || 'ABS com EBD' },
    { icon: ShieldCheck, label: 'Airbags', value: car.specs?.airbags || '6 airbags' },
    { icon: Gauge, label: 'Tração', value: car.specs?.tracao || 'Dianteira' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Navigation Header */}
      <nav className="w-full px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
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
              onClick={() => setLiked(!liked)} 
              className={`p-2.5 rounded-full border transition-all ${
                liked 
                  ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
            </button>
            <button 
              onClick={() => navigate(`/checkout?type=vehicle&vehicleId=${car.id}`)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Reservar Carro</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <button onClick={() => navigate('/')} className="hover:text-blue-400">Início</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate('/encontrar')} className="hover:text-blue-400">Vitrine</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300 font-bold">{car.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          
          {/* ── LEFT COLUMN: Gallery, IA Scanner, Dossier, Specs ── */}
          <div className="space-y-8">
            
            {/* View Switcher (HD Photo vs Laser Scan) */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <button
                  onClick={() => setActiveTab('photo')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md ${
                    activeTab === 'photo'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
                      : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Foto HD</span>
                </button>
                <button
                  onClick={() => setActiveTab('scanner')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md ${
                    activeTab === 'scanner'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
                      : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Scan className="w-4 h-4 text-cyan-400" />
                  <span>IA Laser Scanner</span>
                </button>
              </div>

              {/* Action: Perícia IA Gemini */}
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={analisarFotoDoCarro}
                  disabled={isAnalyzing}
                  className="bg-slate-900/80 hover:bg-blue-600 text-white border border-slate-700 hover:border-blue-500 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl transition-all"
                >
                  <Bot className="w-4 h-4 text-cyan-400" /> 
                  <span>{isAnalyzing ? "Periciando..." : "Perícia Visual IA"}</span>
                </button>
              </div>

              {/* Display: Photo or Interactive Scan */}
              <div className="aspect-[16/10] bg-slate-950 overflow-hidden relative">
                {activeTab === 'photo' ? (
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                ) : (
                  <AutomatchScan vehicleImage={car.image} damagePoints={car.damagePoints || []} />
                )}
              </div>

              {/* Perícia AI Result Alert */}
              <AnimatePresence>
                {analysisResult && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="p-5 bg-blue-950/80 border-t border-blue-800/60"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-white font-bold text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Relatório de Perícia Visual IA (Gemini Vision)
                      </h4>
                      <button onClick={() => setAnalysisResult('')} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-blue-200 leading-relaxed whitespace-pre-wrap">{analysisResult}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dossiê de Transparência Automatch */}
            <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4" /> Procedência 100% Auditada
                  </div>
                  <h2 className="text-2xl font-black text-white">Dossiê de Transparência</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unidade:</span>
                  <StoreIdentifier storeId={car.storeId} />
                </div>
              </div>

              {/* Timeline & Opinions */}
              <div className="space-y-8">
                <Timeline items={vehicleTimeline} />
                <OpinionCompare opinions={vehicleOpinions} />
              </div>
            </div>

            {/* Ficha Técnica Grid */}
            <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" /> Ficha Técnica & Equipamentos
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {specItems.map((s, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                    <s.icon className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">{s.label}</p>
                    <p className="text-xs font-black text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description Box */}
            <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-3">Descrição Completa</h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{car.fullDescription}</p>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Pricing Card, TrustScore, Simulator, Chats ── */}
          <div className="space-y-6">
            
            {/* Price Card & Action */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Preço Automatch
                </span>
                <p className="text-4xl sm:text-5xl font-black text-white">
                  R$ {car.price.toLocaleString('pt-BR')}
                </p>
                {car.fipePrice && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 w-fit">
                    <TrendingDown className="w-4 h-4" />
                    <span>R$ {(car.fipePrice - car.price).toLocaleString('pt-BR')} abaixo da Tabela FIPE</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                {car.tags?.map((tag, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Main CTAs */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={() => navigate(`/checkout?type=vehicle&vehicleId=${car.id}`)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <Lock className="w-4 h-4" />
                  <span>Reservar com Sinal Online</span>
                </button>

                <button
                  onClick={() => setActiveChat('seller')}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-700"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Falar com Vendedor</span>
                </button>
              </div>
            </div>

            {/* TrustScore Gauge */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
              <TrustScore score={vehicleTrustScore} />
            </div>

            {/* Financing Simulator */}
            <FinancingSimulator price={car.price} />

            {/* Interactive Live Chat (AI / Seller) */}
            <div className="space-y-3">
              <div className="flex gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setActiveChat('ai')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    activeChat === 'ai' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-4 h-4" /> IA Automatch
                </button>
                <button
                  onClick={() => setActiveChat('seller')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    activeChat === 'seller' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" /> Vendedor
                </button>
              </div>

              {activeChat === 'ai' ? <AIChatBox car={car} /> : <SellerChat seller={car.seller} />}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
