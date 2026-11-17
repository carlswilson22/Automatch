import { useEffect, useRef } from 'react';
import { activateDialog } from './dialogFocus';
import { useScrollLock } from './useScrollLock';

export function useDialog(isOpen, onClose) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useScrollLock(isOpen);
  useEffect(() => {
    if (!isOpen) return;
    return activateDialog(ref.current, () => closeRef.current?.());
  }, [isOpen]);
  return ref;
}
