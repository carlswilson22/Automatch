import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Users, Car, Clock, FileText, CheckCircle2, AlertTriangle, 
  Send, ShieldCheck, Search, Filter, ArrowRight, MessageSquare, 
  Star, DollarSign, RefreshCw, PlusCircle, Check, XCircle, ChevronRight, Lock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PartnerChatModal from './PartnerChatModal';

export default function PartnershipHubModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'partnerships' | 'reservations' | 'transactions'

  // Data states
  const [sharedCars, setSharedCars] = useState([]);
  const [partnerships, setPartnerships] = useState([]);
  const [availableStores, setAvailableStores] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Filters
  const [searchCar, setSearchCar] = useState('');
  const [markupMap, setMarkupMap] = useState({}); // { carId: markupValue }

  // Sub-modals
  const [reservingCar, setReservingCar] = useState(null);
  const [reservationForm, setReservationForm] = useState({
    proposed_price: 0,
    client_markup: 5000,
    client_name: '',
    duration_minutes: 120
  });

  const [activeChatReservation, setActiveChatReservation] = useState(null);
  const [reviewingTx, setReviewingTx] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, punctuality_rating: 5, comment: '' });

  // Helper de token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Carregamento de dados
  const loadSharedInventory = async () => {
    try {
      const res = await fetch(`/api/partnerships/shared-inventory?q=${encodeURIComponent(searchCar)}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setSharedCars(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadPartnerships = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        fetch('/api/partnerships/my', { headers: getAuthHeaders() }),
        fetch('/api/partnerships/stores-available', { headers: getAuthHeaders() })
      ]);
      if (pRes.ok) setPartnerships(await pRes.json());
      if (sRes.ok) setAvailableStores(await sRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const loadReservations = async () => {
    try {
      const res = await fetch('/api/partnerships/reservations/my', { headers: getAuthHeaders() });
      if (res.ok) setMyReservations(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await fetch('/api/partnerships/transactions', { headers: getAuthHeaders() });
      if (res.ok) setTransactions(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      loadSharedInventory(),
      loadPartnerships(),
      loadReservations(),
      loadTransactions()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      refreshAll();
      const interval = setInterval(loadReservations, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, searchCar]);

  // Ações de Parceria
  const handleInvite = async (storeId) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/partnerships/invite', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ receiver_store_id: storeId, commission_rate: 3.0 })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ type: 'success', text: data.message });
        await loadPartnerships();
      } else {
        setFeedbackMsg({ type: 'error', text: data.detail || 'Erro ao enviar convite.' });
      }
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'Falha na conexão.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptInvite = async (partnershipId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/partnerships/${partnershipId}/accept`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setFeedbackMsg({ type: 'success', text: 'Parceria ativada com sucesso!' });
        await refreshAll();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectInvite = async (partnershipId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/partnerships/${partnershipId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setFeedbackMsg({ type: 'info', text: 'Convite recusado.' });
        await loadPartnerships();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Ações de Reserva
  const openReservationModal = (car) => {
    const piso = car.valor_minimo_repasse || (car.price * 0.90);
    const initialMarkup = markupMap[car.id] !== undefined ? markupMap[car.id] : 5000;
    setReservingCar(car);
    setReservationForm({
      proposed_price: piso,
      client_markup: initialMarkup,
      client_name: '',
      duration_minutes: 120
    });
  };

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    if (!reservingCar) return;

    const piso = reservingCar.valor_minimo_repasse || (reservingCar.price * 0.90);
    if (reservationForm.proposed_price < piso) {
      setFeedbackMsg({
        type: 'error',
        text: `Valor proposto não pode ser inferior ao piso mínimo de repasse (R$ ${piso.toLocaleString('pt-BR')}).`
      });
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/partnerships/reservations', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          car_id: reservingCar.id,
          proposed_price: Number(reservationForm.proposed_price),
          client_markup: Number(reservationForm.client_markup),
          client_name: reservationForm.client_name,
          duration_minutes: Number(reservationForm.duration_minutes)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ type: 'success', text: 'Reserva (Hold Lock) criada com sucesso!' });
        setReservingCar(null);
        await refreshAll();
        setActiveTab('reservations');
      } else {
        setFeedbackMsg({ type: 'error', text: data.detail || 'Erro ao criar reserva.' });
      }
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'Falha ao processar reserva.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestClosing = async (reservationId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/partnerships/reservations/${reservationId}/request-closing`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({ type: 'success', text: data.message });
        await loadReservations();
      } else {
        setFeedbackMsg({ type: 'error', text: data.detail || 'Erro ao solicitar fechamento.' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConsentDecision = async (reservationId, approved, notes = '') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/partnerships/reservations/${reservationId}/give-consent`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ approved, notes })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({
          type: approved ? 'success' : 'info',
          text: approved ? `Negócio formalizado! Protocolo: ${data.protocol}` : 'Proposta recusada.'
        });
        await refreshAll();
      } else {
        setFeedbackMsg({ type: 'error', text: data.detail || 'Erro ao processar consentimento.' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('Deseja realmente cancelar esta reserva e liberar o veículo?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/partnerships/reservations/${reservationId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setFeedbackMsg({ type: 'info', text: 'Reserva cancelada com sucesso.' });
        await refreshAll();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReview = async (e) => {
    e.preventDefault();
    if (!reviewingTx) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/partnerships/reviews', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          transaction_id: reviewingTx.id,
          reviewed_store_id: reviewingTx.selling_store_id,
          rating: Number(reviewForm.rating),
          punctuality_rating: Number(reviewForm.punctuality_rating),
          comment: reviewForm.comment
        })
      });
      if (res.ok) {
        setFeedbackMsg({ type: 'success', text: 'Avaliação registrada com sucesso!' });
        setReviewingTx(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[90vh] max-h-[850px] flex flex-col overflow-hidden"
      >
        {/* Top Hub Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white px-6 sm:px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">Rede de Conexão B2B</h2>
                <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Lojistas & Estoque Compartilhado
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Atenda clientes oferecendo veículos de lojas parceiras com reserva temporária e piso protegido.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {feedbackMsg.text && (
          <div
            className={`px-6 py-3 text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : feedbackMsg.type === 'error'
                ? 'bg-red-50 text-red-800 border-b border-red-200'
                : 'bg-blue-50 text-blue-800 border-b border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {feedbackMsg.text}
            </div>
            <button onClick={() => setFeedbackMsg({ type: '', text: '' })} className="hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-slate-100/80 border-b border-slate-200 px-6 sm:px-8 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'inventory', label: 'Estoque Compartilhado', icon: Car, count: sharedCars.length },
            { id: 'partnerships', label: 'Minhas Parcerias', icon: Users, count: partnerships.filter(p => p.status === 'ativa').length },
            { id: 'reservations', label: 'Minhas Reservas', icon: Clock, count: myReservations.filter(r => r.status === 'ativa').length },
            { id: 'transactions', label: 'Repasses Concluídos', icon: FileText, count: transactions.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-brand-blue shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={refreshAll}
              disabled={loading}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-all disabled:opacity-50"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/50">
          {/* TAB 1: ESTOQUE COMPARTILHADO */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Search & Intro */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por marca, modelo ou cor..."
                    value={searchCar}
                    onChange={(e) => setSearchCar(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <Lock className="w-4 h-4 text-amber-500" />
                  Piso de repasse protegido: visível exclusivamente para parceiros conectados.
                </div>
              </div>

              {/* Grid of Shared Cars */}
              {sharedCars.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 flex flex-col items-center">
                  <Car className="w-12 h-12 text-slate-300 mb-3" />
                  <h3 className="text-lg font-bold text-slate-700">Nenhum veículo no estoque compartilhado</h3>
                  <p className="text-sm text-slate-400 max-w-md mt-1">
                    Conecte-se com mais lojas parceiras na aba "Minhas Parcerias" para ter acesso aos veículos disponíveis para repasse.
                  </p>
                  <button
                    onClick={() => setActiveTab('partnerships')}
                    className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Gerenciar Parcerias
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sharedCars.map((car) => {
                    const piso = car.valor_minimo_repasse || (car.price * 0.90);
                    const currentMarkup = markupMap[car.id] !== undefined ? markupMap[car.id] : 5000;
                    const precoFinalCliente = piso + Number(currentMarkup || 0);
                    const isReserved = car.status_reserva === 'reservado';

                    return (
                      <div
                        key={car.id}
                        className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col ${
                          isReserved
                            ? 'border-amber-200 opacity-80'
                            : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'
                        }`}
                      >
                        {/* Car Image + Badges */}
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          <img
                            src={car.image}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white">
                              {car.store_name}
                            </span>
                            {isReserved && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Em Reserva
                              </span>
                            )}
                          </div>
                          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-700 shadow-sm">
                            {car.year} • {Number(car.km).toLocaleString('pt-BR')} km
                          </div>
                        </div>

                        {/* Body Details */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-base font-black text-slate-800 leading-tight">
                              {car.brand} {car.model}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">{car.location || 'Localização não informada'}</p>

                            {/* Repasse Pricing Box */}
                            <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Piso Mínimo de Repasse:</span>
                                <span className="text-sm font-black text-amber-700">
                                  R$ {piso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>

                              {/* Markup Simulator Input */}
                              <div className="pt-2 border-t border-slate-200/80">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-black uppercase text-slate-400">
                                    Sua Margem Lojista:
                                  </label>
                                  <span className="text-xs font-bold text-emerald-600">
                                    + R$ {Number(currentMarkup).toLocaleString('pt-BR')}
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="1000"
                                  max="25000"
                                  step="500"
                                  value={currentMarkup}
                                  onChange={(e) =>
                                    setMarkupMap({ ...markupMap, [car.id]: Number(e.target.value) })
                                  }
                                  className="w-full accent-emerald-600 cursor-pointer"
                                />
                              </div>

                              {/* Suggested Price to Customer */}
                              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-600">Sugerido ao Cliente:</span>
                                <span className="text-base font-black text-slate-900">
                                  R$ {precoFinalCliente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => openReservationModal(car)}
                            disabled={isReserved}
                            className={`w-full mt-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                              isReserved
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                            {isReserved ? 'Veículo Reservado' : 'Reservar para Cliente (Hold Lock)'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MINHAS PARCERIAS */}
          {activeTab === 'partnerships' && (
            <div className="space-y-8">
              {/* Active & Pending Partnerships */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Parcerias Conectadas & Convites Recebidos
                </h3>

                {partnerships.length === 0 ? (
                  <p className="text-sm text-slate-400 bg-white p-6 rounded-3xl border border-slate-200">
                    Você ainda não possui parcerias ativas. Convide lojas cadastradas abaixo para expandir sua rede.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partnerships.map((p) => {
                      const isPending = p.status === 'pendente';
                      const isIncoming = p.is_incoming;

                      return (
                        <div
                          key={p.id}
                          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base text-slate-800">
                                {isIncoming ? p.requester_store_name : p.receiver_store_name}
                              </h4>
                              <span
                                className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                                  p.status === 'ativa'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : p.status === 'pendente'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Comissão padrão: <span className="font-bold text-slate-600">{p.commission_rate}%</span> • Desde {p.created_at?.split(' ')[0]}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div>
                            {isPending && isIncoming ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAcceptInvite(p.id)}
                                  disabled={actionLoading}
                                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" /> Aceitar
                                </button>
                                <button
                                  onClick={() => handleRejectInvite(p.id)}
                                  disabled={actionLoading}
                                  className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl text-xs font-bold transition-all"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : isPending && !isIncoming ? (
                              <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                Aguardando resposta...
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                <CheckCircle2 className="w-4 h-4" /> Conectado
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Discover & Invite Other Stores */}
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  Conectar com Outras Lojas Cadastradas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableStores.map((store) => {
                    const hasActive = store.partnership_status === 'ativa';
                    const hasPending = store.partnership_status === 'pendente';

                    return (
                      <div
                        key={store.id}
                        className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-slate-800">{store.name}</h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {store.description || 'Concessionária participante da Automatch'}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400">
                            {hasActive ? 'Parceiro Ativo' : hasPending ? 'Convite em análise' : 'Disponível'}
                          </span>
                          {!hasActive && !hasPending && (
                            <button
                              onClick={() => handleInvite(store.id)}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                            >
                              <Send className="w-3.5 h-3.5" /> Enviar Convite
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MINHAS RESERVAS (HOLD LOCK) */}
          {activeTab === 'reservations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Reservas Ativas & Hold Lock Temporizado
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    O Hold Lock bloqueia o veículo para outros lojistas enquanto você atende o cliente.
                  </p>
                </div>
              </div>

              {myReservations.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 flex flex-col items-center">
                  <Clock className="w-12 h-12 text-slate-300 mb-3" />
                  <h3 className="text-lg font-bold text-slate-700">Nenhuma reserva ativa no momento</h3>
                  <p className="text-sm text-slate-400 max-w-md mt-1">
                    Ao reservar um veículo na vitrine compartilhada, a contagem regressiva e os controles de fechamento aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myReservations.map((res) => {
                    const isOwner = res.is_owner;
                    const minsRemaining = Math.floor((res.time_remaining_seconds || 0) / 60);
                    const secsRemaining = (res.time_remaining_seconds || 0) % 60;
                    const timerText = `${String(minsRemaining).padStart(2, '0')}:${String(secsRemaining).padStart(2, '0')}`;

                    return (
                      <div
                        key={res.id}
                        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                      >
                        {/* Vehicle & Store info */}
                        <div className="flex items-center gap-4">
                          {res.car_image ? (
                            <img
                              src={res.car_image}
                              alt={res.car_title}
                              className="w-20 h-16 object-cover rounded-2xl border border-slate-200"
                            />
                          ) : (
                            <div className="w-20 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                              <Car className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base text-slate-800">{res.car_title}</h4>
                              <span
                                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                  res.status === 'ativa'
                                    ? 'bg-blue-100 text-blue-700'
                                    : res.status === 'consentida'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {res.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {isOwner ? (
                                <>Solicitado por: <span className="font-bold text-slate-700">{res.requesting_store_name}</span></>
                              ) : (
                                <>Loja Proprietária: <span className="font-bold text-slate-700">{res.owner_store_name}</span></>
                              )}
                              {res.client_name && ` • Cliente: ${res.client_name}`}
                            </p>
                          </div>
                        </div>

                        {/* Price & Countdown Timer */}
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Proposta</span>
                            <span className="text-lg font-black text-slate-900">
                              R$ {Number(res.proposed_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {res.status === 'ativa' && (
                            <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-2xl text-center">
                              <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider block">Hold Lock</span>
                              <span className="text-base font-mono font-black text-purple-900">{timerText}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setActiveChatReservation(res)}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <MessageSquare className="w-4 h-4 text-indigo-600" /> Chat B2B
                          </button>

                          {/* Se for loja solicitante */}
                          {!isOwner && res.status === 'ativa' && (
                            <>
                              {res.closing_requested ? (
                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                                  Aguardando Consentimento...
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleRequestClosing(res.id)}
                                  disabled={actionLoading}
                                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                  Solicitar Fechamento
                                </button>
                              )}
                              <button
                                onClick={() => handleCancelReservation(res.id)}
                                className="p-2.5 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-xl text-xs transition-all"
                                title="Cancelar Reserva"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Se for loja dona do carro */}
                          {isOwner && res.status === 'ativa' && res.closing_requested === 1 && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleConsentDecision(res.id, true)}
                                disabled={actionLoading}
                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                              >
                                Aprovar Venda
                              </button>
                              <button
                                onClick={() => handleConsentDecision(res.id, false, 'Proposta recusada')}
                                disabled={actionLoading}
                                className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all"
                              >
                                Recusar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HISTÓRICO & REPASSES FINALIZADOS */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Histórico de Repasses Concluídos
              </h3>

              {transactions.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-700">Nenhum repasse concluído ainda</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Quando um lojista e a loja parceira fecham um negócio, o protocolo e os valores registrados aparecem aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                            {tx.protocol}
                          </span>
                          <span className="text-xs font-bold text-slate-400">• {tx.created_at}</span>
                        </div>
                        <h4 className="text-base font-black text-slate-800 mt-2">{tx.car_title}</h4>
                        <p className="text-xs text-slate-500">
                          Vendedor: <span className="font-bold">{tx.selling_store_name}</span> ➔ Comprador: <span className="font-bold">{tx.buying_store_name}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Piso Repasse</span>
                          <span className="text-sm font-black text-slate-700">
                            R$ {Number(tx.repasse_piso).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Comissão Faturada</span>
                          <span className="text-sm font-black text-emerald-600">
                            R$ {Number(tx.commission_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Operação</span>
                          <span className="text-base font-black text-slate-900">
                            R$ {Number(tx.final_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setReviewingTx(tx);
                            setReviewForm({ rating: 5, punctuality_rating: 5, comment: '' });
                          }}
                          className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Avaliar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SUB-MODAL: RESERVA / HOLD LOCK */}
        <AnimatePresence>
          {reservingCar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
                  <h3 className="font-black text-base flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Reserva com Hold Lock Temporário
                  </h3>
                  <button onClick={() => setReservingCar(null)} className="text-white/80 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleConfirmReservation} className="p-6 space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{reservingCar.brand} {reservingCar.model}</h4>
                    <p className="text-xs text-slate-400">{reservingCar.store_name} • Piso Mínimo: R$ {Number(reservingCar.valor_minimo_repasse || (reservingCar.price * 0.90)).toLocaleString('pt-BR')}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Valor Proposto de Repasse (R$) *
                    </label>
                    <input
                      type="number"
                      required
                      min={reservingCar.valor_minimo_repasse || (reservingCar.price * 0.90)}
                      step="100"
                      value={reservationForm.proposed_price}
                      onChange={(e) => setReservationForm({ ...reservationForm, proposed_price: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                    />
                    <span className="text-[10px] text-slate-400">
                      Piso inviolável: não é permitido propor abaixo de R$ {Number(reservingCar.valor_minimo_repasse || (reservingCar.price * 0.90)).toLocaleString('pt-BR')}.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Sua Margem para o Cliente Final (R$)
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={reservationForm.client_markup}
                      onChange={(e) => setReservationForm({ ...reservationForm, client_markup: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Nome / Referência do Cliente Atendido
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: João da Silva (Financiamento aprovado)"
                      value={reservationForm.client_name}
                      onChange={(e) => setReservationForm({ ...reservationForm, client_name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Duração do Hold Lock
                    </label>
                    <select
                      value={reservationForm.duration_minutes}
                      onChange={(e) => setReservationForm({ ...reservationForm, duration_minutes: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                    >
                      <option value="60">1 Hora (60 minutos)</option>
                      <option value="120">2 Horas (Padrão)</option>
                      <option value="240">4 Horas (Atendimento Presencial)</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setReservingCar(null)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      Confirmar Reserva
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SUB-MODAL: AVALIAR PARCEIRO */}
        <AnimatePresence>
          {reviewingTx && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
              >
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                  <h3 className="font-black text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Avaliar Concessionária Parceira
                  </h3>
                  <button onClick={() => setReviewingTx(null)} className="text-white/80 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSendReview} className="p-6 space-y-4">
                  <p className="text-xs text-slate-500">
                    Sua avaliação fortalece a confiança mútua na rede B2B.
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Nota Geral (1 a 5 estrelas)
                    </label>
                    <div className="flex gap-2 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= reviewForm.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Comentário sobre a negociação
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Ex: Excelente agilidade na liberação do documento e transparência no laudo."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                    ></textarea>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewingTx(null)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
                    >
                      Enviar Avaliação
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SUB-MODAL: CHAT DE NEGOCIAÇÃO */}
        {activeChatReservation && (
          <PartnerChatModal
            isOpen={Boolean(activeChatReservation)}
            onClose={() => setActiveChatReservation(null)}
            reservation={activeChatReservation}
          />
        )}
      </motion.div>
    </div>
  );
}
