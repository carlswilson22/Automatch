import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Car, DollarSign, Store, Shield, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function PartnerChatModal({ isOpen, onClose, reservation }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    if (!reservation?.id) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/partnerships/reservations/${reservation.id}/messages`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Erro ao carregar mensagens:", e);
    }
  };

  useEffect(() => {
    if (isOpen && reservation?.id) {
      setLoading(true);
      fetchMessages().finally(() => setLoading(false));

      // Polling suave a cada 5 segundos durante negociação
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, reservation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || sending) return;

    const token = localStorage.getItem('token');
    const msgToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await fetch(`/api/partnerships/reservations/${reservation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ message: msgToSend })
      });

      if (res.ok) {
        await fetchMessages();
      }
    } catch (e) {
      console.error("Erro ao enviar mensagem:", e);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !reservation) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl h-[620px] flex flex-col overflow-hidden"
        >
          {/* Top Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base tracking-tight flex items-center gap-2">
                  Negociação B2B Direta
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Canal Seguro
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  {reservation.requesting_store_name} ↔ {reservation.owner_store_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Deal Summary Subheader */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {reservation.car_image ? (
                <img
                  src={reservation.car_image}
                  alt={reservation.car_title}
                  className="w-12 h-10 object-cover rounded-xl border border-slate-200"
                />
              ) : (
                <div className="w-12 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                  <Car className="w-5 h-5" />
                </div>
              )}
              <div className="truncate">
                <h4 className="font-bold text-sm text-slate-800 truncate">{reservation.car_title}</h4>
                <p className="text-xs text-slate-500">Cliente: {reservation.client_name || 'Em atendimento'}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Proposta Atual</span>
              <span className="text-base font-black text-emerald-600">
                R$ {Number(reservation.proposed_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Carregando histórico da negociação...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                <p className="font-bold text-slate-600 text-sm">Nenhuma mensagem ainda.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Envie uma mensagem para alinhar prazos de pagamento, documentação ou desconto no repasse.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isSystem = m.message.includes('CONSENTIMENTO') || m.message.includes('NEGÓCIO FECHADO') || m.message.includes('SOLICITAÇÃO');
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.is_me ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] font-semibold text-slate-400 mb-1 px-1">
                      {m.is_me ? 'Você' : `${m.sender_name} • ${m.sender_store_name}`}
                    </span>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        isSystem
                          ? 'bg-amber-50 border border-amber-200 text-amber-900 font-medium'
                          : m.is_me
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.message}</p>
                      <span
                        className={`text-[9px] block text-right mt-1.5 ${
                          m.is_me ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {m.created_at ? m.created_at.split(' ')[1] : ''}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Shortcuts */}
          <div className="px-6 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto text-xs">
            {[
              "Cliente aprovou o financiamento!",
              "Podemos emitir laudo complementar?",
              "Qual o prazo para liberação do ATPV-e?",
              "Proposta com fechamento imediato!"
            ].map((shortcut, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(shortcut)}
                className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-medium transition-colors"
              >
                {shortcut}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
            <input
              type="text"
              placeholder="Digite sua mensagem de negociação..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
