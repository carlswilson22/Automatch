import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, PlusCircle, Trash2, Eye, Calendar, Gauge, Palette, 
  MapPin, AlertTriangle, CheckCircle2, ShieldCheck, Car, Sparkles,
  ExternalLink, ChevronRight, Fuel, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getNewCars, deleteNewCar } from '../data/newCarsManager';
import { getVehicleImageUrl, handleVehicleImageError } from '../utils/imageHelper';
import SpotlightCard from '../components/ui/microkit/SpotlightCard';
import GlowButton from '../components/ui/microkit/GlowButton';
import WipeButton from '../components/ui/microkit/WipeButton';
import { modalVariants } from '../utils/motionTokens';

export const formatMileage = (val) => {
  if (val === undefined || val === null) return '0 km';
  if (typeof val === 'number') return `${val.toLocaleString('pt-BR')} km`;
  const str = String(val).trim();
  if (str.toLowerCase().endsWith('km')) return str;
  const num = Number(str.replace(/\D/g, ''));
  return isNaN(num) || num === 0 ? `${str} km` : `${num.toLocaleString('pt-BR')} km`;
};

export const formatPrice = (val) => {
  if (val === undefined || val === null) return 'R$ 0';
  const num = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.-]+/g, ''));
  return isNaN(num) ? `R$ ${val}` : `R$ ${num.toLocaleString('pt-BR')}`;
};

