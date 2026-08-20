import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Car, Calendar, Gauge, Palette, Info, Settings } from 'lucide-react';
import { getNewCarById } from '../data/newCarsManager';
import { mockCars } from '../data/mockData';

const NewCarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);

  useEffect(() => {
    let foundCar = getNewCarById(id);
    
    // Se não encontrou nos carros novos (localStorage), procura nos originais (mockCars)
    if (!foundCar) {
      const original = mockCars.find(c => c.id === id);
      if (original) {
        foundCar = {
          id: original.id,
          marca: original.brand,
          modelo: original.model,
          ano: original.year,
          preco: original.price,
          km: original.mileage,
          imagem: original.images && original.images.length > 0 ? original.images[0] : '',
          cor: 'Não informada',
          transmissao: original.metadata?.transmission || 'Automático',
          descricao: original.opinions?.owner?.text || 'Anúncio Original Automatch'
        };
      }
    }

    if (foundCar) {
      setCar(foundCar);
    }
  }, [id]);

  if (!car) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-800">Carro não encontrado.</h2>
        <button onClick={() => navigate('/novo-catalogo')} className="mt-4 text-blue-600 hover:underline">
          Voltar para o catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <nav className="w-full px-6 py-4 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <ShieldCheck className="w-8 h-8 text-brand-blue" />
            <span className="text-xl font-black tracking-tight text-slate-800 hidden sm:block">AUTOMATCH</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="w-full h-64 md:h-full min-h-[400px] bg-slate-100 relative">
              {car.imagem ? (
                <img
                  src={car.imagem}
                  alt={`${car.marca} ${car.modelo}`}
                  className="w-full h-full object-cover absolute inset-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full absolute inset-0 flex items-center justify-center">
                  <Car className="w-24 h-24 text-slate-300" />
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-6">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{car.marca}</span>
                <h1 className="text-4xl font-black text-slate-800 leading-tight mt-1">{car.modelo}</h1>
                <p className="text-3xl font-bold text-blue-600 mt-4">
                  R$ {Number(car.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 shadow-sm border border-slate-100">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm"><Calendar className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Ano</p>
                    <p className="font-bold text-slate-800">{car.ano}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 shadow-sm border border-slate-100">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm"><Gauge className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Hodômetro</p>
                    <p className="font-bold text-slate-800">{car.km ? `${Number(car.km).toLocaleString('pt-BR')} km` : '0 km'}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 shadow-sm border border-slate-100">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm"><Settings className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Câmbio</p>
                    <p className="font-bold text-slate-800">{car.transmissao || 'Não informado'}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 shadow-sm border border-slate-100">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm"><Palette className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Cor</p>
                    <p className="font-bold text-slate-800">{car.cor || 'Não informada'}</p>
                  </div>
                </div>
              </div>

              {car.descricao && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-800">Descrição do Vendedor</h3>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{car.descricao}</p>
                  </div>
                </div>
              )}

              <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm text-lg">
                Tenho Interesse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCarDetails;
