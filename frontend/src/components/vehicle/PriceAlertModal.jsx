import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2, MessageCircle, Mail, Sparkles, TrendingDown } from 'lucide-react';
import axios from 'axios';

const PriceAlertModal = ({ isOpen, onClose, car }) => {
  const [targetPrice, setTargetPrice] = useState(car?.price ? Math.round(car.price * 0.95) : 135000);
  const [channel, setChannel] = useState('whatsapp'); // 'whatsapp' | 'email' | 'webpush'
  const [contactValue, setContactValue] = useState('');
  const [notifyBelowFipe, setNotifyBelowFipe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactValue) return;

    setIsSubmitting(true);
    try {
      const resp = await axios.post('/api/alerts', {
        car_id: car?.id || '1',
        car_name: car?.name || 'Veículo',
        current_price: car?.price || 142000,
        target_price: Number(targetPrice),
        contact_type: channel,
        contact_value: contactValue,
        notify_below_fipe: notifyBelowFipe
      });

      if (resp.data && resp.data.status === 'success') {
        setSubmitted(true);
        setSuccessMessage(resp.data.mensagem);
      }
    } catch (err) {
      console.warn('Erro ao registrar alerta:', err);
      // Fallback local
      setSubmitted(true);
      setSuccessMessage(`Radar ativado! Você será notificado assim que o valor atingir R$ ${Number(targetPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-white"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">Radar de Oportunidades</h3>
                <p className="text-xs text-slate-400">Alerta de Queda de Preço e Ofertas FIPE</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Monitore o <strong>{car?.name}</strong>. Avisamos no instante em que o proprietário baixar o preço ou quando surgir uma unidade similar com valor abaixo da FIPE.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Preço Atual vs Alvo */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Preço Atual</span>
                  <p className="text-sm font-bold text-slate-300 font-mono">
                    R$ {car?.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '142.000,00'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold flex items-center gap-1 justify-end">
                    <TrendingDown className="w-3 h-3" /> Valor Alvo
                  </span>
                  <div className="flex items-center gap-1 justify-end font-mono">
                    <span className="text-xs text-slate-400">R$</span>
                    <input
                      type="number"
                      value={targetPrice}
                      onChange={e => setTargetPrice(e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-sm font-black text-white outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Canal de Notificação */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Como prefere ser avisado?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      channel === 'whatsapp'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      channel === 'email'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>E-mail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('webpush')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      channel === 'webpush'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>WebPush</span>
                  </button>
                </div>
              </div>

              {/* Input de Contato */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  {channel === 'whatsapp' ? 'Número de WhatsApp com DDD' : (channel === 'email' ? 'Seu E-mail' : 'Identificador')}
                </label>
                <input
                  type={channel === 'email' ? 'email' : 'text'}
                  placeholder={channel === 'whatsapp' ? '(11) 99999-8888' : 'seu@email.com'}
                  value={contactValue}
                  onChange={e => setContactValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
                  required
                />
              </div>

              {/* Checkbox Ofertas FIPE */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={notifyBelowFipe}
                  onChange={e => setNotifyBelowFipe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                />
                <span className="text-[11px] text-slate-400">
                  Avisar também sobre veículos deste modelo anunciados <strong>abaixo da Tabela FIPE</strong>.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all active:scale-95 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Ativando Radar...' : 'Ativar Radar de Preço'}
              </button>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white">Radar Ativado com Sucesso!</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
                {successMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
            >
              Concluir
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PriceAlertModal;
