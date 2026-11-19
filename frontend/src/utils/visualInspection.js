/** Contrato único de inspeção visual. Resultados antigos não certificam lataria. */
export const VISUAL_SCHEMA_VERSION = 2;
export const VISUAL_NOTICE = 'Análise automática por imagens; não substitui a vistoria presencial.';
const states = new Set(['damage_detected', 'inconclusive', 'no_damage_detected']);
export function readVisualInspection(value) {
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { return null; }
  }
  value = value?.visual_inspection || value;
  if (!value || value.schema_version !== VISUAL_SCHEMA_VERSION || !states.has(value.analysis_state)) return null;
  if (value.analysis_state !== 'inconclusive' && value.damage_detection_validated !== true) {
    return { ...value, analysis_state: 'inconclusive', pontos_avaria: [], damage_confidence: null };
  }
  return value;
}
export function vehicleInspection(car) {
  const result = readVisualInspection(car?.visualInspection || car?.visual_inspection || car?.laudoFeedback || car?.laudo_feedback);
  if (result?.car_id && String(result.car_id) !== String(car?.id)) return null;
  if (result?.source_image && result.source_image !== car?.image && result.source_image !== car?.imagem) return null;
  return result;
}
export function inspectionLabel(value) {
  const inspection = readVisualInspection(value);
  if (!inspection) return 'Análise visual não realizada';
  if (inspection.analysis_state === 'damage_detected') return 'Avaria detectada (alta confiança)';
  if (inspection.analysis_state === 'no_damage_detected') return 'Nenhuma avaria detectada na análise automática';
  return 'Análise inconclusiva, confirme com vistoria presencial';
}
export function trustedDamagePoints(value) {
  const result = readVisualInspection(value);
  return result?.analysis_state === 'damage_detected' && result.damage_detection_validated === true
    && Array.isArray(result.pontos_avaria) ? result.pontos_avaria : [];
}
