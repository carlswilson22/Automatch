import React from 'react';
import { motion } from 'framer-motion';

/**
 * WipeButton
 * Adaptado do padrão MicroKit UI (MIT - Henrique Barone) / Outline Wipe Button.
 * Botão outline com efeito de preenchimento (wipe) suave no hover e transição de cor do texto.
 */
export default function WipeButton({
  children,
  onClick,
  variant = 'blue', // 'blue' | 'slate' | 'emerald'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  disabled = false,
  className = '',
  type = 'button'
}) {
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7 py-3 text-base rounded-2xl gap-2.5'
  }[size] || 'px-5 py-2.5 text-sm rounded-xl gap-2';

  const themeClasses = {
    blue: {
      border: 'border-blue-600 text-blue-600 hover:text-white',
      fill: 'bg-blue-600',
    },
    slate: {
      border: 'border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400',
      fill: 'bg-slate-100',
    },
    emerald: {
      border: 'border-emerald-600 text-emerald-600 hover:text-white',
      fill: 'bg-emerald-600',
    }
  }[variant] || {
    border: 'border-blue-600 text-blue-600 hover:text-white',
    fill: 'bg-blue-600',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`relative group overflow-hidden font-bold inline-flex items-center justify-center select-none border transition-colors duration-300 ${sizeClasses} ${themeClasses.border} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {/* Wipe Fill Layer */}
      <span
        className={`absolute inset-0 w-full h-full ${themeClasses.fill} -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none z-0`}
      />

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {Icon && (
          <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
        )}
        <span>{children}</span>
      </span>
    </motion.button>
  );
}
