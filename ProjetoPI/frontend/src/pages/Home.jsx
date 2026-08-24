import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Search, ChevronRight, CheckCircle2,
  Zap, LogIn, UserPlus, Heart, Calendar,
  Gauge, Palette, Eye, MapPin, MessageSquare, X, Send
} from 'lucide-react';

// CONTEXTOS E DADOS
import { useAuth } from '../contexts/AuthContext';
import { stores } from '../data/inventoryData';
import StoreIdentifier from '../components/ui/StoreIdentifier';
import { getNewCars } from '../data/newCarsManager';

// SE O CARCARD ESTIVER EM OUTRO ARQUIVO, DESCOMENTE A LINHA ABAIXO:
// import CarCard from '../components/CarCard';

const showcaseCars = [
  {
    id: 'sc-001',
    name: 'Honda Civic Touring',
    year: 2023,
    price: 165000,
    color: 'Azul Metálico',
    mileage: '18.500 km',
    // ALTERAÇÃO AQUI:
    image: '/images/FotoHondaCivic.jpeg',
    bodyType: 'Sedã',
    description: 'Sedã premium com motor 1.5 turbo de 173cv, câmbio CVT, teto solar e central multimídia 9".',
    tags: ['1.5 Turbo', 'Teto Solar', 'Couro'],
    featured: true,
    storeId: 'store-1',
  },
  {
    id: 'sc-002',
    name: 'Jeep Compass Limited',
    year: 2023,
    price: 189900,
    color: 'Preto Fosco',
    mileage: '22.000 km',
    image: '/images/FotoJeepCompassLimited.jpeg',
    bodyType: 'SUV',
    description: 'SUV com motor 1.3 turbo flex de 185cv, tração 4x4, teto panorâmico e câmera 360°.',
    tags: ['4x4', 'Teto Panorâmico', 'Turbo Flex'],
    featured: false,
    storeId: 'store-1',
  },
  {
    id: 'sc-003',
    name: 'Volkswagen Golf GTI',
    year: 2022,
    price: 215000,
    color: 'Branco Perola',
    mileage: '12.300 km',
    image: '/images/FotoGolfGTI.jpeg',
    bodyType: 'Hatch Esportivo',
    description: 'Hatch esportivo com motor 2.0 TSI de 230cv, câmbio DSG e Cockpit Digital de 10.25".',
    tags: ['2.0 TSI 230cv', 'DSG', 'Cockpit Digital'],
    featured: true,
    storeId: 'store-1',
  },
  {
    id: 'sc-004',
    name: 'Toyota Hilux SRX',
    year: 2022,
    price: 285000,
    color: 'Branco Pérola',
    mileage: '38.000 km',
    image: "/images/FotoNovaHilux.jpeg", // Verifique se a pasta public/images/ existe
    bodyType: 'Picape',
    description: 'Picape com motor 2.8 diesel de 204cv e 500 Nm, tração 4x4 com reduzida.',
    tags: ['Diesel 2.8', '4x4 Reduzida', 'Safety Sense'],
    featured: false,
    storeId: 'store-1',
  },
  {
    id: 'sc-005',
    name: 'Tesla Model 3',
    year: 2024,
    price: 289000,
    color: 'Cinza Grafite',
    mileage: '5.200 km',
    image: '/images/FotoTeslaModel3.jpeg',
    bodyType: '100% Elétrico',
    description: 'Sedã 100% elétrico com 283cv, autonomia de 510 km (WLTP) e Autopilot de série.',
    tags: ['Elétrico 283cv', '510 km Autonomia', 'Autopilot'],
    featured: true,
    storeId: 'store-1',
  },
];

