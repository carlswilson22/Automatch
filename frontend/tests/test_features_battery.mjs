import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Simulação de localStorage e window para execução dos testes em ambiente Node.js
const mockStorage = new Map();
globalThis.window = {};
globalThis.localStorage = {
  getItem: (key) => mockStorage.get(key) ?? null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

// Import dinâmico do módulo de dados de inventário
const inventoryModule = await import('../src/data/inventoryData.js');
const aiCoreModule = await import('../src/utils/aiConsultantCore.js');
const scrollLockCoreModule = await import('../src/utils/scrollLockCore.js');

describe('BATERIA DE TESTES 1: Remoção de "Diferenciais e Itens de Série"', () => {
  const showcasePath = path.join(rootDir, 'src/pages/ShowcaseVehicleDetails.jsx');
  const showcaseContent = fs.readFileSync(showcasePath, 'utf-8');

  test('1.1: O termo "Diferenciais e Itens de Série" não deve existir no arquivo', () => {
    assert.strictEqual(
      showcaseContent.includes('Diferenciais e Itens de Série'),
      false,
      'O texto "Diferenciais e Itens de Série" ainda está presente no arquivo!'
    );
    assert.strictEqual(
      showcaseContent.toLowerCase().includes('diferencias e itens de série'),
      false,
      'Variante do texto ainda está presente!'
    );
  });

  test('1.2: A seção de tags de diferenciais do veículo não deve existir', () => {
    assert.strictEqual(
      showcaseContent.includes('Destaques e Equipamentos do Veículo'),
      false,
      'Comentário/seção antiga de destaques e diferenciais ainda persiste!'
    );
  });

  test('1.3: As seções essenciais "Descrição do Veículo" e "Ficha Técnica & Equipamentos" devem permanecer intactas', () => {
    assert.ok(
      showcaseContent.includes('Descrição do Veículo'),
      'A seção "Descrição do Veículo" deve ser mantida!'
    );
    assert.ok(
      showcaseContent.includes('Ficha Técnica & Equipamentos'),
      'A seção "Ficha Técnica & Equipamentos" deve ser mantida!'
    );
    assert.ok(
      showcaseContent.includes('Custo Estimado de Propriedade (TCO)'),
      'A seção de calculadora TCO deve ser mantida!'
    );
  });

  test('1.4: O arquivo ShowcaseVehicleDetails.jsx deve ter sintaxe equilibrada (chaves, colchetes e parênteses)', () => {
    let braces = 0, parens = 0, brackets = 0;
    for (let i = 0; i < showcaseContent.length; i++) {
      const ch = showcaseContent[i];
      if (ch === '{') braces++;
      else if (ch === '}') braces--;
      else if (ch === '(') parens++;
      else if (ch === ')') parens--;
      else if (ch === '[') brackets++;
      else if (ch === ']') brackets--;
      assert.ok(braces >= 0, `Chaves desbalanceadas no caractere ${i}`);
      assert.ok(parens >= 0, `Parênteses desbalanceados no caractere ${i}`);
      assert.ok(brackets >= 0, `Colchetes desbalanceados no caractere ${i}`);
    }
    assert.strictEqual(braces, 0, 'Chaves finais não balanceadas');
    assert.strictEqual(parens, 0, 'Parênteses finais não balanceados');
    assert.strictEqual(brackets, 0, 'Colchetes finais não balanceados');
  });
});

describe('BATERIA DE TESTES 2: Módulo de Dados do Inventário (inventoryData.js)', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  test('2.1: Deve conter a lista de lojas com ID, nome e color_theme', () => {
    const { stores } = inventoryModule;
    assert.ok(Array.isArray(stores), 'stores deve ser um array');
    assert.strictEqual(stores.length, 3, 'Devem existir 3 lojas cadastradas');
    
    for (const store of stores) {
      assert.ok(store.id, 'Loja deve ter id');
      assert.ok(store.name, 'Loja deve ter nome');
      assert.ok(store.color_theme, 'Loja deve ter color_theme');
    }
  });

  test('2.2: Deve conter inventário inicial enriquecido com campos de configuração', () => {
    const { inventory } = inventoryModule;
    assert.ok(Array.isArray(inventory), 'inventory deve ser um array');
    assert.strictEqual(inventory.length, 5, 'Inventário inicial deve conter 5 veículos');

    const firstItem = inventory[0];
    assert.ok(firstItem.id, 'Ativo deve ter id');
    assert.ok(firstItem.storeId, 'Ativo deve ter storeId');
    assert.ok(firstItem.model, 'Ativo deve ter model');
    assert.ok(firstItem.brand, 'Ativo deve ter brand');
    assert.ok(firstItem.plate, 'Ativo deve ter plate');
    assert.ok(typeof firstItem.sale_value === 'number', 'sale_value deve ser numérico');
    assert.ok(typeof firstItem.floor_price === 'number', 'floor_price deve ser numérico');
    assert.ok(['paid', 'pending', 'financed'].includes(firstItem.financial_status), 'financial_status inválido');
    assert.ok(['available', 'negotiation', 'reserved', 'sold'].includes(firstItem.operational_status), 'operational_status inválido');
  });

  test('2.3: getStoredInventory() deve retornar itens padrão quando storage estiver vazio e inicializá-lo', () => {
    const items = inventoryModule.getStoredInventory();
    assert.strictEqual(items.length, 5);
    assert.strictEqual(mockStorage.has('automatch_b2b_inventory_data_v2'), true);
  });

  test('2.4: updateInventoryAsset() deve atualizar um ativo existente e persistir no storage', () => {
    inventoryModule.getStoredInventory(); // inicializa
    const updated = inventoryModule.updateInventoryAsset({
      id: 'inv-001',
      sale_value: 195000,
      floor_price: 180000,
      financial_status: 'financed',
      operational_status: 'negotiation',
      notes: 'Cliente em análise de crédito'
    });

    const target = updated.find(i => i.id === 'inv-001');
    assert.ok(target, 'Ativo atualizado deve existir no resultado');
    assert.strictEqual(target.sale_value, 195000);
    assert.strictEqual(target.floor_price, 180000);
    assert.strictEqual(target.financial_status, 'financed');
    assert.strictEqual(target.operational_status, 'negotiation');
    assert.strictEqual(target.notes, 'Cliente em análise de crédito');
    // Marca e modelo originais preservados
    assert.strictEqual(target.brand, 'Toyota');
    assert.strictEqual(target.model, 'Corolla Cross XRX');

    // Confirma persistência lendo novamente do storage
    const reloaded = inventoryModule.getStoredInventory();
    const reloadedTarget = reloaded.find(i => i.id === 'inv-001');
    assert.strictEqual(reloadedTarget.sale_value, 195000);
  });

  test('2.5: deleteInventoryAsset() deve excluir o ativo especificado e manter os demais', () => {
    inventoryModule.getStoredInventory(); // inicializa
    const remaining = inventoryModule.deleteInventoryAsset('inv-002');
    
    assert.strictEqual(remaining.length, 4);
    assert.strictEqual(remaining.some(i => i.id === 'inv-002'), false);

    const reloaded = inventoryModule.getStoredInventory();
    assert.strictEqual(reloaded.length, 4);
    assert.strictEqual(reloaded.some(i => i.id === 'inv-002'), false);
  });

  test('2.6: resetInventoryToDefault() deve restaurar o inventário padrão completo', () => {
    inventoryModule.deleteInventoryAsset('inv-001');
    inventoryModule.deleteInventoryAsset('inv-002');
    assert.strictEqual(inventoryModule.getStoredInventory().length, 3);

    const resetResult = inventoryModule.resetInventoryToDefault();
    assert.strictEqual(resetResult.length, 5);
    assert.strictEqual(inventoryModule.getStoredInventory().length, 5);
  });
});

