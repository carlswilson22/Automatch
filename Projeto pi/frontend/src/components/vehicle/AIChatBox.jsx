import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send } from 'lucide-react';

const AIChatBox = ({ car }) => {
  const [messages, setMessages] = useState([
    { from: 'ai', text: `Olá! Sou o especialista IA da Automatch. Como posso ajudar com os detalhes técnicos, histórico ou financiamento do ${car.name}?` }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages(m => [...m, { from: 'user', text: userMessage }]);
    setInput('');
    setMessages(m => [...m, { from: 'ai', text: 'Pensando...', isLoading: true }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensagem: userMessage,
          car_context: {
            brand: car.brand,
            model: car.model,
            year: car.year,
            price: car.price,
            km: typeof car.mileage === 'number' ? car.mileage : parseInt(car.mileage.replace(/\D/g,'')) || 0,
            color: car.color
          }
        })
      });
      const data = await response.json();
      setMessages(m => {
        const newM = [...m];
        if (newM[newM.length - 1].isLoading) newM.pop();
        return [...newM, { from: 'ai', text: data.resposta || 'Não consegui processar a resposta.' }];
      });
    } catch (err) {
      setMessages(m => {
        const newM = [...m];
        if (newM[newM.length - 1].isLoading) newM.pop();
        return [...newM, { from: 'ai', text: 'Ocorreu um erro de conexão com a IA.' }];
      });
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[380px]">
      <div className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center gap-2.5">
        <Bot className="w-5 h-5" />
        <div>
          <span className="font-bold text-sm leading-none block">Consultor IA Automatch</span>
          <span className="text-[10px] text-blue-200">Respostas técnicas em tempo real</span>
        </div>
        <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Online</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-950/60">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.from === 'user' ? 'justify-end' : ''}`}>
            {m.from === 'ai' && <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/30"><Bot className="w-4 h-4" /></div>}
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${m.from === 'ai' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-blue-600 text-white'} ${m.isLoading ? 'animate-pulse' : ''}`}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Pergunte sobre motor, consumo, laudo..." 
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
        <button onClick={handleSend} className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AIChatBox;
