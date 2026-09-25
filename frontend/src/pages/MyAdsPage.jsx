import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, PlusCircle, Trash2, Eye, Calendar, Gauge, Palette, 
  MapPin, AlertTriangle, CheckCircle2, ShieldCheck, Car, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getNewCars, deleteNewCar } from '../data/newCarsManager';
import { getVehicleImageUrl, handleVehicleImageError } from '../utils/imageHelper';


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
      setFeedbackMessage({ type: 'success', text: `Anúncio do "${carToDelete.marca} ${carToDelete.modelo}" foi excluído com sucesso!` });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: 'Não foi possível excluir o anúncio. Tente novamente.' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setIsDeleting(false);
      setCarToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24">
      {/* Top Header */}
      <div className="bg-slate-900 text-white pt-10 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => navigate('/perfil')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-bold transition-all border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Perfil
            </button>
            <button
              onClick={() => navigate('/novo-anuncio')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-900/40 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Anunciar Novo Veículo
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5" /> Gestão de Anúncios com Autenticação
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
                Meus Anúncios
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Área exclusiva para gerenciar, visualizar e excluir com segurança os veículos anunciados na sua conta.
              </p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-3 rounded-2xl flex items-center gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Total Publicado</span>
                <span className="text-2xl font-black text-white">{ads.length} {ads.length === 1 ? 'veículo' : 'veículos'}</span>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Status Geral</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Vitrine Ativa
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 w-full">
        {/* Feedback Alert */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold shadow-lg ${
                feedbackMessage.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ads List */}
        {ads.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-5 border border-blue-100">
              <Car className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">
              Nenhum anúncio encontrado
            </h3>
            <p className="text-slate-500 text-sm max-w-md mb-8">
              Você ainda não possui veículos anunciados. Publique agora mesmo seu carro com laudo cautelar e tecnologia de IA.
            </p>
            <button
              onClick={() => navigate('/novo-anuncio')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              <PlusCircle className="w-5 h-5" /> Criar Meu Primeiro Anúncio
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map((car) => {
              const carName = `${car.marca || ''} ${car.modelo || ''}`.trim() || 'Veículo Anunciado';
              const carImg = car.imagem || '/images/FotoHondaCivic.jpeg';
              return (
                <motion.div
                  key={car.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="w-28 h-20 sm:w-36 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800 shadow-inner">
                      <img 
                        src={getVehicleImageUrl(carImg)} 
                        alt={carName}
                        className="w-full h-full object-cover"
                        onError={handleVehicleImageError}
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Anúncio Ativo
                        </span>
                        {car.laudo && car.laudo !== 'Não possui' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <ShieldCheck className="w-3 h-3" /> Laudo Aprovado
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-800 leading-snug truncate">
                        {carName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {car.ano}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" /> {formatMileage(car.km)}
                        </span>
                        {car.cor && (
                          <span className="flex items-center gap-1">
                            <Palette className="w-3.5 h-3.5 text-slate-400" /> {car.cor}
                          </span>
                        )}
                        {car.localizacao && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {car.localizacao}
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-black text-brand-blue pt-1">
                        {formatPrice(car.preco)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => navigate(`/encontrar/${car.id}`)}
                      className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      title="Ver Anúncio na Vitrine"
                    >
                      <Eye className="w-4 h-4" /> Ver na Vitrine
                    </button>
                    <button
                      onClick={() => setCarToDelete(car)}
                      className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition-colors"
                      title="Excluir este anúncio"
                    >
                      <Trash2 className="w-4 h-4" /> Excluir Anúncio
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {carToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mb-5 mx-auto">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 text-center uppercase tracking-tight mb-2">
                Excluir Anúncio?
              </h3>
              <p className="text-slate-600 text-sm text-center leading-relaxed mb-6">
                Tem certeza que deseja excluir o anúncio do veículo <strong>"{carToDelete.marca} {carToDelete.modelo}"</strong>? Esta ação removerá o veículo imediatamente da vitrine pública.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCarToDelete(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-200 disabled:opacity-50"
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
