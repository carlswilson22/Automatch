import React from 'react';
import { Star, MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';

const ReviewCard = ({ title, opinion, highlightColor, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white rounded-2xl p-5 border shadow-sm relative overflow-hidden flex-1 ${highlightColor}`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent opacity-10 rounded-bl-full`} />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</h4>
          <div className="flex items-center gap-2">
            <img src={opinion.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
            <div className="flex bg-slate-100 rounded-md px-2 py-1 items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-slate-800">{opinion.rating}</span>
            </div>
          </div>
        </div>
        <MessageSquareText className="w-6 h-6 text-slate-300" />
      </div>
      
      <p className="text-slate-700 text-sm leading-relaxed italic">
        "{opinion.text}"
      </p>
    </motion.div>
  );
};

const OpinionCompare = ({ opinions }) => {
  if (!opinions.owner || !opinions.inspector) return null;

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-brand-navy mb-4 flex items-center gap-2">
        <MessageSquareText className="text-brand-blue" />
        Visões sobre o Veículo
      </h3>
      <div className="flex flex-col md:flex-row gap-4">
        <ReviewCard 
          title="Opinião do Antigo Dono" 
          opinion={opinions.owner} 
          highlightColor="border-slate-200 hover:border-blue-300 transition-colors"
          delay={0.1}
        />
        <ReviewCard 
          title="Visão Automatch" 
          opinion={opinions.inspector} 
          highlightColor="border-brand-emerald border-opacity-30 bg-emerald-50 bg-opacity-30"
          delay={0.3}
        />
      </div>
    </div>
  );
};

export default OpinionCompare;
