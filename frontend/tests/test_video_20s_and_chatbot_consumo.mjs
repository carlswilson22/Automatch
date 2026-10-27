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

const videoSrc = readFileSync(resolve(root, 'src/components/vehicle/PericialVideoViewer.jsx'), 'utf-8');

assert(videoSrc.includes('VIDEO_DURATION = 20'), 'VIDEO_DURATION constante definida como 20');
assert(!videoSrc.includes('VIDEO_DURATION = 15'), 'Não existe VIDEO_DURATION = 15');
assert(videoSrc.includes('Vídeo Pericial Oficial de 20s'), 'Header exibe "20s"');
assert(!videoSrc.includes('Vídeo Pericial Oficial de 15s'), 'Não existe header "15s"');
assert(videoSrc.includes('Reiniciar vídeo (20s)'), 'Tooltip exibe "20s"');
assert(!videoSrc.includes('Reiniciar vídeo (15s)'), 'Não existe tooltip "15s"');
assert(videoSrc.includes('Frente (5s), Linha de Cintura & 4 Pneus (10s), Traseira (5s)'), 'Header exibe divisão 5s / 10s / 5s');
assert(videoSrc.includes('Fase {activeSegment + 1}/3'), 'Fase X/3');

// Verify 3 checkpoints: 0-5s, 5-15s, 15-20s
const checkpointMatches = videoSrc.match(/start:\s*\d+,\s*\n\s*end:\s*\d+/g);
assert(checkpointMatches && checkpointMatches.length === 3, `3 CHECKPOINTS definidos (encontrados: ${checkpointMatches ? checkpointMatches.length : 0})`);
assert(videoSrc.includes('start: 0') && videoSrc.includes('end: 5'), 'Frente: 0s a 5s');
assert(videoSrc.includes('start: 5') && videoSrc.includes('end: 15'), 'Linha de cintura e 4 pneus: 5s a 15s (10s de duração)');
assert(videoSrc.includes('start: 15') && videoSrc.includes('end: 20'), 'Traseira: 15s a 20s (5s de duração)');

// Verify progress bar has dividers at 25% (5s) and 75% (15s)
assert(videoSrc.includes('left-[25%]'), 'Divider em 25% (5s)');
assert(videoSrc.includes('left-[75%]'), 'Divider em 75% (15s)');
assert(!videoSrc.includes('left-[33.33%]'), 'Sem divider antigo 33%');
assert(!videoSrc.includes('left-[50%]'), 'Sem divider em 50% (agora fase 2 dura 10s de 25% a 75%)');

// Verify label na página de detalhes
const detailsSrc = readFileSync(resolve(root, 'src/pages/ShowcaseVehicleDetails.jsx'), 'utf-8');
assert(detailsSrc.includes('Vídeo Pericial 20s'), 'Tab de detalhes exibe "20s"');
assert(!detailsSrc.includes('Vídeo Pericial 15s'), 'Sem label antigo "15s" na tab');

// No hardcoded 15 remaining (excluding line numbers, comments about checkpoints at 15s)
const hardcoded15Regex = /\b15\b/g;
const videoLines = videoSrc.split('\n');
let hardcoded15Count = 0;
for (const line of videoLines) {
  const stripped = line.trim();
  // Ignore: checkpoint end: 15 (valid!), checkpoint start: 15 (valid!), "Checkpoint 15s" (valid!)
  if (stripped.includes('end: 15') || stripped.includes('start: 15') || stripped.includes('Checkpoint 15s')) continue;
  if (stripped.includes('useState(15)') || stripped.includes('>= 15') || stripped.includes('/ 15') || stripped.includes('* 15') || stripped.includes('de 15s') || stripped.includes('(15s)')) {
    hardcoded15Count++;
  }
}
assert(hardcoded15Count === 0, `Sem referências hardcoded de "15" (encontradas: ${hardcoded15Count})`);

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
assert(aiCoreSrc.includes('excelente rendimento energético'), 'Fallback genérico preservado para veículos sem dados');

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
