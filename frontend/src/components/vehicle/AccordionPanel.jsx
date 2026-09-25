import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AccordionPanel - Painel colapsável unificado com framer-motion
 * Garante física de animação idêntica (220ms, easeOut, height: 0 ↔ auto)
 * e elimina cortes secos e disparidades visuais entre Laudo, DETRAN e FIPE.
 */
export default function AccordionPanel({ isOpen, children, className = '' }) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0, scale: 0.99 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.99 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
