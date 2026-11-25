import { parseVehicleNumber } from './vehicleNumbers.js';

export const UNKNOWN_VEHICLE_VALUE = 'Não informado';

const LAUDO_STATUS_LABELS = Object.freeze({
  sem_ressalvas: 'Aprovado sem ressalvas',
  com_atencao: 'Aprovado com apontamento',
  com_restricoes: 'Reprovado / Com restrições',
  approved_100: 'Aprovado 100%',
});

/** Normalizes raw status fields without inventing data for missing values. */
export function vehicleStatusValue(value) {
  if (value == null || String(value).trim() === '') return UNKNOWN_VEHICLE_VALUE;
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  return String(value).trim();
}

/** Formats technical inspection enums (e.g. SEM_RESSALVAS, approved_100) into readable Portuguese labels. */
export function formatLaudoStatusLabel(value) {
  const normalized = vehicleStatusValue(value);
  if (normalized === UNKNOWN_VEHICLE_VALUE) return normalized;
  return LAUDO_STATUS_LABELS[normalized.toLowerCase()] || normalized;
}

/**
 * Classifies vehicle inspection compliance across declared laudo status, PDF AI audit,
 * and visual AI scanner state without false-positive substring matches (e.g. "sem apontamentos").
 */
export function classifyVehicleCompliance({ laudoStatus, parsedIa, visualInspection } = {}) {
  const text = String(laudoStatus || '').trim().toLowerCase();
  const iaClass = String(parsedIa?.classificacao_geral || '').trim().toUpperCase();
  const visualState = visualInspection?.analysis_state;

  const isCritical = iaClass === 'COM_RESTRICOES'
    || text.includes('reprovado')
    || text.includes('restric')
    || text.includes('restriç');
  if (isCritical) {
    return { level: 'critical', badgeLabel: 'Laudo: Restrições Críticas' };
  }

  const excludesWarning = text.includes('sem apontamento') || text.includes('sem ressalva');
  const textHasWarning = !excludesWarning && (
    text.includes('apontamento')
    || text.includes('atenção')
    || text.includes('atencao')
    || text.includes('ressalva')
  );
  if (iaClass === 'COM_ATENCAO' || visualState === 'damage_detected' || textHasWarning) {
    return { level: 'warning', badgeLabel: 'Laudo Verificado por IA: Com Apontamento' };
  }

  const isApproved = iaClass === 'SEM_RESSALVAS'
    || text.includes('sem apontamento')
    || text.includes('sem ressalva')
    || text.includes('sem_ressalva')
    || text.includes('aprovado 100%')
    || text.includes('approved_100')
    || text.includes('aprovado');
  if (isApproved) {
    return { level: 'approved', badgeLabel: 'Laudo Verificado por IA: Sem Ressalvas' };
  }

  return { level: 'neutral', badgeLabel: 'Laudo Verificado por IA: Conferência Pendente' };
}

/** Returns the semantic UI tone ('positive' | 'warning' | 'critical' | 'neutral') for a status pill. */
export function getStatusTone(label, value) {
  const normalized = vehicleStatusValue(value);
  if (normalized === UNKNOWN_VEHICLE_VALUE) return 'neutral';
  const text = normalized.toLowerCase();
  if (String(label || '').toLowerCase().includes('laudo')) {
    const level = classifyVehicleCompliance({ laudoStatus: normalized }).level;
    return level === 'approved' ? 'positive' : level;
  }
  if (text.includes('sem débito') || text.includes('sem debito') || text.includes('quitad') || text.includes('licenciado') || text.includes('sem passagem')) {
    return 'positive';
  }
  if (text.includes('com débito') || text.includes('com debito') || text.includes('multa') || text.includes('com passagem') || text.includes('sinistro')) {
    return 'warning';
  }
  return 'neutral';
}

export function formatVehicleMileage(value) {
  const number = parseVehicleNumber(value, null);
  return number == null || number < 0 ? UNKNOWN_VEHICLE_VALUE : `${number.toLocaleString('pt-BR')} km`;
}

export function getVehicleStatusRows(car) {
  return [
    ['Laudo informado', formatLaudoStatusLabel(car?.laudoStatus ?? car?.laudo_status ?? car?.laudo)],
    ['Débitos informados', vehicleStatusValue(car?.debtStatus ?? car?.debt_status ?? car?.debitos)],
    ['Leilão informado', vehicleStatusValue(car?.auctionHistory ?? car?.auction_history ?? car?.leilao)],
  ];
}
