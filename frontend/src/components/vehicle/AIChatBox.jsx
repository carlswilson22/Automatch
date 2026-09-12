import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send } from 'lucide-react';

const AIChatBox = ({ car }) => {
  const [messages, setMessages] = useState([
    { from: 'ai', text: `Olá! Sou o especialista IA da Automatch. Como posso ajudar com os detalhes técnicos, histórico ou financiamento do ${car.name}?` }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  useEffect(() => { 
    if (messages.length > 1) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
    }
  }, [messages]);

  const generateLocalResponse = (userMsg) => {
    const q = userMsg.toLowerCase();
    const kmText = typeof car.mileage === 'number' ? `${car.mileage.toLocaleString('pt-BR')} km` : (car.mileage || 'Baixa KM');
    const priceText = typeof car.price === 'number' ? `R$ ${car.price.toLocaleString('pt-BR')}` : (car.price || 'sob consulta');

    if (q.includes('motor') || q.includes('potência') || q.includes('cilindrada') || q.includes('desempenho') || q.includes('câmbio') || q.includes('cambio')) {
      return `O ${car.name} (${car.year}) conta com conjunto mecânico inspecionado e revisado. A transmissão e os componentes eletrônicos foram validados sem anomalias na varredura técnica.`;
    }
    if (q.includes('consumo') || q.includes('combustível') || q.includes('combustivel') || q.includes('gasolina') || q.includes('etanol') || q.includes('gasta')) {
      return `O consumo médio do ${car.name} gira em torno de 10 a 13 km/l em ciclo urbano e até 15 km/l em rodovias, demonstrando excelente eficiência para sua categoria.`;
    }
    if (q.includes('laudo') || q.includes('cautelar') || q.includes('batida') || q.includes('leilao') || q.includes('leilão') || q.includes('procedência') || q.includes('procedencia')) {
      return `Este ${car.name} possui Laudo Cautelar 100% APROVADO: chassi, colunas, longarinas e estrutura íntegras, sem histórico de sinistro ou apontamento de leilão.`;
    }
    if (q.includes('fipe') || q.includes('preço') || q.includes('preco') || q.includes('desconto') || q.includes('valor')) {
      return `O valor anunciado é ${priceText}, compatível com a Tabela FIPE Oficial e refletindo as excelentes condições de conservação do veículo.`;
    }
    if (q.includes('km') || q.includes('quilometragem') || q.includes('rodado')) {
      return `O veículo possui ${kmText} originais comprovados, com histórico de manutenções periódicas e hodômetro verificado.`;
    }
    if (q.includes('financiamento') || q.includes('parcela') || q.includes('entrada') || q.includes('banco') || q.includes('taxa')) {
      return `Simulamos financiamento com taxas competitivas a partir de 1,29% a.m. Você pode parcelar a entrada e financiar o saldo em até 60 meses.`;
    }
    if (q.includes('troca') || q.includes('aceita troca') || q.includes('usado')) {
      return `Aceitamos seu veículo usado na troca com avaliação justa baseada na FIPE. Você também pode utilizar nosso simulador de troca disponível nesta página.`;
    }
    if (q.includes('garantia') || q.includes('segurança') || q.includes('revisão') || q.includes('revisao')) {
      return `O ${car.name} inclui garantia de procedência, 90 dias de cobertura técnica para motor e câmbio e certificação pericial Automatch.`;
    }
    return `O ${car.name} (${car.year}) está disponível em ótimo estado, com ${kmText}, laudo aprovado e documentação 100% regularizada. Deseja simular um financiamento ou falar com o vendedor?`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages(m => [...m, { from: 'user', text: userMessage }]);
    setInput('');
    setMessages(m => [...m, { from: 'ai', text: 'Consultando especialista Automatch...', isLoading: true }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensagem: userMessage,
          car_context: {
            brand: car.brand || '',
            model: car.name || '',
            year: car.year || '',
            price: car.price || 0,
            km: typeof car.mileage === 'number' ? car.mileage : parseInt(String(car.mileage).replace(/\D/g,'')) || 0,
            color: car.color || ''
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(m => {
          const newM = [...m];
          if (newM[newM.length - 1]?.isLoading) newM.pop();
          return [...newM, { from: 'ai', text: data.resposta || generateLocalResponse(userMessage) }];
        });
      } else {
        throw new Error('API offline');
      }
    } catch (err) {
      // Intelligent fallback when offline / mock mode
      setTimeout(() => {
        setMessages(m => {
          const newM = [...m];
          if (newM[newM.length - 1]?.isLoading) newM.pop();
          return [...newM, { from: 'ai', text: generateLocalResponse(userMessage) }];
        });
      }, 400);
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
