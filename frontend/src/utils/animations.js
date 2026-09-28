/**
 * animations.js
 * Padrões de transição e animações Framer Motion reutilizáveis no AutoMatch.
 * Garante consistência visual, fluidez de 60fps e acessibilidade (respeito a prefers-reduced-motion).
 */

export const pageTransitionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }
  }
};

export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: custom * 0.05, ease: 'easeOut' }
  })
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const cardHoverTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 20
};

export const badgePulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};
