import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Banknote, 
  Search, 
  LayoutGrid, 
  List, 
  ArrowLeft,
  TrendingUp,
  Package,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  X,
  BarChart3,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  PlusCircle,
  Trash2,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import B2BRepassePanel from '../components/inventory/B2BRepassePanel';
import { useNavigate } from 'react-router-dom';
import { 
  stores, 
  inventory, 
  getStoredInventory, 
  updateInventoryAsset, 
  deleteInventoryAsset 
} from '../data/inventoryData';
import { useAuth } from '../contexts/AuthContext';
import { getNewCars, deleteNewCar } from '../data/newCarsManager';
import StoreSelector from '../components/layout/StoreSelector';
import StoreIdentifier from '../components/ui/StoreIdentifier';
import AssetConfigurationModal from '../components/inventory/AssetConfigurationModal';
import { getVehicleImageUrl, handleVehicleImageError } from '../utils/imageHelper';
import useScrollLock from '../utils/useScrollLock';
import SpotlightCard from '../components/ui/microkit/SpotlightCard';
import GlowButton from '../components/ui/microkit/GlowButton';
import WipeButton from '../components/ui/microkit/WipeButton';

// Code-Splitting: PartnershipHubModal e AIStudioModal carregados sob demanda
const PartnershipHubModal = lazy(() => import('../components/partners/PartnershipHubModal'));
const AIStudioModal = lazy(() => import('../components/inventory/AIStudioModal'));

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Erro capturado no Dashboard:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="py-16 px-6 text-center bg-white rounded-3xl border border-red-200 my-8 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-800">Ocorreu uma falha ao exibir a grade de ativos</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Seus dados estão preservados no inventário. Tente recarregar a visualização.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Recarregar Gestão de Ativos
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, canAccessB2B } = useAuth();
  const isB2B = Boolean(canAccessB2B?.());

  // Estado de controle para anúncios pessoais do comprador
  const [personalAdsVersion, setPersonalAdsVersion] = useState(0);

  // Inventário de lojas (B2B)
  const [b2bInventoryList, setB2bInventoryList] = useState(() => getStoredInventory());

  // Anúncios do usuário comprador (Particular)
  const personalInventory = useMemo(() => {
    if (isB2B) return [];
    const all = getNewCars();
    const userCars = all.filter(c => {
      if (c.userEmail && user?.email) {
        return c.userEmail.toLowerCase() === user.email.toLowerCase();
      }
      return true;
    });

    return userCars.map(c => ({
      id: c.id,
      storeId: 'particular',
      model: c.modelo || c.model || 'Veículo',
      brand: c.marca || c.brand || 'Automatch',
      plate: c.plate || 'PARTICULAR',
      sale_value: Number(c.preco || c.price) || 0,
      floor_price: Number(c.preco || c.price) || 0,
      financial_status: 'paid',
      operational_status: 'available',
      year: String(c.ano || c.year || '2024'),
      mileage: Number(c.km) || 0,
      color: c.cor || 'Branco',
      fuel: 'Flex',
      visible_showcase: true,
      visible_b2b: false,
      image: c.imagem || c.image || '/images/FotoCorollaCross.jpg',
      isParticular: true,
      rawCar: c
    }));
  }, [isB2B, user?.email, personalAdsVersion]);

  // Lista ativa conforme role: B2B usa b2bInventoryList, Comprador usa personalInventory
  const inventoryList = isB2B ? b2bInventoryList : personalInventory;

  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [configuringAsset, setConfiguringAsset] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [dashboardTab, setDashboardTab] = useState('inventory'); // 'inventory' | 'b2b-radar'
  const itemsPerPage = 12;

  const filteredInventory = inventoryList.filter(item => {
    if (!item) return false;
    const matchesStore = !isB2B || !selectedStoreId || item.storeId === selectedStoreId;
    const query = (searchQuery || '').toLowerCase().trim();
    if (!query) return matchesStore;
    const modelStr = String(item.model || '').toLowerCase();
    const brandStr = String(item.brand || '').toLowerCase();
    const plateStr = String(item.plate || '').toLowerCase();
    const matchesSearch = modelStr.includes(query) || 
                          brandStr.includes(query) ||
                          plateStr.includes(query);
    return matchesStore && matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStoreId, searchQuery]);

  // Bloqueio de rolagem centralizado com contagem de referências ao abrir modal
  useScrollLock(isConfigModalOpen || isB2BModalOpen);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;
  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(start, start + itemsPerPage);
  }, [filteredInventory, currentPage, itemsPerPage]);

  const getStoreStats = () => {
    const totalAssets = filteredInventory.length;
    const totalValue = filteredInventory.reduce((acc, item) => acc + (Number(item.sale_value) || 0), 0);
    const pendingFinance = filteredInventory.filter(i => i.financial_status === 'pending').length;
    
    return { totalAssets, totalValue, pendingFinance };
  };

  const stats = getStoreStats();

  const handleOpenConfigureAsset = (asset) => {
    setConfiguringAsset(asset);
    setIsConfigModalOpen(true);
  };

  const handleSaveAsset = (updatedAsset) => {
    try {
      if (!updatedAsset || !updatedAsset.id) {
        throw new Error('Identificador do ativo ausente.');
      }
      const safeAsset = {
        ...updatedAsset,
        brand: String(updatedAsset.brand || 'Veículo').trim(),
        model: String(updatedAsset.model || 'Sem Modelo').trim(),
        plate: String(updatedAsset.plate || 'SEM-PLACA').trim(),
        sale_value: Number(updatedAsset.sale_value) || 0,
        floor_price: Number(updatedAsset.floor_price) || 0,
        mileage: Number(updatedAsset.mileage) || 0,
        storeId: String(updatedAsset.storeId || (isB2B ? 'store-1' : 'particular'))
      };
      const newList = updateInventoryAsset(safeAsset);
      setB2bInventoryList(newList);
      setFeedbackToast({
        type: 'success',
        message: `Ativo "${safeAsset.brand} ${safeAsset.model}" (${safeAsset.plate}) configurado com sucesso!`
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (err) {
      console.error('Falha ao processar salvamento do ativo:', err);
      setFeedbackToast({
        type: 'error',
        message: 'Erro ao salvar configuração do ativo. Os dados foram preservados.'
      });
      setTimeout(() => setFeedbackToast(null), 5000);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      if (!isB2B) {
        await deleteNewCar(assetId);
        setPersonalAdsVersion(v => v + 1);
        setFeedbackToast({
          type: 'info',
          message: 'Anúncio removido com sucesso.'
        });
        setTimeout(() => setFeedbackToast(null), 4000);
        return;
      }
      const deletedItem = inventoryList.find(i => String(i.id) === String(assetId));
      const newList = deleteInventoryAsset(assetId);
      setB2bInventoryList(newList);
      setFeedbackToast({
        type: 'info',
        message: `Ativo "${deletedItem ? `${deletedItem.brand} ${deletedItem.model}` : 'Veículo'}" removido com sucesso.`
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (err) {
      console.error('Falha ao remover ativo:', err);
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Não foi possível remover o ativo.'
      });
      setTimeout(() => setFeedbackToast(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans pb-16 relative overflow-hidden">
      {/* Top Header */}
      <header className="bg-white/85 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 rounded-2xl transition-colors text-slate-600 cursor-pointer active:scale-95 border border-slate-200/60"
              aria-label="Voltar para o início"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {isB2B ? 'Gestão de Ativos' : 'Meu Painel de Vendas'}
                </h1>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isB2B 
                    ? 'bg-blue-50 text-blue-700 border-blue-200/60' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                }`}>
                  {isB2B ? 'B2B Lojas' : 'Vendedor Particular'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {isB2B 
                  ? (selectedStoreId ? (stores.find(s => s.id === selectedStoreId)?.name || 'Unidade Selecionada') : 'Visão Consolidada Multi-Lojas')
                  : (user?.name ? `Olá, ${user.name}! Gerencie seus anúncios e propostas` : 'Gerencie seus anúncios publicados e métricas de venda')
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {isB2B && (
              <div className="min-w-[170px]">
                <StoreSelector selectedStoreId={selectedStoreId} onSelect={setSelectedStoreId} />
              </div>
            )}
            
            <div className="relative min-w-[210px] flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Buscar modelo ou placa..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 border border-slate-200/60 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Botão Novo Anúncio (para todos) */}
              <button
                onClick={() => navigate('/novo-anuncio')}
                className="px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Novo Anúncio</span>
              </button>

              {/* Botão Rede B2B exclusivo para lojistas/admin */}
              {isB2B && (
                <button
                  onClick={() => setIsB2BModalOpen(true)}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-slate-900/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Rede B2B</span>
                </button>
              )}

              {/* Estúdio IA */}
              <button
                onClick={() => setIsAIStudioOpen(true)}
                className="px-3.5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-violet-500/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Estúdio IA</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Feedback Alert Toast */}
        <AnimatePresence>
          {feedbackToast && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-bold shadow-lg backdrop-blur-md ${
                feedbackToast.type === 'error' 
                  ? 'bg-red-50 text-red-800 border-red-200' 
                  : feedbackToast.type === 'info'
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feedbackToast.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <span>{feedbackToast.message}</span>
              </div>
              <button 
                onClick={() => setFeedbackToast(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {(isB2B ? [
            { 
              label: 'Total em Estoque', 
              value: `${stats.totalAssets} ${stats.totalAssets === 1 ? 'veículo' : 'veículos'}`, 
              icon: Package, 
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              border: 'border-blue-100',
              sub: 'Pátio consolidado'
            },
            { 
              label: 'Valor Adensado', 
              value: `R$ ${stats.totalValue.toLocaleString('pt-BR')}`, 
              icon: Banknote, 
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              border: 'border-emerald-100',
              sub: 'Patrimônio em vitrine'
            },
            { 
              label: 'Pendências Financeiras', 
              value: `${stats.pendingFinance} pendentes`, 
              icon: FileText, 
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              border: 'border-amber-100',
              sub: 'Em regularização'
            },
          ] : [
            { 
              label: 'Meus Anúncios Ativos', 
              value: `${stats.totalAssets} ${stats.totalAssets === 1 ? 'veículo anunciado' : 'veículos anunciados'}`, 
              icon: Car, 
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              border: 'border-blue-100',
              sub: 'Publicados na vitrine nacional'
            },
            { 
              label: 'Valor Total Anunciado', 
              value: `R$ ${stats.totalValue.toLocaleString('pt-BR')}`, 
              icon: Banknote, 
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              border: 'border-emerald-100',
              sub: 'Patrimônio sob sua titularidade'
            },
            { 
              label: 'Status do Vendedor', 
              value: 'Particular Ativo', 
              icon: ShieldCheck, 
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              border: 'border-emerald-100',
              sub: 'Apto a receber propostas diretas'
            },
          ]).map((stat, i) => (
            <SpotlightCard 
              key={i}
              className="p-5 sm:p-6 flex items-center gap-4"
            >
              <div className={`w-13 h-13 rounded-2xl ${stat.bg} ${stat.border} border flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">{stat.value}</p>
                <p className="text-[11px] text-slate-500 font-medium">{stat.sub}</p>
              </div>
            </SpotlightCard>
          ))}
        </div>

        {/* Action Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200 w-fit">
            <button
              onClick={() => setDashboardTab('inventory')}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                dashboardTab === 'inventory' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Package className="w-3.5 h-3.5" /> 
              <span>{isB2B ? 'Inventário Ativo' : 'Meus Veículos'}</span>
            </button>
            {isB2B && (
              <button
                onClick={() => setDashboardTab('b2b-radar')}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  dashboardTab === 'b2b-radar' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> 
                <span>Radar B2B</span>
              </button>
            )}
          </div>

          {dashboardTab === 'inventory' && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Exibição:</span>
              <div className="bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm flex">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="Visualização em Grade"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="Visualização em Lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* B2B Radar Panel */}
        {isB2B && dashboardTab === 'b2b-radar' && (
          <motion.div
            key="b2b-radar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <B2BRepassePanel inventory={filteredInventory} />
          </motion.div>
        )}

        {/* Inventory View */}
        {dashboardTab === 'inventory' && (
          <DashboardErrorBoundary>
            {filteredInventory.length === 0 ? (
              <div className="py-16 px-6 text-center bg-white rounded-3xl border border-slate-200/80 my-4 shadow-sm max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-4">
                  <Car className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {isB2B ? 'Nenhum ativo localizado no estoque' : 'Você ainda não possui veículos anunciados'}
                </h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  {isB2B 
                    ? 'Nenhum ativo localizado com os filtros aplicados. Tente alterar a unidade ou o termo de busca.'
                    : 'Publique seu carro de forma rápida com laudo pericial, fotos inteligentes e integração direta com compradores interessados.'}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/novo-anuncio')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publicar Meu Primeiro Anúncio</span>
                  </button>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div 
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {paginatedInventory.map((item, idx) => {
                      const store = stores.find(s => s.id === item.storeId);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300 group relative flex flex-col justify-between"
                        >
                          {/* Accent */}
                          <div 
                            className="absolute top-0 left-0 bottom-0 w-1.5 z-10" 
                            style={{ backgroundColor: item.isParticular ? '#10b981' : (store?.color_theme || '#2563eb') }}
                          />
                          
                          <div>
                            {/* Image Container */}
                            <div className="aspect-[16/10] overflow-hidden bg-slate-950 relative">
                              <img 
                                src={getVehicleImageUrl(item.image || item.imagem || 'placeholder-carro.jpg')} 
                                alt={`${item.brand} ${item.model}`}
                                loading="lazy"
                                onError={handleVehicleImageError}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                              
                              {/* Floating Badge */}
                              <div className="absolute top-3 right-3 z-20">
                                {item.isParticular ? (
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-md">
                                    Vendedor Particular
                                  </span>
                                ) : (
                                  <StoreIdentifier storeId={item.storeId} variant="badge" />
                                )}
                              </div>

                              <div className="absolute bottom-2 left-4 z-20">
                                <span className="text-[10px] font-black text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono tracking-wider">
                                  {item.plate}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-5">
                              <div className="flex justify-between items-center mb-2.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  {item.brand}
                                </span>

                                {item.operational_status && (
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                    item.operational_status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    item.operational_status === 'negotiation' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    item.operational_status === 'reserved' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {item.operational_status === 'available' ? 'Disponível' :
                                     item.operational_status === 'negotiation' ? 'Negociação' :
                                     item.operational_status === 'reserved' ? 'Reservado' : 'Vendido'}
                                  </span>
                                )}
                              </div>
                              
                              <h3 className="text-lg font-black text-slate-900 leading-snug tracking-tight mb-2 truncate">
                                {item.model}
                              </h3>

                              <p className="text-2xl font-black text-blue-600 tracking-tight">
                                R$ {Number(item.sale_value).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          <div className="px-5 pb-5 pt-0">
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${
                                  item.financial_status === 'paid' ? 'bg-emerald-500' : 
                                  item.financial_status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                                }`} />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                                  {item.financial_status === 'paid' ? 'Quitado' : 
                                   item.financial_status === 'pending' ? 'Pendente' : 'Financiado'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => navigate(`/encontrar/${item.id}`)}
                                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                                  title="Ver anúncio na vitrine pública"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                                
                                {isB2B ? (
                                  <button 
                                    onClick={() => handleOpenConfigureAsset(item)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                                    title="Configurar ativo e precificação"
                                  >
                                    <Sliders className="w-3.5 h-3.5" />
                                    <span>Configurar</span>
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleDeleteAsset(item.id)}
                                    className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                                    title="Excluir este anúncio"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200/80">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Ativo</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Origem</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Placa</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Valor Anunciado</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedInventory.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-9 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-900">
                                    <img 
                                      src={getVehicleImageUrl(item.image || item.imagem || 'placeholder-carro.jpg')} 
                                      alt="" 
                                      loading="lazy"
                                      onError={handleVehicleImageError}
                                      className="w-full h-full object-cover" 
                                    />
                                  </div>
                                  <span className="font-bold text-slate-900">{item.brand} {item.model}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {item.isParticular ? (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Particular
                                  </span>
                                ) : (
                                  <StoreIdentifier storeId={item.storeId} className="scale-90 origin-left" />
                                )}
                              </td>
                              <td className="px-6 py-4 text-xs font-mono font-bold text-slate-600">{item.plate}</td>
                              <td className="px-6 py-4 font-black text-blue-600">R$ {Number(item.sale_value).toLocaleString('pt-BR')}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-2 h-2 rounded-full ${
                                    item.financial_status === 'paid' ? 'bg-emerald-500' : 
                                    item.financial_status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                                  }`} />
                                  <span className="text-[10px] font-bold text-slate-600 uppercase">
                                    {item.financial_status === 'paid' ? 'Quitado' : 
                                     item.financial_status === 'pending' ? 'Pendente' : 'Financiado'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button 
                                    onClick={() => navigate(`/encontrar/${item.id}`)}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-all cursor-pointer"
                                    title="Ver anúncio"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                  {isB2B ? (
                                    <button 
                                      onClick={() => handleOpenConfigureAsset(item)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                                    >
                                      <Sliders className="w-3 h-3" />
                                      <span>Configurar</span>
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleDeleteAsset(item.id)}
                                      className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-lg text-xs transition-all cursor-pointer"
                                      title="Excluir"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Pagination Controls */}
            {filteredInventory.length > itemsPerPage && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs text-slate-400 font-medium">
                  Exibindo {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredInventory.length)} de {filteredInventory.length} ativos
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Próxima página"
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </DashboardErrorBoundary>
        )}

        {/* Banner Informativo B2B para Compradores */}
        {!isB2B && (
          <div className="mt-10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20">
                  Expansão Comercial Automatch
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  Possui uma concessionária ou revenda de veículos?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Conheça a <strong>Rede B2B Automatch</strong>: tenha acesso a estoque compartilhado de concessionárias parceiras, radar de repasse com piso inviolável e gestão multi-lojas.
                </p>
              </div>
              <button
                onClick={() => navigate('/como-funciona')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              >
                <span>Conhecer a Rede B2B</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Configuração do Ativo */}
      <AssetConfigurationModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setConfiguringAsset(null);
        }}
        asset={configuringAsset}
        onSave={handleSaveAsset}
        onDelete={handleDeleteAsset}
        stores={stores}
      />

      {/* Hub B2B Modal + AI Studio Modal (Lazy Loaded) */}
      <Suspense fallback={null}>
        {isB2B && isB2BModalOpen && (
          <PartnershipHubModal
            isOpen={isB2BModalOpen}
            onClose={() => setIsB2BModalOpen(false)}
          />
        )}
        {isAIStudioOpen && (
          <AIStudioModal
            isOpen={isAIStudioOpen}
            onClose={() => setIsAIStudioOpen(false)}
            vehicleName="Veículo Selecionado"
          />
        )}
      </Suspense>
      
      {/* Floating Feedback Toast */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold ${
              feedbackToast.type === 'error'
                ? 'bg-red-600 text-white border-red-500 shadow-red-500/20'
                : feedbackToast.type === 'info'
                ? 'bg-slate-900 text-white border-slate-800 shadow-slate-900/30'
                : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
            }`}
          >
            {feedbackToast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span>{feedbackToast.message}</span>
            <button
              onClick={() => setFeedbackToast(null)}
              className="ml-2 text-white/80 hover:text-white cursor-pointer"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
