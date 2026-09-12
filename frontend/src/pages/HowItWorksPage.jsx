import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Search, Car, FileText, Banknote } from 'lucide-react';

export default function HowItWorksPage() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Search,
      title: "1. Encontre seu Match",
      description: "Navegue pela nossa vitrine digital. Use a IA para tirar dúvidas em tempo real sobre os veículos, como consumo, especificações e histórico."
    },
    {
      icon: FileText,
      title: "2. Verifique a Procedência",
      description: "Acesse o Dossiê de Transparência de cada carro. Consulte o Laudo Cautelar, situação no DETRAN e a Fipe, tudo na mesma tela sem pagar nada extra."
    },
    {
      icon: Car,
      title: "3. Perícia Visual IA",
      description: "Em carros selecionados, nossa inteligência artificial avalia as fotos em busca de informações sobre a lataria e pintura do veículo."
    },
    {
      icon: Banknote,
      title: "4. Negocie e Feche",
      description: "Converse com o vendedor diretamente pelo chat. Simule financiamentos na hora e, se quiser, reserve online pagando um sinal seguro."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-black tracking-tight text-slate-900 uppercase italic">
              Automatch
            </span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Como a Automatch Funciona?</h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Acreditamos que comprar um carro deve ser tão simples e seguro quanto dar "Match" no seu app favorito. 
            Esqueça as letras miúdas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <step.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button 
            onClick={() => navigate('/encontrar')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-600/30 transition-all transform hover:scale-105 active:scale-95"
          >
            Acessar Vitrine Digital
          </button>
        </div>
      </main>
    </div>
  );
}
