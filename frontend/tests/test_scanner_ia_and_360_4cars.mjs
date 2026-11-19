import { test } from 'node:test';
import assert from 'node:assert/strict';
import { showcaseCars } from '../src/data/showcaseData.js';
import { mapVehicleToViewModel, isComplete360Set } from '../src/utils/vehicleMapper.js';
import { vehicleInspection, trustedDamagePoints } from '../src/utils/visualInspection.js';

test('catálogo inteiro não transforma apontamento fictício em inspeção', () => {
 for (const car of showcaseCars) {
  const view = mapVehicleToViewModel(car);
  assert.equal(vehicleInspection(view), null, car.id);
  assert.deepEqual(trustedDamagePoints(vehicleInspection(view)), [], car.id);
  assert.deepEqual(car.damagePoints || [], [], car.id);
 }
});
test('quatro conjuntos orbitais pertencem ao anúncio exato; Pulse permanece indisponível', () => {
 for (const car of showcaseCars.slice(0,4)) {
  assert.ok(isComplete360Set(mapVehicleToViewModel(car).photos360));
  for (const url of Object.values(car.photos360)) assert.ok(url.includes('/'+car.id+'/'));
 }
 assert.equal(mapVehicleToViewModel(showcaseCars[4]).photos360, null);
});
test('IDs numéricos, prefixos de UUID e nomes semelhantes não emprestam fotos do catálogo', () => {
 for (const id of ['1','4a14b56e-aaaa-bbbb-cccc-d12345678901','sc-004-extra']) {
  assert.equal(mapVehicleToViewModel({id,brand:'Chevrolet',model:'Tracker Premier'}).photos360,null,id);
 }
});
test('oito ângulos precisam de oito URLs distintas', () => {
 const set = {...showcaseCars[0].photos360,315:showcaseCars[0].photos360[0]};
 assert.equal(isComplete360Set(set),false);
});
