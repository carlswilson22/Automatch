import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';

import { generateGeneralSupportAnswer } from '../../utils/aiConsultantCore';
import { showcaseCars } from '../../data/showcaseData';

export default function HomeSupportChat({ isOpen, onClose }) {
  const [chatTab, setChatTab] = useState('system');
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Olá! Bem-vindo ao AutoMatch. Como podemos ajudar com sua busca ou negociação hoje?', sender: 'system' }
  ]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const generateAssistantResponse = (text) => {
    return generateGeneralSupportAnswer(text, showcaseCars);
  };

  const handleSendMessage = async (e, directText = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const textToSend = (directText || chatMessage).trim();
    if (!textToSend) return;
    
    setMessages(prev => [...prev, { id: Date.now(), text: textToSend, sender: 'user' }]);
    if (!directText) setChatMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mensagem: textToSend }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.resposta) {
          setIsTyping(false);
          setMessages(prev => [...prev, { id: Date.now(), text: data.resposta, sender: 'system' }]);
          return;
        }
      }
      throw new Error('Fallback para assistente inteligente');
    } catch (error) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { id: Date.now(), text: generateAssistantResponse(textToSend), sender: 'system' }]);
      }, 700);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[550px] max-h-[85vh]"
        >
          {/* Chat Header */}
          <div className="bg-blue-600 px-6 pt-4 pb-0 flex flex-col text-white border-b border-blue-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full shadow-inner">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight tracking-wide">Mensagens</h3>
                  <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mt-0.5">Automatch Chat</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar chat"
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Chat Tabs */}
            <div className="flex gap-4 px-2">
              <button 
                type="button"
                onClick={() => setChatTab('system')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all ${chatTab === 'system' ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'}`}
              >
                Atendimento
              </button>
              <button 
                type="button"
                onClick={() => setChatTab('p2p')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${chatTab === 'p2p' ? 'border-white text-white' : 'border-transparent text-blue-200 hover:text-white'}`}
              >
                Outros Usuários <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">2</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          {chatTab === 'system' ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-md'
                        }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-md">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                {/* Quick Chips */}
                {messages.length <= 2 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['Laudo Cautelar', 'Financiamento', 'Tabela FIPE', 'Garantia', 'Troca'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSendMessage(null, chip)}
                        className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => handleSendMessage(e)}
                  className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full px-2 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm"
                >
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-transparent border-none focus:outline-none px-4 text-slate-700 text-sm placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim() || isTyping}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto bg-slate-50">
              <div className="p-4 space-y-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:border-blue-300 transition-colors">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-sm text-slate-800">Carlos Eduardo</h4>
                      <span className="text-[10px] text-slate-400">10:42</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">Sobre o Honda Civic: Aceita troca?</p>
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:border-blue-300 transition-colors">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-sm text-slate-800">Loja AutoPremium</h4>
                      <span className="text-[10px] text-slate-400">Ontem</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">O financiamento foi pré-aprovado!</p>
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
