/**
 * test_laudo_ia_battery.mjs — Bateria de testes de integridade da Auditoria de Laudos Cautelares por IA.
 * 
 * Valida os requisitos do sistema de feedback inteligente por IA (Gemini 1.5 Flash):
 * 1. Camada 1: Conferência de dados (Cross-Check: placa, chassi, marca_modelo, ano, km).
 * 2. Camada 2: Matriz de riscos e pontos de atenção (leilão, sinistro, estrutura, judicial, remarcação).
 * 3. Camada 3: Classificação semafórica geral (SEM_RESSALVAS, COM_ATENCAO, COM_RESTRICOES).
 * 4. Fluxo do Anunciante: Detecção e alerta de divergência de km antes da publicação.
 * 5. Fluxo do Comprador: Badge de verificação no dossiê oficial e detalhes do veículo.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Utilitário para verificar sintaxe balanceada de arquivos JS/JSX
function verifyBalancedSyntax(content, filename) {
  let curly = 0;
  let paren = 0;
  let bracket = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let isEscaped = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (char === '"' && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (char === '`' && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
      continue;
    }

    if (inSingleQuote || inDoubleQuote || inBacktick) continue;

    if (char === '/' && content[i + 1] === '/') {
      const nextLine = content.indexOf('\n', i);
      if (nextLine !== -1) {
        i = nextLine;
        continue;
      }
    }

    if (char === '/' && content[i + 1] === '*') {
      const endComment = content.indexOf('*/', i + 2);
      if (endComment !== -1) {
        i = endComment + 1;
        continue;
      }
    }

    if (char === '{') curly++;
    if (char === '}') curly--;
    if (char === '(') paren++;
    if (char === ')') paren--;
    if (char === '[') bracket++;
    if (char === ']') bracket--;
  }

  assert.strictEqual(curly, 0, `Chaves desbalanceadas no arquivo ${filename}: ${curly}`);
  assert.strictEqual(paren, 0, `Parênteses desbalanceados no arquivo ${filename}: ${paren}`);
  assert.strictEqual(bracket, 0, `Colchetes desbalanceados no arquivo ${filename}: ${bracket}`);
}

