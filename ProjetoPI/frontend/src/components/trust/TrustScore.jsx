import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TrustScore = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const controls = setInterval(() => {
      setAnimatedScore((prev) => {
        if (prev >= score) {
          clearInterval(controls);
          return score;
        }
        return prev + 1;
      });
    }, 20);
    return () => clearInterval(controls);
  }, [score]);

  // Determine color based on score
  const getColor = () => {
    if (score >= 90) return 'text-brand-emerald';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };
  
  const strokeColor = () => {
    if (score >= 90) return '#10b981'; // emerald-500
    if (score >= 70) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">TrustScore™</h3>
      
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#f1f5f9" // slate-100
            strokeWidth="10"
          />
          {/* Animated Foreground Circle */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={strokeColor()}
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: "easeOut" }}
            strokeDasharray={circumference}
            className="drop-shadow-sm"
          />
        </svg>
        
        {/* Score Text inside */}
        <div className="flex flex-col items-center">
          <motion.span 
            className={`text-4xl font-black ${getColor()}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {animatedScore}
          </motion.span>
          <span className="text-xs font-medium text-slate-400 mt-1">/100</span>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-center font-medium text-slate-600">
        {score >= 90 ? 'Excelente estado geral' : score >= 70 ? 'Requer atenção em detalhes' : 'Não recomendado pela Automatch'}
      </p>
    </div>
  );
};

export default TrustScore;