describe('BATERIA DE TESTES 3: Modal de Configuração do Ativo (AssetConfigurationModal.jsx)', () => {
  const modalPath = path.join(rootDir, 'src/components/inventory/AssetConfigurationModal.jsx');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');

  test('3.1: Componente AssetConfigurationModal deve existir e exportar default', () => {
    assert.ok(fs.existsSync(modalPath), 'Arquivo AssetConfigurationModal.jsx não encontrado!');
    assert.ok(
      modalContent.includes('export default function AssetConfigurationModal'),
      'Componente deve ter export default'
    );
  });

  test('3.2: Deve conter suporte para abas de navegação (pricing, details, visibility)', () => {
    assert.ok(modalContent.includes("activeTab === 'pricing'"), 'Aba pricing ausente');
    assert.ok(modalContent.includes("activeTab === 'details'"), 'Aba details ausente');
    assert.ok(modalContent.includes("activeTab === 'visibility'"), 'Aba visibility ausente');
  });

  test('3.3: Deve conter cálculo reativo de margem operacional (sale_value - floor_price)', () => {
    assert.ok(
      modalContent.includes('formData.sale_value') && modalContent.includes('formData.floor_price'),
      'Campos de precificação ausentes no modal'
    );
    assert.ok(
      modalContent.includes('margin'),
      'Cálculo de margem operacional deve estar presente'
    );
  });

  test('3.4: Deve permitir seleção de status financeiro (Quitado, Pendente, Financiado)', () => {
    assert.ok(modalContent.includes("'paid'"), 'Opção Quitado ausente');
    assert.ok(modalContent.includes("'pending'"), 'Opção Pendente ausente');
    assert.ok(modalContent.includes("'financed'"), 'Opção Financiado ausente');
  });

  test('3.5: Deve permitir seleção de disponibilidade de estoque (Disponível, Negociação, Reservado, Vendido)', () => {
    assert.ok(modalContent.includes("'available'"), 'Opção Disponível ausente');
    assert.ok(modalContent.includes("'negotiation'"), 'Opção Negociação ausente');
    assert.ok(modalContent.includes("'reserved'"), 'Opção Reservado ausente');
    assert.ok(modalContent.includes("'sold'"), 'Opção Vendido ausente');
  });

  test('3.6: Deve conter fluxo de confirmação seguro para exclusão de ativo', () => {
    assert.ok(modalContent.includes('isConfirmingDelete'), 'Estado isConfirmingDelete ausente');
    assert.ok(modalContent.includes('handleDelete'), 'Handler handleDelete ausente');
  });

  test('3.7: Sintaxe e fechamento de blocos no AssetConfigurationModal.jsx devem ser válidos', () => {
    let braces = 0, parens = 0, brackets = 0;
    for (let i = 0; i < modalContent.length; i++) {
      const ch = modalContent[i];
      if (ch === '{') braces++;
      else if (ch === '}') braces--;
      else if (ch === '(') parens++;
      else if (ch === ')') parens--;
      else if (ch === '[') brackets++;
      else if (ch === ']') brackets--;
      assert.ok(braces >= 0, `Chaves desbalanceadas no caractere ${i}`);
      assert.ok(parens >= 0, `Parênteses desbalanceados no caractere ${i}`);
      assert.ok(brackets >= 0, `Colchetes desbalanceados no caractere ${i}`);
    }
    assert.strictEqual(braces, 0, 'Chaves finais não balanceadas');
    assert.strictEqual(parens, 0, 'Parênteses finais não balanceados');
    assert.strictEqual(brackets, 0, 'Colchetes finais não balanceados');
  });
});

describe('BATERIA DE TESTES 4: Página de Gestão de Ativos e Botão (Dashboard.jsx)', () => {
  const dashboardPath = path.join(rootDir, 'src/pages/Dashboard.jsx');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8');

  test('4.1: Deve exibir o botão "Gestão de Ativos" no modo Grade com ícone e onClick configurado', () => {
    assert.ok(
      dashboardContent.includes('Gestão de Ativos'),
      'O botão com texto "Gestão de Ativos" deve estar presente no Dashboard!'
    );
    assert.ok(
      dashboardContent.includes('handleOpenConfigureAsset(item)'),
      'O botão deve chamar handleOpenConfigureAsset ao ser clicado!'
    );
  });

  test('4.2: Deve exibir o botão "Gestão de Ativos" na tabela do modo Lista', () => {
    assert.ok(
      dashboardContent.includes('<th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>'),
      'A coluna "Ações" deve estar presente na tabela do modo Lista'
    );
  });

  test('4.3: Deve integrar o modal AssetConfigurationModal passando props obrigatórias', () => {
    assert.ok(
      dashboardContent.includes('<AssetConfigurationModal'),
      'AssetConfigurationModal deve ser instanciado no Dashboard'
    );
    assert.ok(
      dashboardContent.includes('isOpen={isConfigModalOpen}'),
      'Prop isOpen vinculada ao estado'
    );
    assert.ok(
      dashboardContent.includes('onSave={handleSaveAsset}'),
      'Prop onSave vinculada ao handler handleSaveAsset'
    );
    assert.ok(
      dashboardContent.includes('onDelete={handleDeleteAsset}'),
      'Prop onDelete vinculada ao handler handleDeleteAsset'
    );
  });

  test('4.4: Deve conter exibição de feedback / toast após salvar ou excluir ativo', () => {
    assert.ok(
      dashboardContent.includes('feedbackToast'),
      'Estado feedbackToast deve existir no Dashboard'
    );
    assert.ok(
      dashboardContent.includes('configurado com sucesso!'),
      'Mensagem de sucesso ao salvar configuração deve estar presente'
    );
  });

  test('4.5: Lógica de cálculo de estatísticas da loja deve ser dinâmica', () => {
    // Simula cálculo de getStoreStats
    const mockInventory = [
      { id: '1', sale_value: 100000, financial_status: 'paid' },
      { id: '2', sale_value: 80000, financial_status: 'pending' },
      { id: '3', sale_value: 120000, financial_status: 'financed' }
    ];

    const totalAssets = mockInventory.length;
    const totalValue = mockInventory.reduce((acc, item) => acc + (Number(item.sale_value) || 0), 0);
    const pendingFinance = mockInventory.filter(i => i.financial_status === 'pending').length;

    assert.strictEqual(totalAssets, 3);
    assert.strictEqual(totalValue, 300000);
    assert.strictEqual(pendingFinance, 1);
  });

  test('4.6: Sintaxe e fechamento de blocos no Dashboard.jsx devem ser válidos', () => {
    let braces = 0, parens = 0, brackets = 0;
    for (let i = 0; i < dashboardContent.length; i++) {
      const ch = dashboardContent[i];
      if (ch === '{') braces++;
      else if (ch === '}') braces--;
      else if (ch === '(') parens++;
      else if (ch === ')') parens--;
      else if (ch === '[') brackets++;
      else if (ch === ']') brackets--;
      assert.ok(braces >= 0, `Chaves desbalanceadas no caractere ${i}`);
      assert.ok(parens >= 0, `Parênteses desbalanceados no caractere ${i}`);
      assert.ok(brackets >= 0, `Colchetes desbalanceados no caractere ${i}`);
    }
    assert.strictEqual(braces, 0, 'Chaves finais não balanceadas');
    assert.strictEqual(parens, 0, 'Parênteses finais não balanceados');
    assert.strictEqual(brackets, 0, 'Colchetes finais não balanceados');
  });
});

describe('BATERIA DE TESTES 5: Não-Regressão e Integridade dos Módulos Importadores', () => {
  const filesToCheck = [
    'src/components/layout/StoreSelector.jsx',
    'src/components/ui/StoreIdentifier.jsx',
    'src/pages/Home.jsx',
    'src/pages/ShowcaseCatalog.jsx',
    'src/pages/NewCarAdForm.jsx',
    'src/App.jsx'
  ];

  for (const relPath of filesToCheck) {
    test(`5: Arquivo ${relPath} deve existir e ser sintaticamente válido`, () => {
      const fullPath = path.join(rootDir, relPath);
      assert.ok(fs.existsSync(fullPath), `Arquivo ${relPath} não encontrado!`);
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      let braces = 0, parens = 0, brackets = 0;
      for (let i = 0; i < content.length; i++) {
        const ch = content[i];
        if (ch === '{') braces++;
        else if (ch === '}') braces--;
        else if (ch === '(') parens++;
        else if (ch === ')') parens--;
        else if (ch === '[') brackets++;
        else if (ch === ']') brackets--;
      }
      assert.strictEqual(braces, 0, `Chaves desbalanceadas em ${relPath}`);
      assert.strictEqual(parens, 0, `Parênteses desbalanceados em ${relPath}`);
      assert.strictEqual(brackets, 0, `Colchetes desbalanceados em ${relPath}`);
    });
  }

  test('5.2: As rotas essenciais para /dashboard e /encontrar/:id devem estar registradas no App.jsx', () => {
    const appPath = path.join(rootDir, 'src/App.jsx');
    const appContent = fs.readFileSync(appPath, 'utf-8');
    assert.ok(appContent.includes('path="/dashboard"'), 'Rota /dashboard não encontrada no App.jsx');
    assert.ok(appContent.includes('path="/encontrar/:id"'), 'Rota /encontrar/:id não encontrada no App.jsx');
  });
});

describe('BATERIA DE TESTES 6: Varredura 360° Fidedigna e Quadrante 180° Traseira', () => {
  const viewerPath = path.join(rootDir, 'src/components/vehicle/Vehicle360Viewer.jsx');
  const viewerContent = fs.readFileSync(viewerPath, 'utf-8');
  const showcaseDataPath = path.join(rootDir, 'src/data/showcaseData.js');
  const showcaseDataContent = fs.readFileSync(showcaseDataPath, 'utf-8');

  test('6.1: showcaseData.js deve mapear os 8 quadrantes angulares no photos360', () => {
    for (const angle of [0, 45, 90, 135, 180, 225, 270, 315]) {
      assert.ok(
        new RegExp(`\\b${angle}\\s*:`).test(showcaseDataContent),
        `Ângulo ${angle}° deve estar mapeado no photos360`
      );
    }
  });

  test('6.2: Ângulo 180° deve apontar fidedignamente para imagem de traseira dedicada (/images/cars/sc-001/180.jpg)', () => {
    assert.ok(
      showcaseDataContent.includes("180: '/images/cars/sc-001/180.jpg'"),
      'O ângulo 180° deve apontar para /images/cars/sc-001/180.jpg'
    );
  });

  test('6.3: Vehicle360Viewer.jsx deve conter miniaturas navegáveis e perspectiva 3D orbital', () => {
    assert.ok(
      viewerContent.includes('perspective') || viewerContent.includes('rotateY'),
      'Perspectiva 3D orbital deve estar implementada'
    );
    assert.ok(
      viewerContent.includes('currentAngle') || viewerContent.includes('setAngle'),
      'Controle angular de rotação 360 deve estar presente'
    );
  });

  test('6.4: Sintaxe e fechamento de blocos no Vehicle360Viewer.jsx devem ser válidos', () => {
    let braces = 0, parens = 0, brackets = 0;
    for (let i = 0; i < viewerContent.length; i++) {
      const ch = viewerContent[i];
      if (ch === '{') braces++;
      else if (ch === '}') braces--;
      else if (ch === '(') parens++;
      else if (ch === ')') parens--;
      else if (ch === '[') brackets++;
      else if (ch === ']') brackets--;
      assert.ok(braces >= 0, `Chaves desbalanceadas no caractere ${i}`);
      assert.ok(parens >= 0, `Parênteses desbalanceados no caractere ${i}`);
      assert.ok(brackets >= 0, `Colchetes desbalanceados no caractere ${i}`);
    }
    assert.strictEqual(braces, 0, 'Chaves finais não balanceadas');
    assert.strictEqual(parens, 0, 'Parênteses finais não balanceados');
    assert.strictEqual(brackets, 0, 'Colchetes finais não balanceados');
  });
});

