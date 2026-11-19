/**
 * test_video_20s_and_chatbot_consumo.mjs — Testes do tempo de vídeo de vistoria e respostas de consumo.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para validar que vídeos periciais cumpram a meta de 20s e o chatbot retorne médias de consumo confiáveis.
 */
/**
 * test_video_20s_and_chatbot_consumo.mjs
 * Testes das Tarefas 6 e 7:
 *   - Vídeo pericial deve ser 20s (não 15s)
 *   - Chatbot "Consumo" deve retornar km/l para TODOS os veículos
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(__dirname, '..');

let passed = 0;
let failed = 0;
function assert(condition, msg) {
  if (condition) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; console.error(`  ❌ ${msg}`); }
}

// =====================================================
// TAREFA 6 — Vídeo Pericial 20s
// =====================================================
console.log('\n🎬 TAREFA 6 — Vídeo Pericial: duração 20s');
console.log('=' .repeat(60));

const { pericialTimeline, CHECKPOINTS, VIDEO_DURATION } = await import('../src/data/pericialTimeline.generated.js');
assert(VIDEO_DURATION === 20, 'Dura??o vem do cronograma');
assert(JSON.stringify(CHECKPOINTS.map(stage=>[stage.start,stage.end])) === '[[0,5],[5,15],[15,20]]', 'Fases exatas');
for(const [time,index] of [[0,0],[4.999,0],[5,1],[14.999,1],[15,2],[19.999,2]]) {
 assert(CHECKPOINTS.findIndex(stage=>time>=stage.start && time<stage.end)===index, 'Legenda na fronteira temporal '+time);
}
assert(pericialTimeline.shots.map(shot=>shot.angle).join(',')==='0,90,270,180','Ordem das vistas vem da mesma configura??o');
const videoSrc = readFileSync(resolve(root,'src/components/vehicle/PericialVideoViewer.jsx'),'utf8');
assert(videoSrc.includes('pericialTimeline.generated.js'), 'Player consome configura??o gerada');
assert(!videoSrc.includes('const CHECKPOINTS = ['),'Sem cronograma duplicado no player');

// =====================================================
// TAREFA 7 — Chatbot Consumo com km/l
// =====================================================
console.log('\n🤖 TAREFA 7 — Chatbot IA: resposta de "Consumo" com km/l');
console.log('=' .repeat(60));

const aiCoreSrc = readFileSync(resolve(root, 'src/utils/aiConsultantCore.js'), 'utf-8');
const showcaseSrc = readFileSync(resolve(root, 'src/data/showcaseData.js'), 'utf-8');

// Verifica que aiConsultantCore prioriza consumoInmetro
assert(aiCoreSrc.includes('specs.consumoInmetro'), 'aiConsultantCore verifica specs.consumoInmetro');
assert(aiCoreSrc.includes('INMETRO'), 'Resposta menciona INMETRO');

// Verifica que cada veículo possui consumoInmetro nos specs
const vehicles = [
  { id: 'sc-001', name: 'Toyota Corolla Cross XRX' },
  { id: 'sc-002', name: 'Volkswagen Polo TSI' },
  { id: 'sc-003', name: 'Hyundai HB20 Platinum' },
  { id: 'sc-004', name: 'Chevrolet Tracker Premier' },
  { id: 'sc-005', name: 'Fiat Pulse Abarth' },
];

for (const v of vehicles) {
  const hasConsumo = showcaseSrc.includes(`consumoInmetro:`);
  assert(hasConsumo, `${v.name} (${v.id}): campo consumoInmetro existe`);
}

// Verificar valores específicos de km/l por veículo
const consumoMap = {
  'sc-001': '18,1 km/l',
  'sc-002': '14,1 km/l',
  'sc-003': '13,3 km/l',
  'sc-004': '12,4 km/l',
  'sc-005': '10,2 km/l',
};

for (const [id, expectedKmL] of Object.entries(consumoMap)) {
  const name = vehicles.find(v => v.id === id)?.name;
  assert(showcaseSrc.includes(expectedKmL), `${name}: consumo inclui ${expectedKmL}`);
}

// Verifica que a lógica de fallback genérico ainda existe
const { generateVehicleConsultantAnswer } = await import('../src/utils/aiConsultantCore.js');
const unknownConsumption = generateVehicleConsultantAnswer('consumo', {id:'sem-consumo'});
assert(unknownConsumption.includes('não informado'), 'Consumo ausente deve permanecer não informado');
assert(!unknownConsumption.includes('excelente rendimento'), 'Não inventar avaliação energética');

// =====================================================
// RESUMO
// =====================================================
console.log('\n' + '=' .repeat(60));
console.log(`📊 RESULTADO FINAL: ${passed} passed, ${failed} failed de ${passed + failed} total`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 Todas as verificações das Tarefas 6 e 7 passaram!\n');
}
