import { test } from 'node:test';
import assert from 'node:assert/strict';
import { showcaseCars } from '../src/data/showcaseData.js';
import { mapVehicleToViewModel, isComplete360Set } from '../src/utils/vehicleMapper.js';
import { vehicleInspection, trustedDamagePoints, readVisualInspection } from '../src/utils/visualInspection.js';

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

// --- Testes do método calibrado Gemini Vision ---
const SCHEMA_V2 = 2;
const METHOD_VERSION = 'visual-evidence-v2';
const CALIBRATION_ID = 'gemini-vision-v1';

function makeGeminiContract({ damagePoints = [], car_id = null } = {}) {
  return {
    schema_version: SCHEMA_V2,
    analysis_state: damagePoints.length > 0 ? 'damage_detected' : 'inconclusive',
    modelo: 'Gemini Vision',
    method_version: METHOD_VERSION,
    calibration_id: CALIBRATION_ID,
    damage_detection_validated: damagePoints.length > 0,
    pontos_avaria: damagePoints,
    damage_confidence: null,
    score_lataria: null,
    ...(car_id ? { car_id } : {}),
  };
}

test('gemini-vision-v1 com avaria é aceito como método calibrado', () => {
  const contract = makeGeminiContract({
    damagePoints: [{ descricao: 'arranhão na lateral esquerda', source: 'gemini-vision-v1', x: null, y: null }],
  });
  const result = readVisualInspection(contract);
  assert.ok(result, 'readVisualInspection deve retornar objeto não-nulo');
  assert.equal(result.analysis_state, 'damage_detected');
  assert.equal(result.damage_detection_validated, true);
  assert.equal(result.pontos_avaria.length, 1);
  assert.equal(result.damage_confidence, null, 'nunca deve inventar probabilidade');
});

test('gemini-vision-v1 sem avaria retorna inconclusive aceito', () => {
  const contract = makeGeminiContract({ damagePoints: [] });
  // inconclusive é sempre aceito independente do método
  const result = readVisualInspection(contract);
  assert.ok(result);
  assert.equal(result.analysis_state, 'inconclusive');
});

test('contrato forjado com calibration_id falso é rebaixado para inconclusive', () => {
  const forged = {
    schema_version: SCHEMA_V2,
    analysis_state: 'damage_detected',
    modelo: 'Gemini Vision',
    method_version: METHOD_VERSION,
    calibration_id: 'falso-nao-calibrado',
    damage_detection_validated: true,
    pontos_avaria: [{ descricao: 'INVENTADO', x: 10, y: 20 }],
  };
  const result = readVisualInspection(forged);
  assert.ok(result);
  assert.equal(result.analysis_state, 'inconclusive', 'calibration_id falso deve ser rebaixado');
  assert.deepEqual(result.pontos_avaria, []);
});

test('contrato sem damage_detection_validated=true é sempre inconclusive', () => {
  const contract = {
    schema_version: SCHEMA_V2,
    analysis_state: 'damage_detected',
    modelo: 'Gemini Vision',
    method_version: METHOD_VERSION,
    calibration_id: CALIBRATION_ID,
    damage_detection_validated: false,  // não validado
    pontos_avaria: [{ descricao: 'arranhão', x: null, y: null }],
  };
  const result = readVisualInspection(contract);
  assert.equal(result.analysis_state, 'inconclusive');
});