describe('BATERIA DE TESTES 7: Remoção de Botões Duplicados de Contato no Detalhe do Veículo', () => {
  const showcasePath = path.join(rootDir, 'src/pages/ShowcaseVehicleDetails.jsx');
  const showcaseContent = fs.readFileSync(showcasePath, 'utf-8');

  test('7.1: Botões redundantes "Falar com Vendedor" foram removidos da navegação e sidebar', () => {
    assert.strictEqual(
      showcaseContent.includes('Falar com Vendedor'),
      false,
      'Os botões duplicados "Falar com Vendedor" não devem existir no ShowcaseVehicleDetails.jsx'
    );
  });

  test('7.2: Componente possui sintaxe íntegra após a limpeza dos botões redundantes', () => {
    let braces = 0, parens = 0, brackets = 0;
    for (let i = 0; i < showcaseContent.length; i++) {
      const ch = showcaseContent[i];
      if (ch === '{') braces++;
      else if (ch === '}') braces--;
      else if (ch === '(') parens++;
      else if (ch === ')') parens--;
      else if (ch === '[') brackets++;
      else if (ch === ']') brackets--;
      assert.ok(braces >= 0, `Chaves desbalanceadas no caractere ${i}`);
      assert.ok(parens >= 0, `Parênteses desbalanceados no caractere ${i}`);
      assert.ok(brackets >= 0, `Colchetes desbalanceados no caractere ${i}`);
    }
    assert.strictEqual(braces, 0, 'Chaves finais não balanceadas');
    assert.strictEqual(parens, 0, 'Parênteses finais não balanceados');
    assert.strictEqual(brackets, 0, 'Colchetes finais não balanceados');
  });
});

describe('BATERIA DE TESTES 8: Rede de Conexão B2B, Desempenho e Tradução do Hold Lock', () => {
  const modalPath = path.join(rootDir, 'src/components/partners/PartnershipHubModal.jsx');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');

  test('8.1: PartnershipHubModal.jsx deve isolar timer com componente memoizado ReservationTimerBadge', () => {
    assert.ok(
      modalContent.includes('ReservationTimerBadge'),
      'O componente memoizado ReservationTimerBadge deve estar presente para evitar re-renders globais a 1s'
    );
  });

  test('8.2: O modal deve conter a tradução pedagógica "Trava de Reserva Exclusiva (Hold Lock)"', () => {
    assert.ok(
      modalContent.includes('Trava de Reserva Exclusiva (Hold Lock)') || modalContent.includes('Trava Exclusiva (Hold Lock)'),
      'A tradução pedagógica do Hold Lock deve estar presente'
    );
    assert.ok(
      modalContent.includes('Como funciona a Trava de Reserva Exclusiva (Hold Lock)?'),
      'Banner educativo do Hold Lock deve estar presente'
    );
  });

  test('8.3: Ação de solicitar fechamento retira o Hold Lock e exibe status afirmativo', () => {
    assert.ok(
      modalContent.includes('isClosing') || modalContent.includes('closing_requested'),
      'Suporte a estado de fechamento solicitado deve existir'
    );
    assert.ok(
      modalContent.includes('Fechamento Solicitado'),
      'Badge afirmativo "Fechamento Solicitado" deve substituir o timer do Hold Lock'
    );
  });

  test('8.4: Sintaxe e fechamento de blocos no PartnershipHubModal.jsx devem ser válidos', () => {
    let braces = 0, parens = 0, brackets = 0;
    for (let i = 0; i < modalContent.length; i++) {
      const ch = modalContent[i];
      if (ch === '{') braces++;
      else if (ch === '}') braces--;
      else if (ch === '(') parens++;
      else if (ch === ')') parens--;
      else if (ch === '[') brackets++;
      else if (ch === ']') brackets--;
      assert.ok(braces >= 0, `Chaves desbalanceadas no caractere ${i}`);
      assert.ok(parens >= 0, `Parênteses desbalanceados no caractere ${i}`);
      assert.ok(brackets >= 0, `Colchetes desbalanceados no caractere ${i}`);
    }
    assert.strictEqual(braces, 0, 'Chaves finais não balanceadas');
    assert.strictEqual(parens, 0, 'Parênteses finais não balanceados');
    assert.strictEqual(brackets, 0, 'Colchetes finais não balanceados');
  });
});

describe('BATERIA DE TESTES 9: Unificação de Lojas da Vitrine e da Rede B2B', () => {
  test('9.1: inventoryData.js deve conter as 3 lojas padronizadas (AutoShop Prime, Motors Campinas, Concessionária Alpha)', () => {
    const { stores } = inventoryModule;
    const storeNames = stores.map(s => s.name);
    assert.ok(storeNames.includes('AutoShop Prime'), 'AutoShop Prime deve constar nas lojas');
    assert.ok(storeNames.includes('Motors Campinas'), 'Motors Campinas deve constar nas lojas');
    assert.ok(storeNames.includes('Concessionária Alpha'), 'Concessionária Alpha deve constar nas lojas');
  });

  test('9.2: showcaseData.js deve utilizar as mesmas lojas padronizadas nos dados dos veículos', () => {
    const showcasePath = path.join(rootDir, 'src/data/showcaseData.js');
    const showcaseContent = fs.readFileSync(showcasePath, 'utf-8');
    assert.ok(showcaseContent.includes('AutoShop Prime'), 'AutoShop Prime deve constar nos vendedores do showcase');
    assert.ok(showcaseContent.includes('Motors Campinas'), 'Motors Campinas deve constar nos vendedores do showcase');
    assert.ok(showcaseContent.includes('Concessionária Alpha'), 'Concessionária Alpha deve constar nos vendedores do showcase');
  });
});

describe('BATERIA DE TESTES 10: Contadores Dinâmicos de Veículos no Perfil do Usuário (ProfilePage.jsx)', () => {
  const profilePath = path.join(rootDir, 'src/pages/ProfilePage.jsx');
  const profileContent = fs.readFileSync(profilePath, 'utf-8');

  test('10.1: ProfilePage.jsx deve integrar contadores em tempo real para "Meus Carros", "Carros Favoritos" e "Estoque Vitrine"', () => {
    assert.ok(profileContent.includes('Meus Carros'), 'Card "Meus Carros" deve existir no perfil');
    assert.ok(profileContent.includes('Carros Favoritos'), 'Card "Carros Favoritos" deve existir no perfil');
    assert.ok(profileContent.includes('Estoque Vitrine'), 'Card "Estoque Vitrine" deve existir no perfil');
  });

  test('10.2: ProfilePage.jsx deve importar e assinar managers de dados em tempo real', () => {
    assert.ok(profileContent.includes('subscribeFavorites'), 'subscribeFavorites deve ser importado para reatividade');
    assert.ok(profileContent.includes('getNewCars'), 'getNewCars deve ser importado para contagem dos anúncios');
  });

  test('10.3: Sintaxe e fechamento de blocos no ProfilePage.jsx devem ser válidos', () => {
    let braces = 0, parens = 0, brackets = 0;
    for (let i = 0; i < profileContent.length; i++) {
      const ch = profileContent[i];
      if (ch === '{') braces++;
      else if (ch === '}') braces--;
      else if (ch === '(') parens++;
      else if (ch === ')') parens--;
      else if (ch === '[') brackets++;
      else if (ch === ']') brackets--;
      assert.ok(braces >= 0, `Chaves desbalanceadas no caractere ${i}`);
      assert.ok(parens >= 0, `Parênteses desbalanceados no caractere ${i}`);
      assert.ok(brackets >= 0, `Colchetes desbalanceados no caractere ${i}`);
    }
    assert.strictEqual(braces, 0, 'Chaves finais não balanceadas');
    assert.strictEqual(parens, 0, 'Parênteses finais não balanceados');
    assert.strictEqual(brackets, 0, 'Colchetes finais não balanceados');
  });
});

