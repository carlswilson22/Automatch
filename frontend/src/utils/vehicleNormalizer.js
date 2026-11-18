import { mapVehicleToViewModel } from './vehicleMapper.js';
import { formatVehicleMileage } from './vehicleInformation.js';

/** Shared view model, with display values; never manufactures inspection or FIPE data. */
export function normalizeVehicle(rawCar) {
  const car = mapVehicleToViewModel(rawCar);
  if (!car) return null;
  return {
    ...car,
    formattedPrice: car.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    formattedFipePrice: car.fipePrice == null ? 'Não informado' : car.fipePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    formattedMileage: formatVehicleMileage(car.mileage),
    storeId: car.storeId == null ? null : Number(String(car.storeId).replace(/^store-/, '')) || null,
  };
}
export function normalizeVehicleList(cars) {
  return Array.isArray(cars) ? cars.map(normalizeVehicle).filter(Boolean) : [];
}
