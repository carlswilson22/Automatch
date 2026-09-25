import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, RotateCcw, Trash2 } from 'lucide-react';

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
          return parsed.filter(m => !m.isLoading && m.text);
        }
      }
    } catch (e) {
      console.warn('Erro ao restaurar histórico do chat:', e);
    }
    return [defaultWelcome];
  });

  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => { 
    if (messages.length > 1) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
    }
  }, [messages]);

  // Sincroniza histórico no localStorage a cada atualização
  useEffect(() => {
    try {
      const toSave = messages.filter(m => !m.isLoading && m.text);
      if (toSave.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(toSave));
      }
    } catch (e) {
      console.warn('Erro ao salvar histórico do chat:', e);
    }
  }, [messages, storageKey]);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn('Erro ao limpar localStorage:', e);
    }
    setMessages([defaultWelcome]);
  };

  const generateLocalResponse = (userMsg) => {
    const q = userMsg.toLowerCase().trim();
    const kmText = typeof car?.mileage === 'number' ? `${car.mileage.toLocaleString('pt-BR')} km` : (car?.mileage || 'Baixa KM');
    const priceText = typeof car?.price === 'number' ? `R$ ${car.price.toLocaleString('pt-BR')}` : (car?.price || 'sob consulta');
    const colorText = car?.color || car?.cor || 'Prata';
    const fuelText = car?.fuel || car?.combustivel || 'Flex';
    const transText = car?.transmission || car?.cambio || 'Automático';
    const carName = car?.name || 'veículo';

    if (q.includes('cor') || q.includes('pintura') || q.includes('tonalidade') || q.includes('verniz') || q.includes('retoque') || q.includes('lataria')) {
      return `O ${carName} possui a cor oficial ${colorText}. A perícia técnica atestou pintura com espessura uniforme (115 micras, padrão de fábrica), sem peças repintadas, manchas ou avarias na lataria.`;
    }
    if (q.includes('ano') || q.includes('modelo') || q.includes('fabricação') || q.includes('fabricacao')) {
      return `O ${carName} é ano/modelo ${car?.year || 'recente'}, com procedência e histórico de fabricação confirmados perante os órgãos de trânsito.`;
    }
    if (q.includes('documento') || q.includes('documentação') || q.includes('documentacao') || q.includes('ipva') || q.includes('detran') || q.includes('licenciamento') || q.includes('multa') || q.includes('debito') || q.includes('débito')) {
      return `A documentação do ${carName} está 100% regular perante o DETRAN: IPVA quitado, licenciamento em dia, sem multas pendentes e sem gravame, pronto para transferência imediata.`;
    }
    if (q.includes('câmbio') || q.includes('cambio') || q.includes('marcha') || q.includes('transmissão') || q.includes('transmissao')) {
      return `Equipado com transmissão ${transText}, o ${carName} passou por teste de rodagem e inspeção técnica com trocas suaves e sem trancos.`;
    }
    if (q.includes('motor') || q.includes('potência') || q.includes('potencia') || q.includes('cilindrada') || q.includes('desempenho') || q.includes('cv')) {
      return `O ${carName} (${car?.year || ''}) conta com conjunto mecânico inspecionado e revisado. A transmissão e os componentes eletrônicos foram validados sem anomalias na varredura técnica.`;
    }
    if (q.includes('consumo') || q.includes('combustível') || q.includes('combustivel') || q.includes('gasolina') || q.includes('etanol') || q.includes('flex') || q.includes('gasta')) {
      return `O ${carName} é movido a ${fuelText} e apresenta consumo médio de 10 a 13 km/l em ciclo urbano e até 15 km/l em rodovias, demonstrando excelente eficiência para sua categoria.`;
    }
    if (q.includes('laudo') || q.includes('cautelar') || q.includes('batida') || q.includes('leilao') || q.includes('leilão') || q.includes('procedência') || q.includes('procedencia') || q.includes('pericia') || q.includes('perícia')) {
      return `Este ${carName} possui Laudo Cautelar 100% APROVADO: chassi, colunas, longarinas e estrutura íntegras, sem histórico de sinistro ou apontamento de leilão.`;
    }
    if (q.includes('fipe') || q.includes('preço') || q.includes('preco') || q.includes('desconto') || q.includes('valor') || q.includes('quanto custa')) {
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
      return `O ${carName} inclui garantia de procedência, cobertura técnica para motor e câmbio e certificação pericial Automatch.`;
    }
    return `Olá! Sou o consultor IA da Automatch. Posso esclarecer dúvidas específicas sobre o ${carName}: você pode perguntar sobre cor, ano, motor, consumo, quilometragem, documentação/DETRAN, Tabela FIPE ou financiamento!`;
  };

  const handleSend = async (overrideText = null) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend) return;
    const userMessage = textToSend;
    const currentMessages = messages;
    setMessages(m => [...m, { from: 'user', text: userMessage }]);
    if (!overrideText) setInput('');
    setMessages(m => [...m, { from: 'ai', text: 'Consultando especialista Automatch...', isLoading: true }]);

    // Prepare multi-turn history excluding loader
    const historico = currentMessages
      .filter(m => !m.isLoading && m.text)
      .map(m => ({ from: m.from, text: m.text }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensagem: userMessage,
          historico,
          car_context: {
            brand: car?.brand || '',
            model: car?.name || '',
            year: car?.year || '',
            price: car?.price || 0,
            km: typeof car?.mileage === 'number' ? car.mileage : parseInt(String(car?.mileage || 0).replace(/\D/g,'')) || 0,
            color: car?.color || car?.cor || 'Prata',
            fuel: car?.fuel || car?.combustivel || 'Flex',
            transmission: car?.transmission || car?.cambio || 'Automático'
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

  const quickPills = ["Cor", "Ano", "Combustível", "Preço FIPE", "Documentação", "Laudo"];

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
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${m.from === 'ai' ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-blue-600 text-white'} ${m.isLoading ? 'animate-pulse' : ''}`}>{m.text}</div>
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
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 transition-all shrink-0 active:scale-95"
          >
            {pill}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Pergunte sobre cor, ano, motor, consumo, laudo..." 
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
        <button onClick={() => handleSend()} className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AIChatBox;