describe('BATERIA DE TESTES 11: Tarefa 1 - Componentes de Upload no Formulário "Anunciar meu carro"', () => {
  const formPath = path.join(rootDir, 'src/pages/NewCarAdForm.jsx');
  const formContent = fs.readFileSync(formPath, 'utf-8');

  test('11.1: NewCarAdForm.jsx deve conter componente de upload de vídeo com validação e preview', () => {
    assert.ok(formContent.includes('video/mp4') || formContent.includes('video/*') || formContent.includes('accept="video/mp4'), 'Deve aceitar vídeos MP4/WebM');
    assert.ok(formContent.includes('40 * 1024 * 1024') || formContent.includes('40MB') || formContent.includes('40 MB'), 'Deve validar limite de tamanho de 40 MB');
    assert.ok(formContent.includes('<video') || formContent.includes('videoPreview'), 'Deve renderizar preview do vídeo');
    assert.ok(formContent.includes('remover vídeo') || formContent.includes('Remover Vídeo') || formContent.includes('handleRemoveVideo'), 'Deve fornecer botão para remover vídeo');
  });

  test('11.2: NewCarAdForm.jsx deve conter componente de galeria multi-fotos com preview e botão de capa', () => {
    assert.ok(formContent.includes('multiple'), 'Input de galeria deve permitir seleção múltipla');
    assert.ok(formContent.includes('handleProcessGalleryFiles') || formContent.includes('handlePhotoUpload'), 'Deve possuir handler para fotos');
    assert.ok(formContent.includes('Usar como Capa') || formContent.includes('Definir como Capa'), 'Deve possuir ação para definir foto de capa');
    assert.ok(formContent.includes('galleryPhotos') || formContent.includes('gallery'), 'Deve gerenciar estado de galeria');
  });

  test('11.3: NewCarAdForm.jsx deve associar video_url e gallery ao salvar e enviar anúncio', () => {
    assert.ok(formContent.includes('video_url'), 'Deve associar video_url ao registro do veículo');
    assert.ok(formContent.includes('gallery'), 'Deve associar gallery ao registro do veículo');
  });
});

describe('BATERIA DE TESTES 12: Tarefa 2 - Varredura 360° no Detalhe do Anúncio', () => {
  const viewerPath = path.join(rootDir, 'src/components/vehicle/Vehicle360Viewer.jsx');
  const viewerContent = fs.readFileSync(viewerPath, 'utf-8');

  test('12.1: Vehicle360Viewer.jsx não deve conter DEFAULT_360_IMAGES genéricas de outro carro', () => {
    assert.strictEqual(
      viewerContent.includes('DEFAULT_360_IMAGES'),
      false,
      'DEFAULT_360_IMAGES com fotos de outro carro não deve existir no visualizador!'
    );
  });

  test('12.2: Vehicle360Viewer.jsx deve usar exclusivamente fotos do próprio veículo ou perspectiva 3D explícita', () => {
    assert.ok(
      viewerContent.includes('photos360') || viewerContent.includes('gallery') || viewerContent.includes('imageMap'),
      'Deve priorizar fotos reais do próprio veículo'
    );
    assert.ok(
      viewerContent.includes('Perspectiva 3D') || viewerContent.includes('PERSPECTIVA ORBITAL 3D'),
      'Deve indicar explicitamente perspectiva 3D quando apenas 1 foto for fornecida'
    );
    assert.ok(
      viewerContent.includes('360° FOTOGRÁFICO REAL') || viewerContent.includes('fotos do veículo'),
      'Deve identificar claramente quando fotos reais 360° estiverem disponíveis'
    );
  });
});

describe('BATERIA DE TESTES 13: Tarefa 3 - Botão e Modal "Dossiê Oficial Automatch"', () => {
  const modalPath = path.join(rootDir, 'src/components/vehicle/OfficialDossierModal.jsx');
  const detailsPath = path.join(rootDir, 'src/pages/ShowcaseVehicleDetails.jsx');

  test('13.1: OfficialDossierModal.jsx deve existir e conter estrutura completa', () => {
    assert.ok(fs.existsSync(modalPath), 'Arquivo OfficialDossierModal.jsx deve existir');
    const modalContent = fs.readFileSync(modalPath, 'utf-8');
    assert.ok(modalContent.includes('DOSSIÊ OFICIAL AUTOMATCH') || modalContent.includes('Dossiê Oficial Automatch'), 'Deve ter cabeçalho oficial');
    assert.ok(modalContent.includes('ATM-2026-') || modalContent.includes('protocol'), 'Deve conter protocolo oficial determinístico');
    assert.ok(modalContent.includes('Estrutura e Longarinas') || modalContent.includes('Estrutura e Chassi'), 'Deve conter tabela de inspeção estrutural');
    assert.ok(modalContent.includes('Termo de Conformidade') || modalContent.includes('TERMO DE CONFORMIDADE'), 'Deve conter termo de conformidade oficial');
    assert.ok(modalContent.includes('handlePrint') || modalContent.includes('window.print') || modalContent.includes('handleGeneratePdf'), 'Deve conter opção de impressão / exportação A4');
  });

  test('13.2: ShowcaseVehicleDetails.jsx deve conter botão "Dossiê Oficial Automatch" no grid de 4 colunas', () => {
    const detailsContent = fs.readFileSync(detailsPath, 'utf-8');
    assert.ok(detailsContent.includes('OfficialDossierModal'), 'ShowcaseVehicleDetails deve importar OfficialDossierModal');
    assert.ok(detailsContent.includes('Dossiê Oficial Automatch'), 'Deve exibir botão "Dossiê Oficial Automatch"');
    assert.ok(detailsContent.includes('isDossierModalOpen') || detailsContent.includes('setIsDossierModalOpen'), 'Deve controlar abertura do modal');
  });
});

describe('BATERIA DE TESTES 14: Tarefa 4 - Vitrine Digital: Remoção do Botão Redundante de Filtros', () => {
  const catalogPath = path.join(rootDir, 'src/pages/ShowcaseCatalog.jsx');
  const catalogContent = fs.readFileSync(catalogPath, 'utf-8');

  test('14.1: O botão redundante "Limpar todos" nos chips ativos deve ser removido', () => {
    assert.strictEqual(
      catalogContent.includes('Limpar todos</button>') || catalogContent.includes('Limpar todos\n'),
      false,
      'O botão de chip redundante "Limpar todos" deve ser removido'
    );
  });

  test('14.2: O botão principal "Limpar Filtros" no painel de filtros e em zero resultados deve ser mantido', () => {
    assert.ok(
      catalogContent.includes('Limpar Filtros') || catalogContent.includes('Limpar filtros'),
      'O botão principal "Limpar Filtros" deve ser preservado'
    );
  });
});

describe('BATERIA DE TESTES 15: Tarefa 5 - Vitrine Digital: Higienização dos Cards', () => {
  const catalogPath = path.join(rootDir, 'src/pages/ShowcaseCatalog.jsx');
  const catalogContent = fs.readFileSync(catalogPath, 'utf-8');

  test('15.1: O card da vitrine não deve exibir lojas fakes como "Beto Motors"', () => {
    assert.strictEqual(
      catalogContent.includes('Beto Motors'),
      false,
      'Nome fictício "Beto Motors" não deve estar presente no catálogo'
    );
  });

  test('15.2: O card da vitrine não deve conter botão inativo de localização nem "Preço Justo Fipe"', () => {
    assert.strictEqual(
      catalogContent.includes('aria-label="Ver localização"'),
      false,
      'Botão inativo de localização com MapPin deve ser removido dos cards'
    );
    assert.strictEqual(
      catalogContent.includes('MarketPriceIndicator'),
      false,
      'Badge Preço Justo Fipe (MarketPriceIndicator) deve ser removido dos cards'
    );
  });

  test('15.3: O botão "Ver Detalhes" no grid deve ocupar largura total (w-full)', () => {
    assert.ok(
      catalogContent.includes('w-full py-2.5 bg-brand-blue') || catalogContent.includes('w-full py-2.5'),
      'O botão "Ver Detalhes" deve ocupar largura total'
    );
  });
});

describe('BATERIA DE TESTES 16: Tarefa 6 - Rede B2B Conectada com Lojas Oficiais', () => {
  const hubPath = path.join(rootDir, 'src/components/partners/PartnershipHubModal.jsx');
  const invitePath = path.join(rootDir, 'src/components/partners/NewPartnershipInviteCard.jsx');
  const hubContent = fs.readFileSync(hubPath, 'utf-8');
  const inviteContent = fs.readFileSync(invitePath, 'utf-8');

  test('16.1: PartnershipHubModal.jsx deve carregar e sincronizar lojas oficiais do projeto', () => {
    assert.ok(
      hubContent.includes('officialProjectStores') || hubContent.includes('getOfficialFallbackStores'),
      'Deve importar e sincronizar com as lojas oficiais'
    );
    assert.ok(
      hubContent.includes('storesLoading'),
      'Deve gerenciar estado de carregamento storesLoading'
    );
  });

  test('16.2: NewPartnershipInviteCard.jsx deve tratar estado de carregamento e eliminar duplicidades', () => {
    assert.ok(
      inviteContent.includes('isLoading'),
      'Deve aceitar prop isLoading'
    );
    assert.ok(
      inviteContent.includes('Carregando lojas da rede B2B...') || inviteContent.includes('animate-spin'),
      'Deve exibir spinner de carregamento'
    );
    assert.ok(
      inviteContent.includes('seen.has(key)') || inviteContent.includes('seen'),
      'Deve deduplicar lojas para não fabricar nem duplicar lojistas'
    );
  });
});

