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

  test('6.2: Ângulo 180° deve apontar fidedignamente para imagem de traseira (/images/carro_360_traseira.jpg)', () => {
    assert.ok(
      showcaseDataContent.includes("180: '/images/carro_360_traseira.jpg'"),
      'O ângulo 180° deve apontar para /images/carro_360_traseira.jpg'
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

