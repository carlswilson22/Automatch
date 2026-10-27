/**
 * AIChatBox.jsx — Caixa de chat contextualizada com o veículo em exibição.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para permitir que o comprador tire dúvidas específicas sobre o carro selecionado
 *     (histórico de revisões, estado dos pneus, laudo cautelar e negociação de preço) via IA.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, RotateCcw, Square } from 'lucide-react';
import { streamChatMessage } from '../../services/aiChatService';
import { generateVehicleConsultantAnswer } from '../../utils/aiConsultantCore';

const AIChatBox = ({ car }) => {
  const storageKey = `automatch_chat_${car?.id || 'default'}`;
  
  const defaultWelcome = { 
    from: 'ai', 
    text: `Olá! Sou o especialista IA da Automatch. Como posso ajudar com os detalhes técnicos, histórico ou financiamento do ${car?.name || 'veículo'}?` 
  };

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(m => !m.isLoading && !m.isStreaming && m.text);
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar histórico do chat:', e);
    }
    return [defaultWelcome];
  });

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const endRef = useRef(null);
  const abortControllerRef = useRef(null);
  const streamingIndexRef = useRef(null);

  useEffect(() => { 
    if (messages.length > 1) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
    }
  }, [messages]);

  // Persistência debounced: grava no localStorage somente quando NÃO está em streaming
  useEffect(() => {
    if (isStreaming) return;
    try {
      const toSave = messages.filter(m => !m.isLoading && !m.isStreaming && m.text);
      if (toSave.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(toSave));
      }
    } catch (e) {
      console.warn('Erro ao salvar histórico do chat:', e);
    }
  }, [messages, storageKey, isStreaming]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn('Erro ao limpar localStorage:', e);
    }
    setMessages([defaultWelcome]);
  };

  const handleCancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    // Remove o flag de streaming da mensagem atual
    setMessages(prev =>
      prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m)
    );
  }, []);

  const handleSend = async (overrideText = null) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || isStreaming) return;
    const userMessage = textToSend;
    const currentMessages = messages;
    setMessages(m => [...m, { from: 'user', text: userMessage }]);
    if (!overrideText) setInput('');

    // Cria AbortController para esta requisição
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Histórico conversacional para contexto
    const historico = currentMessages
      .filter(m => !m.isLoading && !m.isStreaming && m.text)
      .map(m => ({ from: m.from, text: m.text }));

    const fullCarContext = {
      brand: car?.brand || '',
      model: car?.name || car?.model || '',
      year: car?.year || '',
      price: car?.price || 0,
      km: typeof car?.mileage === 'number' ? car.mileage : parseInt(String(car?.mileage || 0).replace(/\D/g, '')) || 0,
      color: car?.color || car?.cor || 'Prata',
      fuel: car?.fuel || car?.combustivel || car?.specs?.combustivel || 'Flex',
      transmission: car?.transmission || car?.cambio || car?.specs?.cambio || 'Automático',
      specs: car?.specs || {},
      description: car?.description || '',
      fullDescription: car?.fullDescription || '',
      laudoStatus: car?.timeline?.find(t => t.type === 'laudo')?.status || 'approved'
    };

    // Índice da mensagem de streaming
    const streamIdx = currentMessages.length + 1; // +1 porque adicionamos a user message acima
    streamingIndexRef.current = streamIdx;

    // Adiciona mensagem vazia para preencher via streaming
    setMessages(m => [...m, { from: 'ai', text: '', isStreaming: true }]);
    setIsStreaming(true);

    try {
      await streamChatMessage({
        message: userMessage,
        historico,
        carContext: fullCarContext,
        signal: controller.signal,
        onChunk: (token) => {
          setMessages(prev => {
            const newM = [...prev];
            const lastAi = newM.length - 1;
            if (newM[lastAi]?.isStreaming) {
              newM[lastAi] = { ...newM[lastAi], text: newM[lastAi].text + token };
            }
            return newM;
          });
        },
        onDone: () => {
          setMessages(prev => {
            const newM = [...prev];
            const lastAi = newM.length - 1;
            if (newM[lastAi]?.isStreaming) {
              newM[lastAi] = { ...newM[lastAi], isStreaming: false };
            }
            return newM;
          });
          setIsStreaming(false);
          abortControllerRef.current = null;
          streamingIndexRef.current = null;
        },
        onError: () => {
          // Tratado no catch abaixo
        }
      });
    } catch (err) {
      // Se foi cancelado pelo usuário, mantém texto parcial
      if (controller.signal.aborted) {
        setMessages(prev =>
          prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m)
        );
        setIsStreaming(false);
        return;
      }

      // Fallback semântico fundamentado nas 3 fontes (anúncio, laudo e descrição)
      setMessages(m => {
        const newM = [...m];
        // Remove a mensagem de streaming vazia/parcial
        if (newM[newM.length - 1]?.isStreaming) newM.pop();
        return [...newM, { from: 'ai', text: generateVehicleConsultantAnswer(userMessage, car, historico) }];
      });
      setIsStreaming(false);
      abortControllerRef.current = null;
      streamingIndexRef.current = null;
    }
  };

  const quickPills = ["Direção e Freios", "Motor e KM", "Consumo", "Preço FIPE", "Documentação", "Laudo Cautelar"];

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[400px]">
      <div className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Bot className="w-5 h-5 shrink-0" />
          <div className="truncate">
            <span className="font-bold text-sm leading-none block truncate">Consultor IA Automatch</span>
            <span className="text-[10px] text-blue-200">Respostas técnicas com memória contínua</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 1 && (
            <button
              type="button"
              id="clear-chat-history-btn"
              onClick={handleClearHistory}
              title="Limpar Histórico da Conversa"
              className="text-[11px] bg-white/10 hover:bg-white/20 active:scale-95 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all text-white border border-white/20"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar Conversa</span>
            </button>
          )}
          <span className="text-[10px] bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">Online</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-950/60">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.from === 'user' ? 'justify-end' : ''}`}>
            {m.from === 'ai' && <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30"><Bot className="w-4 h-4" /></div>}
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${m.from === 'ai' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-blue-600 text-white'} ${m.isLoading ? 'animate-pulse' : ''}`}>
              {m.text}
              {m.isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-400 rounded-sm animate-pulse align-text-bottom" />
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-3 py-1.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-500 shrink-0 mr-1 font-semibold">Perguntas Rápidas:</span>
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(pill)}
            disabled={isStreaming}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 transition-all shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pill}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && !isStreaming && handleSend()}
          placeholder="Pergunte sobre cor, ano, motor, consumo, laudo..." 
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={handleCancelStream}
            title="Parar resposta"
            className="bg-red-500 text-white p-2.5 rounded-xl hover:bg-red-400 transition-colors active:scale-95"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => handleSend()} className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AIChatBox;
