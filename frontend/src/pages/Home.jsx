import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronRight, CheckCircle2,
  Zap, LogIn, Heart, MessageSquare, Star,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { stores } from '../data/inventoryData';
import StoreIdentifier from '../components/ui/StoreIdentifier';
import AutomatchLogo from '../components/ui/AutomatchLogo';
import GlowButton from '../components/ui/GlowButton';
import WipeButton from '../components/ui/WipeButton';
import { getNewCars } from '../data/newCarsManager';
import { toggleFavorite, isFavorite } from '../data/favoritesManager';
import { getVehicleImageUrl, handleVehicleImageError } from '../utils/imageHelper';

export const formatPrice = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.-]+/g, ''));
  return isNaN(num) || num <= 0 ? '' : `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const HomeSupportChat = React.lazy(() => import('../components/chat/HomeSupportChat'));

const showcaseCars = [
  { id: 'sc-001', name: 'Toyota Corolla Cross XRX', year: 2024, price: 185000, color: 'Branco Perola', mileage: '12.000 km', image: '/images/FotoCorollaCross.jpg', bodyType: 'SUV', description: 'SUV hibrido flex, pacote de seguranca completo e teto solar.', tags: ['Hibrido Flex', 'Teto Solar', 'Safety Sense'], featured: true, storeId: 'store-1' },
  { id: 'sc-002', name: 'Volkswagen Polo TSI', year: 2023, price: 98000, color: 'Vermelho', mileage: '18.500 km', image: '/images/FotoPoloTSI.jpg', bodyType: 'Hatch', description: 'Hatch potente e economico com painel digital.', tags: ['1.0 Turbo', 'Painel Digital', 'VW Play'], featured: false, storeId: 'store-2' },
  { id: 'sc-003', name: 'Hyundai HB20 Platinum', year: 2024, price: 105000, color: 'Prata', mileage: '5.000 km', image: '/images/FotoHyundaiHB20.jpg', bodyType: 'Hatch', description: 'Design renovado, excelente acabamento e conectividade avancada.', tags: ['SmartSense', 'Camera de Re', 'Unico Dono'], featured: true, storeId: 'store-3' },
  { id: 'sc-004', name: 'Chevrolet Tracker Premier', year: 2024, price: 152000, color: 'Azul Escuro', mileage: '8.500 km', image: '/images/FotoChevroletTracker.jpg', bodyType: 'SUV', description: 'SUV urbano mais completo da categoria com teto solar panoramico.', tags: ['1.2 Turbo', 'Teto Panoramico', 'Wi-Fi'], featured: false, storeId: 'store-1' },
  { id: 'sc-005', name: 'Fiat Pulse Abarth', year: 2024, price: 145000, color: 'Vermelho', mileage: '3.200 km', image: '/images/FotoFiatPulse.jpg', bodyType: 'SUV', description: 'O primeiro SUV Abarth do mundo, performance esportiva e design exclusivo.', tags: ['Abarth', 'Turbo 270', 'Esportivo'], featured: true, storeId: 'store-2' },
];

const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };
const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } } };

const HomeCarCard = ({ car }) => {
  const navigate = useNavigate();
  const [fav, setFav] = useState(() => isFavorite(car.id));
  const handleDetails = (e) => { e?.stopPropagation(); navigate(`/encontrar/${car.id}`); };
  const handleFavorite = (e) => { e.stopPropagation(); const updated = toggleFavorite(car.id); setFav(updated.includes(car.id)); };
  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full" onClick={handleDetails}>
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img src={getVehicleImageUrl(car.image || 'placeholder-carro.jpg')} alt={car.name} onError={handleVehicleImageError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
          <StoreIdentifier storeId={car.storeId} variant="badge" />
          <motion.button whileTap={{ scale: 0.85 }} className={`w-9 h-9 rounded-full border border-slate-200/60 flex items-center justify-center transition-all shadow-sm ${fav ? 'bg-red-50 text-red-500' : 'bg-white/95 text-slate-500 hover:bg-white hover:text-red-500'}`} title={fav ? 'Remover dos favoritos' : 'Curtir veiculo'} onClick={handleFavorite}>
            <Heart className={`w-4 h-4 transition-all duration-200 ${fav ? 'fill-red-500 text-red-500 scale-110' : 'hover:scale-110'}`} />
          </motion.button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors truncate" title={car.name}>{car.name}</h3>
              {car.featured && <span title="Destaque" aria-label="Veiculo em Destaque" className="inline-flex items-center shrink-0"><Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" /></span>}
            </div>
            {formatPrice(car.price) && <span className="text-lg font-black text-brand-blue whitespace-nowrap shrink-0">{formatPrice(car.price)}</span>}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{car.bodyType}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 my-4">
          {[{ label: car.year, icon: '📅' }, { label: car.mileage, icon: '🛣️' }, { label: car.color, icon: '🎨' }].map(({ label, icon }, i) => (
            <div key={i} className="bg-slate-50 rounded-lg px-1 py-2 text-center border border-slate-100 hover:bg-white hover:border-blue-200 transition-colors">
              <span className="text-sm block mb-0.5">{icon}</span>
              <p className="text-[11px] font-bold text-slate-700 truncate">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
          {car.tags?.map((tag) => <span key={`${car.id}-${tag}`} className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase">{tag}</span>)}
        </div>
        <button onClick={handleDetails} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200">
          <Search className="w-4 h-4" />Ver Detalhes
        </button>
      </div>
    </motion.div>
  );
};

const FeatureItem = ({ title, description }) => (
  <motion.div variants={fadeUp} className="group py-4">
    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-600 leading-relaxed font-light">{description}</p>
  </motion.div>
);


const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const [allCars, setAllCars] = useState(showcaseCars);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroImgY = useTransform(scrollY, [0, 500], [0, 80]);

  useEffect(() => {
    const local = getNewCars();
    const formatted = local.map((car) => ({
      id: car.id, name: `${car.marca} ${car.modelo}`, year: car.ano, price: car.preco,
      color: car.cor || 'Nao informada', mileage: car.km ? `${Number(car.km).toLocaleString('pt-BR')} km` : '0 km',
      image: car.imagem || 'https://via.placeholder.com/400x300?text=Sem+Foto', bodyType: 'Novo Anuncio',
      description: car.descricao || 'Veiculo anunciado pelo usuario independente.',
      tags: [car.transmissao || 'Automatico', 'Novidade'], featured: true, storeId: 'particular',
    }));
    setAllCars([...formatted, ...showcaseCars]);
  }, []);


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <AutomatchLogo size="md" theme="light" onClick={() => navigate('/')} />
            <div className="hidden md:flex items-center gap-1 border-l border-slate-200 pl-6 ml-2">
              <button onClick={() => navigate('/encontrar')} className="text-slate-600 hover:text-blue-600 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-all">Vitrine Digital</button>
              <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 font-semibold text-sm transition-all"><MessageSquare className="w-4 h-4" /><span>Consultor IA</span></button>
              <button onClick={() => navigate('/novo-anuncio')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-sm transition-all">Vender meu Carro</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: '/favoritos' } } }); } else { navigate('/favoritos'); } }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Carros Curtidos"><Heart className="w-5 h-5" /></button>
            {isAuthenticated ? (
              <button onClick={() => navigate('/perfil')} className="flex items-center gap-3 px-2 py-1.5 rounded-full border border-slate-100 hover:bg-slate-50 transition-all group shadow-sm">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:ring-blue-300">
                  <img src={user?.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} alt={user?.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-bold text-slate-700 pr-2 group-hover:text-blue-600">{user?.name?.split(' ')[0] || 'Perfil'}</span>
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-all shadow-md shadow-blue-200 active:scale-95"><LogIn className="w-4 h-4" /><span>Entrar / Cadastrar</span></button>
            )}
          </div>
        </div>
      </nav>

      <section ref={heroRef} className="relative min-h-[92vh] overflow-hidden bg-slate-900 flex flex-col justify-center">
        <motion.div style={{ y: heroImgY, willChange: 'transform' }} className="absolute inset-0 z-0 scale-110">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-blue-950/60 z-10" />
          <div style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} className="absolute inset-0 z-5 opacity-[0.03]" />
          <img src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=2000" alt="Hero Background" className="w-full h-full object-cover opacity-30" />
        </motion.div>
        <div className="absolute top-[35%] left-[-5%] w-[60%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rotate-[-12deg] z-10" />
        <div className="absolute top-[60%] right-[-5%] w-[50%] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent rotate-[8deg] z-10" />

        <div className="max-w-7xl mx-auto px-6 relative z-20 w-full py-20 md:py-28">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-3xl">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-emerald-400 font-medium text-sm mb-7">
                <CheckCircle2 className="w-4 h-4" /><span>100% dos carros com Laudo Cautelar e Historico</span>
              </div>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
              O Match Perfeito,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Sem Surpresas.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-slate-300 md:w-4/5 mb-10 leading-relaxed font-light">
              Esqueca o medo de comprar carro usado. A Automatch utiliza inteligencia artificial e transparencia radical para garantir que seu proximo carro seja exatamente o que voce espera.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <GlowButton onClick={() => navigate('/encontrar')} size="lg" icon={Search} className="shadow-xl shadow-blue-900/40">
                <span>Ver Vitrine Digital</span><ChevronRight className="w-5 h-5 ml-1" />
              </GlowButton>
              <WipeButton onClick={() => navigate('/como-funciona')} size="lg" variant="slate" className="text-white border-white/20 bg-white/5 hover:border-white/40">
                Como funciona?
              </WipeButton>
            </motion.div>
            <motion.div variants={fadeIn} className="mt-16">
              <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold mb-6">Disponivel nas melhores lojas</p>
              <div className="flex flex-wrap justify-start items-center gap-8 md:gap-12">
                {stores?.slice(0, 4).map((store) => (
                  <motion.div key={store.id} whileHover={{ scale: 1.05 }} className="cursor-pointer" onClick={() => navigate(`/encontrar?store=${store.id}`)}>
                    <span className="text-white/40 hover:text-blue-400 font-bold transition-colors text-sm">{store.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>


      </section>


      <section id="vitrine" className="bg-slate-100 py-20 px-4 sm:px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4 border border-blue-200">
              <Zap className="w-3.5 h-3.5" />Vitrine Digital Automatch
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">Novos Anuncios e Destaques</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light">Anuncios verificados com transparencia total. Cada veiculo possui dossie completo de procedencia.</p>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {allCars.map((car) => <HomeCarCard key={car.id} car={car} />)}
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-24 px-6 border-t">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4 border border-slate-200">
              <Sparkles className="w-3.5 h-3.5" />Por que Automatch?
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Tecnologia a seu favor</h2>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid md:grid-cols-3 gap-8">
            <FeatureItem title="Preco FIPE Automatch" description="Nossa inteligencia artificial analisa FIPE, quilometragem e estado de conservacao para sugerir o preco real." />
            <FeatureItem title="Dossie de Procedencia" description="Laudo cautelar, historico de multas e leilao comparados com nossa vistoria tecnica rigorosa." />
            <FeatureItem title="Scanner de Avarias com IA" description="Nossa inteligencia identifica danos na lataria por visao computacional e precifica reparos na hora." />
          </motion.div>
        </div>
      </section>

      {isChatOpen && (
        <React.Suspense fallback={null}>
          <HomeSupportChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </React.Suspense>
      )}
    </div>
  );
};

export default Home;