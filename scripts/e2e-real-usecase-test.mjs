/**
 * e2e-real-usecase-test.mjs
 * Teste de Caso de Uso Real: Validação completa da plataforma no Docker com Scanner IA.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Importa funções do contrato de inspeção visual do frontend
import { readVisualInspection, inspectionLabel, trustedDamagePoints, VISUAL_SCHEMA_VERSION } from '../frontend/src/utils/visualInspection.js';

const GATEWAY_URL = 'http://localhost';
const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:3000';

console.log('='.repeat(80));
console.log('🚗 TESTE DE CASO DE USO REAL - AUTOMATCH NO DOCKER COM SCANNER IA');
console.log('='.repeat(80));

async function runStep(stepName, fn) {
  process.stdout.write(`\n⏳ [${stepName}] Executando... `);
  try {
    const res = await fn();
    console.log(`✅ OK!`);
    if (res) console.log(`   └─ ${res}`);
    return true;
  } catch (err) {
    console.log(`❌ FALHOU!`);
    console.error(`   └─ Erro: ${err.message}`);
    throw err;
  }
}

async function main() {
  // 1. Healthcheck do Gateway e Backend
  await runStep('1. Health Check do Gateway e Backend', async () => {
    const resp = await fetch(`${GATEWAY_URL}/api/health`);
    assert.equal(resp.status, 200);
    const data = await resp.json();
    assert.equal(data.status, 'ok');
    return `Gateway proxy para backend OK (status=${data.status})`;
  });

  // 2. Disponibilidade da Aplicação Frontend (Vite/React)
  await runStep('2. Disponibilidade da Aplicação Frontend (Porta 3000)', async () => {
    const resp = await fetch(FRONTEND_URL);
    assert.equal(resp.status, 200);
    const html = await resp.text();
    assert.ok(html.includes('Automatch'));
    return `HTML raiz da SPA carregado com sucesso (${html.length} bytes)`;
  });

  // 3. Carregamento dos Ativos Estáticos do Carro (Tracker)
  let trackerImageB64 = '';
  await runStep('3. Acesso à foto do anúncio do Chevrolet Tracker via Frontend', async () => {
    const resp = await fetch(`${FRONTEND_URL}/images/FotoChevroletTracker.jpg`);
    assert.equal(resp.status, 200);
    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    assert.ok(buffer.length > 50000, 'Tamanho da imagem insuficiente');
    trackerImageB64 = buffer.toString('base64');
    return `Foto obtida via HTTP do frontend (${buffer.length} bytes, base64 pronto)`;
  });

  // 4. Registro e Autenticação de Usuário Real
  let authToken = '';
  const testEmail = `usuario.teste.${Date.now()}@automatch.com`;
  await runStep('4. Registro e Login de Usuário (Auth JWT)', async () => {
    const regResp = await fetch(`${GATEWAY_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Usuário Teste Real',
        email: testEmail,
        password: 'SenhaForte2026!',
        role: 'comum'
      })
    });
    assert.equal(regResp.status, 200);
    const regData = await regResp.json();
    authToken = regData.token;
    assert.ok(authToken, 'Token JWT ausente');
    return `Usuário registrado com ID=${regData.id}, token JWT obtido`;
  });

  // 5. Teste do Scanner de IA com a Foto do Chevrolet Tracker (sc-004)
  await runStep('5. Execução do Scanner de IA Pericial no Chevrolet Tracker (sc-004)', async () => {
    const scannerPayload = {
      imageBase64: trackerImageB64,
      imageUrl: '/images/FotoChevroletTracker.jpg',
      car_context: {
        id: 'sc-004',
        brand: 'Chevrolet',
        model: 'Tracker Premier',
        year: 2024,
        color: 'Azul Eclipse',
        damages: ['Pequeno Risco Superficial'] // Contexto não deve criar dano
      }
    };

    const resp = await fetch(`${GATEWAY_URL}/api/analise-visual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scannerPayload)
    });

    assert.equal(resp.status, 200);
    const rawData = await resp.json();

    // Validação de Contrato Backend
    assert.equal(rawData.schema_version, 2, 'schema_version deve ser 2');
    assert.equal(rawData.method_version, 'visual-evidence-v2');
    assert.equal(rawData.car_id, 'sc-004');
    assert.equal(rawData.score_lataria, null, 'score_lataria não deve ser inventado');
    assert.equal(rawData.damage_confidence, null, 'damage_confidence não deve ser inventado');
    assert.ok(rawData.image_sha256, 'image_sha256 deve estar presente');

    // Validação da Camada Frontend: readVisualInspection()
    const inspection = readVisualInspection(rawData);
    assert.ok(inspection, 'readVisualInspection deve aceitar o contrato');
    assert.equal(inspection.analysis_state, 'inconclusive');
    
    // Validação da Interface: rótulo e pontos de dano
    const label = inspectionLabel(inspection);
    assert.equal(label, 'Análise inconclusiva, confirme com vistoria presencial');
    
    const damagePoints = trustedDamagePoints(inspection);
    assert.deepEqual(damagePoints, [], 'Nenhum ponto de dano falso pode ser exibido');

    return `Resultado pericial: state="${inspection.analysis_state}", label="${label}", pontos_avaria=${damagePoints.length}`;
  });

  // 6. Teste do Scanner de IA com Carro com Amassado Real (carro_lataria_amassada.jpg)
  await runStep('6. Execução do Scanner de IA com Imagem de Amassado', async () => {
    const dentedBytes = fs.readFileSync(path.join(rootDir, 'frontend', 'public', 'images', 'carro_lataria_amassada.jpg'));
    const dentedB64 = dentedBytes.toString('base64');

    const resp = await fetch(`${GATEWAY_URL}/api/analise-visual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: dentedB64,
        car_context: { id: 'test-dented', brand: 'Generico', model: 'Teste' }
      })
    });

    assert.equal(resp.status, 200);
    const rawData = await resp.json();
    assert.equal(rawData.schema_version, 2);
    
    const inspection = readVisualInspection(rawData);
    assert.ok(inspection);
    if (inspection.analysis_state === 'damage_detected') {
      // Quando Gemini Vision está ativo e detecta avaria real
      assert.equal(inspection.calibration_id, 'gemini-vision-v1');
      assert.equal(inspection.tem_avarias, true);
      assert.equal(inspection.damage_detection_validated, true);
      assert.equal(inspection.score_lataria, null, 'score_lataria não pode ser inventado');
      assert.ok(inspection.pontos_avaria.length > 0, 'deve conter pontos de avaria reais');
      const label = inspectionLabel(inspection);
      assert.ok(label.includes('Avaria') || label.includes('avaria'), 'rótulo deve indicar avaria');
      return `Detecção pericial Gemini Vision ativa: ${inspection.pontos_avaria.length} avaria(s) identificada(s) com evidência visual`;
    } else {
      // Quando cai em fallback inconclusivo
      assert.equal(inspection.analysis_state, 'inconclusive');
      assert.equal(inspectionLabel(inspection), 'Análise inconclusiva, confirme com vistoria presencial');
      assert.deepEqual(trustedDamagePoints(inspection), []);
      return `Contrato validado: integridade pericial preservada sem alucinação`;
    }
  });

  // 7. Teste do Consultor IA em Streaming (SSE)
  await runStep('7. Interação com Consultor IA via Streaming SSE', async () => {
    const chatResp = await fetch(`${GATEWAY_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mensagem: 'Qual o ano e versão deste Tracker?',
        car_context: { brand: 'Chevrolet', model: 'Tracker Premier', year: 2024 }
      })
    });

    assert.equal(chatResp.status, 200);
    assert.ok(chatResp.headers.get('content-type').includes('text/event-stream'));
    const text = await chatResp.text();
    assert.ok(text.includes('data:'), 'Deve conter eventos SSE');
    assert.ok(text.includes('[DONE]'), 'Deve finalizar com sinal [DONE]');
    return `Streaming SSE operacional: resposta transmitida e finalizada com sucesso`;
  });

  // 8. Teste de Consulta DETRAN simulada
  await runStep('8. Consulta de Integração DETRAN', async () => {
    const detranResp = await fetch(`${GATEWAY_URL}/api/v1/integracoes/detran/ABC1D23`);
    assert.equal(detranResp.status, 200);
    const detranData = await detranResp.json();
    assert.ok(detranData.dados_veiculo || detranData.placa, 'Dados do veículo presentes');
    return `DETRAN respondeu com sucesso (placa=${detranData.placa || 'ABC1D23'})`;
  });

  // 9. Teste de Controle de Acesso e Estoque B2B
  await runStep('9. Controle de Acesso RBAC e Estoque Compartilhado B2B', async () => {
    // 9a. Usuário anônimo sem token -> 401
    const unauthResp = await fetch(`${GATEWAY_URL}/api/partnerships/shared-inventory`);
    assert.equal(unauthResp.status, 401, 'Acesso não autenticado a B2B deve ser 401');

    // 9b. Usuário comum -> 403 Forbidden
    const comumResp = await fetch(`${GATEWAY_URL}/api/partnerships/shared-inventory`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    assert.equal(comumResp.status, 403, 'Usuário comum não pode acessar B2B (deve ser 403)');

    // 9c. Registro de lojista parceiro
    const lojistaEmail = `lojista.${Date.now()}@concessionaria.com`;
    const regLojista = await fetch(`${GATEWAY_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Gerente Lojista',
        email: lojistaEmail,
        password: 'SenhaForte2026!',
        role: 'lojista',
        store_name: 'Concessionária Alpha'
      })
    });
    assert.equal(regLojista.status, 200);
    const lojistaData = await regLojista.json();

    // 9d. Acesso lojista com token válido -> 200
    const b2bResp = await fetch(`${GATEWAY_URL}/api/partnerships/shared-inventory`, {
      headers: { 'Authorization': `Bearer ${lojistaData.token}` }
    });
    assert.equal(b2bResp.status, 200);
    const b2bData = await b2bResp.json();
    assert.ok(Array.isArray(b2bData.veiculos || b2bData), 'Lista de veículos compartilhados válida');

    return `RBAC validado: anônimo=401, comum=403, lojista=200 OK (${(b2bData.veiculos || b2bData).length} carros no estoque compartilhado)`;
  });

  console.log('\n' + '='.repeat(80));
  console.log('🎉 SUCESSO ABSOLUTO: TODAS AS 9 ETAPAS DE USO REAL FORAM APROVADAS!');
  console.log('='.repeat(80));
}

main().catch((err) => {
  console.error('\n❌ TESTE ABORTADO POR ERRO:\n', err);
  process.exit(1);
});
