/**
 * FocusInput — Adapted from MicroKit UI (https://microkit.co)
 * License: MIT (c) Henrique Barone
 * 
 * Accessible input field with smooth glow ring, prefix/suffix icons, and clean state.
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function FocusInput({
  label,
  value = '',
  onChange,
  onClear,
  placeholder = '',
  type = 'text',
  icon: Icon,
  rightElement,
  error,
  disabled = false,
  className = '',
  inputClassName = '',
  id,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold text-slate-700 uppercase tracking-wider select-none flex justify-between"
        >
          <span>{label}</span>
          {error && <span className="text-red-500 normal-case font-medium">{error}</span>}
        </label>
      )}

      <div
        className={`relative flex items-center w-full rounded-2xl bg-white border transition-all duration-300 ${
          error
            ? 'border-red-300 ring-2 ring-red-500/10'
            : isFocused
            ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-sm'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-60 bg-slate-50 pointer-events-none' : ''}`}
      >
        {Icon && (
          <div className="pl-4 pr-1 text-slate-400 pointer-events-none transition-colors duration-200">
            <Icon
              className={`w-4 h-4 transition-colors ${isFocused ? 'text-blue-600' : 'text-slate-400'}`}
              aria-hidden="true"
            />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-transparent py-3 text-sm text-slate-800 placeholder:text-slate-400 font-medium outline-none ${
            Icon ? 'pl-2' : 'pl-4'
          } ${onClear && value ? 'pr-9' : 'pr-4'} ${inputClassName}`}
          {...props}
        />

        {/* Clear Button */}
        {onClear && value && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Limpar campo"
            aria-label="Limpar campo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Custom Right Element (e.g. search button or badge) */}
        {rightElement && (
          <div className="pr-3 pl-1 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}
