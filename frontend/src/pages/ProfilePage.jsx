import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, ShieldCheck, Calendar, Heart, Eye, LogOut, 
  Edit3, Camera, Save, ArrowLeft, Loader2, Sparkles, 
  LayoutDashboard, PlusCircle, ChevronRight, Car, Users,
  CheckCircle2, ArrowUpRight, Award, Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFavorites, subscribeFavorites } from '../data/favoritesManager';
import { getNewCars, isCarDeleted } from '../data/newCarsManager';
import { showcaseCars } from '../data/showcaseData';
import SpotlightCard from '../components/ui/microkit/SpotlightCard';
import GlowButton from '../components/ui/microkit/GlowButton';
import WipeButton from '../components/ui/microkit/WipeButton';
import FocusInput from '../components/ui/microkit/FocusInput';

// Code-Splitting: PartnershipHubModal carregado sob demanda (economiza 50.5 kB na montagem inicial)
const PartnershipHubModal = React.lazy(() => import('../components/partners/PartnershipHubModal'));

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: 'Apaixonado por tecnologia e carros premium selecionados com laudo cautelar.'
  });

  // Contadores dinâmicos de veículos e favoritos
  const [favoriteCount, setFavoriteCount] = useState(() => getFavorites().length);
  const [myCarsCount, setMyCarsCount] = useState(() => {
    return getNewCars().filter(c => !isCarDeleted(c.id)).length;
  });
  const [catalogCarsCount, setCatalogCarsCount] = useState(() => {
    const userCars = getNewCars().filter(c => !isCarDeleted(c.id)).length;
    return (showcaseCars?.length || 5) + userCars;
  });

  useEffect(() => {
    // Sincronização em tempo real de favoritos
    const unsubscribeFavs = subscribeFavorites((favs) => {
      setFavoriteCount(Array.isArray(favs) ? favs.length : getFavorites().length);
    });

    // Sincronização em tempo real de anúncios do usuário e catálogo
    const updateCounts = () => {
      const activeUserCars = getNewCars().filter(c => !isCarDeleted(c.id)).length;
      setMyCarsCount(activeUserCars);
      setCatalogCarsCount((showcaseCars?.length || 5) + activeUserCars);
      setFavoriteCount(getFavorites().length);
    };

    window.addEventListener('storage', updateCounts);
    window.addEventListener('focus', updateCounts);

    return () => {
      unsubscribeFavs();
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('focus', updateCounts);
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({ name: formData.name, email: formData.email });
    setIsSaving(false);
    setIsEditing(false);
  };

  if (!user) return null;

  const isB2BUser = Boolean(user?.role === 'lojista' || user?.role === 'admin' || user?.accountType === 'store');

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col pt-20 pb-20 px-4 sm:px-6 font-sans relative overflow-hidden">
      {/* Background Ambient Accents */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto w-full">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-slate-600 hover:text-blue-600 hover:border-blue-200 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Voltar ao Início</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Painel do Usuário
            </span>
          </div>
        </div>

        {/* Main Grid: Profile Card (Left) & Management Area (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
          
          {/* Left Column: Profile Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            <SpotlightCard className="p-7 flex flex-col items-center text-center">
              {/* Avatar with Camera Trigger */}
              <div className="relative mb-5 group">
                <div className="w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-slate-100 shadow-md bg-slate-100 transition-transform duration-300 group-hover:scale-105">
                  <img 
                    src={user.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  type="button"
                  aria-label="Atualizar foto de perfil"
                  className="absolute -bottom-1.5 -right-1.5 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-500/30 transition-transform active:scale-95 border-2 border-white cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* User Identity */}
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                {user.name}
              </h2>
              
              <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Identidade Verificada</span>
              </div>

              {isB2BUser && (
                <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 text-[11px] font-black uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  <span>Membro Corporativo B2B</span>
                </div>
              )}

              <div className="w-full h-px bg-slate-100 my-6" />

              {/* Quick Details */}
              <div className="w-full space-y-3.5 text-left text-xs">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Membro Desde</span>
                    <span className="font-bold text-slate-700">{user.memberSince || 'Março 2024'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">E-mail Cadastrado</span>
                    <span className="font-bold text-slate-700 truncate block" title={user.email}>{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={logout}
                className="w-full mt-6 py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-red-100 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            </SpotlightCard>
          </motion.div>

          {/* Right Column: Settings & Highlights */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* Account Settings Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Configurações do Perfil
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    Atualize seus dados pessoais e informações de contato na plataforma.
                  </p>
                </div>

                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl text-slate-700 font-bold text-xs transition-all uppercase tracking-wider self-start sm:self-auto cursor-pointer active:scale-95"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar Perfil</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button 
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Salvar</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FocusInput 
                    label="Nome Completo"
                    icon={User}
                    value={formData.name}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome"
                  />
                  
                  <FocusInput 
                    label="Endereço de E-mail"
                    icon={Mail}
                    type="email"
                    value={formData.email}
                    disabled={!isEditing}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu.email@exemplo.com"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Bio Pessoal
                  </label>
                  <textarea 
                    rows={3}
                    disabled={!isEditing}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Conte um pouco sobre você e seus interesses automotivos..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium text-slate-700 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none disabled:opacity-60 disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Account Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Meus Carros', 
                  icon: Car, 
                  val: myCarsCount, 
                  color: 'text-blue-600', 
                  bg: 'bg-blue-50', 
                  border: 'border-blue-100',
                  sub: 'Cadastrados',
                  onClick: () => navigate('/meus-anuncios')
                },
                { 
                  label: 'Carros Favoritos', 
                  icon: Heart, 
                  val: favoriteCount, 
                  color: 'text-red-500', 
                  bg: 'bg-red-50', 
                  border: 'border-red-100',
                  sub: 'Salvos na lista',
                  onClick: () => navigate('/favoritos')
                },
                { 
                  label: 'Estoque Vitrine', 
                  icon: Sparkles, 
                  val: catalogCarsCount, 
                  color: 'text-purple-600', 
                  bg: 'bg-purple-50', 
                  border: 'border-purple-100',
                  sub: 'Disponíveis',
                  onClick: () => navigate('/encontrar')
                },
                { 
                  label: 'Visitas ao Perfil', 
                  icon: Eye, 
                  val: '124', 
                  color: 'text-emerald-600', 
                  bg: 'bg-emerald-50', 
                  border: 'border-emerald-100',
                  sub: 'Últimos 30 dias',
                  onClick: null
                },
              ].map((stat, i) => (
                <SpotlightCard 
                  key={i} 
                  onClick={stat.onClick || undefined}
                  className={`p-4 flex flex-col items-center text-center group ${
                    stat.onClick ? 'cursor-pointer hover:border-blue-300 active:scale-[0.98]' : 'cursor-default'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.border} border flex items-center justify-center ${stat.color} mb-2.5 transition-transform group-hover:scale-110`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                    {stat.val}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 leading-tight">
                    {stat.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {stat.sub}
                  </span>
                </SpotlightCard>
              ))}
            </div>

            {/* Quick Actions Shortcuts */}
            <div className={`grid grid-cols-1 ${isB2BUser ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
              <button 
                onClick={() => navigate('/meus-anuncios')}
                className="group relative p-5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl shadow-md hover:shadow-xl shadow-blue-500/20 text-left transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] flex flex-col justify-between cursor-pointer overflow-hidden border border-blue-500/30"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white">
                    <Car className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-black text-base text-white">Meus Anúncios</h4>
                  <p className="text-xs text-blue-100/90 mt-0.5 font-medium">Gerenciar, editar e excluir veículos</p>
                </div>
              </button>

              {isB2BUser && (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="group p-5 bg-white border border-slate-200/90 text-slate-800 rounded-3xl shadow-sm hover:shadow-lg hover:border-blue-300 text-left transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                  </div>
                  <div>
                    <h4 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors">Painel B2B</h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Gestão de Ativos & Estoque Lojista</p>
                  </div>
                </button>
              )}

              <button 
                onClick={() => navigate('/novo-anuncio')}
                className="group p-5 bg-white border border-slate-200/90 text-slate-800 rounded-3xl shadow-sm hover:shadow-lg hover:border-emerald-300 text-left transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900 group-hover:text-emerald-600 transition-colors">Criar Anúncio</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Venda seu carro com laudo e IA</p>
                </div>
              </button>
            </div>

            {/* B2B Partnership Banner */}
            {isB2BUser && (
              <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-indigo-900/40">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-blue-300 shrink-0 shadow-inner">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-lg text-white">Rede de Parceiros B2B</h4>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Ativo
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                        Acesse o estoque compartilhado, faça reservas temporárias com Hold Lock e repasses estratégicos entre lojas.
                      </p>
                    </div>
                  </div>

                  <WipeButton
                    onClick={() => setIsB2BModalOpen(true)}
                    variant="primary"
                    size="md"
                    className="whitespace-nowrap shrink-0 self-start sm:self-auto shadow-lg shadow-blue-500/30"
                  >
                    Acessar Hub B2B
                  </WipeButton>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Hub B2B Modal (Lazy Loaded) */}
      <React.Suspense fallback={null}>
        {isB2BUser && isB2BModalOpen && (
          <PartnershipHubModal
            isOpen={isB2BModalOpen}
            onClose={() => setIsB2BModalOpen(false)}
          />
        )}
      </React.Suspense>
    </div>
  );
}
