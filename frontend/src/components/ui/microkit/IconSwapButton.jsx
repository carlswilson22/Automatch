/**
 * IconSwapButton — Adapted from MicroKit UI (https://microkit.co)
 * License: MIT (c) Henrique Barone
 * 
 * Button that swaps between two icons/labels with spring animation (e.g. Favorite, Copy).
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion, MOTION_EASINGS, MOTION_DURATIONS } from '../../../utils/motionTokens';

export default function IconSwapButton({
  isActive = false,
  onToggle,
  defaultIcon: DefaultIcon,
  activeIcon: ActiveIcon,
  defaultLabel,
  activeLabel,
  activeColor = 'text-red-500 fill-red-500',
  defaultColor = 'text-slate-500 hover:text-slate-800',
  className = '',
  title = '',
  'aria-label': ariaLabel,
}) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <button
      type="button"
      onClick={onToggle}
      title={title || (isActive ? activeLabel : defaultLabel)}
      aria-label={ariaLabel || title || (isActive ? activeLabel : defaultLabel)}
      aria-pressed={isActive}
      className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isActive ? 'active' : 'default'}
          initial={reducedMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
          transition={reducedMotion ? { duration: 0.1 } : MOTION_EASINGS.springBouncy}
          className="inline-flex items-center gap-1.5"
        >
          {isActive ? (
            <ActiveIcon className={`w-5 h-5 ${activeColor}`} />
          ) : (
            <DefaultIcon className={`w-5 h-5 ${defaultColor}`} />
          )}

          {(isActive ? activeLabel : defaultLabel) && (
            <span className="text-xs font-bold select-none">
              {isActive ? activeLabel : defaultLabel}
            </span>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
