import { readVisualInspection, vehicleInspection, inspectionLabel, trustedDamagePoints, VISUAL_NOTICE } from '../utils/visualInspection.js';
import { getVehicleStatusRows, formatVehicleMileage } from '../utils/vehicleInformation.js';
/**
 * ShowcaseVehicleDetails.jsx — Página de detalhes aprofundados e ficha técnica do veículo selecionado.
 *
 * Objetivo e Motivo da Criação:
 *   - Criado para reunir todos os dados de decisão em um único lugar: fotos em alta resolução, visualizador 360°,
 *     laudo pericial completo, histórico de procedência, simulador de financiamento e contato direto com o vendedor.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Calendar, Gauge, Palette, MapPin, Heart, MessageCircle, Bot, Star, ChevronRight, ChevronDown, Car, AlertTriangle, Fuel, Settings, Award, Calculator, Scan, Tag, RotateCw, Bell, Globe2, FileText, Video, Scale, Loader2 } from 'lucide-react';
import StoreIdentifier from '../components/ui/StoreIdentifier';
import AutomatchLogo from '../components/ui/AutomatchLogo';
import { showcaseCars } from '../data/showcaseData';
import { mockCars } from '../data/mockData';
import { getNewCarById, isCarDeleted } from '../data/newCarsManager';
import { toggleFavorite, isFavorite, subscribeFavorites } from '../data/favoritesManager';

import AIChatBox from '../components/vehicle/AIChatBox';
import SellerChat from '../components/vehicle/SellerChat';
import TradeInSimulator from '../components/vehicle/TradeInSimulator';
import Vehicle360Viewer from '../components/vehicle/Vehicle360Viewer';
import PericialVideoViewer from '../components/vehicle/PericialVideoViewer';
import OfficialDossierModal from '../components/vehicle/OfficialDossierModal';

// Code-Splitting: Carregamento sob demanda para modais secundários (reduz bundle inicial em ~40 kB)
const PriceAlertModal = React.lazy(() => import('../components/vehicle/PriceAlertModal'));
const MultichannelSyncModal = React.lazy(() => import('../components/vehicle/MultichannelSyncModal'));
const VehicleComparatorModal = React.lazy(() => import('../components/vehicle/VehicleComparatorModal'));
import MarketPriceIndicator from '../components/vehicle/MarketPriceIndicator';
import TcoCalculatorCard from '../components/vehicle/TcoCalculatorCard';
import PriceDropBadge from '../components/vehicle/PriceDropBadge';
import { useAuth } from '../contexts/useAuth';
import { getVehicleImageUrl, handleVehicleImageError } from '../utils/imageHelper';
import ErrorBoundary from '../components/common/ErrorBoundary';
import AccordionPanel from '../components/vehicle/AccordionPanel';
import { api, isDemoModeEnabled } from '../services/apiClient';
import { demoDossier, demoRegistration } from '../utils/demoTools';
import VehicleReferencePanel from '../components/vehicle/VehicleReferencePanel';
import { mapVehicleToViewModel } from '../utils/vehicleMapper';

const formatMileage = formatVehicleMileage;

const formatPrice = (val) => {
  if (val === undefined || val === null) return 'R$ 0';
  const num = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.-]+/g, ''));
  return isNaN(num) ? `R$ ${val}` : `R$ ${num.toLocaleString('pt-BR')}`;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ShowcaseVehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [car, setCar] = useState(null);
  const [isLoadingCar, setIsLoadingCar] = useState(true);
  const [carLoadError, setCarLoadError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [scanError, setScanError] = useState(false);
  const [allInventoryCars, setAllInventoryCars] = useState([]);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [isOpeningComparator, setIsOpeningComparator] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeChat, setActiveChat] = useState('ai'); // 'ai' | 'seller'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [activeDamage, setActiveDamage] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState(null); // 'laudo' | 'detran' | 'fipe' | null
  const laudoCacheRef = useRef(null);
  const detranCacheRef = useRef(null);
  const analysisScopeRef = useRef(null);
  const [inspectionTab, setInspectionTab] = useState('body'); // 'body' | '360' | 'video'
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isTcoOpen, setIsTcoOpen] = useState(false);

  // Scroll to top on mount & initialize favorite state
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hydrate vehicle from local sources & PostgreSQL API
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setCar(null);
    setIsLoadingCar(true);
    setCarLoadError(null);

    setLiked(isFavorite(id));
    const unsubFav = subscribeFavorites((favs) => {
      setLiked(favs.includes(String(id)));
    });

    // Carrega inventário para alimentar o comparador
    api.get('/api/cars?limit=30', { signal: controller.signal })
      .then(data => {
        const items = Array.isArray(data) ? data : (data?.items || []);
        if (!controller.signal.aborted) setAllInventoryCars(items.map(mapVehicleToViewModel).filter(Boolean));
      })
      .catch(() => {});

    if (isCarDeleted(id)) {
      setCar(null);
      setIsLoadingCar(false);
      return () => { unsubFav(); controller.abort(); };
    }

    // Every source uses the same fields; local ads do not gain demo approvals.
    const found = showcaseCars.find(c => String(c.id) === String(id))
      || mockCars.find(c => String(c.id) === String(id)) || getNewCarById(id);
    if (found && isDemoModeEnabled()) {
      setCar(mapVehicleToViewModel(found));
      setIsLoadingCar(false);
    }

    // 2. Busca no banco de dados PostgreSQL via API
    api.get(`/api/cars/${id}`, { signal: controller.signal })
      .then(dbCar => {
        if (dbCar && !controller.signal.aborted) {
          const formatted = mapVehicleToViewModel(dbCar);
          if (formatted) {
            setCar(formatted);
          }
        }
      })
      .catch(error => {
        if (!controller.signal.aborted && !(found && isDemoModeEnabled())) {
          setCar(null);
          setCarLoadError(error.message || 'Verifique sua conexão e tente novamente.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingCar(false);
      });

    return () => { unsubFav(); controller.abort(); };
  }, [id, loadAttempt]);

  const [aiDamageData, setAiDamageData] = useState(null);
  const [currentDamagePoints, setCurrentDamagePoints] = useState([]);

  useEffect(() => {
    setCurrentDamagePoints(trustedDamagePoints(vehicleInspection(car)));
    setActiveDamage(null);
    setAiDamageData(null);
  }, [car]);

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
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = src;
      } catch {
        resolve(null);
      }
    });
  };

  // ── Integrações Oficiais (Laudo Cautelar e DETRAN) ──
  const [laudoData, setLaudoData] = useState(null);
  const [isLaudoLoading, setIsLaudoLoading] = useState(false);
  const [detranData, setDetranData] = useState(null);
  const [isDetranLoading, setIsDetranLoading] = useState(false);
  const [integrationError, setIntegrationError] = useState(null);

  useEffect(() => {
    const scope = { active: true, controller: new AbortController() };
    analysisScopeRef.current = scope;
    laudoCacheRef.current = null;
    detranCacheRef.current = null;
    setLaudoData(null);
    setDetranData(null);
    setIsLaudoLoading(false);
    setIsDetranLoading(false);
    setActiveAccordion(null);
    setIntegrationError(null);
    setAnalysisResult('');
    setIsAnalyzing(false);
    return () => { scope.active = false; scope.controller.abort(); };
  }, [id, car?.image]);

  const toggleAccordion = async (tipo) => {
    if (activeAccordion === tipo) {
      setActiveAccordion(null);
      return;
    }
    setActiveAccordion(tipo);
    setIntegrationError(null);
    const scope = analysisScopeRef.current;
    if (!scope?.active) return;

    if (tipo === 'laudo' && !laudoCacheRef.current) {
      setIsLaudoLoading(true);
      try {
        const fipeCode = car?.fipeCode;
        if (!isDemoModeEnabled() && !fipeCode) throw new Error('Código FIPE não informado.');
        const data = isDemoModeEnabled() ? demoDossier(car) : await api.get(`/api/v1/integracoes/laudo-cautelar/${encodeURIComponent(fipeCode)}${car.year ? `?ano=${car.year}` : ''}`, { signal: scope.controller.signal });
        if (!scope.active) return;
        laudoCacheRef.current = data;
        setLaudoData({ ...(data.laudo || data), sample: data.is_simulado });
      } catch {
        if (!scope.active) return;
        setIntegrationError({ type: 'laudo', message: 'Não foi possível consultar o laudo cautelar. Tente novamente.' });
      } finally {
        if (scope.active) setIsLaudoLoading(false);
      }
    } else if (tipo === 'detran' && !detranCacheRef.current) {
      setIsDetranLoading(true);
      try {
        const plate = car?.plate;
        if (!isDemoModeEnabled() && !plate) throw new Error('Placa não informada.');
        const data = isDemoModeEnabled() ? demoRegistration(car) : await api.get(`/api/v1/integracoes/detran/${encodeURIComponent(plate)}`, { signal: scope.controller.signal });
        if (!scope.active) return;
        detranCacheRef.current = data;
        setDetranData({ ...(data.dados_veiculo || data), sample: data.is_simulado });
      } catch {
        if (!scope.active) return;
        setIntegrationError({ type: 'detran', message: 'Não foi possível consultar os dados do DETRAN. Tente novamente.' });
      } finally {
        if (scope.active) setIsDetranLoading(false);
      }
    }
  };


  const analisarFotoDoCarro = async () => {
    const scope = analysisScopeRef.current;
    if (!scope?.active || isAnalyzing || !car?.image) return;
    setIsAnalyzing(true);
    setScanError(false);
    setAiDamageData(null);
    setCurrentDamagePoints([]);
    setAnalysisResult('');
    try {
      const vehicleImg = getVehicleImageUrl(car.image);
      const compressedB64 = await compressImage(vehicleImg, 1024, 0.8);
      if (!scope.active) return;
      const response = await fetch('/api/analise-visual', {
        method: 'POST', signal: scope.controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: vehicleImg, imageBase64: compressedB64,
          car_context: { id: car.id, brand: car.brand, model: car.model, year: car.year, color: car.color }
        }),
      });
      const data = await response.json();
      if (!scope.active) return;
      if (!response.ok || data.status === 'error') throw new Error(data.detail || 'Não foi possível analisar a foto.');
      const inspection = readVisualInspection(data);
      if (!inspection || (inspection.car_id && String(inspection.car_id) !== String(car.id))) {
        throw new Error('O serviço retornou uma análise sem evidência compatível com o anúncio.');
      }
      setAiDamageData({ ...inspection, source_image: car.image });
      setAnalysisResult(inspection.resposta || inspectionLabel(inspection));
      setCurrentDamagePoints(trustedDamagePoints(inspection));
      setActiveDamage(null);
    } catch {
      if (!scope.active) return;
      setScanError(true);
      setAnalysisResult('Não foi possível concluir a análise visual. Tente novamente.');
    } finally {
      if (scope.active) setIsAnalyzing(false);
    }
  };

  if (carLoadError) {
    return <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div role="alert" className="max-w-md text-center space-y-4">
        <h1 className="text-xl font-bold">Não foi possível carregar o anúncio</h1>
        <p>{carLoadError}</p>
        <button type="button" className="rounded-xl bg-blue-600 px-5 py-3 font-bold"
          onClick={() => setLoadAttempt(value => value + 1)}>Tentar novamente</button>
      </div>
    </main>;
  }

  if (isLoadingCar) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Carregando dados do veículo...</p>
        </div>
      </div>
    );
  }

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

  const visualInspection = readVisualInspection(aiDamageData) || vehicleInspection(car);
  const inspectedCar = { ...car, visualInspection, damagePoints: trustedDamagePoints(visualInspection) };

  const specItems = [
    { icon: Settings, label: 'Motor', value: car.specs?.motor || 'Não informado' },
    { icon: Settings, label: 'Câmbio', value: car.specs?.cambio || 'Não informado' },
    { icon: Fuel, label: 'Combustível', value: car.specs?.combustivel || 'Não informado' },
    { icon: Car, label: 'Portas', value: car.specs?.portas || 'Não informado' },
    { icon: Settings, label: 'Direção', value: car.specs?.direcao || 'Não informado' },
    { icon: ShieldCheck, label: 'Freios', value: car.specs?.freios || 'Não informado' },
    { icon: ShieldCheck, label: 'Airbags', value: car.specs?.airbags || 'Não informado' },
    { icon: Gauge, label: 'Tração', value: car.specs?.tracao || 'Não informado' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20">
      {/* Navigation Header */}
      <nav className="w-full px-6 py-4 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <AutomatchLogo size="md" theme="dark" onClick={() => navigate('/')} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { toggleFavorite(id); }}
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
              type="button"
              id="topbar-open-comparator-btn"
              onClick={() => {
                setIsOpeningComparator(true);
                try {
                  setIsComparatorOpen(true);
                } finally {
                  setTimeout(() => setIsOpeningComparator(false), 300);
                }
              }}
              disabled={isOpeningComparator}
              title="Comparar com outros veículos"
              className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
            >
              {isOpeningComparator ? (
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Scale className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-xs font-bold text-amber-300">
                {isOpeningComparator ? 'Abrindo...' : 'Comparar'}
              </span>
            </button>

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium">
          <button onClick={() => navigate('/')} className="hover:text-blue-400">Início</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate('/encontrar')} className="hover:text-blue-400">Vitrine</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300 font-bold">{car.name}</span>
        </div>

        {/* Grid Principal do Anúncio */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">

          {/* ── LEFT COLUMN: Gallery/Scanner, Dossiê, Veículo + Ficha Técnica, TCO ── */}
          <div className="space-y-8">

            {/* Hub Pericial Multidimensional IA: Abas Seletoras */}
            <div data-tour="detalhes-varredura-360" id="hub-pericial-container" className="space-y-4">
              <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto shadow-lg">
              <button
                type="button"
                id="scanner-ia-tab-btn"
                onClick={() => setInspectionTab('body')}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                  inspectionTab === 'body'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Scan className="w-3.5 h-3.5 text-cyan-300" />
                <span>Scanner de IA</span>
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

              <button
                type="button"
                onClick={() => setInspectionTab('video')}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                  inspectionTab === 'video'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-purple-300" />
                <span>Vídeo Pericial 20s</span>
              </button>
            </div>

            {/* Renderização Condicional da Inspeção Selecionada */}
            {inspectionTab === 'video' && (
              <div data-tour="detalhes-video-pericial"><PericialVideoViewer
                videoUrl={car.videoUrl || car.video_url}
                carName={car.name}
              /></div>
            )}

            {inspectionTab === '360' && (
              <div data-tour="detalhes-varredura-360"><Vehicle360Viewer
                car={inspectedCar}
                vehicleImage={car.image || car.imagem}
                carName={car.name || `${car.brand} ${car.model}`}
                gallery={car.gallery}
                photos360={car.photos360}
                damagePoints={currentDamagePoints}
                onOpenLaudo={() => setActiveAccordion('laudo')}
              /></div>
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
                        <span role="status" className="text-xs text-cyan-300 animate-pulse">Analisando foto...</span>
                      ) : (
                        <span role="status" className={visualInspection?.analysis_state === 'damage_detected' ? 'text-xs text-amber-300' : 'text-xs text-slate-300'}>
                          {inspectionLabel(visualInspection)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Avaliação por imagens com evidências e recomendação de vistoria.
                    </p>
                  </div>
                </div>

                {/* Single Unified Action Button */}
                <button
                  type="button"
                  id="scanner-ia-action-btn"
                  onClick={analisarFotoDoCarro}
                  disabled={isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <Bot className={`w-4 h-4 text-cyan-200 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? "Escanando Imagem..." : (scanError ? "Tentar novamente" : (analysisResult ? "Refazer Scanner de IA" : "Scanner de IA"))}</span>
                </button>
              </div>

              {/* Photo Canvas with Integrated Scanner & Hotspots */}
              <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden select-none">
                <img
                  src={getVehicleImageUrl(car.image || car.imagem || 'placeholder-carro.jpg')}
                  alt={car.name}
                  onError={handleVehicleImageError}
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

              {/* Resultado único, sem score artificial de lataria. */}
              {analysisResult && (
                <div role={scanError ? 'alert' : 'status'} className="p-5 bg-slate-950 border-t border-slate-800 space-y-2">
                  <h4 className="text-sm font-bold text-white">{scanError ? 'Análise indisponível' : inspectionLabel(visualInspection)}</h4>
                  <p className="text-sm text-slate-300">{analysisResult}</p>
                  <p className="text-xs text-slate-400">{VISUAL_NOTICE}</p>
                </div>
              )}
            </div>
            )}

            {/* Sobre o Veículo — Nome, Metadados, Descrição e Ficha Técnica Consolidados */}
            <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-6">
              {/* Situações informadas no cadastro; não representam consulta oficial. */}
              <div className="flex flex-wrap items-center gap-2" data-vehicle-status>
                {getVehicleStatusRows(car).map(([label, value]) => <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">{label}: {value}</span>)}
              </div>

              {/* Nome do Veículo */}
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                    {car.name}
                  </h2>
                  {car.featured && (
                    <span title="Destaque" aria-label="Veículo em Destaque" className="inline-flex items-center">
                      <Star className="w-6 h-6 text-amber-400 fill-amber-400 shrink-0" />
                    </span>
                  )}
                </div>
                {/* Informações Básicas (Ano, Km, Câmbio, Cor, Localização) */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 mt-3 text-xs sm:text-sm text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                    <Calendar className="w-4 h-4 text-blue-400" /> Ano: <strong className="text-white font-bold ml-1">{car.year}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                    <Gauge className="w-4 h-4 text-blue-400" /> Km: <strong className="text-white font-bold ml-1">{formatMileage(car.mileage)}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                    <Settings className="w-4 h-4 text-blue-400" /> Câmbio: <strong className="text-white font-bold ml-1">{car.specs?.cambio || 'Não informado'}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                    <Palette className="w-4 h-4 text-blue-400" /> Cor: <strong className="text-white font-bold ml-1">{car.color || 'Prata'}</strong>
                  </span>
                  {car.location && (
                    <span className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                      <MapPin className="w-4 h-4 text-blue-400" /> <strong className="text-white font-bold ml-1">{car.location}</strong>
                    </span>
                  )}
                </div>
              </div>

            </div>

              {/* Descrição Concisa do Veículo */}
              <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Descrição do Veículo
                </span>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {(car.fullDescription || car.description || car.descricao || 'Descrição não informada pelo anunciante.').slice(0, 240)}
                  {(car.fullDescription || car.description || '').length > 240 ? '...' : ''}
                </p>
              </div>

              {/* Ficha Técnica & Equipamentos */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3.5 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-400" /> Ficha Técnica & Equipamentos
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {specItems.map((s, i) => (
                    <div key={i} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center hover:border-slate-700 transition-colors">
                      <s.icon className="w-4 h-4 text-blue-400 mx-auto mb-1.5" />
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">{s.label}</p>
                      <p className="text-xs font-black text-white break-words">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dossiê de Transparência Automatch */}
            <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2" data-testid="laudo-ia-badge-container">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4" /> Informações do anunciante
                    </div>
                    {String(car.laudoStatus || car.laudo_status || '').toLowerCase().includes('reprovado') || String(car.laudoStatus || car.laudo_status || '').includes('RESTRICOES') ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-black uppercase tracking-wider border border-rose-500/30">
                        <AlertTriangle className="w-3.5 h-3.5" /> Laudo: Restrições Críticas
                      </span>
                    ) : String(car.laudoStatus || car.laudo_status || '').toLowerCase().includes('apontamento') || String(car.laudoStatus || car.laudo_status || '').includes('ATENCAO') ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-500/30">
                        <AlertTriangle className="w-3.5 h-3.5" /> Laudo Verificado por IA: Com Apontamento
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-500/30">
                        <ShieldCheck className="w-3.5 h-3.5" /> Laudo Verificado por IA: Sem Ressalvas
                      </span>
                    )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('laudo')}
                  disabled={isLaudoLoading}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                    activeAccordion === 'laudo'
                      ? 'bg-blue-950/80 border-blue-500 shadow-lg shadow-blue-900/30 scale-[1.01]'
                      : 'bg-blue-950/50 hover:bg-blue-900/60 border-blue-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">FIPE + Laudo</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Laudo Cautelar</h4>
                    <p className="text-[11px] text-slate-400">{isLaudoLoading ? 'Consultando FIPE...' : 'Ver dados e documento informado'}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleAccordion('detran')}
                  disabled={isDetranLoading}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                    activeAccordion === 'detran'
                      ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-900/30 scale-[1.01]'
                      : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">DETRAN</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Certidão DETRAN</h4>
                    <p className="text-[11px] text-slate-400">{isDetranLoading ? 'Preparando informações...' : 'Checar chassi, débitos e gravame'}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleAccordion('fipe')}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                    activeAccordion === 'fipe'
                      ? 'bg-cyan-950/70 border-cyan-500 shadow-lg shadow-cyan-900/30 scale-[1.01]'
                      : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Tag className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">Referência FIPE</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Preço FIPE</h4>
                    <p className="text-[11px] text-slate-400">Referência informada no anúncio</p>
                  </div>
                </button>

                <button
                  type="button"
                  data-tour="detalhes-botao-dossie"
                  onClick={() => setIsDossierModalOpen(true)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer ${
                    isDossierModalOpen
                      ? 'bg-blue-950/80 border-blue-500 shadow-lg shadow-blue-900/30 scale-[1.01]'
                      : 'bg-indigo-950/50 hover:bg-indigo-900/60 border-indigo-800/50 hover:border-indigo-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">Oficial</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Dossiê Oficial Automatch</h4>
                    <p className="text-[11px] text-slate-400">Resumo consolidado e laudo</p>
                  </div>
                </button>

              </div>


              {/* Resultado: Laudo Cautelar com AccordionPanel */}
              {integrationError?.type === activeAccordion && (
                <p role="alert" className="p-4 rounded-2xl bg-amber-950/30 border border-amber-700/40 text-sm text-amber-300">{integrationError.message}</p>
              )}
              <AccordionPanel isOpen={activeAccordion === 'laudo' && !!laudoData}>
                <VehicleReferencePanel type="laudo" car={inspectedCar} data={laudoData} />
              </AccordionPanel>
              <AccordionPanel isOpen={activeAccordion === 'detran' && !!detranData}>
                <VehicleReferencePanel type="detran" car={inspectedCar} data={detranData} />
              </AccordionPanel>
              <AccordionPanel isOpen={activeAccordion === 'fipe'}>
                <VehicleReferencePanel type="fipe" car={inspectedCar} />
              </AccordionPanel>
            </div>
            {/* Simulador de Custo Mensal */}
            <div data-tour="detalhes-simulador-tco" className="bg-slate-900/80 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Simulador de Custo Mensal</h3>
                    <p className="text-xs text-slate-400">
                      Ajuste estado e km para ver quanto este carro custa por mês no seu bolso.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTcoOpen(!isTcoOpen)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  <span>{isTcoOpen ? 'Ocultar Simulação' : 'Simular Custo Mensal'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isTcoOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <AnimatePresence>
                {isTcoOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden pt-5 mt-4 border-t border-slate-800"
                  >
                    <TcoCalculatorCard
                      price={car.price}
                      fipePrice={car.fipePrice}
                      fuelType={car.specs?.combustivel || car.fuel || 'Não informado'}

                      showHeader={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Pricing Card, Perícia Cautelar, Simulator, Chats ── */}
          <div className="space-y-6">

            {/* Price Card & Action Limpo */}
            <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                    Preço do Veículo
                  </span>
                  <PriceDropBadge
                    originalPrice={car.originalPrice}
                    currentPrice={car.price}
                    priceHistory={car.priceHistory || []}
                    variant="badge"

                  />
                </div>
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {formatPrice(car.price)}
                </p>
              </div>

              {/* Main CTAs */}
              <div className="space-y-3 pt-2">


                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => navigate('/meus-anuncios')}
                    className="w-full py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <span>Gerenciar meus anúncios</span>
                  </button>
                )}
              </div>
            </div>

            {/* Deal Rating Oficial Automatch (CarGurus Benchmark) */}
            <MarketPriceIndicator
              price={car.price}
              fipePrice={car.fipePrice}
              autoPrice={car.autoPrice}
              year={car.year}
              mileage={car.mileage}
              daysOnMarket={car.daysOnMarket || 14}
              priceHistory={car.priceHistory || []}
              variant="gauge"
            />

            {/* Simulador Inteligente: Financiamento Multi-Bancos + Troca com Troco */}
            <TradeInSimulator
              price={typeof car.price === 'number' ? car.price : 142000}
              carName={car.name}
            />

            {/* Interactive Live Chat (AI / Seller) */}
            <div id="chat-section" data-tour="detalhes-consultor-ia" className="space-y-3 scroll-mt-24">
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

              {activeChat === 'ai' ? <AIChatBox car={inspectedCar} /> : <SellerChat seller={car.seller} />}
            </div>

          </div>
        </div>
      </main>

      {/* Modais Globais de Funcionalidades (Lazy Mounted) */}
      <React.Suspense fallback={null}>
        {isAlertModalOpen && (
          <PriceAlertModal
            isOpen={isAlertModalOpen}
            onClose={() => setIsAlertModalOpen(false)}
            car={inspectedCar}
          />
        )}

        {isSyncModalOpen && (
          <MultichannelSyncModal
            isOpen={isSyncModalOpen}
            onClose={() => setIsSyncModalOpen(false)}
            car={inspectedCar}
          />
        )}

        {isComparatorOpen && (
          <ErrorBoundary
            isOpen={isComparatorOpen}
            resetKey={isComparatorOpen ? 'open' : 'closed'}
            title="Comparador Multidimensional Temporariamente Indisponível"
            description="Ocorreu uma instabilidade ao confrontar os dados deste veículo. Você pode recarregar ou continuar navegando na vitrine."
            onClose={() => setIsComparatorOpen(false)}
          >
            <VehicleComparatorModal
              isOpen={isComparatorOpen}
              onClose={() => setIsComparatorOpen(false)}
              baseCar={car}
              availableCars={allInventoryCars.length > 0 ? allInventoryCars : showcaseCars}
            />
          </ErrorBoundary>
        )}

      </React.Suspense>

      {/* Modal Oficial Consolidado do Dossiê Automatch */}
      <OfficialDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        car={inspectedCar}
      />
    </div>
  );
}
