import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, ShieldCheck, MapPin, Calendar, Heart, Eye, LogOut, 
  Edit3, Camera, Save, ArrowLeft, Shield, Loader2, Sparkles, 
  LayoutDashboard, PlusCircle, CreditCard, ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: 'Apaixonado por tecnologia e carros premium.'
  });

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({ name: formData.name, email: formData.email });
    setIsSaving(false);
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-20 pb-16 px-6 font-sans">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header/Back Link */}
        <button 
          onClick={() => navigate('/')}
          className="bg-white/50 backdrop-blur-md p-2.5 rounded-full hover:bg-white flex items-center gap-2 text-slate-500 hover:text-brand-blue font-bold text-sm mb-10 transition-all border border-slate-200/50 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 ml-1" />
          Voltar para o Início
        </button>

        <div className="grid md:grid-cols-[1fr_2.5fr] gap-10">
          {/* Sidebar - Profile Summary */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center">
              <div className="relative mb-6 group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-slate-100 shadow-inner">
                  <img 
                    src={user.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                    alt={user.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                  />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-brand-blue p-2.5 rounded-2xl text-white shadow-lg shadow-blue-200 hover:scale-110 transition-transform active:scale-95 border-2 border-white">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              
              <h2 className="text-xl font-black text-slate-800 tracking-tight text-center leading-tight mb-2">
                {user.name}
              </h2>
              <p className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" /> Verificado
              </p>

              <div className="w-full h-px bg-slate-100 my-8"></div>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-3 text-slate-500">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Desde</span>
                    <span className="text-sm font-bold text-slate-700">{user.memberSince || 'Março 2024'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">e-mail</span>
                    <span className="text-sm font-bold text-slate-700 truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={logout}
                className="w-full mt-10 bg-red-50 hover:bg-red-100 text-red-500 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 border border-red-100 active:scale-95 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </button>
            </div>
          </motion.div>

          {/* Main Content - Editing Area */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8"
          >
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                    Configurações
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">Gerencie sua identidade na Automatch</p>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-brand-blue hover:text-white rounded-2xl text-slate-600 font-bold text-xs transition-all uppercase tracking-widest"
                  >
                    <Edit3 className="w-4 h-4" /> Editar Perfil
                  </button>
                ) : (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-2xl font-bold text-xs transition-all uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95 disabled:bg-slate-300"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
                  </button>
                )}
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Nome de Exibição</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 transition-colors group-focus-within:text-brand-blue" />
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 transition-all focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue focus:bg-white outline-none disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Endereço de E-mail</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 transition-colors group-focus-within:text-brand-blue" />
                      <input 
                        type="email" 
                        disabled={!isEditing}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 transition-all focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue focus:bg-white outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Minha Bio</label>
                  <textarea 
                    rows="3"
                    disabled={!isEditing}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-medium text-slate-700 transition-all focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue focus:bg-white outline-none disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                    placeholder="Conte um pouco sobre você..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Account Stats / Highlights */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Favoritos', icon: Heart, val: '8', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
                { label: 'Buscas Salvas', icon: Shield, val: '3', color: 'text-brand-blue', bg: 'bg-blue-50', border: 'border-blue-100' },
                { label: 'Visitas', icon: Eye, val: '124', color: 'text-brand-emerald', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              ].map((stat, i) => (
                <div key={i} className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center transition-all hover:shadow-md cursor-default`}>
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.border} border flex items-center justify-center ${stat.color} mb-3`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{stat.val}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
            {/* Quick Actions / Ecosystem Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('/planos')}
                className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-lg shadow-blue-500/20 text-left hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Planos & Assinatura</h4>
                  <p className="text-xs text-blue-100 mt-0.5">Upgrade para Lojista Pro</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/dashboard')}
                className="p-5 bg-white border border-slate-200 text-slate-800 rounded-3xl shadow-sm text-left hover:border-brand-blue hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-brand-blue">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Painel B2B</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Gestão de Ativos & Estoque</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/novo-anuncio')}
                className="p-5 bg-white border border-slate-200 text-slate-800 rounded-3xl shadow-sm text-left hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-brand-emerald">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Criar Anúncio</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Venda seu carro com IA</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
