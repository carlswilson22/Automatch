/**
 * Gestão de bloqueio de rolagem com contador de referências (Reference-Counted Scroll Lock).
 * Resolve de forma definitiva o problema de duplo bloqueio quando múltiplos componentes
 * ou modais aninhados (Pai e Filho) solicitam bloqueio concorrente.
 */

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

export function lockScroll() {
  if (typeof document === 'undefined') return;

  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow || '';
    originalPaddingRight = document.body.style.paddingRight || '';

    const scrollBarWidth = typeof window !== 'undefined' && document.documentElement
      ? window.innerWidth - document.documentElement.clientWidth 
      : 0;

    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

export function unlockScroll() {
  if (typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow || '';
    document.body.style.paddingRight = originalPaddingRight || '';
  }
}

export function resetScrollLock() {
  if (typeof document === 'undefined') return;
  lockCount = 0;
  document.body.style.overflow = originalOverflow || '';
  document.body.style.paddingRight = originalPaddingRight || '';
}

export function getScrollLockCount() {
  return lockCount;
}

export function getOriginalOverflow() {
  return originalOverflow;
}
