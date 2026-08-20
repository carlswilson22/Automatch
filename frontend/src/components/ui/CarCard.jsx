import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Gauge,
  ChevronRight,
  Heart,
  Star
} from 'lucide-react';
import StoreIdentifier from './StoreIdentifier';

/**
 * Standardized Master Component for Car Ads
 * @param {Object} data - Car data (id, model, brand, year, price/sale_value, mileage, image, etc)
 * @param {Object} store - Store data (optional, fetches via StoreIdentifier if not provided)
 * @param {number} index - Index for animation delay
 */
const CarCard = ({ data, index = 0 }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = React.useState(false);

  // Normalization of fields (Showcase vs Inventory)
  const id = data.id || data.invId;
  const model = data.model || data.name;
  const brand = data.brand;
  const price = data.price || data.sale_value;
  const mileage = data.mileage !== undefined ? data.mileage : 0;
  const year = data.year || new Date().getFullYear();
  const image = data.image;
  const storeId = data.storeId;
  const featured = data.featured || false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/encontrar/${id}`)}
    >
      {/* Image Section (16:9) */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={`${brand} ${model}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Store Identifier (Overlay Top-Left) */}
        <div className="absolute top-4 left-4 z-20">
          <StoreIdentifier storeId={storeId} variant="badge" />
        </div>

        {/* Action Buttons (Top-Right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center hover:bg-white transition-all shadow-lg"
          >
            <Heart className={`w-5 h-5 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
          </button>
        </div>

        {/* Featured Tag */}
        {featured && (
          <div className="absolute bottom-4 left-4 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 border border-amber-400/50">
            <Star className="w-3.5 h-3.5 fill-white" /> Destaque
          </div>
        )}

        {/* Price Overlay (Bottom-Right) - Optional but looks good */}
        <div className="absolute bottom-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent w-full text-right pointer-events-none">
          <p className="text-2xl font-black text-white drop-shadow-lg">
            R$ {price?.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-brand-blue transition-colors">
            {brand} <span className="text-slate-600">{model}</span>
          </h3>
          <div className="flex items-center gap-4 mt-2 text-slate-400 font-medium text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {year}
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="flex items-center gap-1.5 text-slate-500">
              <Gauge className="w-4 h-4" /> {mileage?.toLocaleString('pt-BR')} km
            </span>
          </div>
        </div>

        {/* Footer with Price and Button */}
        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Valor de Venda</span>
            <p className="text-xl font-black text-brand-blue">
              R$ {price?.toLocaleString('pt-BR')}
            </p>
          </div>

          <button className="h-12 px-6 bg-slate-900 group-hover:bg-brand-blue text-white rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
            <span>Ver Detalhes</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CarCard;
