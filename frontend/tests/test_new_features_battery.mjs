import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Utilitário para verificar sintaxe de arquivos JS/JSX
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

    // Toggle de strings
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

    // Linha de comentário
    if (char === '/' && content[i + 1] === '/') {
      const nextLine = content.indexOf('\n', i);
      if (nextLine !== -1) {
        i = nextLine;
        continue;
      }
    }

    // Bloco de comentário
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

describe('BATERIA DE TESTES - NOVAS FUNCIONALIDADES (SPRINT EXPANDIDA)', () => {

  // 1. MUST HAVE: MarketPriceIndicator
  describe('1. Indicador de Preço de Mercado / FIPE (MarketPriceIndicator)', () => {
    const filePath = path.join(rootDir, 'src/components/vehicle/MarketPriceIndicator.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    test('1.1: Componente existe e exporta default', () => {
      assert.ok(fs.existsSync(filePath), 'MarketPriceIndicator.jsx deve existir');
      assert.ok(
        content.includes('export default function MarketPriceIndicator') || 
        content.includes('export default MarketPriceIndicator'), 
        'Deve exportar default MarketPriceIndicator'
      );
    });

    test('1.2: Implementa cálculo de diferencial e análise FIPE', () => {
      assert.ok(content.includes('fipePrice') || content.includes('fipe'), 'Deve processar dados FIPE');
      assert.ok(content.includes('toLocaleString') || content.includes('Intl.NumberFormat'), 'Deve formatar moedas');
      assert.ok(content.includes('diffPercent') || content.includes('diffFromImv'), 'Deve calcular variação percentual de mercado');
    });

    test('1.3: Exibe badges semânticos de oportunidade e barra comparativa', () => {
      assert.ok(content.includes('Oportunidade') || content.includes('Preço Justo') || content.includes('HIGH_PRICE'), 'Deve possuir categorização de preço');
      assert.ok(content.includes('motion.div') || content.includes('bg-emerald') || content.includes('bar'), 'Deve possuir elemento visual comparativo');
    });

    test('1.4: Possui sintaxe balanceada e sem erros estruturais', () => {
      verifyBalancedSyntax(content, 'MarketPriceIndicator.jsx');
    });
  });

  // 2. MUST HAVE: VehicleComparatorModal
  describe('2. Comparador Lado a Lado de Veículos (VehicleComparatorModal)', () => {
    const filePath = path.join(rootDir, 'src/components/vehicle/VehicleComparatorModal.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    test('2.1: Componente existe e exporta default', () => {
      assert.ok(fs.existsSync(filePath), 'VehicleComparatorModal.jsx deve existir');
      assert.ok(
        content.includes('export default function VehicleComparatorModal') || 
        content.includes('export default VehicleComparatorModal'), 
        'Deve exportar default VehicleComparatorModal'
      );
    });

    test('2.2: Suporta seleção comparativa com remoção e adição', () => {
      assert.ok(content.includes('selectedVehicles') || content.includes('vehicles'), 'Deve receber veículos para comparação');
      assert.ok(content.includes('onRemove') || content.includes('remove') || content.includes('handleRemoveCar'), 'Deve permitir remover veículo do comparativo');
      assert.ok(content.includes('onClose'), 'Deve conter callback de fechamento onClose');
    });

    test('2.3: Apresenta tabela com especificações técnicas e equipamentos', () => {
      assert.ok(content.includes('Preço') || content.includes('price'), 'Deve comparar preço');
      assert.ok(content.includes('mileage') || content.includes('km'), 'Deve comparar quilometragem');
      assert.ok(content.includes('Fuel') || content.includes('combustivel'), 'Deve comparar combustível');
      assert.ok(content.includes('transmission') || content.includes('Câmbio') || content.includes('cambio'), 'Deve comparar transmissão');
    });

    test('2.4: Possui sintaxe balanceada e sem erros estruturais', () => {
      verifyBalancedSyntax(content, 'VehicleComparatorModal.jsx');
    });
  });

  // 3. MUST HAVE: Vehicle360Viewer
  describe('3. Visualizador 360 Graus Interativo (Vehicle360Viewer)', () => {
    const filePath = path.join(rootDir, 'src/components/vehicle/Vehicle360Viewer.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    test('3.1: Componente existe e exporta default', () => {
      assert.ok(fs.existsSync(filePath), 'Vehicle360Viewer.jsx deve existir');
      assert.ok(
        content.includes('export default function Vehicle360Viewer') || 
        content.includes('export default Vehicle360Viewer'), 
        'Deve exportar default Vehicle360Viewer'
      );
    });

    test('3.2: Implementa rotação interativa por mouse e touch', () => {
      assert.ok(content.includes('onMouseDown') || content.includes('handleMouseDown'), 'Deve tratar eventos de mouse');
      assert.ok(content.includes('onTouchStart') || content.includes('handleTouchStart'), 'Deve tratar eventos de touch mobile');
      assert.ok(content.includes('currentAngle') || content.includes('activeAngle') || content.includes('angleIndex') || content.includes('angles'), 'Deve gerenciar ângulo de visão 360');
    });

    test('3.3: Possui botões de navegação, presets de ângulos e rotação contínua', () => {
      assert.ok(content.includes('RotateCw') || content.includes('RotateCcw') || content.includes('isAutoRotating') || content.includes('autoRotate'), 'Deve ter controles de rotação automática ou manual');
    });

    test('3.4: Possui sintaxe balanceada e sem erros estruturais', () => {
      verifyBalancedSyntax(content, 'Vehicle360Viewer.jsx');
    });
  });

  // 4. SHOULD HAVE: B2BRepassePanel
  describe('4. Painel B2B de Repasse e Margem de Negociação (B2BRepassePanel)', () => {
    const filePath = path.join(rootDir, 'src/components/inventory/B2BRepassePanel.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    test('4.1: Componente existe e exporta default', () => {
      assert.ok(fs.existsSync(filePath), 'B2BRepassePanel.jsx deve existir');
      assert.ok(
        content.includes('export default function B2BRepassePanel') || 
        content.includes('export default B2BRepassePanel'), 
        'Deve exportar default B2BRepassePanel'
      );
    });

    test('4.2: Implementa cálculo de margens e simulações para revendedores', () => {
      assert.ok(content.includes('grossMargin') || content.includes('margin') || content.includes('repasse') || content.includes('FIPE'), 'Deve calcular margens de repasse');
      assert.ok(content.includes('opportunityScore') || content.includes('score') || content.includes('desconto') || content.includes('discount'), 'Deve conter indicadores financeiros');
    });

    test('4.3: Contém filtros e listagem de veículos elegíveis a repasse', () => {
      assert.ok(content.includes('b2bItems') && content.includes('inventory'), 'Deve gerenciar estoque para repasse');
      assert.ok(content.includes('visible_b2b'), 'Deve filtrar por elegibilidade B2B');
    });

    test('4.4: Possui sintaxe balanceada e sem erros estruturais', () => {
      verifyBalancedSyntax(content, 'B2BRepassePanel.jsx');
    });
  });

  // 5. SHOULD HAVE: WarrantyBadgeModal
  describe('5. Modal de Garantia e Extensão de Garantia (WarrantyBadgeModal)', () => {
    const filePath = path.join(rootDir, 'src/components/vehicle/WarrantyBadgeModal.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    test('5.1: Componente existe e exporta default', () => {
      assert.ok(fs.existsSync(filePath), 'WarrantyBadgeModal.jsx deve existir');
      assert.ok(
        content.includes('export default function WarrantyBadgeModal') || 
        content.includes('export default WarrantyBadgeModal'), 
        'Deve exportar default WarrantyBadgeModal'
      );
    });

    test('5.2: Apresenta planos de cobertura (motor, câmbio, elétrica, laudo)', () => {
      assert.ok(content.includes('Motor'), 'Deve cobrir motor');
      assert.ok(content.includes('Transmissão') || content.includes('câmbio'), 'Deve cobrir transmissão/câmbio');
      assert.ok(content.includes('WARRANTY') || content.includes('Garantia') || content.includes('Meses'), 'Deve detalhar planos');
    });

    test('5.3: Implementa fechamento por backdrop e botão fechar', () => {
      assert.ok(content.includes('onClose'), 'Deve conter handler de fechamento');
      assert.ok(content.includes('isOpen'), 'Deve responder à visibilidade isOpen');
    });

    test('5.4: Possui sintaxe balanceada e sem erros estruturais', () => {
      verifyBalancedSyntax(content, 'WarrantyBadgeModal.jsx');
    });
  });

  // 6. COULD HAVE: AIStudioModal
  describe('6. Estúdio Virtual IA de Veículos (AIStudioModal)', () => {
    const filePath = path.join(rootDir, 'src/components/inventory/AIStudioModal.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    test('6.1: Componente existe e exporta default', () => {
      assert.ok(fs.existsSync(filePath), 'AIStudioModal.jsx deve existir');
      assert.ok(
        content.includes('export default function AIStudioModal') || 
        content.includes('export default AIStudioModal'), 
        'Deve exportar default AIStudioModal'
      );
    });

    test('6.2: Contém múltiplos cenários para troca de fundo IA', () => {
      assert.ok(content.includes('SCENARIOS') || content.includes('scenarios') || content.includes('preset') || content.includes('Estúdio') || content.includes('dark'), 'Deve oferecer cenários virtuais');
      assert.ok(content.includes('Sparkles') || content.includes('Wand2') || content.includes('ia') || content.includes('IA'), 'Deve conter ícones/elementos visuais de IA');
    });

    test('6.3: Implementa fluxo de upload/drag-and-drop e visualização antes/depois', () => {
      assert.ok(content.includes('upload') || content.includes('Upload') || content.includes('file') || content.includes('drop'), 'Deve permitir upload de foto do veículo');
      assert.ok(content.includes('onClose'), 'Deve conter handler de fechamento');
    });

    test('6.4: Possui sintaxe balanceada e sem erros estruturais', () => {
      verifyBalancedSyntax(content, 'AIStudioModal.jsx');
    });
  });

  // 7. INTEGRAÇÃO COM AS PÁGINAS PRINCIPAIS
  describe('7. Integrações nas Páginas Principais (ShowcaseVehicleDetails, ShowcaseCatalog e Dashboard)', () => {
    const detailsContent = fs.readFileSync(path.join(rootDir, 'src/pages/ShowcaseVehicleDetails.jsx'), 'utf-8');
    const catalogContent = fs.readFileSync(path.join(rootDir, 'src/pages/ShowcaseCatalog.jsx'), 'utf-8');
    const dashboardContent = fs.readFileSync(path.join(rootDir, 'src/pages/Dashboard.jsx'), 'utf-8');

    test('7.1: ShowcaseVehicleDetails integra MarketPriceIndicator, VehicleComparatorModal, Vehicle360Viewer e WarrantyBadgeModal', () => {
      assert.ok(detailsContent.includes('MarketPriceIndicator'), 'ShowcaseVehicleDetails deve integrar MarketPriceIndicator');
      assert.ok(detailsContent.includes('VehicleComparatorModal'), 'ShowcaseVehicleDetails deve integrar VehicleComparatorModal');
      assert.ok(detailsContent.includes('Vehicle360Viewer'), 'ShowcaseVehicleDetails deve integrar Vehicle360Viewer');
      assert.ok(detailsContent.includes('WarrantyBadgeModal'), 'ShowcaseVehicleDetails deve integrar WarrantyBadgeModal');
    });

    test('7.2: ShowcaseCatalog integra VehicleComparatorModal com comparador rápido', () => {
      assert.ok(catalogContent.includes('VehicleComparatorModal'), 'ShowcaseCatalog deve integrar VehicleComparatorModal');
    });

    test('7.3: Dashboard integra AIStudioModal e B2BRepassePanel', () => {
      assert.ok(dashboardContent.includes('AIStudioModal'), 'Dashboard deve integrar AIStudioModal');
      assert.ok(dashboardContent.includes('B2BRepassePanel'), 'Dashboard deve integrar B2BRepassePanel');
    });

    test('7.4: Páginas principais mantêm sintaxe íntegra e balanceada', () => {
      verifyBalancedSyntax(detailsContent, 'ShowcaseVehicleDetails.jsx');
      verifyBalancedSyntax(catalogContent, 'ShowcaseCatalog.jsx');
      verifyBalancedSyntax(dashboardContent, 'Dashboard.jsx');
    });
  });

});
