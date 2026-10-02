import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * GlowButton
 * Adaptado do padrão MicroKit UI (MIT - Henrique Barone) / Cursor Edge Glow Button.
 * Botão com efeito de iluminação perimetral refinada no hover e feedback tátil ao clique.
 */
export default function GlowButton({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'dark'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  disabled = false,
  className = '',
  type = 'button'
}) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs rounded-xl gap-1.5',
    md: 'px-6 py-3 text-sm rounded-xl gap-2',
    lg: 'px-8 py-3.5 text-base rounded-2xl gap-2.5'
  }[size] || 'px-6 py-3 text-sm rounded-xl gap-2';

  const baseStyles = variant === 'primary'
    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-500 active:bg-blue-700'
    : 'bg-slate-900 text-white border border-slate-700/80 hover:bg-slate-800 active:bg-slate-950';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`relative group overflow-hidden font-bold inline-flex items-center justify-center select-none transition-all duration-300 ${sizeClasses} ${baseStyles} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {/* Feixe Perimetral Animado (Edge Glow Beam) */}
      {!disabled && isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute inset-0 rounded-[inherit] p-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent mask-border animate-pulse" />
          <div className="absolute -inset-1 bg-blue-400/20 rounded-2xl blur-md pointer-events-none" />
        </motion.div>
      )}

      {/* Conteúdo do Botão */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />}
        <span>{children}</span>
      </span>
    </motion.button>
  );
}
