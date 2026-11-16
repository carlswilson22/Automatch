/** Aceita o parecer salvo pela API, tanto JSON quanto objeto ou envelope de upload. */
export function parseInspectionFeedback(value) {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const ia = parsed.ia_feedback || parsed;
    return typeof ia.classificacao_geral === 'string' ? ia : null;
  } catch {
    return null;
  }
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}
