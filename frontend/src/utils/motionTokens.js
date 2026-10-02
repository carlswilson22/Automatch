/**
 * Motion Tokens & Animation Presets
 * Inspired by Details.so and MicroKit UI
 * Preserves 60fps performance and respects prefers-reduced-motion
 */

import { useState, useEffect } from 'react';

export const MOTION_DURATIONS = {
  micro: 0.15,   // Clicks, switches, badges (150ms)
  medium: 0.25,  // Hover, tabs, dropdowns, card lifts (250ms)
  macro: 0.40,   // Page transitions, modals, drawers (400ms)
};

export const MOTION_EASINGS = {
  smooth: [0.16, 1, 0.3, 1], // easeOutExpo
  spring: { type: 'spring', damping: 25, stiffness: 320 },
  springBouncy: { type: 'spring', damping: 18, stiffness: 400 },
  sharp: [0.4, 0, 0.2, 1],
};

/**
 * Custom Hook to detect if the user has requested reduced motion
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event) => setPrefersReducedMotion(event.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      mediaQuery.addListener(listener);
      return () => mediaQuery.removeListener(listener);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Common Accessible Variants for Framer Motion
 */
export const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.medium,
      delay: i * 0.05,
      ease: MOTION_EASINGS.smooth,
    },
  }),
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: MOTION_EASINGS.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: MOTION_DURATIONS.micro, ease: MOTION_EASINGS.sharp },
  },
};
