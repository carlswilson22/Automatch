import { useEffect } from 'react';
import { lockScroll, unlockScroll, resetScrollLock, getScrollLockCount, getOriginalOverflow } from './scrollLockCore';

/**
 * Hook declarativo para bloqueio de rolagem.
 * @param {boolean} isLocked Se verdadeiro, bloqueia a rolagem; ao mudar para falso ou desmontar, desbloqueia.
 */
export function useScrollLock(isLocked = true) {
  useEffect(() => {
    if (!isLocked) return;

    lockScroll();

    return () => {
      unlockScroll();
    };
  }, [isLocked]);
}

export { lockScroll, unlockScroll, resetScrollLock, getScrollLockCount, getOriginalOverflow };
export default useScrollLock;
