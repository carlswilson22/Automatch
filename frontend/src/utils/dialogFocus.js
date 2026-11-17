/** Keyboard and focus management for the topmost open dialog. */
const dialogs = [];
const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function activateDialog(root, onClose) {
  const document = root?.ownerDocument;
  if (!root || !document?.addEventListener) return () => {};
  const previous = document.activeElement;
  const entry = { root, document };
  dialogs.push(entry);
  const isTop = () => dialogs.filter(item => item.document === document).at(-1) === entry;
  const focusable = () => [...root.querySelectorAll(selector)].filter(element => {
    if (element.hidden || element.tabIndex < 0 || element.closest?.('[hidden], [inert], [aria-hidden="true"]')) return false;
    const style = document.defaultView?.getComputedStyle?.(element);
    return style?.display !== 'none' && style?.visibility !== 'hidden';
  });
  const focusFirst = () => (root.querySelector('[data-dialog-autofocus]') || focusable()[0] || root).focus?.({ preventScroll: true });
  const onKeyDown = event => {
    if (!isTop() || event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose?.();
    } else if (event.key === 'Tab') {
      const items = focusable();
      const first = items[0];
      const last = items.at(-1);
      const active = document.activeElement;
      if (!items.length || !root.contains(active) || (event.shiftKey && active === first) || (!event.shiftKey && active === last)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus?.({ preventScroll: true });
        if (!items.length) root.focus?.({ preventScroll: true });
      }
    }
  };
  const onFocus = event => {
    if (isTop() && !root.contains(event.target)) focusFirst();
  };
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('focusin', onFocus, true);
  focusFirst();
  return () => {
    const wasTop = isTop();
    const index = dialogs.indexOf(entry);
    if (index >= 0) dialogs.splice(index, 1);
    document.removeEventListener('keydown', onKeyDown, true);
    document.removeEventListener('focusin', onFocus, true);
    if (!wasTop) return;
    const parent = dialogs.filter(item => item.document === document).at(-1);
    if (previous?.isConnected !== false && typeof previous?.focus === 'function' && (!parent || parent.root.contains(previous))) previous.focus({ preventScroll: true });
    else parent?.root.focus?.({ preventScroll: true });
  };
}