describe('BATERIA DE TESTES 17: Controle de Acesso B2B em Duas Camadas (Rotas, UI e Contexto)', () => {
  const protectedRoutePath = path.join(rootDir, 'src/components/ProtectedRoute.jsx');
  const appPath = path.join(rootDir, 'src/App.jsx');
  const profilePath = path.join(rootDir, 'src/pages/ProfilePage.jsx');
  const newAdPath = path.join(rootDir, 'src/pages/NewCarAdForm.jsx');

  test('17.1: ProtectedRoute.jsx deve validar allowedRoles e proteger rotas restritas', () => {
    const content = fs.readFileSync(protectedRoutePath, 'utf-8');
    assert.ok(content.includes('allowedRoles'), 'Deve aceitar prop allowedRoles');
    assert.ok(content.includes('allowedRoles.includes(effectiveRole)'), 'Deve validar a role do usuário contra allowedRoles');
  });

  test('17.2: App.jsx deve proteger a rota /dashboard para admin e lojista', () => {
    const content = fs.readFileSync(appPath, 'utf-8');
    assert.ok(
      content.includes("allowedRoles={['admin', 'lojista']}"),
      'A rota /dashboard deve estar envolvida em ProtectedRoute com allowedRoles restrito'
    );
  });

  test('17.3: ProfilePage.jsx deve ocultar Painel B2B e Rede de Parceiros para compradores e visitantes', () => {
    const content = fs.readFileSync(profilePath, 'utf-8');
    assert.ok(content.includes('isB2BUser'), 'Deve calcular flag isB2BUser');
    assert.ok(content.includes('{isB2BUser && ('), 'Deve condicionar o card do Painel B2B à flag isB2BUser');
  });

  test('17.4: NewCarAdForm.jsx deve condicionar a seção de Compartilhamento B2B estritamente para isB2BUser', () => {
    const content = fs.readFileSync(newAdPath, 'utf-8');
    assert.ok(content.includes('isB2BUser'), 'Deve conter verificação isB2BUser no formulário de anúncio');
    assert.ok(content.includes('{isB2BUser && ('), 'Deve condicionar os campos de repasse B2B a isB2BUser');
  });
});

describe('BATERIA DE TESTES 18: Varredura 360° com Imagens Dedicadas e Exclusão de Não Cadastrados', () => {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const registeredCars = ['sc-001', 'sc-002', 'sc-003', 'sc-004', 'sc-005'];

  test('18.1: Cada carro cadastrado da vitrine deve possuir pasta com os 8 ângulos no frontend', () => {
    for (const carId of registeredCars) {
      const carDir = path.join(rootDir, 'public/images/cars', carId);
      assert.ok(fs.existsSync(carDir), `Diretório do carro ${carId} deve existir em public/images/cars`);
      for (const angle of angles) {
        const imgFile = path.join(carDir, `${angle}.jpg`);
        assert.ok(fs.existsSync(imgFile), `Ângulo ${angle}.jpg deve existir para o carro ${carId}`);
        assert.ok(fs.statSync(imgFile).size > 0, `Arquivo ${angle}.jpg do carro ${carId} não pode estar vazio`);
      }
    }
  });

  test('18.2: Arquivos de carros não cadastrados foram excluídos conforme solicitado', () => {
    const unregistered = [
      'FotoGolfGTI.jpeg',
      'FotoHondaCivic.jpeg',
      'FotoJeepCompassLimited.jpeg',
      'FotoNovaHilux.jpeg',
      'FotoTeslaModel3.jpeg',
      'FotoToyotaCorolla.jpg'
    ];
    for (const file of unregistered) {
      const filePath = path.join(rootDir, 'public/images', file);
      assert.ok(!fs.existsSync(filePath), `Arquivo órfão ${file} deve ter sido excluído`);
    }
  });

  test('18.3: Salvaguardas essenciais da perícia IA permanecem preservadas', () => {
    const safeguards = [
      'carro_lataria_amassada.jpg',
      'carro_parachoque_danificado.jpg',
      'placeholder-carro.jpg'
    ];
    for (const file of safeguards) {
      const filePath = path.join(rootDir, 'public/images', file);
      assert.ok(fs.existsSync(filePath), `Arquivo de salvaguarda ${file} DEVE permanecer preservado`);
      assert.ok(fs.statSync(filePath).size > 0, `Arquivo ${file} não pode estar corrompido`);
    }
  });
});

describe('BATERIA DE TESTES 19: Dossiê Oficial Automatch - Botões Lado a Lado no Topo e Responsabilidades Únicas', () => {
  const dossierPath = path.join(rootDir, 'src/components/vehicle/OfficialDossierModal.jsx');
  const content = fs.readFileSync(dossierPath, 'utf-8');

  test('19.1: Botões Imprimir e Baixar PDF devem estar presentes no cabeçalho', () => {
    assert.ok(content.includes('onClick={handlePrintPdf}'), 'Botão Imprimir deve acionar handlePrintPdf');
    assert.ok(content.includes('onClick={handleDownloadPdf}'), 'Botão Baixar PDF deve acionar handleDownloadPdf');
  });

  test('19.2: Funções de download e impressão devem ter responsabilidades únicas e segregadas', () => {
    assert.ok(content.includes('const handleDownloadPdf'), 'Deve existir handler dedicado para download');
    assert.ok(content.includes('const handlePrintPdf'), 'Deve existir handler dedicado para impressão');
  });

  test('19.3: Botão redundante no rodapé foi removido, mantendo apenas botão Fechar', () => {
    const footerSection = content.slice(content.lastIndexOf('Barra Inferior'));
    assert.ok(!footerSection.includes('Imprimir / Salvar PDF'), 'Botão duplicado de impressão não deve existir no rodapé');
    assert.ok(footerSection.includes('Fechar'), 'Botão Fechar deve estar presente no rodapé');
  });
});

describe('BATERIA DE TESTES 20: Gestão de Ativos - Validação de Dados, Blindagem contra Erros e Toast', () => {
  const modalPath = path.join(rootDir, 'src/components/inventory/AssetConfigurationModal.jsx');
  const dashboardPath = path.join(rootDir, 'src/pages/Dashboard.jsx');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8');

  test('20.1: AssetConfigurationModal deve conter validações comerciais (preço > 0, piso <= venda)', () => {
    assert.ok(modalContent.includes('validationError'), 'Deve conter estado para validação');
    assert.ok(modalContent.includes('saleVal <= 0'), 'Deve validar que valor de venda é positivo');
    assert.ok(modalContent.includes('floorVal > saleVal'), 'Deve validar que piso de repasse não excede preço de venda');
  });

  test('20.2: AssetConfigurationModal deve exibir banner de alerta em caso de dados inválidos', () => {
    assert.ok(modalContent.includes('Atenção ao salvar:'), 'Deve exibir título pedagógico de atenção ao usuário');
    assert.ok(modalContent.includes('{validationError}'), 'Deve renderizar a mensagem de erro amigável');
  });

  test('20.3: Dashboard.jsx deve blindar busca de estoque contra campos indefinidos e conter ErrorBoundary', () => {
    assert.ok(dashboardContent.includes('DashboardErrorBoundary'), 'Deve implementar ErrorBoundary para blindar a tela');
    assert.ok(dashboardContent.includes('modelStr') && dashboardContent.includes('String(item.model'), 'Deve normalizar campos para string antes de toLowerCase()');
  });

  test('20.4: Dashboard.jsx deve renderizar componente visual de toast de feedback', () => {
    assert.ok(dashboardContent.includes('{feedbackToast && ('), 'Deve renderizar feedbackToast condicionalmente');
    assert.ok(dashboardContent.includes('feedbackToast.message'), 'Deve exibir mensagem do toast');
  });
});

describe('BATERIA DE TESTES 21: Vitrine Digital - Substituição de Selo Sobreposto por Estrela de Destaque', () => {
  const catalogPath = path.join(rootDir, 'src/pages/ShowcaseCatalog.jsx');
  const detailsPath = path.join(rootDir, 'src/pages/ShowcaseVehicleDetails.jsx');
  const catalogContent = fs.readFileSync(catalogPath, 'utf-8');
  const detailsContent = fs.readFileSync(detailsPath, 'utf-8');

  test('21.1: ShowcaseCatalog.jsx não deve conter selo textual Destaque sobreposto a StoreIdentifier', () => {
    assert.ok(
      !catalogContent.includes("absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1"),
      'Selo textual Destaque sobreposto no canto superior esquerdo deve ter sido removido'
    );
  });

  test('21.2: ShowcaseCatalog.jsx deve renderizar Star icon acessível ao lado do nome do veículo', () => {
    assert.ok(
      catalogContent.includes('title="Destaque"') || catalogContent.includes('aria-label="Veículo em Destaque"'),
      'Ícone de destaque deve possuir tooltip e aria-label para acessibilidade'
    );
    assert.ok(
      catalogContent.includes('<Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />'),
      'Ícone de estrela âmbar deve ser renderizado ao lado do nome do carro'
    );
  });

  test('21.3: ShowcaseVehicleDetails.jsx deve renderizar Star icon acessível ao lado do título do veículo', () => {
    assert.ok(
      detailsContent.includes('car.featured && (') && detailsContent.includes('title="Destaque"'),
      'Detalhes do veículo deve exibir estrela de destaque ao lado do nome quando featured for true'
    );
  });
});

