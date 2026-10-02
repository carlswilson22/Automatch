/**
 * SlidingTabs — Adapted from MicroKit UI (https://microkit.co)
 * License: MIT (c) Henrique Barone
 * 
 * Supports two variants:
 * - 'underline': active indicator slides under the text
 * - 'pill': active indicator is a rounded filled pill behind the text
 */

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion, MOTION_DURATIONS, MOTION_EASINGS } from '../../../utils/motionTokens';

export default function SlidingTabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline', // 'underline' | 'pill'
  layoutId = 'sliding-tabs-indicator',
  className = '',
  tabClassName = '',
}) {
  const reducedMotion = usePrefersReducedMotion();
  const listRef = useRef(null);

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    }
    if (nextIndex !== null) {
      e.preventDefault();
      onChange(tabs[nextIndex].id);
      const buttons = listRef.current?.querySelectorAll('button');
      buttons?.[nextIndex]?.focus();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      className={`inline-flex items-center gap-1 ${
        variant === 'pill'
          ? 'bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60'
          : 'border-b border-slate-200'
      } ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative px-4 py-2 text-sm font-bold transition-colors select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl ${
              isActive
                ? variant === 'pill'
                  ? 'text-blue-600'
                  : 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            } ${tabClassName}`}
          >
            {/* Sliding Pill Indicator */}
            {variant === 'pill' && isActive && (
              <motion.div
                layoutId={reducedMotion ? undefined : layoutId}
                transition={reducedMotion ? { duration: 0 } : MOTION_EASINGS.spring}
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/80 -z-0"
              />
            )}

            {/* Sliding Underline Indicator */}
            {variant === 'underline' && isActive && (
              <motion.div
                layoutId={reducedMotion ? undefined : layoutId}
                transition={reducedMotion ? { duration: 0 } : MOTION_EASINGS.spring}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
              />
            )}

            {/* Tab Label with Optional Icon & Counter */}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
