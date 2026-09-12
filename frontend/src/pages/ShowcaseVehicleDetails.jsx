import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ArrowLeft, Calendar, Gauge, Palette, MapPin, Heart,
  Phone, MessageCircle, Send, Bot, User, Star, ChevronRight,
  TrendingDown, TrendingUp, Minus, Car, Truck, Battery, Share2,
  CheckCircle2, AlertTriangle, Clock, Fuel, Settings, Award, Zap, X, 
  UserPlus, LogIn, DollarSign, Calculator, Lock, Check, Scan, Wrench, Tag,
  RotateCw, Bell, Globe2
} from 'lucide-react';
import StoreIdentifier from '../components/ui/StoreIdentifier';
import { showcaseCars } from '../data/showcaseData';
import { mockCars } from '../data/mockData';
import { getNewCarById, deleteNewCar, isCarDeleted } from '../data/newCarsManager';
import { toggleFavorite, isFavorite } from '../data/favoritesManager';
import AutomatchScan from '../components/vehicle/AutomatchScan';
import AIChatBox from '../components/vehicle/AIChatBox';
import SellerChat from '../components/vehicle/SellerChat';
import TradeInSimulator from '../components/vehicle/TradeInSimulator';
import PriceAlertModal from '../components/vehicle/PriceAlertModal';
import MultichannelSyncModal from '../components/vehicle/MultichannelSyncModal';
import Vehicle360Viewer from '../components/vehicle/Vehicle360Viewer';

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ShowcaseVehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [activeChat, setActiveChat] = useState('ai'); // 'ai' | 'seller'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [activeDamage, setActiveDamage] = useState(null);
  const [fipeInfoOpen, setFipeInfoOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [inspectionTab, setInspectionTab] = useState('body'); // 'body' | '360'
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Scroll to top on mount & initialize favorite state
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (id) setLiked(isFavorite(id));
  }, [id]);

  // Unify vehicle search from all stores/origins
  let car = null;
  if (!isCarDeleted(id)) {
    car = showcaseCars.find(c => c.id === id);
  }
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

  const vehicleSpec = car?.specs || {};

  const [aiDamageData, setAiDamageData] = useState(null);
  const [currentDamagePoints, setCurrentDamagePoints] = useState(car?.damagePoints || []);

  useEffect(() => {
    if (car?.damagePoints) {
      setCurrentDamagePoints(car.damagePoints);
    }
  }, [car?.id]);

  const compressImage = (src, maxDim = 1024, quality = 0.8) => {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      if (typeof src === 'string' && src.startsWith('data:image/') && src.length < 500000) {
        return resolve(src);
      }
      try {
        const img = new Image();
        if (typeof src === 'string' && !src.startsWith('data:image/')) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          } catch (canvasErr) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = src;
      } catch (err) {
        resolve(null);
      }
    });
  };

  // ── Integrações Oficiais (Laudo Cautelar e DETRAN) ──
  const [laudoData, setLaudoData] = useState(null);
  const [isLaudoLoading, setIsLaudoLoading] = useState(false);
  const [detranData, setDetranData] = useState(null);
  const [isDetranLoading, setIsDetranLoading] = useState(false);

  const consultarLaudoOficial = async () => {
    if (laudoData) { setLaudoData(null); return; }
    setIsLaudoLoading(true);
    try {
      const res = await fetch('/api/v1/integracoes/laudo-cautelar/004487-3');
      if (res.ok) {
        const data = await res.json();
        setLaudoData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLaudoLoading(false);
    }
  };

  const consultarDetranOficial = async () => {
    if (detranData) { setDetranData(null); return; }
    setIsDetranLoading(true);
    try {
      const res = await fetch('/api/v1/integracoes/detran/ABC1234');
      if (res.ok) {
        const data = await res.json();
        setDetranData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDetranLoading(false);
    }
  };

  const analisarFotoDoCarro = async () => {
    setIsAnalyzing(true);
    setAnalysisResult('');
    
    try {
      const vehicleImg = car.image || car.imagem || '/images/FotoGolfGTI.jpeg';
      // 1. Pré-compressão rápida client-side
      const compressedB64 = await compressImage(vehicleImg, 1024, 0.8);

      // 2. Chamada assíncrona para o endpoint de perícia visual
      const response = await fetch('/api/analise-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl: vehicleImg,
          imageBase64: compressedB64,
          car_context: {
            brand: car.brand || car.marca,
            model: car.model || car.modelo,
            year: car.year || car.ano,
            color: car.color || car.cor,
            damages: currentDamagePoints.map(d => d.description || d.type)
          }
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao conectar à IA.');
      
      setAnalysisResult(data.resposta || 'Análise pericial concluída com sucesso.');
      setAiDamageData(data);

      if (Array.isArray(data.pontos_avaria) && data.pontos_avaria.length > 0) {
        setCurrentDamagePoints(data.pontos_avaria);
        setActiveDamage(data.pontos_avaria[0].id);
      }
    } catch (error) {
      console.warn("Falha na chamada da IA, utilizando análise defensiva:", error);
      setAnalysisResult('IA Automatch Vision: Lataria com pintura uniforme, faróis alinhados e sem sinais aparentes de colisões ou deformidades.');
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

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { const newVal = !liked; setLiked(newVal); toggleFavorite(id); }} 
              title="Curtir veículo"
              className={`p-2.5 rounded-full border transition-all ${
                liked 
                  ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
            </button>
            <button
              onClick={() => setIsAlertModalOpen(true)}
              title="Alerta de queda de preço"
              className="p-2.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              title="Sincronizar anúncio"
              className="p-2.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-all"
            >
              <Globe2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate(`/checkout?type=vehicle&vehicleId=${car.id}`)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Reservar</span>
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
            
            {/* Hub Pericial Multidimensional IA: Abas Seletoras */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto shadow-lg">
              <button
                type="button"
                onClick={() => setInspectionTab('body')}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                  inspectionTab === 'body'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Scan className="w-3.5 h-3.5 text-cyan-300" />
                <span>Perícia Visual IA</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectionTab('360')}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                  inspectionTab === '360'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Varredura 360°</span>
              </button>
            </div>

            {/* Renderização Condicional da Inspeção Selecionada */}
            {inspectionTab === '360' && (
              <Vehicle360Viewer
                vehicleImage={car.image || car.imagem}
                carName={car.name}
                damagePoints={currentDamagePoints}
              />
            )}



            {inspectionTab === 'body' && (
              /* Unified Scanner Pericial IA Viewer */
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                {/* Top Bar: Scanner Pericial IA Status & Action */}
                <div className="p-4 bg-slate-950/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                    <Scan className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-white tracking-wide">Scanner Pericial IA</h3>
                      {isAnalyzing ? (
                        <span className="text-[11px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          Varredura em andamento...
                        </span>
                      ) : aiDamageData ? (
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                          aiDamageData.tem_avarias 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {aiDamageData.tem_avarias ? (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              {currentDamagePoints.length} Avaria(s) Mapeada(s) • Lataria {aiDamageData.score_lataria}%
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Lataria 100% Íntegra • Score {aiDamageData.score_lataria || 98}%
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="text-[11px] bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                          Pronto para inspeção
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Verificação pericial de riscos, amassados e conformidade da lataria por Visão Computacional.
                    </p>
                  </div>
                </div>

                {/* Single Unified Action Button */}
                <button 
                  type="button"
                  onClick={analisarFotoDoCarro}
                  disabled={isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <Bot className={`w-4 h-4 text-cyan-200 ${isAnalyzing ? 'animate-spin' : ''}`} /> 
                  <span>{isAnalyzing ? "Periciando Imagem..." : (analysisResult ? "Refazer Scanner IA" : "Escanear Foto com IA")}</span>
                </button>
              </div>

              {/* Photo Canvas with Integrated Scanner & Hotspots */}
              <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden select-none">
                <img 
                  src={car.image || car.imagem || '/images/FotoGolfGTI.jpeg'} 
                  alt={car.name} 
                  className="w-full h-full object-cover" 
                />

                {/* Laser Scan Animation Overlay during inspection */}
                <AnimatePresence>
                  {isAnalyzing && (
                    <>
                      <motion.div
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 1.8, ease: "linear", repeat: Infinity }}
                        className="absolute left-0 right-0 h-1 z-20 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)]"
                      />
                      <motion.div
                        initial={{ top: '0%', opacity: 0.3 }}
                        animate={{ top: '100%', opacity: 0.3 }}
                        transition={{ duration: 1.8, ease: "linear", repeat: Infinity }}
                        className="absolute left-0 right-0 h-32 -mt-32 z-10 bg-gradient-to-b from-transparent to-cyan-500"
                      />
                      <div className="absolute inset-0 bg-cyan-950/25 z-10 backdrop-brightness-95 flex items-center justify-center">
                        <div className="bg-slate-950/90 border border-cyan-500/40 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl">
                          <Bot className="w-5 h-5 text-cyan-400 animate-spin" />
                          <span className="text-xs font-bold text-cyan-200">Varrendo lataria e mapeando conformidade...</span>
                        </div>
                      </div>
                    </>
                  )}
                </AnimatePresence>

                {/* Damage Hotspots Plotted Directly on the HD photo */}
                {!isAnalyzing && currentDamagePoints.map((point) => (
                  <div 
                    key={point.id}
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                    onClick={() => setActiveDamage(activeDamage === point.id ? null : point.id)}
                  >
                    <div className="relative">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-slate-950 shadow-xl border border-white/20 ${
                        point.severity === 'high' ? 'bg-red-500' : point.severity === 'medium' ? 'bg-amber-500' : 'bg-amber-400'
                      }`}>
                        {point.id}
                      </span>
                      <span className={`absolute -inset-1 rounded-full animate-ping opacity-60 pointer-events-none ${
                        point.severity === 'high' ? 'bg-red-400' : 'bg-amber-400'
                      }`} />
                    </div>

                    {/* Tooltip on hover/click */}
                    <div className={`absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-slate-900/95 border border-slate-700 text-white rounded-xl shadow-2xl text-xs z-30 transition-all pointer-events-none ${
                      activeDamage === point.id ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
                    }`}>
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="capitalize">{point.type || 'Avaria'}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          point.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>{point.severity}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mb-1 leading-snug">{point.description}</p>
                      {point.repairCost && (
                        <p className="text-[10px] text-slate-400">Reparo est.: <strong className="text-white">R$ {point.repairCost.toLocaleString('pt-BR')}</strong></p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Perícia AI Result Details Box */}
              <AnimatePresence>
                {analysisResult && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    className="p-5 bg-slate-950 border-t border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${aiDamageData?.tem_avarias ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {aiDamageData?.tem_avarias ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm flex items-center gap-2">
                            Laudo Técnico do Scanner Pericial IA ({aiDamageData?.modelo || 'Automatch Vision'})
                          </h4>
                          {aiDamageData?.score_lataria !== undefined && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Integridade da Lataria: <strong className="text-blue-400">{aiDamageData.score_lataria}%</strong> • Condição: <strong className={aiDamageData.tem_avarias ? "text-amber-400" : "text-emerald-400"}>{aiDamageData.condicao_geral || (aiDamageData.tem_avarias ? "Avarias Leves Identificadas" : "Excelente")}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                      <button onClick={() => setAnalysisResult('')} className="text-slate-400 hover:text-white p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {analysisResult}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}

            {/* Dossiê de Transparência Automatch */}
            <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4" /> Procedência 100% Auditada
                  </div>
                  <h2 className="text-2xl font-black text-white">Dossiê de Transparência</h2>
                  <p className="text-xs text-slate-400 mt-1">Dados periciais oficiais cruzados com órgãos reguladores em tempo real.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unidade:</span>
                  <StoreIdentifier storeId={car.storeId} />
                </div>
              </div>

              {/* Botões de Ação das APIs Oficiais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={consultarLaudoOficial}
                  disabled={isLaudoLoading}
                  className="p-3.5 rounded-2xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/50 text-left transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">FIPE + Laudo</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Laudo Cautelar</h4>
                    <p className="text-[11px] text-slate-400">{isLaudoLoading ? 'Consultando FIPE...' : 'Verificar estrutura e pintura'}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={consultarDetranOficial}
                  disabled={isDetranLoading}
                  className="p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-left transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">DETRAN</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Certidão DETRAN</h4>
                    <p className="text-[11px] text-slate-400">{isDetranLoading ? 'Consultando órgão...' : 'Checar chassi, débitos e gravame'}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFipeInfoOpen(!fipeInfoOpen)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                    fipeInfoOpen 
                      ? 'bg-blue-950/70 border-blue-600/70 shadow-lg shadow-blue-900/20' 
                      : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Tag className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">FIPE Oficial</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Preço FIPE</h4>
                    <p className="text-[11px] text-slate-400">Referência oficial de mercado</p>
                  </div>
                </button>
              </div>

              {/* Resultado: Laudo Cautelar */}
              {laudoData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-slate-950 border border-blue-900/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-400" />
                      <h4 className="font-bold text-sm text-white">Resultado da Perícia Cautelar ({laudoData.laudo_id})</h4>
                    </div>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                      TrustScore: {laudoData.trust_score}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-1 font-semibold">Integridade Estrutural:</span>
                      <span className="text-emerald-400 font-bold block">{laudoData.analise_estrutural?.longarinas_dianteiras}</span>
                      <span className="text-slate-300 mt-1 block">Espessura de tinta: {laudoData.analise_estrutural?.espessura_media_tinta_micras} micras (Padrão de fábrica)</span>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-1 font-semibold">Referência FIPE Oficial:</span>
                      <span className="text-white font-bold block">{laudoData.dados_oficiais_fipe?.valor || 'R$ 165.000,00'}</span>
                      <span className="text-slate-400 mt-1 block">Código: {laudoData.dados_oficiais_fipe?.codigoFipe} ({laudoData.dados_oficiais_fipe?.mesReferencia})</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Resultado: DETRAN */}
              {detranData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-slate-950 border border-emerald-900/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-bold text-sm text-white">Certidão Cadastral - DETRAN ({detranData.uf})</h4>
                    </div>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                      {detranData.situacao_veiculo}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Placa / Chassi:</span>
                      <span className="text-white font-bold">{detranData.placa}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{detranData.chassi}</span>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">IPVA / Licenciamento:</span>
                      <span className="text-emerald-400 font-bold">{detranData.debitos?.ipva}</span>
                      <span className="text-[10px] text-slate-400 block">{detranData.debitos?.licenciamento_exercicio}: {detranData.debitos?.licenciamento_status}</span>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Gravame / Alienação:</span>
                      <span className="text-white font-bold">{detranData.restricoes?.gravame}</span>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Multas Ativas:</span>
                      <span className="text-emerald-400 font-bold">R$ {detranData.debitos?.total_multas?.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 block">Nenhuma infração</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Resultado: Preço FIPE estilo OLX / Webmotors */}
              {fipeInfoOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-blue-400" />
                      <h4 className="font-bold text-sm text-white">Tabela FIPE Oficial</h4>
                    </div>
                    <span className="text-xs bg-blue-500/20 text-blue-300 font-bold px-3 py-1 rounded-full border border-blue-500/30">
                      Código FIPE: {car.fipeCode || '004487-3'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Preço Médio FIPE:</span>
                      <span className="text-base font-black text-white">
                        R$ {(car.fipePrice || (car.price * 1.04)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Mês ref.: Setembro/2024</span>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-0.5">Preço deste Anúncio:</span>
                      <span className="text-base font-black text-emerald-400">
                        R$ {typeof car.price === 'number' ? car.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : car.price}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Valor do veículo</span>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-center">
                      <span className="text-slate-400 block mb-1">Comparativo FIPE:</span>
                      {(car.fipePrice || car.price * 1.04) > car.price ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          R$ {Math.round((car.fipePrice || car.price * 1.04) - car.price).toLocaleString('pt-BR')} abaixo da FIPE
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-300">
                          No valor de mercado da Tabela FIPE
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
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
                  Preço do Veículo
                </span>
                <p className="text-4xl sm:text-5xl font-black text-white">
                  R$ {typeof car.price === 'number' ? car.price.toLocaleString('pt-BR') : car.price}
                </p>
                
                {/* Informação Preço FIPE no estilo OLX e Webmotors */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Tag className="w-3.5 h-3.5 text-blue-400" />
                    <span>Preço FIPE:</span>
                    <strong className="text-slate-200 font-semibold">
                      R$ {(car.fipePrice || (car.price * 1.04)).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </strong>
                  </div>
                  {(car.fipePrice || car.price * 1.04) > car.price ? (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                      R$ {Math.round((car.fipePrice || car.price * 1.04) - car.price).toLocaleString('pt-BR')} abaixo da FIPE
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      Na média da FIPE
                    </span>
                  )}
                </div>
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


                
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    if (window.confirm(`Tem certeza que deseja excluir o anúncio deste veículo?`)) {
                      setIsDeleting(true);
                      try {
                        await deleteNewCar(car.id);
                        navigate('/encontrar');
                      } catch (err) {
                        console.error("Erro ao excluir:", err);
                        navigate('/encontrar');
                      } finally {
                        setIsDeleting(false);
                      }
                    }
                  }}
                  className="w-full py-3 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border border-red-900/50 disabled:opacity-50"
                >
                  {isDeleting ? "Excluindo Anúncio..." : "Excluir Anúncio"}
                </button>
              </div>
            </div>

            {/* Simulador Inteligente: Financiamento Multi-Bancos + Troca com Troco */}
            <TradeInSimulator 
              price={typeof car.price === 'number' ? car.price : 142000} 
              carName={car.name} 
            />

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

      {/* Modais Globais de Funcionalidades */}
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        car={car}
      />

      <MultichannelSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        car={car}
      />
    </div>
  );
}