export default function MyAdsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ads, setAds] = useState([]);
  const [carToDelete, setCarToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadUserAds();
  }, [user]);

  const loadUserAds = () => {
    const all = getNewCars();
    // Exibe anúncios do usuário logado (ou criados localmente nesta sessão/dispositivo)
    const userAds = all.filter(c => {
      if (c.userEmail && user?.email) {
        return c.userEmail.toLowerCase() === user.email.toLowerCase();
      }
      return true; // Se não tem email explícito, exibe anúncios criados no navegador
    });
    setAds(userAds);
  };

  const handleConfirmDelete = async () => {
    if (!carToDelete) return;
    setIsDeleting(true);
    try {
      await deleteNewCar(carToDelete.id);
      setAds(prev => prev.filter(c => String(c.id) !== String(carToDelete.id)));
      setFeedbackMessage({ 
        type: 'success', 
        text: `Anúncio do "${carToDelete.marca} ${carToDelete.modelo}" foi excluído com sucesso!` 
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      setFeedbackMessage({ 
        type: 'error', 
        text: 'Não foi possível excluir o anúncio. Tente novamente.' 
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setIsDeleting(false);
      setCarToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans pb-24 relative overflow-hidden">
      {/* Background Ambient Accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <div className="bg-slate-950 text-white pt-12 pb-16 px-4 sm:px-6 relative overflow-hidden border-b border-slate-800/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Back button */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => navigate('/perfil')}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-bold transition-all border border-white/10 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Voltar ao Perfil</span>
            </button>
            
            <button
              onClick={() => navigate('/encontrar')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors"
            >
              <span>Ver Vitrine Pública</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs font-bold mb-3 border border-blue-400/20 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Gestão Segura de Estoque</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
                Meus Anúncios
              </h1>
              
              <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">
                Área exclusiva para gerenciar, monitorar o status e manter atualizados os veículos publicados na sua conta Automatch.
              </p>
            </div>

            {/* Quick KPI stats box */}
            <div className="bg-slate-900/90 border border-slate-800/80 px-5 py-3.5 rounded-3xl flex items-center gap-5 backdrop-blur-md shadow-xl self-start md:self-auto">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Total Publicado</span>
                <span className="text-2xl font-black text-white leading-tight">
                  {ads.length} <span className="text-xs font-medium text-slate-400">{ads.length === 1 ? 'veículo' : 'veículos'}</span>
                </span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Status na Vitrine</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ativo e Visível</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 w-full relative z-20">
        {/* Feedback Alert Toast */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold shadow-lg backdrop-blur-md ${
                feedbackMessage.type === 'success' 
                  ? 'bg-emerald-50/95 text-emerald-800 border-emerald-200' 
                  : 'bg-red-50/95 text-red-800 border-red-200'
              }`}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span className="flex-1">{feedbackMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {ads.length === 0 ? (
          <SpotlightCard className="p-10 sm:p-14 text-center flex flex-col items-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-5 border border-blue-100 shadow-inner">
              <Car className="w-10 h-10" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">
              Nenhum veículo anunciado no momento
            </h3>
            
            <p className="text-slate-500 text-sm max-w-md mb-8 leading-relaxed">
              Você ainda não possui veículos anunciados. Publique agora mesmo seu carro com laudo cautelar integrado e inteligência artificial para atrair compradores qualificados.
            </p>

            <GlowButton
              onClick={() => navigate('/novo-anuncio')}
              icon={PlusCircle}
              size="lg"
            >
              Criar Meu Primeiro Anúncio
            </GlowButton>
          </SpotlightCard>
        ) : (
          <div className="space-y-6">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Listagem de Veículos ({ads.length})
                </span>
              </div>

              <div className="flex justify-center w-full sm:w-auto">
                <WipeButton
                  onClick={() => navigate('/novo-anuncio')}
                  icon={PlusCircle}
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Anunciar Novo Veículo
                </WipeButton>
              </div>
            </div>

            {/* Vehicle Cards List */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5">
              {ads.map((car, index) => {
                const carName = `${car.marca || ''} ${car.modelo || ''}`.trim() || 'Veículo Anunciado';
                const carImg = car.imagem || '/images/placeholder-carro.jpg';
                const hasLaudo = car.laudo && car.laudo !== 'Não possui';

                return (
                  <motion.div
                    key={car.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                  >
                    <SpotlightCard className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto flex-1 min-w-0">
                        {/* Vehicle Thumbnail */}
                        <div className="relative w-full sm:w-40 sm:h-28 h-48 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200/80 shadow-inner group">
                          <img 
                            src={getVehicleImageUrl(carImg)} 
                            alt={carName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={handleVehicleImageError}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                            {car.ano}
                          </span>
                        </div>

                        {/* Vehicle Details */}
                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Anúncio Ativo</span>
                            </span>

                            {hasLaudo ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                                <ShieldCheck className="w-3 h-3 text-blue-600" />
                                <span>Laudo Cautelar Aprovado</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                <span>Sem Laudo</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug truncate">
                            {carName}
                          </h3>

                          {/* Meta Specs */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{car.ano}</span>
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Gauge className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatMileage(car.km)}</span>
                            </span>
                            {car.cor && (
                              <span className="inline-flex items-center gap-1">
                                <Palette className="w-3.5 h-3.5 text-slate-400" />
                                <span>{car.cor}</span>
                              </span>
                            )}
                            {car.localizacao && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{car.localizacao}</span>
                              </span>
                            )}
                          </div>

                          {/* Price */}
                          <p className="text-xl font-black text-blue-600 pt-1 tracking-tight">
                            {formatPrice(car.preco)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                        <button
                          onClick={() => navigate(`/encontrar/${car.id}`)}
                          className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-bold transition-all border border-transparent hover:border-blue-200 cursor-pointer active:scale-95"
                          title="Ver Anúncio na Vitrine Pública"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver na Vitrine</span>
                        </button>

                        <button
                          onClick={() => setCarToDelete(car)}
                          className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-100 transition-all cursor-pointer active:scale-95"
                          title="Excluir este anúncio"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Botão Principal Centralizado no Meio da Página */}
            <div className="flex justify-center pt-2 pb-2">
              <GlowButton
                onClick={() => navigate('/novo-anuncio')}
                icon={PlusCircle}
                size="md"
              >
                Anunciar Novo Veículo
              </GlowButton>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {carToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
                <Trash2 className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                Excluir Anúncio?
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Tem certeza que deseja excluir o anúncio de <strong>"{carToDelete.marca} {carToDelete.modelo}"</strong>? Esta ação removerá o veículo imediatamente da vitrine pública.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCarToDelete(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/25 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {isDeleting ? "Excluindo..." : "Sim, Excluir"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
