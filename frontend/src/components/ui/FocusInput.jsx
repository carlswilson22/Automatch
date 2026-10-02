import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * FocusInput
 * Adaptado do padrão MicroKit UI (MIT - Henrique Barone) / Focus Field.
 * Campo de entrada com microinteração de borda animada e glow suave de foco.
 */
const FocusInput = forwardRef(function FocusInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  onKeyDown,
  icon: Icon,
  rightElement,
  error,
  label,
  id,
  className = '',
  disabled = false,
  autoComplete = 'off',
  ...rest
}, ref) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className={`absolute left-3.5 pointer-events-none transition-colors duration-200 ${
            isFocused ? 'text-blue-600' : 'text-slate-400'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${
            rightElement ? 'pr-10' : 'pr-3.5'
          } ${
            error 
              ? 'border-red-400 focus:border-red-500 bg-red-50/20' 
              : isFocused 
              ? 'border-blue-500 shadow-[0_0_15px_-3px_rgba(37,99,235,0.25)]' 
              : 'border-slate-200 hover:border-slate-300'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
          {...rest}
        />

        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}

        {/* Linha animada de foco (MicroKit Focus Line) */}
        <motion.div
          initial={false}
          animate={{
            scaleX: isFocused ? 1 : 0,
            opacity: isFocused ? 1 : 0
          }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl origin-center pointer-events-none ${
            error ? 'bg-red-500' : 'bg-blue-600'
          }`}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 font-semibold">{error}</p>
      )}
    </div>
  );
});

export default FocusInput;
