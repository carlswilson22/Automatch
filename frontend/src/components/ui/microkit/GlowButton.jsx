/**
 * GlowButton — Adapted from MicroKit UI (https://microkit.co)
 * License: MIT (c) Henrique Barone
 * 
 * Interactive CTA with rim glow, smooth arrow reveal and tactile active state.
 */

import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { usePrefersReducedMotion, MOTION_DURATIONS } from '../../../utils/motionTokens';

export default function GlowButton({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'dark' | 'outline' | 'ghost'
  size = 'md',         // 'sm' | 'md' | 'lg'
  icon = ChevronRight,
  showArrow = true,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const IconComponent = icon;
  const reducedMotion = usePrefersReducedMotion();

  const sizeClasses = {
    sm: 'h-9 px-4 text-xs gap-1.5 rounded-xl',
    md: 'h-11 px-5 text-sm gap-2 rounded-xl',
    lg: 'h-13 px-7 text-base gap-2.5 rounded-2xl',
  };

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 border border-blue-500/30',
    dark:
      'bg-slate-900 hover:bg-blue-600 text-white shadow-md shadow-slate-900/20 hover:shadow-lg hover:shadow-blue-600/25 border border-slate-800',
    outline:
      'bg-white hover:bg-blue-50/50 text-slate-800 hover:text-blue-600 border border-slate-200 hover:border-blue-300 shadow-sm',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-transparent',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`group relative inline-flex items-center justify-center font-bold tracking-tight select-none transition-all duration-300 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${
        sizeClasses[size] || sizeClasses.md
      } ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : null}

      <span className="relative z-10 inline-flex items-center gap-1.5">
        {children}
      </span>

      {!loading && showArrow && IconComponent && (
        <IconComponent
          className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
            reducedMotion ? '' : 'group-hover:translate-x-1'
          }`}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
