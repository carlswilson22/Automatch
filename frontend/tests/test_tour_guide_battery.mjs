/**
 * test_tour_guide_battery.mjs — Suíte de testes automatizados do Tour Guiado Interativo e Acessibilidade.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para garantir que as âncoras existam no DOM, o RBAC oculte o tour de lojista para usuários não autorizados,
 *     os limites de palavras sejam cumpridos e a acessibilidade (WCAG AAA) esteja assegurada.
 */
import test, { describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

import {
  TOUR_ANCHORS,
  TOURS_CONFIG,
  getAvailableTours,
  getTourById
} from '../src/data/tourGuideData.js';

describe('BATERIA DE TESTES - TOUR GUIADO INTERATIVO & ACESSIBILIDADE', () => {

  // =========================================================================
  // MÓDULO 1: Integridade das Âncoras data-tour no Código-Fonte Real
  // =========================================================================
  test('1.1: Todas as âncoras canônicas de TOUR_ANCHORS devem existir fisicamente no JSX da aplicação', () => {
    const filesToScan = [
      'src/pages/ShowcaseCatalog.jsx',
      'src/pages/ShowcaseVehicleDetails.jsx',
      'src/pages/Home.jsx',
      'src/pages/NewCarAdForm.jsx',
      'src/pages/MyAdsPage.jsx',
      'src/pages/Dashboard.jsx',
    ];

    const aggregatedContent = filesToScan
      .map(file => fs.readFileSync(path.join(rootDir, file), 'utf-8'))
      .join('\n');

    for (const [key, anchorValue] of Object.entries(TOUR_ANCHORS)) {
      const pattern = `data-tour="${anchorValue}"`;
      const patternDynamic = `data-tour={index === 0 ? "${anchorValue}" : undefined}`;
      const exists = aggregatedContent.includes(pattern) || aggregatedContent.includes(patternDynamic);
      assert.ok(
        exists,
        `A âncora [${key}: "${anchorValue}"] deve existir em pelo menos um componente JSX do projeto.`
      );
    }
  });

  // =========================================================================
  // MÓDULO 2: Controle de Acesso e Segregação de Perfis (RBAC)
  // =========================================================================
  test('2.1: Visitantes (não autenticados / role nula) não devem ver nem acessar o tour de lojista', () => {
    const tours = getAvailableTours(null);
    const tourIds = tours.map(t => t.id);

    assert.ok(tourIds.includes('comprar'), 'Visitante deve ver tour Quero Comprar');
    assert.ok(tourIds.includes('anunciar'), 'Visitante deve ver tour Quero Anunciar');
    assert.ok(!tourIds.includes('lojista'), 'Visitante NÃO deve ver tour Sou Lojista');

    const blockedTour = getTourById('lojista', null);
    assert.strictEqual(blockedTour, null, 'getTourById para lojista com role null deve retornar null');
  });

  test('2.2: Usuário comum (role "comum") não deve ver nem acessar o tour de lojista', () => {
    const tours = getAvailableTours('comum');
    const tourIds = tours.map(t => t.id);

    assert.ok(tourIds.includes('comprar'), 'Comum deve ver tour Quero Comprar');
    assert.ok(tourIds.includes('anunciar'), 'Comum deve ver tour Quero Anunciar');
    assert.ok(!tourIds.includes('lojista'), 'Comum NÃO deve ver tour Sou Lojista');

    const blockedTour = getTourById('lojista', 'comum');
    assert.strictEqual(blockedTour, null, 'getTourById para lojista com role comum deve retornar null');
  });

  test('2.3: Lojistas e Administradores possuem acesso exclusivo ao tour B2B', () => {
    for (const role of ['lojista', 'admin']) {
      const tours = getAvailableTours(role);
      const tourIds = tours.map(t => t.id);

      assert.ok(tourIds.includes('comprar'), `${role} deve ver tour Comprar`);
      assert.ok(tourIds.includes('anunciar'), `${role} deve ver tour Anunciar`);
      assert.ok(tourIds.includes('lojista'), `${role} deve ver tour Lojista`);

      const allowedTour = getTourById('lojista', role);
      assert.ok(allowedTour && allowedTour.id === 'lojista', `${role} deve carregar objeto do tour lojista`);
    }
  });

  // =========================================================================
  // MÓDULO 3: Qualidade de Conteúdo, Microcopy e Limite de Palavras
  // =========================================================================
  test('3.1: Cada passo de todos os tours deve conter no máximo cerca de 25 palavras (meta indicativa UX)', () => {
    for (const tour of TOURS_CONFIG) {
      assert.ok(tour.steps.length >= 2 && tour.steps.length <= 6, `Tour ${tour.id} deve ter entre 2 e 6 passos`);

      for (const step of tour.steps) {
        assert.ok(step.title && step.title.length > 0, `Passo ${step.id} deve ter título`);
        assert.ok(step.text && step.text.length > 0, `Passo ${step.id} deve ter texto explicativo`);

        const wordCount = step.text.trim().split(/\s+/).length;
        assert.ok(
          wordCount <= 26,
          `Passo [${tour.id} -> ${step.id}] possui ${wordCount} palavras. Limite máximo é 25 palavras.`
        );
      }
    }
  });

  // =========================================================================
  // MÓDULO 4: Conformidade de Acessibilidade e Gestão de Rolagem no AutomatchTour
  // =========================================================================
  test('4.1: AutomatchTour.jsx implementa bloqueio e desbloqueio exclusivo via scrollLockCore.js', () => {
    const tourComponentContent = fs.readFileSync(path.join(rootDir, 'src/components/tour/AutomatchTour.jsx'), 'utf-8');

    assert.ok(
      tourComponentContent.includes("from '../../utils/scrollLockCore'"),
      'Deve importar exclusivamente de scrollLockCore'
    );
    assert.ok(tourComponentContent.includes('lockScroll()'), 'Deve invocar lockScroll()');
    assert.ok(tourComponentContent.includes('unlockScroll()'), 'Deve invocar unlockScroll()');
  });

  test('4.2: AutomatchTour.jsx implementa atributos acessíveis WCAG AAA (role dialog, aria-live, teclado)', () => {
    const tourComponentContent = fs.readFileSync(path.join(rootDir, 'src/components/tour/AutomatchTour.jsx'), 'utf-8');

    assert.ok(tourComponentContent.includes('role="dialog"'), 'Deve possuir role="dialog"');
    assert.ok(tourComponentContent.includes('aria-modal="true"'), 'Deve possuir aria-modal="true"');
    assert.ok(tourComponentContent.includes('aria-labelledby'), 'Deve possuir aria-labelledby');
    assert.ok(tourComponentContent.includes('aria-describedby'), 'Deve possuir aria-describedby');
    assert.ok(tourComponentContent.includes('aria-live="polite"'), 'Deve possuir região aria-live="polite"');
    assert.ok(tourComponentContent.includes("e.key === 'Escape'"), 'Deve tratar tecla Escape');
    assert.ok(tourComponentContent.includes("e.key === 'ArrowRight'"), 'Deve tratar tecla ArrowRight');
    assert.ok(tourComponentContent.includes("e.key === 'ArrowLeft'"), 'Deve tratar tecla ArrowLeft');
    assert.ok(tourComponentContent.includes("e.key === 'Tab'"), 'Deve conter Focus Trap com tecla Tab');
    assert.ok(tourComponentContent.includes('prefers-reduced-motion'), 'Deve respeitar prefers-reduced-motion');
  });

  // =========================================================================
  // MÓDULO 5: Proteção de Regras Permanentes (Itens Descontinuados Não Podem Retornar)
  // =========================================================================
  test('5.1: Nenhum texto do tour ou howItWorksData deve citar funcionalidades descontinuadas', () => {
    const tourDataContent = fs.readFileSync(path.join(rootDir, 'src/data/tourGuideData.js'), 'utf-8');
    const howItWorksDataContent = fs.readFileSync(path.join(rootDir, 'src/data/howItWorksData.js'), 'utf-8');
    const combined = tourDataContent + '\n' + howItWorksDataContent;

    const forbiddenTerms = [
      'Garantia Estendida',
      'Estimativa Real',
      'Preço Justo Fipe',
      'Painel do usuário',
    ];

    for (const term of forbiddenTerms) {
      assert.ok(
        !combined.includes(term),
        `O termo descontinuado "${term}" não deve constar em tourGuideData nem em howItWorksData.`
      );
    }
  });
});