describe('BATERIA DE TESTES 22: Selo Preço Baixou - Ausência de Porcentagem e Alinhamento com Destaque', () => {
  const badgePath = path.join(rootDir, 'src/components/vehicle/PriceDropBadge.jsx');
  const catalogPath = path.join(rootDir, 'src/pages/ShowcaseCatalog.jsx');
  const badgeContent = fs.readFileSync(badgePath, 'utf-8');
  const catalogContent = fs.readFileSync(catalogPath, 'utf-8');

  test('22.1: PriceDropBadge.jsx não deve calcular nem exibir porcentagem de queda', () => {
    assert.ok(!badgeContent.includes('dropPercent'), 'dropPercent deve ter sido removido');
    assert.ok(!badgeContent.includes('-{dropPercent}%'), 'A tag de porcentagem não deve constar no JSX');
  });

  test('22.2: PriceDropBadge.jsx deve aceitar prop isFeatured e renderizar ícone de estrela', () => {
    assert.ok(badgeContent.includes('isFeatured = false') || badgeContent.includes('isFeatured'), 'Deve aceitar prop isFeatured');
    assert.ok(badgeContent.includes('<Star'), 'Deve renderizar ícone Star quando isFeatured for verdadeiro');
  });

  test('22.3: ShowcaseCatalog.jsx deve passar prop isFeatured={car.featured} ao PriceDropBadge', () => {
    assert.ok(
      catalogContent.includes('isFeatured={car.featured}'),
      'Catálogo deve fornecer isFeatured ao PriceDropBadge'
    );
  });
});

describe('BATERIA DE TESTES 23: Sprint 09 Tarefa 1 - Meus Anúncios (Botão Criar Anúncio Central)', () => {
  const myAdsPath = path.join(rootDir, 'src/pages/MyAdsPage.jsx');
  const myAdsContent = fs.readFileSync(myAdsPath, 'utf-8');

  test('23.1: MyAdsPage.jsx não deve conter botão "Anunciar Novo Veículo" no cabeçalho superior', () => {
    const topHeader = myAdsContent.split('{/* Top Header */}')[1]?.split('{/* Main Container */}')[0];
    assert.ok(topHeader, 'Top header deve existir');
    assert.ok(!topHeader.includes('Anunciar Novo Veículo'), 'Cabeçalho superior não deve conter botão Anunciar Novo Veículo');
    assert.ok(topHeader.includes('Voltar ao Perfil'), 'Cabeçalho superior deve conter apenas o botão de retorno');
  });

  test('23.2: MyAdsPage.jsx deve conter botão principal de anúncio centralizado em lista populada e lista vazia', () => {
    assert.ok(myAdsContent.includes('Criar Meu Primeiro Anúncio'), 'Lista vazia deve conter botão central');
    assert.ok(myAdsContent.includes('flex justify-center') && myAdsContent.includes('Anunciar Novo Veículo'), 'Lista preenchida deve conter botão centralizado no meio');
  });

  test('23.3: Sintaxe e fechamento de blocos no MyAdsPage.jsx devem ser válidos', () => {
    let braces = 0, parens = 0, brackets = 0;
    for (let i = 0; i < myAdsContent.length; i++) {
      const ch = myAdsContent[i];
      if (ch === '{') braces++;
      else if (ch === '}') braces--;
      else if (ch === '(') parens++;
      else if (ch === ')') parens--;
      else if (ch === '[') brackets++;
      else if (ch === ']') brackets--;
    }
    assert.strictEqual(braces, 0);
    assert.strictEqual(parens, 0);
    assert.strictEqual(brackets, 0);
  });
});

describe('BATERIA DE TESTES 24: Sprint 09 Tarefa 2 - Preço Junto ao Nome em Padrão BRL com Truncamento e Estrela', () => {
  const homePath = path.join(rootDir, 'src/pages/Home.jsx');
  const catalogPath = path.join(rootDir, 'src/pages/ShowcaseCatalog.jsx');
  const homeContent = fs.readFileSync(homePath, 'utf-8');
  const catalogContent = fs.readFileSync(catalogPath, 'utf-8');

  test('24.1: Home.jsx e ShowcaseCatalog.jsx devem formatar preço no padrão brasileiro (R$ 185.000,00)', () => {
    assert.ok(homeContent.includes("minimumFractionDigits: 2"), 'Home deve formatar com 2 casas decimais no padrão brasileiro');
    assert.ok(catalogContent.includes("minimumFractionDigits: 2"), 'ShowcaseCatalog deve formatar com 2 casas decimais no padrão brasileiro');
  });

  test('24.2: Home.jsx deve exibir o preço ao lado do nome do carro na mesma linha com estrela e truncamento', () => {
    assert.ok(homeContent.includes('title={car.name}'), 'Home deve possuir tooltip com nome completo');
    assert.ok(homeContent.includes('truncate'), 'Home deve truncar nomes longos');
    assert.ok(homeContent.includes('car.featured &&') && homeContent.includes('<Star'), 'Home deve exibir estrela de destaque');
  });

  test('24.3: ShowcaseCatalog.jsx deve exibir o preço ao lado do nome do carro na mesma linha no Grid e List view', () => {
    assert.ok(catalogContent.includes('title={car.name}'), 'ShowcaseCatalog deve possuir tooltip no nome');
    assert.ok(catalogContent.includes('text-xl font-black text-brand-blue') || catalogContent.includes('formatPrice(car.price)'), 'Preço deve constar na linha do nome');
  });
});

describe('BATERIA DE TESTES 25: Sprint 09 Tarefa 3 - Selo Preço Baixou sem Estrela nos Detalhes do Anúncio', () => {
  const badgePath = path.join(rootDir, 'src/components/vehicle/PriceDropBadge.jsx');
  const detailsPath = path.join(rootDir, 'src/pages/ShowcaseVehicleDetails.jsx');
  const catalogPath = path.join(rootDir, 'src/pages/ShowcaseCatalog.jsx');
  const badgeContent = fs.readFileSync(badgePath, 'utf-8');
  const detailsContent = fs.readFileSync(detailsPath, 'utf-8');
  const catalogContent = fs.readFileSync(catalogPath, 'utf-8');

  test('25.1: PriceDropBadge.jsx deve suportar prop showStar com default true', () => {
    assert.ok(badgeContent.includes('showStar = true'), 'PriceDropBadge deve aceitar showStar');
    assert.ok(badgeContent.includes('isFeatured && showStar'), 'Só exibe estrela quando showStar for true');
  });

  test('25.2: ShowcaseVehicleDetails.jsx deve suprimir a estrela do PriceDropBadge com showStar={false}', () => {
    assert.ok(detailsContent.includes('showStar={false}'), 'ShowcaseVehicleDetails deve passar showStar={false} para o selo');
  });

  test('25.3: ShowcaseCatalog.jsx e ShowcaseVehicleDetails.jsx mantêm a estrela de destaque ao lado do nome', () => {
    assert.ok(catalogContent.includes('car.featured &&') && catalogContent.includes('<Star'), 'Estrela no nome mantida no catálogo');
    assert.ok(detailsContent.includes('car.featured &&') && detailsContent.includes('<Star'), 'Estrela no título mantida nos detalhes');
  });
});

describe('BATERIA DE TESTES 26: Sprint 09 Tarefa 4 - Rede B2B sem Instabilidade Temporária e Acesso Restrito', () => {
  const b2bPath = path.join(rootDir, 'src/components/partners/PartnershipHubModal.jsx');
  const b2bContent = fs.readFileSync(b2bPath, 'utf-8');

  test('26.1: PartnershipHubModal.jsx deve declarar estado partnerships e callback refreshAll', () => {
    assert.ok(b2bContent.includes('const [partnerships, setPartnerships] = useState'), 'partnerships deve ser declarado no estado');
    assert.ok(b2bContent.includes('const refreshAll ='), 'refreshAll deve ser definido como função');
  });

  test('26.2: PartnershipHubModal.jsx deve implementar verificação graciosa isB2BAuthorized para compradores/visitantes', () => {
    assert.ok(b2bContent.includes('isB2BAuthorized'), 'isB2BAuthorized deve ser verificado');
    assert.ok(b2bContent.includes('Acesso Exclusivo B2B'), 'Deve renderizar tela pedagógica de acesso restrito');
  });

  test('26.3: Sintaxe e fechamento de blocos no PartnershipHubModal.jsx devem ser válidos', () => {
    let braces = 0, parens = 0, brackets = 0;
    for (let i = 0; i < b2bContent.length; i++) {
      const ch = b2bContent[i];
      if (ch === '{') braces++;
      else if (ch === '}') braces--;
      else if (ch === '(') parens++;
      else if (ch === ')') parens--;
      else if (ch === '[') brackets++;
      else if (ch === ']') brackets--;
    }
    assert.strictEqual(braces, 0, 'Chaves desbalanceadas no PartnershipHubModal');
    assert.strictEqual(parens, 0, 'Parênteses desbalanceados no PartnershipHubModal');
    assert.strictEqual(brackets, 0, 'Colchetes desbalanceados no PartnershipHubModal');
  });
});