const CarCard = ({ car, index }) => {
  const navigate = useNavigate();

  // Função para navegar evitando repetição de código
  const handleDetails = (e) => {
    e?.stopPropagation();
    navigate(`/encontrar/${car.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full"
      onClick={handleDetails}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={car.image || '/images/FotoGolfGTI.jpeg'}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges - Organizados para não sobrepor */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
          <div className="flex flex-col gap-2">
            {/* Identificador da Loja */}
            <StoreIdentifier storeId={car.storeId} variant="badge" />

            {/* Featured Badge - Posicionado abaixo da loja se ambos existirem */}
            {car.featured && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg w-fit">
                ⭐ Destaque
              </div>
            )}
          </div>

          {/* Wishlist */}
          <button
            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md group/heart"
            onClick={(e) => {
              e.stopPropagation();
              // Lógica de favorito aqui
            }}
          >
            <Heart className="w-4 h-4 text-slate-500 group-hover/heart:text-red-500 group-hover/heart:fill-red-500 transition-all" />
          </button>
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
          <p className="text-2xl font-black text-white drop-shadow-md">
            R$ {Number(car.price).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
            {car.name}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">
            {car.bodyType}
          </p>
        </div>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="bg-slate-50 rounded-lg px-1 py-2 text-center border border-slate-100 hover:bg-white hover:border-blue-200 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-700">{car.year}</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-1 py-2 text-center border border-slate-100 hover:bg-white hover:border-blue-200 transition-colors">
            <Gauge className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-700 truncate">{car.mileage}</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-1 py-2 text-center border border-slate-100 hover:bg-white hover:border-blue-200 transition-colors">
            <Palette className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1" />
            <p className="text-[11px] font-bold text-slate-700 truncate">{car.color}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-snug mb-4 line-clamp-2 italic">
          "{car.description}"
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
          {car.tags?.map((tag) => (
            <span
              key={`${car.id}-${tag}`}
              className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDetails}
            className="flex-[4] py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
          >
            <Eye className="w-4 h-4" />
            Detalhes
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const catalogRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const [allCars, setAllCars] = useState(showcaseCars);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Olá! Bem-vindo ao AutoMatch. Como podemos ajudar com sua negociação hoje?', sender: 'system' }
  ]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const userMessage = chatMessage;
    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, sender: 'user' }]);
    setChatMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mensagem: userMessage }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { id: Date.now(), text: data.resposta, sender: 'system' }]);
      } else {
        const fallbackText = data.fallback || data.error || "Desculpe, ocorreu um erro ao conectar com o assistente.";
        setMessages(prev => [...prev, { id: Date.now(), text: fallbackText, sender: 'system' }]);
      }
    } catch (error) {
      console.error("Erro no chat:", error);
      setMessages(prev => [...prev, { id: Date.now(), text: "Não foi possível conectar ao servidor de chat. Verifique se o servidor está rodando.", sender: 'system' }]);
    }
  };

  React.useEffect(() => {
    const local = getNewCars();
    const formatted = local.map(car => ({
      id: car.id,
      name: `${car.marca} ${car.modelo}`,
      year: car.ano,
      price: car.preco,
      color: car.cor || 'Não informada',
      mileage: car.km ? `${Number(car.km).toLocaleString('pt-BR')} km` : '0 km',
      image: car.imagem || 'https://via.placeholder.com/400x300?text=Sem+Foto',
      bodyType: 'Novo Anúncio',
      description: car.descricao || 'Veículo anunciado pelo usuário independente.',
      tags: [car.transmissao || 'Automático', 'Novidade'],
      featured: true,
      storeId: 'particular',
    }));
    setAllCars([...formatted, ...showcaseCars]);
  }, []);

  // Função de Scroll Suave
  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <ShieldCheck className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase italic">
                Automatch
              </span>
            </div>

            <div className="hidden md:flex items-center gap-3 border-l border-slate-200 pl-6 ml-2">
              <button
                onClick={() => navigate('/encontrar')}
                className="text-slate-600 hover:text-blue-600 font-bold text-sm px-3 py-2 transition-colors"
              >
                Vitrine Digital
              </button>
              <button
                onClick={() => navigate('/planos')}
                className="text-slate-600 hover:text-blue-600 font-bold text-sm px-3 py-2 transition-colors"
              >
                Planos & Preços
              </button>
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-blue-600 border border-blue-200 bg-transparent hover:bg-blue-50 font-bold text-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </button>
              <button onClick={() => navigate('/novo-anuncio')} className="text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 font-bold text-sm transition-all">
                Vender meu Carro
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/perfil')}
                className="flex items-center gap-3 px-2 py-1.5 rounded-full border border-slate-100 hover:bg-slate-50 transition-all group shadow-sm"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:ring-blue-300">
                  <img
                    src={user?.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-bold text-slate-700 pr-2 group-hover:text-blue-600">
                  {user?.name?.split(' ')[0] || 'Perfil'}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-900 flex flex-col justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-blue-600/20 to-transparent"></div>
          <div className="absolute top-[30%] left-[-10%] w-[120%] h-[1px] bg-blue-500/30 rotate-[-15deg]"></div>
          <div className="absolute top-[60%] left-[-10%] w-[120%] h-[1px] bg-emerald-500/20 rotate-[10deg]"></div>
          <img
            src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=2000"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-emerald-400 font-medium text-sm mb-6">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% dos carros com Laudo Cautelar e Histórico</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
                O Match Perfeito,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Sem Surpresas.</span>
              </h1>
              <p className="text-xl text-slate-300 md:w-4/5 mb-10 leading-relaxed font-light">
                Esqueça o medo de comprar carro usado. A Automatch utiliza inteligência artificial e transparência radical para garantir que seu próximo carro seja exatamente o que você espera.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/encontrar')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-900/40"
                >
                  <Search className="w-5 h-5" />
                  Ver Vitrine Digital
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg transition-all">
                  Como funciona?
                </button>
              </div>

              {/* Partners Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="mt-16"
              >
                <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold mb-8">
                  Disponível nas melhores lojas
                </p>
                <div className="flex flex-wrap justify-start items-center gap-8 md:gap-12 opacity-70">
                  {stores?.slice(0, 4).map((store) => (
                    <div
                      key={store.id}
                      className="grayscale hover:grayscale-0 transition-all cursor-pointer"
                      onClick={() => navigate(`/encontrar?store=${store.id}`)}
                    >
                      <span className="text-white font-bold opacity-50 hover:opacity-100 hover:text-blue-400 transition-colors">
                        {store.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== CATALOG SHOWCASE ====== */}
      <section ref={catalogRef} id="vitrine" className="bg-slate-100 py-16 px-4 sm:px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4 border border-blue-200">
              <Zap className="w-3.5 h-3.5" />
              Vitrine Digital Automatch
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Novos Anúncios e Destaques
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light">
              Anúncios verificados com transparência total. Cada veículo possui dossiê completo de procedência.
            </p>
          </motion.div>

          {/* Car Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {allCars.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-24 px-6 border-t">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <FeatureItem
            icon={<ShieldCheck className="w-7 h-7" />}
            title="TrustScore™ Exclusivo"
            description="Cada veículo possui uma nota baseada em mais de 120 pontos de checagem técnica e estética."
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <FeatureItem
            icon={<CheckCircle2 className="w-7 h-7" />}
            title="Dossiê de Procedência"
            description="Laudo cautelar, histórico de multas e leilão comparados com nossa vistoria técnica rigorosa."
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <FeatureItem
            icon={<Search className="w-7 h-7" />}
            title="IA Damage Scanner"
            description="Nossa inteligência identifica danos na lataria por visão computacional e precifica reparos na hora."
            color="text-slate-700"
            bg="bg-slate-100"
          />
        </div>
      </section>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[550px] max-h-[85vh]"
            >
              {/* Chat Header */}
              <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white border-b border-blue-700">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full shadow-inner">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight tracking-wide">Mensagens</h3>
                    <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mt-0.5">Atendimento Automatch</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-md'
                        }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm"
                >
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-transparent border-none focus:outline-none px-4 text-slate-700 text-sm placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim()}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente auxiliar para as Features
const FeatureItem = ({ icon, title, description, color, bg }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group"
  >
    <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center ${color} mb-6 border border-black/5 shadow-sm group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-600 leading-relaxed font-light">{description}</p>
  </motion.div>
);

export default Home;