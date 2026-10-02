/**
 * SpotlightCard — Adapted from MicroKit UI (https://microkit.co) & Details.so Card Hover
 * License: MIT (c) Henrique Barone
 * 
 * Card surface that projects a smooth radial spotlight tracking the user's cursor.
 */

import React, { useRef, useState, useCallback } from 'react';
import { usePrefersReducedMotion } from '../../../utils/motionTokens';

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(37, 99, 235, 0.08)',
  borderColor = 'rgba(37, 99, 235, 0.25)',
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const handleMouseMove = useCallback((e) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [reducedMotion]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: -1000, y: -1000 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {/* Radial Spotlight Overlay */}
      {!reducedMotion && isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-3xl opacity-100 z-10"
          style={{
            background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Children content */}
      <div className="relative z-20 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}
