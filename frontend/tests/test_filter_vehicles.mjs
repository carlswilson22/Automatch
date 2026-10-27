/**
 * test_filter_vehicles.mjs — Testes unitários do algoritmo de filtragem combinada de veículos.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para testar exaustivamente múltiplos filtros combinados (faixa de preço, ano, quilometragem).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { filterVehicles, PRICE_RANGES, KM_RANGES } from '../src/utils/filterVehicles.js';

const mockCars = [
  { id: '1', brand: 'Toyota', model: 'Corolla', year: 2024, price: 180000, mileage: 12000, bodyType: 'Sedan', storeId: 'store-1', featured: true },
  { id: '2', brand: 'Volkswagen', model: 'Polo', year: 2023, price: 95000, mileage: 18000, bodyType: 'Hatchback', storeId: 'store-2', featured: false },
  { id: '3', brand: 'Hyundai', model: 'HB20', year: 2022, price: 78000, mileage: 32000, bodyType: 'Hatchback', storeId: 'store-1', featured: false },
  { id: '4', brand: 'Chevrolet', model: 'Tracker', year: 2023, price: 115000, mileage: 25000, bodyType: 'SUV', storeId: 'store-2', featured: true },
  { id: '5', brand: 'Fiat', model: 'Pulse', year: 2021, price: 79000, mileage: 48000, bodyType: 'SUV', storeId: 'store-3', featured: false }
];

describe('GAR-02: Motor de Filtragem de Veículos (filterVehicles)', () => {
  test('Filtro de Ano (filterYear) isola corretamente os veículos pelo ano', () => {
    const res2023 = filterVehicles(mockCars, { year: 2023 });
    assert.strictEqual(res2023.length, 2);
    assert.ok(res2023.every(c => c.year === 2023));

    const res2024 = filterVehicles(mockCars, { year: 2024 });
    assert.strictEqual(res2024.length, 1);
    assert.strictEqual(res2024[0].model, 'Corolla');
  });

  test('Filtro de Faixa de Preço (filterPrice) restringe corretamente os valores', () => {
    // Até R$ 80.000
    const resAte80k = filterVehicles(mockCars, { price: 'Até R$ 80.000' });
    assert.strictEqual(resAte80k.length, 2);
    assert.ok(resAte80k.every(c => c.price <= 80000));

    // Acima de R$ 150.000 a R$ 200.000
    const res150k200k = filterVehicles(mockCars, { price: 'R$ 150.000 a R$ 200.000' });
    assert.strictEqual(res150k200k.length, 1);
    assert.strictEqual(res150k200k[0].model, 'Corolla');
  });

  test('Combinações de filtros múltiplos (Ano + Marca + Preço)', () => {
    const res = filterVehicles(mockCars, {
      brand: 'Chevrolet',
      year: 2023,
      price: 'R$ 80.000 a R$ 150.000'
    });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].model, 'Tracker');
  });

  test('Filtro por loja e quilometragem', () => {
    const res = filterVehicles(mockCars, {
      store: 'store-1',
      km: 'Até 30.000 km'
    });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].model, 'Corolla');
  });

  test('Nenhum resultado retorna array vazio de forma resiliente', () => {
    const res = filterVehicles(mockCars, {
      brand: 'Ferrari',
      year: 2024
    });
    assert.strictEqual(res.length, 0);
  });

  test('Reset / Limpar Filtros devolve a totalidade dos itens ordenados', () => {
    const res = filterVehicles(mockCars, {
      store: 'Todas',
      brand: 'Todas',
      bodyType: 'Todos',
      year: 'Todos',
      price: 'Qualquer',
      km: 'Qualquer'
    });
    assert.strictEqual(res.length, mockCars.length);
  });
});
