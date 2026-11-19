/** Contrato único de inspeção visual. Resultados antigos não certificam lataria. */
export const VISUAL_SCHEMA_VERSION = 2;
export const VISUAL_NOTICE = 'Análise automática por imagens; não substitui a vistoria presencial.';
export const INSPECTION_LABELS = {
  damage_detected: 'Avaria detectada (alta confiança)',
  inconclusive: 'Análise inconclusiva, confirme com vistoria presencial',
  no_damage_detected: 'Nenhuma avaria detectada na análise automática',
};
// Nenhum método de dano foi homologado; um booleano enviado pelo cliente não basta.
// gemini-vision-v1: Gemini Vision com prompt estruturado de evidência visual (ativado em 2026-11-19).
const calibratedMethods = new Set([
  'Gemini Vision:visual-evidence-v2:gemini-vision-v1',
]);
const states = new Set(['damage_detected', 'inconclusive', 'no_damage_detected']);
export function readVisualInspection(value) {
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { return null; }
  }
  value = value?.visual_inspection || value;
  if (!value || value.schema_version !== VISUAL_SCHEMA_VERSION || !states.has(value.analysis_state)) return null;
  if (value.analysis_state !== 'inconclusive' && (value.damage_detection_validated !== true || !calibratedMethods.has([value.modelo, value.method_version, value.calibration_id].join(':')))) {
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
  return INSPECTION_LABELS[inspection.analysis_state];
}
export function trustedDamagePoints(value) {
  const result = readVisualInspection(value);
  return result?.analysis_state === 'damage_detected' && result.damage_detection_validated === true
    && Array.isArray(result.pontos_avaria) ? result.pontos_avaria : [];
}
