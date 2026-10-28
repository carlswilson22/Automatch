/**
 * test_tracker_fixes_battery.mjs — Bateria de testes de validação das correções da Chevrolet Tracker
 * 
 * Objetivo e Motivo da Criação:
 *   - Valida a disponibilidade da varredura orbital 360° no anúncio da Chevrolet Tracker (sc-004).
 *   - Valida a consistência entre o Scanner Pericial de IA e o Laudo Cautelar do veículo com avaria na lataria/retrovisor.
 *   - Valida as respostas do Consultor IA (Automatch AI) ao ser questionado sobre avarias, riscos e integridade da lataria.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { showcaseCars } from '../src/data/showcaseData.js';
import { isComplete360Set } from '../src/utils/vehicleMapper.js';
import { generateVehicleConsultantAnswer } from '../src/utils/aiConsultantCore.js';

describe('BATERIA DE TESTES — CHEVROLET TRACKER, SCANNER IA & CONSULTOR', () => {

  const tracker = showcaseCars.find(c => c.id === 'sc-004');
  const corolla = showcaseCars.find(c => c.id === 'sc-001');

  test('1. Varredura 360° da Chevrolet Tracker (sc-004) está 100% DISPONÍVEL', () => {
    assert.ok(tracker, 'Tracker (sc-004) deve existir no catálogo de vitrine');
    assert.ok(tracker.photos360, 'photos360 deve estar configurado na Tracker');
    assert.strictEqual(typeof tracker.photos360, 'object', 'photos360 deve ser um objeto');
    
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    for (const ang of angles) {
      assert.ok(tracker.photos360[ang], `Ângulo ${ang}° deve estar presente no photos360 da Tracker`);
      assert.ok(tracker.photos360[ang].includes('sc-004'), `Caminho do ângulo ${ang}° deve apontar para sc-004`);
    }

    const isComplete = isComplete360Set(tracker.photos360);
    assert.strictEqual(isComplete, true, 'isComplete360Set(tracker.photos360) deve retornar true');
  });

  test('2. Scanner Pericial e Laudo Cautelar da Tracker com avaria mapeada na lataria/retrovisor', () => {
    assert.ok(Array.isArray(tracker.damagePoints), 'damagePoints da Tracker deve ser um array');
    assert.ok(tracker.damagePoints.length >= 1, 'Tracker deve ter pelo menos 1 avaria mapeada');

    const dp = tracker.damagePoints[0];
    assert.ok(dp.part.includes('Retrovisor'), 'Avaria deve estar no Retrovisor Externo Direito');
    assert.strictEqual(dp.angle, 90, 'Hotspot da avaria deve estar visível no ângulo de 90° da varredura 360°');
    assert.ok(tracker.fullDescription.includes('retrovisor'), 'Descrição completa deve citar o apontamento leve periciado');
  });

  test('3. Consultor IA Automatch reconhece e detalha avarias quando o usuário pergunta sobre a Tracker', () => {
    const perguntasAvarias = [
      'o veículo tem avarias?',
      'o carro tem avaria na lataria?',
      'tem algum risco ou amassado?',
      'possui algum defeito ou dano?'
    ];

    for (const pergunta of perguntasAvarias) {
      const resposta = generateVehicleConsultantAnswer(pergunta, tracker);
      assert.ok(
        resposta.toLowerCase().includes('retrovisor') || resposta.toLowerCase().includes('apontamento'),
        `Resposta para "${pergunta}" deve mencionar a avaria do retrovisor. Resposta recebida: ${resposta}`
      );
      assert.ok(
        !resposta.toLowerCase().includes('não constam registros'),
        `Resposta para "${pergunta}" não pode conter "não constam registros".`
      );
    }
  });

  test('4. Consultor IA confirma integridade 100% sem avarias para veículo impecável (Corolla Cross)', () => {
    const respostaCorolla = generateVehicleConsultantAnswer('o veículo tem avarias?', corolla);
    assert.ok(
      respostaCorolla.toLowerCase().includes('não possui avarias') || respostaCorolla.toLowerCase().includes('100% íntegro'),
      `Resposta para Corolla deve atestar 100% integridade. Resposta recebida: ${respostaCorolla}`
    );
  });

});

