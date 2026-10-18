import { describe, test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('BATERIA DE TESTES - TAREFA 2: Selos Novidade e Preço Baixou em Apenas 2 Carros', () => {
  const mapperPath = path.join(rootDir, 'src/utils/vehicleMapper.js');
  const showcasePath = path.join(rootDir, 'src/data/showcaseData.js');
  const catalogPath = path.join(rootDir, 'src/pages/ShowcaseCatalog.jsx');
  const homePath = path.join(rootDir, 'src/pages/Home.jsx');
  const detailsPath = path.join(rootDir, 'src/pages/ShowcaseVehicleDetails.jsx');

  const mapperContent = fs.readFileSync(mapperPath, 'utf-8');
  const showcaseContent = fs.readFileSync(showcasePath, 'utf-8');
  const catalogContent = fs.readFileSync(catalogPath, 'utf-8');
  const homeContent = fs.readFileSync(homePath, 'utf-8');
  const detailsContent = fs.readFileSync(detailsPath, 'utf-8');

  test('2.1: vehicleMapper.js não contém o multiplicador sintético 1.04 para originalPrice', () => {
    assert.ok(
      !mapperContent.includes('price * 1.04'),
      'Multiplicador sintético price * 1.04 deve ter sido completamente eliminado de vehicleMapper.js'
    );
  });

  test('2.2: vehicleMapper.js define originalPrice estritamente quando maior que price', () => {
    assert.ok(
      mapperContent.includes('rawOriginal !== null && Number(rawOriginal) > price'),
      'originalPrice deve ser estritamente superior ao preço atual'
    );
  });

  test('2.3: showcaseData.js define Preço Baixou e Novidade exclusivamente para sc-001 e sc-002', async () => {
    const { showcaseCars } = await import('../src/data/showcaseData.js');

    const carsWithPriceDrop = showcaseCars.filter(c => c.originalPrice && c.originalPrice > c.price);
    const carsWithNovidade = showcaseCars.filter(c => Array.isArray(c.tags) && c.tags.includes('Novidade'));

    assert.strictEqual(carsWithPriceDrop.length, 2, 'Exatamente 2 carros devem ter queda de preço em showcaseData.js');
    assert.deepStrictEqual(
      carsWithPriceDrop.map(c => c.id).sort(),
      ['sc-001', 'sc-002'].sort(),
      'Os dois carros com Preço Baixou devem ser sc-001 e sc-002'
    );

    assert.strictEqual(carsWithNovidade.length, 2, 'Exatamente 2 carros devem ter o selo Novidade em showcaseData.js');
    assert.deepStrictEqual(
      carsWithNovidade.map(c => c.id).sort(),
      ['sc-001', 'sc-002'].sort(),
      'Os dois carros com Novidade devem ser sc-001 e sc-002'
    );
  });

  test('2.4: sc-003, sc-004 e sc-005 não possuem originalPrice superior nem tag Novidade em showcaseData.js', async () => {
    const { showcaseCars } = await import('../src/data/showcaseData.js');
    const otherCars = showcaseCars.filter(c => ['sc-003', 'sc-004', 'sc-005'].includes(c.id));

    for (const car of otherCars) {
      assert.ok(!car.originalPrice || car.originalPrice <= car.price, `${car.id} não deve ter Preço Baixou`);
      assert.ok(!car.tags?.includes('Novidade'), `${car.id} não deve ter tag Novidade`);
    }
  });

  test('2.5: Home.jsx e ShowcaseVehicleDetails.jsx não injetam cegamente tag Novidade em anúncios locais', () => {
    assert.ok(
      !homeContent.includes("tags: [car.transmissao || 'Automatico', 'Novidade']"),
      'Home.jsx não deve injetar Novidade em todos os carros locais'
    );
    assert.ok(
      !detailsContent.includes("tags: ['Novidade',"),
      'ShowcaseVehicleDetails.jsx não deve injetar Novidade em anúncios locais'
    );
  });
});
