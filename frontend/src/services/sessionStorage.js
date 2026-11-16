/** Lê apenas a sessão da aba atual; credenciais antigas de localStorage não são aceitas. */
export function readSessionToken() {
  try {
    const token = sessionStorage.getItem('automatch_token');
    if (token) return token;
    const user = JSON.parse(sessionStorage.getItem('automatch_user') || 'null');
    return typeof user?.token === 'string' ? user.token : null;
  } catch {
    return null;
  }
}

export function canUseOfflineFallback(error, demoEnabled) {
  return demoEnabled && (error?.status === 0 || error?.status === 404 || error?.status === 405 || error?.status >= 500);
}
