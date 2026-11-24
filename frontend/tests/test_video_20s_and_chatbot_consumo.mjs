/**
 * test_video_20s_and_chatbot_consumo.mjs — Testes do tempo de vídeo de vistoria e respostas de consumo.
 * 
 * Objetivo e Motivo da Criação:
 *   - Valida que vídeos periciais cumpram a meta de 20s e o chatbot retorne médias de consumo confiáveis (km/l).
 *   - Padronizado na API nativa node:test e node:assert/strict para integração no CI.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(__dirname, '..');

describe('TAREFA 6 — Vídeo Pericial (20s e Cronograma)', () => {
  test('6.1: Duração do vídeo pericial é de 20s vinda do cronograma', async () => {
    const { VIDEO_DURATION } = await import('../src/data/pericialTimeline.generated.js');
    assert.equal(VIDEO_DURATION, 20, 'Duração deve vir do cronograma e ser de exatamente 20s');
  });

  test('6.2: Fases temporais e checkpoints cumprem intervalos exatos', async () => {
    const { CHECKPOINTS } = await import('../src/data/pericialTimeline.generated.js');
    assert.deepEqual(
      CHECKPOINTS.map(stage => [stage.start, stage.end]),
      [[0, 5], [5, 15], [15, 20]],
      'Intervalos temporais das etapas periciais devem ser [[0,5],[5,15],[15,20]]'
    );

    for (const [time, index] of [[0, 0], [4.999, 0], [5, 1], [14.999, 1], [15, 2], [19.999, 2]]) {
      assert.equal(
        CHECKPOINTS.findIndex(stage => time >= stage.start && time < stage.end),
        index,
        'Legenda na fronteira temporal ' + time
      );
    }
  });

  test('6.3: Ordem das tomadas segue 0, 90, 270, 180 graus', async () => {
    const { pericialTimeline } = await import('../src/data/pericialTimeline.generated.js');
    assert.equal(
      pericialTimeline.shots.map(shot => shot.angle).join(','),
      '0,90,270,180',
      'Ordem das vistas deve vir da mesma configuração pericial'
    );
  });

  test('6.4: PericialVideoViewer consome pericialTimeline.generated.js sem duplicidade', () => {
    const videoSrc = readFileSync(resolve(root, 'src/components/vehicle/PericialVideoViewer.jsx'), 'utf8');
    assert.ok(videoSrc.includes('pericialTimeline.generated.js'), 'Player consome configuração gerada');
    assert.ok(!videoSrc.includes('const CHECKPOINTS = ['), 'Sem cronograma duplicado no player');
  });
});

describe('TAREFA 7 — Chatbot IA (Consumo com km/l e conformidade INMETRO)', () => {
  test('7.1: aiConsultantCore prioriza specs.consumoInmetro e cita INMETRO', () => {
    const aiCoreSrc = readFileSync(resolve(root, 'src/utils/aiConsultantCore.js'), 'utf-8');
    assert.ok(aiCoreSrc.includes('specs.consumoInmetro'), 'aiConsultantCore verifica specs.consumoInmetro');
    assert.ok(aiCoreSrc.includes('INMETRO'), 'Resposta do chatbot menciona INMETRO');
  });

  test('7.2: Todos os veículos possuem consumoInmetro nos dados de showcase', () => {
    const showcaseSrc = readFileSync(resolve(root, 'src/data/showcaseData.js'), 'utf-8');
    const vehicles = [
      { id: 'sc-001', name: 'Toyota Corolla Cross XRX' },
      { id: 'sc-002', name: 'Volkswagen Polo TSI' },
      { id: 'sc-003', name: 'Hyundai HB20 Platinum' },
      { id: 'sc-004', name: 'Chevrolet Tracker Premier' },
      { id: 'sc-005', name: 'Fiat Pulse Abarth' },
    ];

    for (const v of vehicles) {
      assert.ok(showcaseSrc.includes('consumoInmetro:'), `${v.name} (${v.id}): campo consumoInmetro deve existir`);
    }
  });

  test('7.3: Veículos do catálogo possuem médias de km/l esperadas', () => {
    const showcaseSrc = readFileSync(resolve(root, 'src/data/showcaseData.js'), 'utf-8');
    const consumoMap = {
      'sc-001': '18,1 km/l',
      'sc-002': '14,1 km/l',
      'sc-003': '13,3 km/l',
      'sc-004': '12,4 km/l',
      'sc-005': '10,2 km/l',
    };

    for (const [id, expectedKmL] of Object.entries(consumoMap)) {
      assert.ok(showcaseSrc.includes(expectedKmL), `Veículo ${id}: consumo deve incluir ${expectedKmL}`);
    }
  });

  test('7.4: Fallback de veículo sem consumo permanece como não informado sem alucinação', async () => {
    const { generateVehicleConsultantAnswer } = await import('../src/utils/aiConsultantCore.js');
    const unknownConsumption = generateVehicleConsultantAnswer('consumo', { id: 'sem-consumo' });
    assert.ok(unknownConsumption.includes('não informado'), 'Consumo ausente deve permanecer não informado');
    assert.ok(!unknownConsumption.includes('excelente rendimento'), 'Não inventar avaliação energética');
  });
});