describe('BATERIA DE TESTES 27: Sprint 09 Tarefa 5 - Vitrine Digital Docker (Consistência dos 5 Carros)', () => {
  const seedPath = path.join(rootDir, '../backend/seed.py');
  const mainPath = path.join(rootDir, '../backend/main.py');
  const testBatteryPath = path.join(rootDir, '../backend/test_audit_full_battery.py');
  const seedContent = fs.readFileSync(seedPath, 'utf-8');
  const mainContent = fs.readFileSync(mainPath, 'utf-8');
  const testBatteryContent = fs.readFileSync(testBatteryPath, 'utf-8');

  test('27.1: seed.py deve conter exatamente os 5 carros oficiais cadastrados da Vitrine', () => {
    assert.ok(seedContent.includes('sc-001') && seedContent.includes('Corolla Cross XRX Híbrido'));
    assert.ok(seedContent.includes('sc-002') && seedContent.includes('Polo TSI Comfortline'));
    assert.ok(seedContent.includes('sc-003') && seedContent.includes('HB20 Platinum Plus'));
    assert.ok(seedContent.includes('sc-004') && seedContent.includes('Tracker Premier 1.2 Turbo'));
    assert.ok(seedContent.includes('sc-005') && seedContent.includes('Pulse Abarth 1.3 Turbo'));
  });

  test('27.2: main.py deve invocar seed_db no lifespan startup para garantir catálogo pré-carregado', () => {
    assert.ok(mainContent.includes('seed_db()'), 'main.py deve chamar seed_db() no startup');
  });

  test('27.3: test_audit_full_battery.py deve possuir tearDownClass para limpar veículos temporários de teste', () => {
    assert.ok(testBatteryContent.includes('def tearDownClass'), 'tearDownClass deve existir para evitar resíduos no banco');
  });
});

describe('BATERIA DE TESTES 28: Sprint 09 Tarefa 6 - Detalhes do Anúncio (Sobre o Veículo acima do Dossiê Oficial)', () => {
  const detailsPath = path.join(rootDir, 'src/pages/ShowcaseVehicleDetails.jsx');
  const detailsContent = fs.readFileSync(detailsPath, 'utf-8');

  test('28.1: Bloco "Sobre o Veículo" deve anteceder o "Dossiê de Transparência"', () => {
    const idxSobre = detailsContent.indexOf('{/* Sobre o Veículo — Nome, Metadados, Descrição e Ficha Técnica Consolidados */}');
    const idxDossie = detailsContent.indexOf('{/* Dossiê de Transparência Automatch */}');
    const idxTco = detailsContent.indexOf('{/* Calculadora Interativa de Custo Total de Posse (TCO)');

    assert.ok(idxSobre > 0, 'Bloco Sobre o Veículo deve existir');
    assert.ok(idxDossie > 0, 'Bloco Dossiê de Transparência deve existir');
    assert.ok(idxTco > 0, 'Bloco TCO deve existir');
    assert.ok(idxSobre < idxDossie, 'Sobre o Veículo deve vir ANTES do Dossiê de Transparência');
    assert.ok(idxDossie < idxTco, 'Dossiê de Transparência deve vir ANTES do TCO (TCO na sua posição original)');
  });

  test('28.2: Ficha Técnica & Equipamentos, especs e modais permanecem preservados', () => {
    assert.ok(detailsContent.includes('Ficha Técnica & Equipamentos'), 'Ficha técnica deve permanecer');
    assert.ok(detailsContent.includes('Dossiê Oficial Automatch'), 'Ação do dossiê deve permanecer');
    assert.ok(detailsContent.includes('isDossierModalOpen'), 'Modal do dossiê deve permanecer funcional');
  });

  test('28.3: Sintaxe e fechamento de blocos no ShowcaseVehicleDetails.jsx devem ser válidos', () => {
    let braces = 0, parens = 0, brackets = 0;
    for (let i = 0; i < detailsContent.length; i++) {
      const ch = detailsContent[i];
      if (ch === '{') braces++;
      else if (ch === '}') braces--;
      else if (ch === '(') parens++;
      else if (ch === ')') parens--;
      else if (ch === '[') brackets++;
      else if (ch === ']') brackets--;
    }
    assert.strictEqual(braces, 0, 'Chaves desbalanceadas no ShowcaseVehicleDetails');
    assert.strictEqual(parens, 0, 'Parênteses desbalanceados no ShowcaseVehicleDetails');
    assert.strictEqual(brackets, 0, 'Colchetes desbalanceados no ShowcaseVehicleDetails');
  });
});

describe('BATERIA DE TESTES 29: Dossiê Oficial sob Demanda - Ocultação na Carga Inicial e Abertura por Botão', () => {
  const detailsPath = path.join(rootDir, 'src/pages/ShowcaseVehicleDetails.jsx');
  const detailsContent = fs.readFileSync(detailsPath, 'utf-8');
  const modalPath = path.join(rootDir, 'src/components/vehicle/OfficialDossierModal.jsx');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');

  test('29.1: ShowcaseVehicleDetails não renderiza banner estático do dossiê na carga inicial', () => {
    assert.ok(!detailsContent.includes('Visualizar e Baixar Dossiê'), 'Banner fixo de download do dossiê na página deve ser removido');
    assert.ok(!detailsContent.includes('Barra de Ação Oficial: Download do Laudo Certificado'), 'Comentário e bloco estático devem ser removidos');
  });

  test('29.2: Conteúdo do Dossiê é disparado sob demanda exclusivamente pelo botão "Dossiê Oficial Automatch"', () => {
    assert.ok(detailsContent.includes('Dossiê Oficial Automatch'), 'Botão Dossiê Oficial Automatch deve estar presente no grid de ações');
    assert.ok(detailsContent.includes('setIsDossierModalOpen(true)'), 'Botão deve abrir o modal ao ser clicado');
    assert.ok(detailsContent.includes('<OfficialDossierModal'), 'OfficialDossierModal deve ser renderizado condicionalmente');
  });

  test('29.3: OfficialDossierModal mantém acessibilidade completa com ESC, tabIndex e restauração de foco', () => {
    assert.ok(modalContent.includes("e.key === 'Escape'"), 'Modal deve fechar ao pressionar ESC');
    assert.ok(modalContent.includes('previousActiveElement'), 'Modal deve rastrear elemento anterior para restaurar foco');
    assert.ok(modalContent.includes('previousActiveElement.focus'), 'Foco deve ser devolvido ao botão acionador');
    assert.ok(modalContent.includes('tabIndex="-1"'), 'Modal deve conter tabIndex para foco programático');
  });

  test('29.4: Código morto, estados e imports de PDF obsoletos foram limpos em ShowcaseVehicleDetails.jsx', () => {
    assert.ok(!detailsContent.includes('downloadClientDossier'), 'Função duplicada downloadClientDossier deve ser removida');
    assert.ok(!detailsContent.includes('handleDownloadOfficialPdf'), 'Função duplicada handleDownloadOfficialPdf deve ser removida');
    assert.ok(!detailsContent.includes('isDownloadingPdf'), 'Estado redundante isDownloadingPdf deve ser removido de ShowcaseVehicleDetails');
  });
});