describe('BATERIA DE TESTES - AUDITORIA DE LAUDOS CAUTELARES POR IA (GEMINI 1.5 FLASH)', () => {

  test('LAUDO-01: LaudoFeedbackCard deve processar as três camadas de informação pericial', () => {
    const cardPath = path.join(rootDir, 'src/components/vehicle/LaudoFeedbackCard.jsx');
    assert.ok(fs.existsSync(cardPath), 'LaudoFeedbackCard.jsx deve existir');
    const content = fs.readFileSync(cardPath, 'utf-8');

    // 1. Conferência de dados (Cross-Check)
    assert.ok(content.includes('conferencia_dados') || content.includes('conferencia'), 'Deve conter suporte à conferência de dados');
    assert.ok(content.includes('placa'), 'Deve checar placa no cross-check');
    assert.ok(content.includes('chassi'), 'Deve checar chassi no cross-check');
    assert.ok(content.includes('quilometragem'), 'Deve checar quilometragem no cross-check');

    // 2. Matriz de Riscos
    assert.ok(content.includes('pontos_atencao_riscos') || content.includes('riscos'), 'Deve mapear pontos de atenção e riscos');
    assert.ok(content.includes('gravidade'), 'Deve exibir gravidade dos riscos');

    // 3. Classificação Geral
    assert.ok(content.includes('SEM_RESSALVAS'), 'Deve conter tag SEM_RESSALVAS');
    assert.ok(content.includes('COM_ATENCAO'), 'Deve conter tag COM_ATENCAO');
    assert.ok(content.includes('COM_RESTRICOES'), 'Deve conter tag COM_RESTRICOES');
    assert.ok(content.includes('resumo_executivo') || content.includes('finalResumo'), 'Deve exibir resumo executivo da IA');

    verifyBalancedSyntax(content, 'LaudoFeedbackCard.jsx');
  });

  test('LAUDO-02: NewCarAdForm deve cruzar dados cadastrais no upload e alertar divergência de km', () => {
    const formPath = path.join(rootDir, 'src/pages/NewCarAdForm.jsx');
    assert.ok(fs.existsSync(formPath), 'NewCarAdForm.jsx deve existir');
    const content = fs.readFileSync(formPath, 'utf-8');

    assert.ok(content.includes('formDataUpload.append(\'plate\''), 'Deve enviar placa para conferência');
    assert.ok(content.includes('formDataUpload.append(\'km\''), 'Deve enviar km para conferência');
    assert.ok(content.includes('kmDivergenceAlert'), 'Deve gerenciar alerta de divergência de km');
    assert.ok(content.includes('data-testid="alerta-divergencia-km"'), 'Deve renderizar elemento visual de divergência');
    assert.ok(content.includes('iaFeedback'), 'Deve repassar iaFeedback ao componente de visualização');

    verifyBalancedSyntax(content, 'NewCarAdForm.jsx');
  });

  test('LAUDO-03: OfficialDossierModal deve integrar o parecer e cross-check pericial por IA para o comprador', () => {
    const modalPath = path.join(rootDir, 'src/components/vehicle/OfficialDossierModal.jsx');
    assert.ok(fs.existsSync(modalPath), 'OfficialDossierModal.jsx deve existir');
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('parsedIa'), 'Deve parsear feedback da IA a partir do registro do veículo');
    assert.ok(content.includes('dossie-ia-painel'), 'Deve conter painel dedicado da auditoria de IA no dossiê');
    assert.ok(content.includes('SEM_RESSALVAS') && content.includes('COM_RESTRICOES'), 'Deve exibir classificação oficial');

    verifyBalancedSyntax(content, 'OfficialDossierModal.jsx');
  });

  test('LAUDO-04: ShowcaseVehicleDetails deve exibir o badge oficial de laudo auditado por IA', () => {
    const detailsPath = path.join(rootDir, 'src/pages/ShowcaseVehicleDetails.jsx');
    assert.ok(fs.existsSync(detailsPath), 'ShowcaseVehicleDetails.jsx deve existir');
    const content = fs.readFileSync(detailsPath, 'utf-8');

    assert.ok(content.includes('laudo-ia-badge-container'), 'Deve renderizar container de badge de laudo por IA');
    assert.ok(content.includes('Laudo Verificado por IA'), 'Deve rotular laudos auditados');

    verifyBalancedSyntax(content, 'ShowcaseVehicleDetails.jsx');
  });

  test('LAUDO-05: Backend laudo_ia_evaluator.py e uploads.py devem expor rota e schemas do contrato', () => {
    const evaluatorPath = path.resolve(rootDir, '../backend/services/laudo_ia_evaluator.py');
    const uploadsPath = path.resolve(rootDir, '../backend/routers/uploads.py');

    assert.ok(fs.existsSync(evaluatorPath), 'laudo_ia_evaluator.py deve existir no backend');
    assert.ok(fs.existsSync(uploadsPath), 'uploads.py deve existir no backend');

    const evalContent = fs.readFileSync(evaluatorPath, 'utf-8');
    const upContent = fs.readFileSync(uploadsPath, 'utf-8');

    assert.ok(evalContent.includes('class ClassificacaoGeralEnum'), 'Deve definir ClassificacaoGeralEnum');
    assert.ok(evalContent.includes('class ConferenciaDados'), 'Deve definir ConferenciaDados');
    assert.ok(evalContent.includes('class PontoAtencaoRisco'), 'Deve definir PontoAtencaoRisco');
    assert.ok(evalContent.includes('class LaudoIAFeedbackResponse'), 'Deve definir LaudoIAFeedbackResponse');
    assert.ok(upContent.includes('/laudos/poc-test'), 'Deve expor rota de teste /laudos/poc-test');
    assert.ok(upContent.includes('ia_feedback'), 'Upload deve incluir ia_feedback no response');
  });

});

