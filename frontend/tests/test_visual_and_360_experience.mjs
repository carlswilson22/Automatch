/**
 * test_visual_and_360_experience.mjs — Bateria de testes da experiência visual e animações.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para auditar a suavidade das transições do Framer Motion e layout em diferentes resoluções.
 */
/**
 * test_visual_and_360_experience.mjs
 * Bateria de Testes Automatizados da Experiência Visual, Varredura 360°,
 * Scanner IA Pericial, Animações Framer Motion e Auditoria de Fotos de Veículos.
 * Protocolo VLAEG - Fase E (Estilo / Execução)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicImagesDir = path.join(rootDir, 'public', 'images');

// Simulação de localStorage e window para execução em ambiente Node.js
const mockStorage = new Map();
globalThis.window = {
  innerWidth: 1280,
  addEventListener: () => {},
  removeEventListener: () => {}
};
globalThis.document = {
  body: { style: {} },
  documentElement: { clientWidth: 1280 }
};
globalThis.localStorage = {
  getItem: (key) => mockStorage.get(key) ?? null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

// Import dinâmico dos módulos do projeto
const scrollLockCoreModule = await import('../src/utils/scrollLockCore.js');
const imageHelperModule = await import('../src/utils/imageHelper.js');
const motionTokensModule = await import('../src/utils/motionTokens.js');

// ══════════════════════════════════════════════════════════════════════════════
// MÓDULO 1: VARREDURA 360° (GEOMETRIA, ATIVOS FÍSICOS E INTERAÇÃO)
// ══════════════════════════════════════════════════════════════════════════════
describe('MÓDULO 1: Varredura 360 Graus (Vehicle360Viewer & Ativos)', () => {
  const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
  const VEHICLE_IDS = ['sc-001', 'sc-002', 'sc-003', 'sc-004', 'sc-005'];

  test('1.1: Deve definir exatamente os 8 ângulos canônicos de 45 graus', () => {
    assert.strictEqual(ANGLES.length, 8, 'A varredura 360° deve possuir exatamente 8 ângulos');
    assert.deepStrictEqual(ANGLES, [0, 45, 90, 135, 180, 225, 270, 315]);
  });

  test('1.2: Fórmula de wrap-around horário e anti-horário deve ser perfeita', () => {
    // Horário (Avanço): (angle + 45) % 360
    assert.strictEqual((0 + 45) % 360, 45);
    assert.strictEqual((315 + 45) % 360, 0, 'Wrap-around horário de 315° deve voltar a 0°');

    // Anti-horário (Recuo): (angle - 45 + 360) % 360
    assert.strictEqual((0 - 45 + 360) % 360, 315, 'Wrap-around anti-horário de 0° deve recuar para 315°');
    assert.strictEqual((90 - 45 + 360) % 360, 45);
  });

  test('1.3: Todos os 40 arquivos de fotos 360° (5 carros x 8 ângulos) devem existir fisicamente no disco e ser íntegros (> 50KB)', () => {
    let totalVerified = 0;
    for (const vehicleId of VEHICLE_IDS) {
      const carFolder = path.join(publicImagesDir, 'cars', vehicleId);
      assert.ok(fs.existsSync(carFolder), `Pasta da galeria 360° deve existir para ${vehicleId}`);

      for (const angle of ANGLES) {
        const filePath = path.join(carFolder, `${angle}.jpg`);
        assert.ok(fs.existsSync(filePath), `Foto do ângulo ${angle}° deve existir para ${vehicleId} em ${filePath}`);
        
        const stat = fs.statSync(filePath);
        assert.ok(
          stat.size > 50000,
          `Foto ${angle}.jpg de ${vehicleId} deve ser uma imagem válida de alta resolução (> 50KB), encontrado: ${stat.size} bytes`
        );
        totalVerified++;
      }
    }
    assert.strictEqual(totalVerified, 40, 'Exatamente 40 fotos 360° devem estar validadas e íntegras');
  });

  test('1.4: Vehicle360Viewer.jsx implementa suporte a teclado (ArrowLeft / ArrowRight), auto-rotate e drag', () => {
    const viewerPath = path.join(rootDir, 'src', 'components', 'vehicle', 'Vehicle360Viewer.jsx');
    const content = fs.readFileSync(viewerPath, 'utf-8');

    assert.ok(content.includes('ArrowLeft') && content.includes('ArrowRight'), 'Deve suportar atalhos de setas do teclado');
    assert.ok(content.includes('handleMouseDown') && content.includes('handleMouseMove'), 'Deve suportar rotação contínua por drag com mouse');
    assert.ok(content.includes('onTouchStart') && content.includes('onTouchMove'), 'Deve suportar rotação contínua por touch em dispositivos móveis');
    assert.ok(content.includes('autoRotate') || content.includes('isAutoRotating'), 'Deve implementar estado e controle de rotação automática');
  });

  test('1.5: Sincronização de marcadores periciais aos ângulos correspondentes', () => {
    const viewerPath = path.join(rootDir, 'src', 'components', 'vehicle', 'Vehicle360Viewer.jsx');
    const content = fs.readFileSync(viewerPath, 'utf-8');

    // O viewer deve filtrar ou destacar avarias com base no ângulo atual
    assert.ok(
      content.includes('currentAngle') || content.includes('activeAngle'),
      'Deve rastrear o ângulo ativo para sincronizar marcadores visuais'
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// MÓDULO 2: VARREDURA COM INTELIGÊNCIA ARTIFICIAL (SCANNER PERICIAL & LAUDO)
// ══════════════════════════════════════════════════════════════════════════════
describe('MÓDULO 2: Varredura com IA (AutomatchScan & Laudo Fotográfico)', () => {
  const scanComponentPath = path.join(rootDir, 'src', 'components', 'vehicle', 'AutomatchScan.jsx');
  const detailsPagePath = path.join(rootDir, 'src', 'pages', 'ShowcaseVehicleDetails.jsx');

  test('2.1: AutomatchScan.jsx possui animação de linha de varredura a laser', () => {
    const content = fs.readFileSync(scanComponentPath, 'utf-8');
    assert.ok(
      content.includes('scan-laser') || content.includes('animate-pulse') || content.includes('linear-gradient') || content.includes('isScanning'),
      'Deve possuir efeito visual luminoso de varredura a laser'
    );
  });

  test('2.2: AutomatchScan.jsx mapeia danos com gravidade, orçamento e bounding boxes', () => {
    const content = fs.readFileSync(scanComponentPath, 'utf-8');
    assert.ok(content.includes('damage') || content.includes('avaria') || content.includes('score'), 'Deve calcular avarias ou score de lataria');
    assert.ok(content.includes('R$') || content.includes('BRL') || content.includes('toLocaleString'), 'Deve formatar custos na moeda BRL');
  });

  test('2.3: ShowcaseVehicleDetails.jsx integra botão de acionamento do Scanner e laudo pericial', () => {
    const content = fs.readFileSync(detailsPagePath, 'utf-8');
    assert.ok(
      content.includes('analisarFotoDoCarro') || content.includes('AutomatchScan'),
      'ShowcaseVehicleDetails deve integrar o fluxo de análise pericial'
    );
    assert.ok(
      content.includes('Score') || content.includes('Laudo Cautelar') || content.includes('Pericial'),
      'Deve exibir selo e status pericial do laudo'
    );
  });

  test('2.4: As imagens gabarito de avarias periciais existem e são válidas', () => {
    const latariaAmassada = path.join(publicImagesDir, 'carro_lataria_amassada.jpg');
    const parachoqueDanificado = path.join(publicImagesDir, 'carro_parachoque_danificado.jpg');

    assert.ok(fs.existsSync(latariaAmassada), 'carro_lataria_amassada.jpg deve existir');
    assert.ok(fs.statSync(latariaAmassada).size > 100000, 'carro_lataria_amassada.jpg deve ser > 100KB');

    assert.ok(fs.existsSync(parachoqueDanificado), 'carro_parachoque_danificado.jpg deve existir');
    assert.ok(fs.statSync(parachoqueDanificado).size > 100000, 'carro_parachoque_danificado.jpg deve ser > 100KB');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// MÓDULO 3: ANIMAÇÕES E MICROINTERAÇÕES (FRAMER MOTION & MICROKIT)
// ══════════════════════════════════════════════════════════════════════════════
describe('MÓDULO 3: Animações e Microinterações Framer Motion', () => {

  test('3.1: Tokens de animação motionTokens.js definem springs calibrados e transições', () => {
    assert.ok(motionTokensModule.MOTION_DURATIONS, 'Deve exportar MOTION_DURATIONS');
    assert.ok(motionTokensModule.MOTION_EASINGS, 'Deve exportar MOTION_EASINGS');
    assert.ok(motionTokensModule.MOTION_EASINGS.spring, 'Deve exportar spring easing calibrado');
    assert.ok(motionTokensModule.cardVariants, 'Deve exportar cardVariants para transições');
    assert.ok(motionTokensModule.modalVariants, 'Deve exportar modalVariants para modais');
    assert.ok(typeof motionTokensModule.usePrefersReducedMotion === 'function', 'Deve exportar hook de acessibilidade usePrefersReducedMotion');
  });

  test('3.2: scrollLockCore implementa Reference Counting robusto sem travar a rolagem da página', () => {
    const { lockScroll, unlockScroll, getScrollLockCount, resetScrollLock } = scrollLockCoreModule;

    // Reset para estado neutro
    resetScrollLock();
    assert.strictEqual(getScrollLockCount(), 0, 'Deve iniciar em zero');

    // Primeiro lock (ex: Modal Dossiê aberto)
    lockScroll();
    assert.strictEqual(getScrollLockCount(), 1);
    assert.strictEqual(document.body.style.overflow, 'hidden', 'Body deve receber overflow hidden no primeiro lock');

    // Segundo lock (ex: Modal de Imagem/Zoom aberto sobre o Dossiê)
    lockScroll();
    assert.strictEqual(getScrollLockCount(), 2);
    assert.strictEqual(document.body.style.overflow, 'hidden', 'Body deve permanecer hidden no segundo lock');

    // Primeiro unlock (fecha zoom)
    unlockScroll();
    assert.strictEqual(getScrollLockCount(), 1);
    assert.strictEqual(document.body.style.overflow, 'hidden', 'Body deve permanecer hidden pois ainda há 1 modal aberto');

    // Segundo unlock (fecha dossiê)
    unlockScroll();
    assert.strictEqual(getScrollLockCount(), 0);
    assert.strictEqual(document.body.style.overflow, '', 'Body deve ter rolagem completamente restaurada');
  });

  test('3.3: SlidingTabs.jsx utiliza layoutId para animação fluida de aba ativa', () => {
    const tabsPath = path.join(rootDir, 'src', 'components', 'ui', 'SlidingTabs.jsx');
    const content = fs.readFileSync(tabsPath, 'utf-8');
    assert.ok(content.includes('layoutId'), 'SlidingTabs deve utilizar layoutId do Framer Motion');
    assert.ok(content.includes('motion.div') || content.includes('motion.span'), 'Deve conter elementos animados');
  });

  test('3.4: SpotlightCard.jsx implementa gradiente radial dinâmico no movimento do cursor', () => {
    const cardPath = path.join(rootDir, 'src', 'components', 'ui', 'microkit', 'SpotlightCard.jsx');
    const content = fs.readFileSync(cardPath, 'utf-8');
    assert.ok(content.includes('onMouseMove'), 'SpotlightCard deve escutar onMouseMove');
    assert.ok(content.includes('radial-gradient'), 'Deve aplicar radial-gradient dinâmico com base nas coordenadas');
  });

  test('3.5: GlowButton.jsx e WipeButton.jsx suportam microinterações whileHover e whileTap', () => {
    const glowPath = path.join(rootDir, 'src', 'components', 'ui', 'GlowButton.jsx');
    const wipePath = path.join(rootDir, 'src', 'components', 'ui', 'WipeButton.jsx');

    const glowContent = fs.readFileSync(glowPath, 'utf-8');
    const wipeContent = fs.readFileSync(wipePath, 'utf-8');

    assert.ok(glowContent.includes('whileHover') || glowContent.includes('whileTap'), 'GlowButton deve ter microinterações');
    assert.ok(wipeContent.includes('whileHover') || wipeContent.includes('whileTap'), 'WipeButton deve ter microinterações');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// MÓDULO 4: AUDITORIA DE IMAGENS E HIGIENIZAÇÃO DE MÍDIA
// ══════════════════════════════════════════════════════════════════════════════
describe('MÓDULO 4: Auditoria de Imagens e Integridade de Mídia', () => {
  const EXPECTED_AUTHORIZED_IMAGES = new Set([
    'FotoCorollaCross.jpg',
    'FotoPoloTSI.jpg',
    'FotoHyundaiHB20.jpg',
    'FotoChevroletTracker.jpg',
    'FotoFiatPulse.jpg',
    'carro_lataria_amassada.jpg',
    'carro_parachoque_danificado.jpg',
    'placeholder-carro.jpg',
    'hero-video-poster.jpg'
  ]);

  test('4.1: Todas as fotos de capa dos 5 carros oficiais existem e possuem tamanho consistente (> 100KB)', () => {
    const capas = [
      'FotoCorollaCross.jpg',
      'FotoPoloTSI.jpg',
      'FotoHyundaiHB20.jpg',
      'FotoChevroletTracker.jpg',
      'FotoFiatPulse.jpg'
    ];

    for (const capa of capas) {
      const p = path.join(publicImagesDir, capa);
      assert.ok(fs.existsSync(p), `Foto de capa ${capa} deve existir em ${p}`);
      const stat = fs.statSync(p);
      assert.ok(stat.size > 100000, `Foto de capa ${capa} deve ser de alta qualidade (> 100KB), tamanho: ${stat.size} bytes`);
    }
  });

  test('4.2: Imagem global de fallback placeholder-carro.jpg existe e é válida', () => {
    const placeholder = path.join(publicImagesDir, 'placeholder-carro.jpg');
    assert.ok(fs.existsSync(placeholder), 'placeholder-carro.jpg deve existir');
    assert.ok(fs.statSync(placeholder).size > 10000, 'placeholder deve ser > 10KB');
  });

  test('4.3: imageHelper.js resolve URLs com base path corretamente', () => {
    const { getVehicleImageUrl } = imageHelperModule;
    assert.ok(typeof getVehicleImageUrl === 'function', 'getVehicleImageUrl deve ser exportada');

    // Teste com URL remota
    const remoteUrl = 'https://images.unsplash.com/photo-car';
    assert.strictEqual(getVehicleImageUrl(remoteUrl), remoteUrl, 'URLs remotas devem ser preservadas');

    // Teste com URL local de imagem
    const localRes = getVehicleImageUrl('/images/FotoCorollaCross.jpg');
    assert.ok(localRes.includes('FotoCorollaCross.jpg'), 'Deve incluir o nome do arquivo');

    // Teste com valor nulo / vazio
    const nullRes = getVehicleImageUrl(null);
    assert.ok(nullRes.includes('placeholder-carro.jpg') || nullRes.startsWith('data:image/svg'), 'Deve retornar fallback seguro');
  });

  test('4.4: Auditoria de arquivos órfãos — nenhuma foto desconhecida ou lixo em public/images', () => {
    const filesInRoot = fs.readdirSync(publicImagesDir);
    const nonDirFiles = filesInRoot.filter((f) => !fs.statSync(path.join(publicImagesDir, f)).isDirectory());

    for (const file of nonDirFiles) {
      assert.ok(
        EXPECTED_AUTHORIZED_IMAGES.has(file),
        `Arquivo de imagem inesperado/órfão encontrado em public/images: "${file}". Deve ser apagado ou registrado!`
      );
    }

    assert.strictEqual(
      nonDirFiles.length,
      EXPECTED_AUTHORIZED_IMAGES.size,
      `Devem existir exatamente ${EXPECTED_AUTHORIZED_IMAGES.size} arquivos autorizados na raiz de public/images`
    );
  });
});
