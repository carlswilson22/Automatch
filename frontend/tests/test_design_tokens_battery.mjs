import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(rootDir, '..');

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

describe('BATERIA DE TESTES - LOTE 1 (BASE DE TOKENS E MICROINTERAÇÕES CORE)', () => {

  test('1.1: Arquivo NOTICE deve existir na raiz com a licença MIT do MicroKit UI', () => {
    const noticePath = path.join(repoRoot, 'NOTICE');
    assert.ok(fs.existsSync(noticePath), 'Arquivo NOTICE deve existir na raiz');
    const noticeContent = fs.readFileSync(noticePath, 'utf-8');
    assert.ok(noticeContent.includes('MicroKit UI'), 'NOTICE deve referenciar MicroKit UI');
    assert.ok(noticeContent.includes('MIT License'), 'NOTICE deve conter a licença MIT');
    assert.ok(noticeContent.includes('Henrique Barone'), 'NOTICE deve creditar o autor original');
  });

  test('1.2: AutomatchLogo deve implementar a assinatura canônica oficial (AUTO escuro + MATCH azul + ™)', () => {
    const logoPath = path.join(rootDir, 'src/components/ui/AutomatchLogo.jsx');
    assert.ok(fs.existsSync(logoPath), 'AutomatchLogo.jsx deve existir');
    const content = fs.readFileSync(logoPath, 'utf-8');
    assert.ok(content.includes('AUTO'), 'Deve conter o prefixo AUTO');
    assert.ok(content.includes('MATCH'), 'Deve conter o sufixo MATCH');
    assert.ok(content.includes('™'), 'Deve conter o símbolo de marca registrada ™');
    assert.ok(content.includes('ShieldCheck'), 'Deve renderizar ícone ShieldCheck');
    verifyBalancedSyntax(content, 'AutomatchLogo.jsx');
  });

  test('1.3: FocusInput deve conter feedback de foco animado e suporte a ícones', () => {
    const inputPath = path.join(rootDir, 'src/components/ui/FocusInput.jsx');
    assert.ok(fs.existsSync(inputPath), 'FocusInput.jsx deve existir');
    const content = fs.readFileSync(inputPath, 'utf-8');
    assert.ok(content.includes('isFocused'), 'Deve gerenciar estado de foco isFocused');
    assert.ok(content.includes('motion.div') || content.includes('scaleX'), 'Deve conter linha/borda animada');
    verifyBalancedSyntax(content, 'FocusInput.jsx');
  });

  test('1.4: SlidingTabs deve suportar variantes pill e underline com spring via layoutId', () => {
    const tabsPath = path.join(rootDir, 'src/components/ui/SlidingTabs.jsx');
    assert.ok(fs.existsSync(tabsPath), 'SlidingTabs.jsx deve existir');
    const content = fs.readFileSync(tabsPath, 'utf-8');
    assert.ok(content.includes('layoutId'), 'Deve utilizar layoutId para animação de slide');
    assert.ok(content.includes('spring'), 'Deve utilizar física spring');
    assert.ok(content.includes('role="tablist"'), 'Deve conter semântica de acessibilidade tablist');
    verifyBalancedSyntax(content, 'SlidingTabs.jsx');
  });

  test('1.5: GlowButton e WipeButton devem implementar microinterações de hover e tap', () => {
    const glowPath = path.join(rootDir, 'src/components/ui/GlowButton.jsx');
    const wipePath = path.join(rootDir, 'src/components/ui/WipeButton.jsx');
    assert.ok(fs.existsSync(glowPath), 'GlowButton.jsx deve existir');
    assert.ok(fs.existsSync(wipePath), 'WipeButton.jsx deve existir');
    
    const glowContent = fs.readFileSync(glowPath, 'utf-8');
    const wipeContent = fs.readFileSync(wipePath, 'utf-8');
    
    assert.ok(glowContent.includes('whileTap') && glowContent.includes('Glow'), 'GlowButton deve ter efeitos táteis');
    assert.ok(wipeContent.includes('whileTap') && wipeContent.includes('translate-x'), 'WipeButton deve ter transição wipe');
    
    verifyBalancedSyntax(glowContent, 'GlowButton.jsx');
    verifyBalancedSyntax(wipeContent, 'WipeButton.jsx');
  });

  test('1.6: tailwind.config.js e index.css devem registrar os tokens de cores, sombras e acessibilidade', () => {
    const tailwindPath = path.join(rootDir, 'tailwind.config.js');
    const cssPath = path.join(rootDir, 'src/index.css');
    const tailwindContent = fs.readFileSync(tailwindPath, 'utf-8');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(tailwindContent.includes('card-hover'), 'tailwind.config.js deve conter sombra card-hover');
    assert.ok(tailwindContent.includes('smooth-out'), 'tailwind.config.js deve conter curva smooth-out');
    assert.ok(cssContent.includes('prefers-reduced-motion'), 'index.css deve respeitar prefers-reduced-motion');
  });

});
