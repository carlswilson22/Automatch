/** Account-scoped favorites; previous browser/visitor lists remain available for explicit import. */
const LEGACY_KEY = '@automatch:favorites';
const VISITOR_KEY = `${LEGACY_KEY}:visitor`;
const EVENT_NAME = 'automatch:favorites-updated';
export function getFavoriteOwnerKey() {
  try {
    const user = JSON.parse(globalThis.sessionStorage?.getItem('automatch_user') || 'null');
    if (user?.id != null) return `${LEGACY_KEY}:user:${encodeURIComponent(String(user.id))}`;
    if (user?.email) return `${LEGACY_KEY}:email:${encodeURIComponent(user.email.trim().toLowerCase())}`;
  } catch { /* A missing session never grants another account's list. */ }
  return VISITOR_KEY;
}
function readList(key, strict = false) {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) throw new Error('Invalid favorites');
    return [...new Set(parsed.filter(id => typeof id === 'string' || typeof id === 'number').map(String))];
  } catch {
    if (strict) throw new Error('Não foi possível ler os favoritos. Os dados anteriores foram preservados.');
    return [];
  }
}
export const getGuestFavorites = () => {
  try { return globalThis.localStorage?.getItem(VISITOR_KEY) == null ? readList(LEGACY_KEY) : readList(VISITOR_KEY); } catch { return []; }
};
export const getFavorites = () => {
  if (typeof window === 'undefined') return [];
  const key = getFavoriteOwnerKey();
  try { return key === VISITOR_KEY && globalThis.localStorage?.getItem(key) == null ? readList(LEGACY_KEY) : readList(key); } catch { return []; }
};
export function notifyFavoritesSession() {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVENT_NAME));
}
function saveList(key, ids) {
  try { globalThis.localStorage.setItem(key, JSON.stringify(ids)); }
  catch { throw new Error('Não foi possível salvar os favoritos neste navegador. Tente novamente.'); }
  notifyFavoritesSession();
  return ids;
}
export const isFavorite = carId => carId != null && getFavorites().includes(String(carId));
export function toggleFavorite(carId) {
  if (carId == null || carId === '') return getFavorites();
  const key = getFavoriteOwnerKey();
  // Preserve old lists unchanged. Once the visitor writes a new list, it becomes authoritative.
  const ids = key === VISITOR_KEY && globalThis.localStorage?.getItem(key) == null ? readList(LEGACY_KEY, true) : readList(key, true);
  const id = String(carId);
  return saveList(key, ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]);
}
export function removeFavorite(carId) {
  if (carId == null || carId === '') return getFavorites();
  const key = getFavoriteOwnerKey();
  const ids = key === VISITOR_KEY && globalThis.localStorage?.getItem(key) == null ? readList(LEGACY_KEY, true) : readList(key, true);
  return saveList(key, ids.filter(id => id !== String(carId)));
}
export function importGuestFavorites() {
  const key = getFavoriteOwnerKey();
  if (key === VISITOR_KEY) return getFavorites();
  const guest = globalThis.localStorage?.getItem(VISITOR_KEY) == null ? readList(LEGACY_KEY, true) : readList(VISITOR_KEY, true);
  return saveList(key, [...new Set([...readList(key, true), ...guest])]);
}
export const subscribeFavorites = callback => {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback(getFavorites());
  const storageHandler = event => { if (event.key == null || event.key.startsWith(LEGACY_KEY)) handler(); };
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', storageHandler);
  return () => { window.removeEventListener(EVENT_NAME, handler); window.removeEventListener('storage', storageHandler); };
};
