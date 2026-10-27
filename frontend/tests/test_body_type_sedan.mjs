/**
 * test_body_type_sedan.mjs — Testes de validação dos tipos de carroceria (sedan, SUV, hatch).
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para validar que a classificação de carroceria e seus filtros de busca
 *     operam com precisão técnica em todo o catálogo.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { filterVehicles, normalizeBodyType } from '../src/utils/filterVehicles.js';
import { normalizeVehicle } from '../src/utils/vehicleNormalizer.js';
import { mapVehicleToViewModel } from '../src/utils/vehicleMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('BATERIA DE TESTES - TAREFA 4: Correção Ortográfica e Filtro Sedan', () => {
  const catalogPath = path.join(rootDir, 'src/pages/ShowcaseCatalog.jsx');
  const favoritesPath = path.join(rootDir, 'src/pages/FavoritesPage.jsx');
  const detailsPath = path.join(rootDir, 'src/pages/ShowcaseVehicleDetails.jsx');

  const catalogContent = fs.readFileSync(catalogPath, 'utf-8');
  const favoritesContent = fs.readFileSync(favoritesPath, 'utf-8');
  const detailsContent = fs.readFileSync(detailsPath, 'utf-8');

  test('4.1: ShowcaseCatalog.jsx lista "Sedan" em BODY_TYPES e não contém "Seda"', () => {
    assert.ok(
      catalogContent.includes("const BODY_TYPES = ['Todos', 'Sedan', 'SUV', 'Hatch', 'Picape'];"),
      'BODY_TYPES deve conter Sedan como categoria oficial'
    );
    assert.ok(
      !catalogContent.includes("'Seda'"),
      'A grafia incorreta Seda não deve constar em ShowcaseCatalog.jsx'
    );
  });

  test('4.2: FavoritesPage.jsx e ShowcaseVehicleDetails.jsx usam "Sedan"', () => {
    assert.ok(!favoritesContent.includes("'Seda'"), 'FavoritesPage não deve ter fallback Seda');
    assert.ok(!detailsContent.includes("'Sedã'"), 'ShowcaseVehicleDetails não deve ter fallback Sedã');
    assert.ok(favoritesContent.includes("'Sedan'"), 'FavoritesPage deve usar Sedan');
    assert.ok(detailsContent.includes("'Sedan'"), 'ShowcaseVehicleDetails deve usar Sedan');
  });

  test('4.3: normalizeBodyType canonicaliza variações ("Seda", "Sedã", "sedan") para "sedan"', () => {
    assert.strictEqual(normalizeBodyType('Seda'), 'sedan');
    assert.strictEqual(normalizeBodyType('Sedã'), 'sedan');
    assert.strictEqual(normalizeBodyType('seda'), 'sedan');
    assert.strictEqual(normalizeBodyType('sedã'), 'sedan');
    assert.strictEqual(normalizeBodyType('Sedan'), 'sedan');
    assert.strictEqual(normalizeBodyType('sedan'), 'sedan');
  });

  test('4.4: filterVehicles com filtro bodyType="Sedan" encontra veículos cadastrados com Sedan, Seda ou Sedã', () => {
    const mockList = [
      { id: '1', name: 'Carro 1', bodyType: 'Sedan', price: 90000 },
      { id: '2', name: 'Carro 2', bodyType: 'Seda', price: 85000 },
      { id: '3', name: 'Carro 3', body_type: 'Sedã', price: 80000 },
      { id: '4', name: 'Carro 4', bodyType: 'SUV', price: 150000 },
      { id: '5', name: 'Carro 5', bodyType: 'Hatch', price: 70000 },
    ];

    const result = filterVehicles(mockList, { bodyType: 'Sedan' });
    assert.strictEqual(result.length, 3, 'Deve encontrar os 3 sedans independentemente da variação ortográfica legada');
    assert.deepStrictEqual(result.map(c => c.id), ['1', '2', '3']);
  });

  test('4.5: vehicleNormalizer e vehicleMapper convertem Seda/Sedã para Sedan', () => {
    const rawLegacy1 = { id: 'x1', marca: 'Honda', modelo: 'Civic', body_type: 'Seda' };
    const rawLegacy2 = { id: 'x2', marca: 'Toyota', modelo: 'Corolla', bodyType: 'Sedã' };

    const norm1 = normalizeVehicle(rawLegacy1);
    const norm2 = normalizeVehicle(rawLegacy2);
    assert.strictEqual(norm1.bodyType, 'Sedan', 'vehicleNormalizer deve mapear Seda para Sedan');
    assert.strictEqual(norm2.bodyType, 'Sedan', 'vehicleNormalizer deve mapear Sedã para Sedan');

    const mapped1 = mapVehicleToViewModel(rawLegacy1);
    const mapped2 = mapVehicleToViewModel(rawLegacy2);
    assert.strictEqual(mapped1.bodyType, 'Sedan', 'vehicleMapper deve mapear Seda para Sedan');
    assert.strictEqual(mapped2.bodyType, 'Sedan', 'vehicleMapper deve mapear Sedã para Sedan');
  });
});
