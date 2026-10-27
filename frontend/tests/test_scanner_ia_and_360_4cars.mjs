/**
 * test_scanner_ia_and_360_4cars.mjs
 * Teste específico para o Scanner de IA e a Varredura 360° em 4 veículos:
 *   - 2 carros SEM avarias na lataria (sc-001 Toyota Corolla Cross e sc-002 VW Polo TSI)
 *   - 2 carros COM avarias na lataria (sc-004 Chevrolet Tracker e sc-005 Fiat Pulse Abarth)
 */

import { showcaseCars } from '../src/data/showcaseData.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${msg}`);
  } else {
    failed++;
    console.error(`  ❌ ${msg}`);
  }
}

console.log('\n============================================================');
console.log('🧪 TESTE: SCANNER DE IA & VARREDURA 360° (4 VEÍCULOS)');
console.log('============================================================\n');

// 1. CARRO 1: Toyota Corolla Cross XRX (sc-001) - SEM AVARIAS
console.log('🚗 Carro 1: sc-001 - Toyota Corolla Cross XRX (SEM AVARIAS)');
const car1 = showcaseCars.find(c => c.id === 'sc-001');
assert(car1 !== undefined, 'Carro sc-001 encontrado na vitrine');
assert(!car1.damagePoints || car1.damagePoints.length === 0, 'sc-001 não possui avarias na lataria (100% Íntegro)');
assert(car1.photos360 && Object.keys(car1.photos360).length === 8, 'sc-001 possui todos os 8 ângulos da Varredura 360°');
for (const ang of [0, 45, 90, 135, 180, 225, 270, 315]) {
  assert(Boolean(car1.photos360[ang]), `sc-001: ângulo ${ang}° presente no 360°`);
}

// 2. CARRO 2: Volkswagen Polo TSI (sc-002) - SEM AVARIAS (CORREÇÃO DA FALHA ANTERIOR)
console.log('\n🚗 Carro 2: sc-002 - Volkswagen Polo TSI (SEM AVARIAS - CORRIGIDO)');
const car2 = showcaseCars.find(c => c.id === 'sc-002');
assert(car2 !== undefined, 'Carro sc-002 encontrado na vitrine');
assert(Array.isArray(car2.damagePoints) && car2.damagePoints.length === 0, 'sc-002 corrigido: ZERO avarias fantasma (100% Íntegro, sem defeito no para-choque)');
assert(car2.photos360 && Object.keys(car2.photos360).length === 8, 'sc-002 possui todos os 8 ângulos da Varredura 360°');
for (const ang of [0, 45, 90, 135, 180, 225, 270, 315]) {
  assert(Boolean(car2.photos360[ang]), `sc-002: ângulo ${ang}° presente no 360°`);
}

// 3. CARRO 3: Chevrolet Tracker Premier (sc-004) - COM AVARIAS
console.log('\n🚗 Carro 3: sc-004 - Chevrolet Tracker Premier (COM AVARIAS MAPEADAS)');
const car3 = showcaseCars.find(c => c.id === 'sc-004');
assert(car3 !== undefined, 'Carro sc-004 encontrado na vitrine');
assert(Array.isArray(car3.damagePoints) && car3.damagePoints.length >= 1, `sc-004 possui ${car3.damagePoints?.length} avaria(s) mapeada(s)`);
const dpTracker = car3.damagePoints[0];
assert(dpTracker.part.includes('Retrovisor'), `sc-004: avaria identificada corretamente em '${dpTracker.part}'`);
assert(dpTracker.type.includes('Risco'), `sc-004: tipo de dano é '${dpTracker.type}'`);
assert(car3.photos360 === null, 'sc-004 acusa varredura 360° indisponível com integridade (ACH-05)');

// 4. CARRO 4: Fiat Pulse Abarth (sc-005) - COM AVARIAS
console.log('\n🚗 Carro 4: sc-005 - Fiat Pulse Abarth (COM AVARIAS MAPEADAS)');
const car4 = showcaseCars.find(c => c.id === 'sc-005');
assert(car4 !== undefined, 'Carro sc-005 encontrado na vitrine');
assert(Array.isArray(car4.damagePoints) && car4.damagePoints.length >= 1, `sc-005 possui ${car4.damagePoints?.length} avaria(s) mapeada(s)`);
const dpPulse = car4.damagePoints[0];
assert(dpPulse.part.includes('Spoiler') || dpPulse.part.includes('Para-choque'), `sc-005: avaria identificada corretamente em '${dpPulse.part}'`);
assert(dpPulse.type.includes('Ralado'), `sc-005: tipo de dano é '${dpPulse.type}'`);
assert(car4.photos360 === null, 'sc-005 acusa varredura 360° indisponível com integridade (ACH-05)');

// BALANCEAMENTO FINAL
console.log('\n📊 BALANCEAMENTO:');
const semAvarias = [car1, car2].filter(c => !c.damagePoints || c.damagePoints.length === 0);
const comAvarias = [car3, car4].filter(c => c.damagePoints && c.damagePoints.length > 0);
assert(semAvarias.length === 2, `Exatamente 2 veículos SEM avarias (sc-001 e sc-002)`);
assert(comAvarias.length === 2, `Exatamente 2 veículos COM avarias (sc-004 e sc-005)`);

console.log('\n' + '='.repeat(60));
console.log(`📊 RESULTADO: ${passed} passaram, ${failed} falharam de ${passed + failed} verificações`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 Scanner de IA e Varredura 360° 100% validados para os 4 carros!\n');
}
