import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, MessageSquare, User } from 'lucide-react';

const AutomatchAI = ({ vehicle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: `Olá! Sou a IA Automatch. Como posso ajudar você com este ${vehicle?.model || 'veículo'}?` }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { from: 'user', text: userMessage }]);
    setInput('');

    // AI Logic Simulator
    setTimeout(() => {
      const q = userMessage.toLowerCase();
      let reply = "Desculpe, ainda estou aprendendo sobre este modelo específico. Posso te ajudar com detalhes técnicos ou condições de financiamento?";

      if (q.includes('motor') || q.includes('câmbio') || q.includes('cambio')) {
        reply = `O ${vehicle.model} conta com motorização ${vehicle.metadata?.engine || 'de alta performance'} e câmbio ${vehicle.metadata?.transmission || 'automático'}.`;
      } else if (q.includes('preço') || q.includes('valor') || q.includes('fipe')) {
        reply = `Este veículo está anunciado por R$ ${vehicle.price.toLocaleString('pt-BR')}. Analisando o mercado, é uma excelente oportunidade para o estado dele!`;
      } else if (q.includes('km') || q.includes('rodado') || q.includes('quilom')) {
        reply = `Ele tem apenas ${vehicle.mileage.toLocaleString('pt-BR')} km rodados. Passou pela nossa inspeção rigorosa sem nenhuma pendência mecânica.`;
      } else if (q.includes('bom') || q.includes('recomenda')) {
        reply = `Com base no nosso TrustScore de ${vehicle.trustScore || 'alto nível'}, este carro está no topo da nossa lista de recomendações por sua integridade.`;
      }

      setMessages(prev => [...prev, { from: 'ai', text: reply }]);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-blue text-white rounded-full shadow-2xl flex items-center justify-center z-50 overflow-hidden"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand-navy p-5 pt-7 text-white relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">IA Automatch</h3>
                  <p className="text-xs text-brand-emerald flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-emerald rounded-full animate-pulse"></span>
                    Especialista Online
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.from === 'user' ? 'bg-slate-200' : 'bg-brand-blue/10 text-brand-blue'}`}>
                    {m.from === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.from === 'user'
                      ? 'bg-brand-blue text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Pergunte sobre o carro..."
                className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-11 h-11 bg-brand-blue text-white rounded-xl flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AutomatchAI;
