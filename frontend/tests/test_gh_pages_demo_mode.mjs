/**
 * test_gh_pages_demo_mode.mjs — Testes de validação do modo demonstração para deploy no GitHub Pages.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para garantir que a aplicação funcione perfeitamente sem backend ativo quando hospedada estaticamente.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(rootDir, '..');

describe('BATERIA DE TESTES - TAREFA 3: Modo Demonstração no GitHub Pages', () => {
  const workflowPath = path.join(repoRoot, '.github/workflows/static.yml');
  const catalogPath = path.join(rootDir, 'src/pages/ShowcaseCatalog.jsx');
  const apiClientPath = path.join(rootDir, 'src/services/apiClient.js');

  const workflowContent = fs.readFileSync(workflowPath, 'utf-8');
  const catalogContent = fs.readFileSync(catalogPath, 'utf-8');
  const apiClientContent = fs.readFileSync(apiClientPath, 'utf-8');

  test('3.1: static.yml define VITE_DEMO_MODE="true" no build do GitHub Pages', () => {
    assert.ok(
      workflowContent.includes('VITE_DEMO_MODE: "true"') || workflowContent.includes("VITE_DEMO_MODE: 'true'"),
      'Workflow static.yml deve configurar a variável de ambiente VITE_DEMO_MODE'
    );
  });

  test('3.2: apiClient.js reconhece VITE_DEMO_MODE em isDemoModeEnabled()', () => {
    assert.ok(
      apiClientContent.includes("VITE_DEMO_MODE === 'true'"),
      'isDemoModeEnabled() deve verificar VITE_DEMO_MODE'
    );
  });

  test('3.3: ShowcaseCatalog.jsx renderiza etiqueta discreta de modo demonstração', () => {
    assert.ok(
      catalogContent.includes('isDemoModeEnabled()') && catalogContent.includes('Modo demonstração'),
      'ShowcaseCatalog deve exibir tag de Modo demonstração quando isDemoModeEnabled() for verdadeiro'
    );
  });

  test('3.4: ShowcaseCatalog.jsx condiciona o banner de erro a !isDemoModeEnabled()', () => {
    assert.ok(
      catalogContent.includes('!isDemoModeEnabled() && apiError'),
      'O banner de servidor indisponível não deve aparecer em modo demonstração'
    );
  });

  test('3.5: ShowcaseCatalog.jsx bypassa requisição de API com falha esperada quando em demo mode', () => {
    assert.ok(
      catalogContent.includes('if (isDemoModeEnabled()) {') &&
      catalogContent.includes('setAllCars(unique);'),
      'ShowcaseCatalog deve carregar os dados estáticos imediatamente sem disparar fetch fadado a erro 404'
    );
  });
});
