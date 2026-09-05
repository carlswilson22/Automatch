import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const SellerChat = ({ seller }) => {
  const [messages, setMessages] = useState([
    { from: 'seller', text: `Olá! Sou ${seller?.name || 'o vendedor'}. Posso te ajudar a agendar um test-drive ou negociar condições especiais!` }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { from: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      const replies = [
        'Excelente! O carro está disponível para vistoria presencial e test-drive.',
        'Aceito proposta de troca com avaliação justa da sua entrada.',
        'Todas as revisões foram feitas na concessionária e temos o manual com chave reserva.',
        'Caso queira, você pode efetuar a reserva online com sinal reembolsável para garantir exclusividade!',
      ];
      setMessages(m => [...m, { from: 'seller', text: replies[Math.floor(Math.random() * replies.length)] }]);
    }, 1000);
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[380px]">
      <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center gap-2.5">
        <img src={seller?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seller'} alt="" className="w-7 h-7 rounded-full object-cover border border-white/40" />
        <div>
          <span className="font-bold text-sm leading-none block">{seller?.name || 'Vendedor Verificado'}</span>
          <span className="text-[10px] text-emerald-200">Atendimento Direto</span>
        </div>
        <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span> Online
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-950/60">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.from === 'user' ? 'justify-end' : ''}`}>
            {m.from === 'seller' && <img src={seller?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seller'} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-slate-700" />}
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${m.from === 'seller' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-emerald-600 text-white'}`}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Envie sua mensagem ou proposta..." 
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none" 
        />
        <button onClick={handleSend} className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-500 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SellerChat;
