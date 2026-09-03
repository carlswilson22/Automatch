import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCars } from '../data/mockData';
import { ArrowLeft, Check, Calendar, Settings, Fuel } from 'lucide-react';
import StoreIdentifier from '../components/ui/StoreIdentifier';
import Timeline from '../components/trust/Timeline';
import OpinionCompare from '../components/trust/OpinionCompare';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    const car = mockCars.find(c => c.id === id);
    if (car) setVehicle(car);
  }, [id]);

  if (!vehicle) {
    return <div className="min-h-screen flex items-center justify-center bg-white">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <nav className="w-full px-4 sm:px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center gap-4">
        <button 
          onClick={() => navigate('/catalog')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <span className="font-bold text-slate-800">Voltar ao Catálogo</span>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Title and Price */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h4 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-1">{vehicle.brand}</h4>
            <h1 className="text-3xl sm:text-4xl font-black text-brand-navy leading-tight">{vehicle.model}</h1>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Vendido por</span>
              <StoreIdentifier storeId={vehicle.storeId} />
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-slate-500 font-medium mb-1">Preço Automatch</p>
            <p className="text-4xl font-black text-brand-blue">R$ {vehicle.price.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Images & Dossier) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main vehicle photo */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <img 
                src={vehicle.images?.[0] || vehicle.image || '/images/FotoGolfGTI.jpeg'} 
                alt={`${vehicle.brand} ${vehicle.model}`} 
                className="w-full h-auto max-h-[480px] rounded-xl object-cover"
              />
            </div>

             {/* Dossiê - Opinions & Timeline */}
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
               <h2 className="text-2xl font-black text-brand-navy mb-8 border-b pb-4">Dossiê de Transparência</h2>
               
               <div className="space-y-12">
                 <OpinionCompare opinions={vehicle.opinions} />
                 
                 <div className="mx-auto max-w-2xl bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <Timeline items={vehicle.timeline} />
                 </div>
               </div>
             </div>
          </div>

          {/* Right Column (Specs only) */}
          <div className="space-y-6">
            
            {/* Specs Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Especificações</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                    <Calendar className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Ano</p>
                    <p className="font-semibold text-slate-800">{vehicle.year}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                    <Check className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Quilometragem</p>
                    <p className="font-semibold text-slate-800">{vehicle.mileage.toLocaleString('pt-BR')} km</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                    <Settings className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Câmbio</p>
                    <p className="font-semibold text-slate-800">{vehicle.metadata.transmission}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                    <Fuel className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Combustível</p>
                    <p className="font-semibold text-slate-800">{vehicle.metadata.fuel}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
