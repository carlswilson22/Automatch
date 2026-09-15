import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Search, ChevronRight, CheckCircle2,
  Zap, LogIn, UserPlus, Heart, Calendar,
  Gauge, Palette, Eye, MapPin, MessageSquare, X, Send, TrendingDown
} from 'lucide-react';

// CONTEXTOS E DADOS
import { useAuth } from '../contexts/AuthContext';
import { stores } from '../data/inventoryData';
import StoreIdentifier from '../components/ui/StoreIdentifier';
import { getNewCars } from '../data/newCarsManager';
import { toggleFavorite, isFavorite } from '../data/favoritesManager';

// SE O CARCARD ESTIVER EM OUTRO ARQUIVO, DESCOMENTE A LINHA ABAIXO:
// import CarCard from '../components/CarCard';

const showcaseCars = [
  {
    id: 'sc-001',
    name: 'Toyota Corolla Cross XRX',
    year: 2024,
    price: 185000,
    color: 'Branco Pérola',
    mileage: '12.000 km',
    image: '/images/FotoCorollaCross.jpg',
    bodyType: 'SUV',
    description: 'SUV híbrido flex, pacote de segurança completo e teto solar.',
    tags: ['Híbrido Flex', 'Teto Solar', 'Safety Sense'],
    featured: true,
    storeId: 'store-1',
  },
  {
    id: 'sc-002',
    name: 'Volkswagen Polo TSI',
    year: 2023,
    price: 98000,
    color: 'Vermelho',
    mileage: '18.500 km',
    image: '/images/FotoPoloTSI.jpg',
    bodyType: 'Hatch',
    description: 'Hatch potente e econômico com painel digital.',
    tags: ['1.0 Turbo', 'Painel Digital', 'VW Play'],
    featured: false,
    storeId: 'store-2',
  },
  {
    id: 'sc-003',
    name: 'Hyundai HB20 Platinum',
    year: 2024,
    price: 105000,
    color: 'Prata',
    mileage: '5.000 km',
    image: '/images/FotoHyundaiHB20.jpg',
    bodyType: 'Hatch',
    description: 'Design renovado, excelente acabamento e conectividade avançada.',
    tags: ['SmartSense', 'Câmera de Ré', 'Único Dono'],
    featured: true,
    storeId: 'store-3',
  },
  {
    id: 'sc-004',
    name: 'Chevrolet Tracker Premier',
    year: 2024,
    price: 152000,
    color: 'Azul Escuro',
    mileage: '8.500 km',
    image: "/images/FotoChevroletTracker.jpg",
    bodyType: 'SUV',
    description: 'SUV urbano mais completo da categoria com teto solar panorâmico.',
    tags: ['1.2 Turbo', 'Teto Panorâmico', 'Wi-Fi'],
    featured: false,
    storeId: 'store-1',
  },
  {
    id: 'sc-005',
    name: 'Fiat Pulse Abarth',
    year: 2024,
    price: 145000,
    color: 'Vermelho',
    mileage: '3.200 km',
    image: '/images/FotoFiatPulse.jpg',
    bodyType: 'SUV',
    description: 'O primeiro SUV Abarth do mundo, performance esportiva e design exclusivo.',
    tags: ['Abarth', 'Turbo 270', 'Esportivo'],
    featured: true,
    storeId: 'store-2',
  },
];

const CarCard = ({ car, index }) => {
  const navigate = useNavigate();
  const [fav, setFav] = useState(() => isFavorite(car.id));

  // Função para navegar evitando repetição de código
  const handleDetails = (e) => {
    e?.stopPropagation();
    navigate(`/encontrar/${car.id}`);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    const updated = toggleFavorite(car.id);
    setFav(updated.includes(car.id));
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
            className={`w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-md ${
              fav ? 'bg-red-50 text-red-500' : 'bg-white/90 text-slate-500 hover:bg-white'
            }`}
            title={fav ? "Remover dos favoritos" : "Curtir veículo"}
            onClick={handleFavorite}
          >
            <Heart className={`w-4 h-4 transition-all ${fav ? 'fill-red-500 text-red-500 scale-110' : 'hover:text-red-500'}`} />
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

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState('system');
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
            <button 
              onClick={() => navigate('/favoritos')} 
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              title="Carros Curtidos"
            >
              <Heart className="w-5 h-5" />
            </button>
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
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-md shadow-blue-200 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar / Cadastrar</span>
              </button>
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
            icon={<TrendingDown className="w-7 h-7" />}
            title="Preço FIPE Automatch"
            description="Nossa inteligência artificial analisa FIPE, quilometragem e estado de conservação para sugerir o preço real."
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
              <div className="bg-blue-600 px-6 pt-4 pb-0 flex flex-col text-white border-b border-blue-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full shadow-inner">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight tracking-wide">Mensagens</h3>
                      <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mt-0.5">Automatch Chat</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="hover:bg-white/20 p-2 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Chat Tabs */}
                <div className="flex gap-4 px-2">
                  <button 
                    onClick={() => setChatTab('system')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all ${chatTab === 'system' ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'}`}
                  >
                    Atendimento
                  </button>
                  <button 
                    onClick={() => setChatTab('p2p')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${chatTab === 'p2p' ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'}`}
                  >
                    Outros Usuários <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">2</span>
                  </button>
                </div>
              </div>

              {/* Content Area */}
              {chatTab === 'system' ? (
                <>
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
                </>
              ) : (
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  <div className="p-4 space-y-2">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:border-blue-300 transition-colors">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-sm text-slate-800">Carlos Eduardo</h4>
                          <span className="text-[10px] text-slate-400">10:42</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">Sobre o Honda Civic: Aceita troca?</p>
                      </div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:border-blue-300 transition-colors">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos" alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-sm text-slate-800">Loja AutoPremium</h4>
                          <span className="text-[10px] text-slate-400">Ontem</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">O financiamento foi pré-aprovado!</p>
                      </div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}
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