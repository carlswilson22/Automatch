/**
 * Gestão de bloqueio de rolagem com contador de referências (Reference-Counted Scroll Lock).
 * Resolve de forma definitiva o problema de duplo bloqueio quando múltiplos componentes
 * ou modais aninhados (Pai e Filho) solicitam bloqueio concorrente.
 *
 * Suporte iOS Safari: usa position:fixed + top:-scrollY para evitar scroll
 * em navegadores que ignoram overflow:hidden no body.
 */

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';
let originalPosition = '';
let originalTop = '';
let originalWidth = '';
let savedScrollY = 0;

const isIOS = () =>
  typeof window !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !window.MSStream;

export function lockScroll() {
  if (typeof document === 'undefined') return;

  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow || '';
    originalPaddingRight = document.body.style.paddingRight || '';
    originalPosition = document.body.style.position || '';
    originalTop = document.body.style.top || '';
    originalWidth = document.body.style.width || '';

    if (isIOS()) {
      // iOS Safari: position fixed para bloquear scroll
      savedScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Desktop e Android: overflow hidden com compensação de scrollbar
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
    }
  }
  lockCount++;
}

export function unlockScroll() {
  if (typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    if (isIOS()) {
      // Restaurar posição de scroll no iOS
      document.body.style.position = originalPosition || '';
      document.body.style.top = originalTop || '';
      document.body.style.width = originalWidth || '';
      document.body.style.overflow = originalOverflow || '';
      window.scrollTo(0, savedScrollY);
      savedScrollY = 0;
    } else {
      document.body.style.overflow = originalOverflow || '';
      document.body.style.paddingRight = originalPaddingRight || '';
    }
  }
}

export function resetScrollLock() {
  if (typeof document === 'undefined') return;
  lockCount = 0;
  if (isIOS()) {
    document.body.style.position = originalPosition || '';
    document.body.style.top = originalTop || '';
    document.body.style.width = originalWidth || '';
    document.body.style.overflow = originalOverflow || '';
    if (savedScrollY) {
      window.scrollTo(0, savedScrollY);
      savedScrollY = 0;
    }
  } else {
    document.body.style.overflow = originalOverflow || '';
    document.body.style.paddingRight = originalPaddingRight || '';
  }
}

export function getScrollLockCount() {
  return lockCount;
}

export function getOriginalOverflow() {
  return originalOverflow;
}
