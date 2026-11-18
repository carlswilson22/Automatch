import { parseVehicleNumber } from './vehicleNumbers.js';

export const UNKNOWN_VEHICLE_VALUE = 'Não informado';
export function vehicleStatusValue(value) {
  if (value == null || String(value).trim() === '') return UNKNOWN_VEHICLE_VALUE;
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  return String(value).trim();
}
export function formatVehicleMileage(value) {
  const number = parseVehicleNumber(value, null);
  return number == null || number < 0 ? UNKNOWN_VEHICLE_VALUE : `${number.toLocaleString('pt-BR')} km`;
}
export function getVehicleStatusRows(car) {
  return [
    ['Laudo informado', vehicleStatusValue(car?.laudoStatus ?? car?.laudo_status ?? car?.laudo)],
    ['Débitos informados', vehicleStatusValue(car?.debtStatus ?? car?.debt_status ?? car?.debitos)],
    ['Leilão informado', vehicleStatusValue(car?.auctionHistory ?? car?.auction_history ?? car?.leilao)],
  ];
}
