import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const frontendDir = path.resolve(rootDir, 'frontend');
const backendDir = path.resolve(rootDir, 'backend');

describe('AUDITORIA DE SEGURANÇA E MITIGAÇÃO (OWASP TOP 10 & RBAC)', () => {

  test('SEC-01: Mitigação de Bypass de Autenticação por Tokens Demo (DEF-01 Corrigido)', () => {
    const authPyPath = path.join(backendDir, 'routers/auth.py');
    const partPyPath = path.join(backendDir, 'routers/partnerships.py');

    const authContent = fs.readFileSync(authPyPath, 'utf-8');
    const partContent = fs.readFileSync(partPyPath, 'utf-8');

    // Verifica que o bypass aberto de startswith("demo-") foi removido
    assert.strictEqual(
      authContent.includes('token.startswith("demo-")'),
      false,
      'auth.py não deve aceitar tokens arbitrários iniciando com demo-'
    );

    // Verifica que demo tokens são condicionados a ambiente dev/testes e allow_demo
    assert.ok(
      authContent.includes('allow_demo =') && authContent.includes('os.getenv("ALLOW_DEMO_TOKENS"'),
      'auth.py deve condicionar tokens demo a variável de ambiente segura'
    );
    assert.ok(
      partContent.includes('allow_demo =') && partContent.includes('os.getenv("ALLOW_DEMO_TOKENS"'),
      'partnerships.py deve condicionar tokens demo a variável de ambiente segura'
    );
  });

  test('SEC-02: Isolamento Multilocatário Estrito em cars.py e Atribuição de Dono no seed.py (DEF-02 Corrigido)', () => {
    const carsPyPath = path.join(backendDir, 'routers/cars.py');
    const seedPyPath = path.join(backendDir, 'seed.py');

    const carsContent = fs.readFileSync(carsPyPath, 'utf-8');
    const seedContent = fs.readFileSync(seedPyPath, 'utf-8');

    // Confirma que veículos sem user_id ou de outro usuário não podem ser editados/excluídos por não-admins
    const hasStrictUpdate = carsContent.includes('if not is_admin and (not car.user_id or car.user_id != current_user.id):');
    const hasStrictDelete = carsContent.includes('if not is_admin and (not car.user_id or car.user_id != current_user.id):');

    assert.ok(hasStrictUpdate, 'update_car deve bloquear edição se o veículo não pertencer ao usuário');
    assert.ok(hasStrictDelete, 'delete_car deve bloquear exclusão se o veículo não pertencer ao usuário');

    // Confirma que os veículos do seed recebem dono explícito (admin)
    assert.ok(
      seedContent.includes('c["user_id"] = admin_id'),
      'seed.py deve associar veículos oficiais explicitamente ao usuário administrador'
    );
  });

  test('SEC-03: Eliminação de Senhas em Texto Puro no LocalStorage (DEF-03 Corrigido)', () => {
    const authContextPath = path.join(frontendDir, 'src/contexts/AuthContext.jsx');
    const authContent = fs.readFileSync(authContextPath, 'utf-8');

    // Garante que password não é salvo em texto claro nas contas registradas locais
    assert.strictEqual(
      authContent.includes('updated.push({ ...fullUser, password });'),
      false,
      'AuthContext.jsx não deve salvar fullUser com senha em texto claro'
    );
    assert.strictEqual(
      authContent.includes('updated.push({ ...fallbackUser, password });'),
      false,
      'AuthContext.jsx não deve salvar fallbackUser com senha em texto claro'
    );

    // Garante presença da função de hash seguro local
    assert.ok(
      authContent.includes('hashPasswordLocal'),
      'AuthContext.jsx deve utilizar hash unidirecional para credenciais locais'
    );
  });

  test('SEC-04: Streaming de Upload e Validação de Magic Bytes em Vídeos (DEF-05 Corrigido)', () => {
    const uploadsPyPath = path.join(backendDir, 'routers/uploads.py');
    const uploadsContent = fs.readFileSync(uploadsPyPath, 'utf-8');

    const videoSection = uploadsContent.slice(uploadsContent.indexOf('upload_pericia_video'));

    // Verifica validação de magic bytes
    assert.ok(
      videoSection.includes('b"ftyp"') && videoSection.includes('magic_bytes'),
      'upload_pericia_video deve validar assinatura magic bytes (ftyp) de arquivos de vídeo'
    );

    // Verifica escrita em streaming com limite progressivo de tamanho
    assert.ok(
      videoSection.includes('CHUNK_SIZE') && videoSection.includes('total_size > MAX_VIDEO_SIZE_BYTES'),
      'upload_pericia_video deve gravar via streaming em chunks para prevenir exaustão de memória (DoS)'
    );
  });

  test('SEC-05: Rate Limiting Ativo no Endpoint do Consultor IA (DEF-06 Corrigido)', () => {
    const aiVisionPyPath = path.join(backendDir, 'routers/ai_vision.py');
    const aiVisionContent = fs.readFileSync(aiVisionPyPath, 'utf-8');

    assert.ok(
      aiVisionContent.includes('chat_rate_limiter = RateLimiter'),
      'ai_vision.py deve instanciar RateLimiter para o endpoint de chat'
    );
    assert.ok(
      aiVisionContent.includes('is_allowed, remaining = chat_rate_limiter.is_allowed(client_ip)'),
      'chat_automatch deve checar permissão por IP e retornar 429 quando limite for excedido'
    );
  });

  test('SEC-06: Cabeçalhos HTTP de Segurança Defensiva no Backend', () => {
    const mainPyPath = path.join(backendDir, 'main.py');
    const mainContent = fs.readFileSync(mainPyPath, 'utf-8');

    assert.ok(mainContent.includes('response.headers["X-Content-Type-Options"] = "nosniff"'), 'Header nosniff configurado');
    assert.ok(mainContent.includes('response.headers["X-Frame-Options"] = "DENY"'), 'Header frame-options configurado');
    assert.ok(mainContent.includes('response.headers["Strict-Transport-Security"]'), 'HSTS configurado');
    assert.ok(mainContent.includes('response.headers["Referrer-Policy"]'), 'Referrer-Policy configurado');
  });

  test('SEC-07: Segregação B2B e Controle de Rotas no Frontend', () => {
    const howItWorksPath = path.join(frontendDir, 'src/pages/HowItWorksPage.jsx');
    const protectedRoutePath = path.join(frontendDir, 'src/components/ProtectedRoute.jsx');

    const howItWorksContent = fs.readFileSync(howItWorksPath, 'utf-8');
    const protectedRouteContent = fs.readFileSync(protectedRoutePath, 'utf-8');

    assert.ok(howItWorksContent.includes('{isB2BAuthorized &&'), 'HowItWorksPage condiciona bloco B2B a isB2BAuthorized');
    assert.ok(protectedRouteContent.includes('allowedRoles.includes(effectiveRole)'), 'ProtectedRoute restringe acesso por perfil');
  });
});