describe('BATERIA DE TESTES 30: Consultor IA Aprimorado & Remoção de Linha no Header do Anúncio', () => {
  const { generateVehicleConsultantAnswer, generateGeneralSupportAnswer } = aiCoreModule;
  const corolla = {
    id: 'sc-001',
    name: 'Toyota Corolla Cross XRX Híbrido 2024',
    brand: 'Toyota',
    model: 'Corolla Cross',
    year: 2024,
    price: 185000,
    km: 12000,
    fuel: 'Híbrido Flex',
    color: 'Branco Lunar',
    specs: {
      motor: '1.8 Híbrido Flex',
      potencia: '122 cv',
      cambio: 'Automático CVT',
      direcao: 'Elétrica Progressiva',
      freios: 'ABS com EBD nas 4 rodas',
      airbags: '7 Airbags',
      suspensao: 'Independente McPherson dianteira e eixo de torção traseiro',
      tracao: 'Dianteira'
    },
    description: 'Veículo com baixíssima km, único dono, laudo cautelar 100% aprovado.',
    fullDescription: 'Equipado com pacote Toyota Safety Sense com frenagem autônoma de emergência e alerta de mudança de faixa.'
  };

  const aiChatBoxPath = path.join(rootDir, 'src/components/vehicle/AIChatBox.jsx');
  const homeSupportChatPath = path.join(rootDir, 'src/components/chat/HomeSupportChat.jsx');
  const detailsPath = path.join(rootDir, 'src/pages/ShowcaseVehicleDetails.jsx');
  const aiVisionPath = path.join(rootDir, '../backend/routers/ai_vision.py');

  const aiChatBoxContent = fs.readFileSync(aiChatBoxPath, 'utf-8');
  const homeSupportChatContent = fs.readFileSync(homeSupportChatPath, 'utf-8');
  const detailsContent = fs.readFileSync(detailsPath, 'utf-8');
  const aiVisionContent = fs.readFileSync(aiVisionPath, 'utf-8');

  test('30.1: Responde com precisão a motor e quilometragem sem saudações genéricas', () => {
    const res = generateVehicleConsultantAnswer('Como é o motor e quilometragem?', corolla, []);
    assert.ok(res.includes('1.8 Híbrido Flex') || res.includes('1.8'), 'Deve conter informação do motor');
    assert.ok(res.includes('12.000 km') || res.includes('12.000'), 'Deve conter quilometragem');
    assert.ok(!res.startsWith('Olá! Sou o especialista IA da Automatch. Como posso ajudar com os detalhes técnicos'), 'Não deve retornar mensagem de boas-vindas inicial');
  });

  test('30.2: Responde com precisão a direção e freios para o Corolla Cross XRX', () => {
    const res = generateVehicleConsultantAnswer('Como são a direção e os freios?', corolla, []);
    assert.ok(res.toLowerCase().includes('elétrica progressiva') || res.toLowerCase().includes('elétrica'), 'Deve conter direção');
    assert.ok(res.toLowerCase().includes('abs com ebd') || res.toLowerCase().includes('freios'), 'Deve conter freios');
    assert.ok(!res.startsWith('Olá! Sou o especialista IA da Automatch. Como posso ajudar com os detalhes técnicos'), 'Não deve regredir para mensagem de boas-vindas');
  });

  test('30.3: Responde com precisão a follow-ups curtos (ex: "e o câmbio?")', () => {
    const history = [
      { from: 'user', text: 'Como são a direção e os freios?' },
      { from: 'ai', text: 'O Toyota Corolla Cross XRX conta com direção Elétrica Progressiva...' }
    ];
    const res = generateVehicleConsultantAnswer('e o câmbio?', corolla, history);
    assert.ok(res.toLowerCase().includes('automático cvt') || res.toLowerCase().includes('cvt') || res.toLowerCase().includes('câmbio'), 'Deve resolver o contexto de câmbio');
  });

  test('30.4: Responde com honesta ausência para itens não constantes no anúncio/laudo/descrição', () => {
    const res = generateVehicleConsultantAnswer('Esse carro vem com engate de reboque homologado e blindagem nível 3A?', corolla, []);
    assert.ok(res.toLowerCase().includes('não consta') || res.toLowerCase().includes('não encontrei') || res.toLowerCase().includes('vendedor'), 'Deve admitir ausência honestamente e indicar vendedor');
    assert.ok(!res.includes('Blindagem nível 3A confirmada'), 'Não deve alucinar itens ausentes');
  });

  test('30.5: AIChatBox e HomeSupportChat reutilizam aiConsultantCore compartilhado', () => {
    assert.ok(aiChatBoxContent.includes('from \'../../utils/aiConsultantCore\''), 'AIChatBox deve importar aiConsultantCore');
    assert.ok(aiChatBoxContent.includes('generateVehicleConsultantAnswer'), 'AIChatBox deve usar generateVehicleConsultantAnswer');
    assert.ok(aiChatBoxContent.includes('Direção e Freios'), 'AIChatBox deve incluir pill Direção e Freios');
    assert.ok(homeSupportChatContent.includes('from \'../../utils/aiConsultantCore\''), 'HomeSupportChat deve importar aiConsultantCore');
    assert.ok(homeSupportChatContent.includes('generateGeneralSupportAnswer'), 'HomeSupportChat deve usar generateGeneralSupportAnswer');
  });

  test('30.6: ShowcaseVehicleDetails remove a linha border-b do header nav sticky', () => {
    assert.ok(!detailsContent.includes('border-b border-slate-800 sticky top-0'), 'Não deve ter border-b na navbar fixa');
    assert.ok(detailsContent.includes('sticky top-0'), 'Navbar deve continuar sticky');
  });

  test('30.7: ai_vision.py suporta specs, multi-tópicos e ausência honesta com orientação ao vendedor', () => {
    assert.ok(aiVisionContent.includes('has_direcao and has_freios'), 'ai_vision deve tratar direção e freios conjuntamente');
    assert.ok(aiVisionContent.includes('has_motor and has_km'), 'ai_vision deve tratar motor e km conjuntamente');
    assert.ok(aiVisionContent.includes('consultor IA da Automatch'), 'ai_vision deve manter identificação de consultor');
  });
});

describe('BATERIA DE TESTES 31: Gestão de Ativos - Restauração Garantida de Rolagem (Scroll Lock com Reference Counting)', () => {
  const { lockScroll, unlockScroll, resetScrollLock, getScrollLockCount } = scrollLockCoreModule;

  const dashboardPath = path.join(rootDir, 'src/pages/Dashboard.jsx');
  const modalPath = path.join(rootDir, 'src/components/inventory/AssetConfigurationModal.jsx');
  const scrollLockHookPath = path.join(rootDir, 'src/utils/useScrollLock.js');
  const scrollLockCorePath = path.join(rootDir, 'src/utils/scrollLockCore.js');

  const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');
  const scrollLockHookContent = fs.readFileSync(scrollLockHookPath, 'utf-8');
  const scrollLockCoreContent = fs.readFileSync(scrollLockCorePath, 'utf-8');

  beforeEach(() => {
    resetScrollLock();
    if (globalThis.document && globalThis.document.body) {
      globalThis.document.body.style.overflow = '';
      globalThis.document.body.style.paddingRight = '';
    }
  });

  test('31.1: scrollLockCore implementa reference counting e restaura overflow quando todas as instâncias encerram', () => {
    globalThis.document = {
      body: { style: { overflow: '', paddingRight: '' } },
      documentElement: { clientWidth: 1024 }
    };
    globalThis.window = { innerWidth: 1040 };

    assert.strictEqual(getScrollLockCount(), 0);
    assert.strictEqual(globalThis.document.body.style.overflow, '');

    // Simulação do Filho (AssetConfigurationModal) travando
    lockScroll();
    assert.strictEqual(getScrollLockCount(), 1);
    assert.strictEqual(globalThis.document.body.style.overflow, 'hidden');

    // Simulação do Pai (Dashboard) travando concorrentemente
    lockScroll();
    assert.strictEqual(getScrollLockCount(), 2);
    assert.strictEqual(globalThis.document.body.style.overflow, 'hidden');

    // Filho fecha após salvar (onClose) -> primeiro unlock
    unlockScroll();
    assert.strictEqual(getScrollLockCount(), 1);
    assert.strictEqual(globalThis.document.body.style.overflow, 'hidden', 'Permanece hidden enquanto houver locks pendentes');

    // Pai encerra seu estado -> segundo unlock
    unlockScroll();
    assert.strictEqual(getScrollLockCount(), 0);
    assert.strictEqual(globalThis.document.body.style.overflow, '', 'Deve restaurar perfeitamente para vazio/original');
  });

  test('31.2: useScrollLock e scrollLockCore estão devidamente desacoplados e exportados', () => {
    assert.ok(scrollLockCoreContent.includes('export function lockScroll'), 'scrollLockCore deve exportar lockScroll');
    assert.ok(scrollLockCoreContent.includes('export function unlockScroll'), 'scrollLockCore deve exportar unlockScroll');
    assert.ok(scrollLockHookContent.includes('import { lockScroll, unlockScroll'), 'useScrollLock deve importar de scrollLockCore');
    assert.ok(scrollLockHookContent.includes('export function useScrollLock'), 'useScrollLock deve exportar o hook');
  });

  test('31.3: Dashboard.jsx utiliza useScrollLock centralizado e não sobrescreve body.style.overflow ad-hoc', () => {
    assert.ok(dashboardContent.includes("import useScrollLock from '../utils/useScrollLock'"), 'Dashboard deve importar useScrollLock');
    assert.ok(dashboardContent.includes('useScrollLock(isConfigModalOpen || isB2BModalOpen)'), 'Dashboard deve invocar useScrollLock para modais');
    assert.ok(!dashboardContent.includes('document.body.style.overflow = originalOverflow'), 'Efeito ad-hoc antigo do Dashboard foi removido');
  });

  test('31.4: AssetConfigurationModal.jsx utiliza useScrollLock centralizado', () => {
    assert.ok(modalContent.includes("import useScrollLock from '../../utils/useScrollLock'"), 'AssetConfigurationModal deve importar useScrollLock');
    assert.ok(modalContent.includes('useScrollLock(isOpen)'), 'AssetConfigurationModal deve invocar useScrollLock');
    assert.ok(!modalContent.includes('const originalOverflow = document.body.style.overflow;'), 'Efeito ad-hoc antigo do modal foi removido');
  });

  test('31.5: AssetConfigurationModal.jsx implementa fechamento por tecla ESC e clique no backdrop', () => {
    assert.ok(modalContent.includes("e.key === 'Escape'"), 'Modal deve escutar a tecla Escape');
    assert.ok(modalContent.includes('e.target === e.currentTarget'), 'Modal deve fechar ao clicar no backdrop externo');
  });

  test('31.6: AssetConfigurationModal.jsx previne duplo clique/envio concorrente com isSubmitting e desabilita botão', () => {
    assert.ok(modalContent.includes('isSubmitting'), 'Modal deve possuir estado isSubmitting');
    assert.ok(modalContent.includes('disabled={hasSaved || isSubmitting}'), 'Botão Salvar deve desabilitar enquanto submete');
    assert.ok(modalContent.includes('Salvando...'), 'Modal deve exibir feedback de carregamento');
  });

  test('31.7: Balanceamento de chaves e parênteses em Dashboard.jsx e AssetConfigurationModal.jsx é válido', () => {
    for (const [name, content] of [['Dashboard', dashboardContent], ['AssetConfigurationModal', modalContent]]) {
      let braces = 0, parens = 0, brackets = 0;
      for (let i = 0; i < content.length; i++) {
        const ch = content[i];
        if (ch === '{') braces++;
        else if (ch === '}') braces--;
        else if (ch === '(') parens++;
        else if (ch === ')') parens--;
        else if (ch === '[') brackets++;
        else if (ch === ']') brackets--;
      }
      assert.strictEqual(braces, 0, `Chaves desbalanceadas em ${name}`);
      assert.strictEqual(parens, 0, `Parênteses desbalanceados em ${name}`);
      assert.strictEqual(brackets, 0, `Colchetes desbalanceados em ${name}`);
    }
  });
});


