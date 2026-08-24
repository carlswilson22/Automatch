import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Gavel, FileWarning, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const TimelineItem = ({ item, index, isLast }) => {
  const getStatusConfig = (status) => {
    switch(status) {
      case 'approved':
        return { color: 'text-brand-emerald', bg: 'bg-brand-emerald', icon: <CheckCircle2 className="w-5 h-5 text-white" /> };
      case 'attention':
        return { color: 'text-amber-500', bg: 'bg-amber-500', icon: <AlertCircle className="w-5 h-5 text-white" /> };
      case 'danger':
      case 'rejected':
        return { color: 'text-red-500', bg: 'bg-red-500', icon: <XCircle className="w-5 h-5 text-white" /> };
      default:
        return { color: 'text-slate-500', bg: 'bg-slate-500', icon: <CheckCircle2 className="w-5 h-5 text-white" /> };
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'laudo': return <FileText className="w-5 h-5 text-brand-navy" />;
      case 'leilao': return <Gavel className="w-5 h-5 text-brand-navy" />;
      case 'debitos': return <FileWarning className="w-5 h-5 text-brand-navy" />;
      default: return <FileText className="w-5 h-5 text-brand-navy" />;
    }
  };

  const config = getStatusConfig(item.status);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className="flex relative"
    >
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-[1.35rem] top-10 bottom-[-1rem] w-0.5 bg-slate-200"></div>
      )}
      
      {/* Node Graphic */}
      <div className="relative flex flex-col items-center mr-6">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center z-10 ${config.bg} shadow-md border-4 border-white`}>
          {config.icon}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="bg-white border text-left border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              {getIconForType(item.type)}
            </div>
            <h4 className="font-bold text-slate-800">{item.title}</h4>
            <span className={`ml-auto text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${config.color.replace('text-', 'bg-').replace('500', '100')} ${config.color}`}>
              {item.status}
            </span>
          </div>
          <p className="text-sm text-slate-600 ml-[2.3rem]">{item.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Timeline = ({ items }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-brand-navy mb-6">Procedência Verificada</h3>
      <div className="pl-2">
        {items.map((item, index) => (
          <TimelineItem 
            key={item.id} 
            item={item} 
            index={index} 
            isLast={index === items.length - 1} 
          />
        ))}
      </div>
    </div>
  );
};

export default Timeline;
