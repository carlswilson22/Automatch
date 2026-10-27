import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('BATERIA DE TESTES - HERO VIDEO SCRUB & ACESSIBILIDADE', () => {

  test('HVS-01: Componente HeroVideoScrub.jsx existe e possui sintaxe válida', () => {
    const filePath = path.join(rootDir, 'src', 'components', 'home', 'HeroVideoScrub.jsx');
    assert.ok(fs.existsSync(filePath), 'HeroVideoScrub.jsx deve existir');

    const content = fs.readFileSync(filePath, 'utf-8');
    assert.ok(content.length > 500, 'HeroVideoScrub.jsx deve ter conteúdo substancial');
    assert.ok(content.includes('export default HeroVideoScrub') || content.includes('export const HeroVideoScrub'), 'Deve exportar o componente');
  });

  test('HVS-02: Integração de GSAP ScrollTrigger com registro e limpeza contextual', () => {
    const filePath = path.join(rootDir, 'src', 'components', 'home', 'HeroVideoScrub.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes("import gsap from 'gsap'"), 'Deve importar gsap');
    assert.ok(content.includes("ScrollTrigger"), 'Deve importar ScrollTrigger');
    assert.ok(content.includes("gsap.registerPlugin(ScrollTrigger)"), 'Deve registrar ScrollTrigger');
    assert.ok(content.includes("pin: pinEl") || content.includes("pin:"), 'Deve habilitar o pin durante o scroll');
    assert.ok(content.includes("scrub:"), 'Deve configurar scrub suave');
    assert.ok(content.includes("ctx.revert()") || content.includes("kill()"), 'Deve limpar triggers no desmonte (unmount)');
  });

  test('HVS-03: Acessibilidade estrita - prefers-reduced-motion exibe apenas o poster', () => {
    const filePath = path.join(rootDir, 'src', 'components', 'home', 'HeroVideoScrub.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(
      content.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"),
      'Deve consultar a media query de movimento reduzido'
    );
    assert.ok(
      content.includes('reducedMotion') && content.includes('<img') && content.includes('posterSrc'),
      'Com movimento reduzido, deve renderizar apenas a imagem poster sem inicializar scrub de vídeo'
    );
  });

  test('HVS-04: Atributos decorativos e acessíveis no elemento <video>', () => {
    const filePath = path.join(rootDir, 'src', 'components', 'home', 'HeroVideoScrub.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes('aria-hidden="true"'), 'Vídeo decorativo deve ter aria-hidden="true"');
    assert.ok(content.includes('muted'), 'Vídeo deve ser mudo (sem áudio)');
    assert.ok(content.includes('playsInline'), 'Vídeo deve ter playsInline para evitar fullscreen indesejado em mobile');
    assert.ok(content.includes('preload="auto"'), 'Vídeo deve ter preload="auto"');
  });

  test('HVS-05: Desempenho de rolagem - requestAnimationFrame e guarda seeking', () => {
    const filePath = path.join(rootDir, 'src', 'components', 'home', 'HeroVideoScrub.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes('requestAnimationFrame'), 'Deve agendar atualizações de currentTime via requestAnimationFrame');
    assert.ok(content.includes('seeking'), 'Deve verificar se o vídeo está em seeking antes de aplicar novo currentTime');
    assert.ok(content.includes('currentTime'), 'Deve manipular o tempo de reprodução com base no progresso');
  });

  test('HVS-06: Resolução dinâmica de caminhos via import.meta.env.BASE_URL', () => {
    const filePath = path.join(rootDir, 'src', 'components', 'home', 'HeroVideoScrub.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    assert.ok(content.includes('import.meta.env.BASE_URL'), 'Deve utilizar import.meta.env.BASE_URL');
    assert.ok(content.includes('videos/hero-scrub.mp4'), 'Deve apontar para o vídeo hero-scrub.mp4');
    assert.ok(content.includes('hero-video-poster.jpg') || content.includes('poster.jpg'), 'Deve apontar para o poster');
  });

  test('HVS-07: Integração na Home.jsx e preservação de elementos', () => {
    const homePath = path.join(rootDir, 'src', 'pages', 'Home.jsx');
    assert.ok(fs.existsSync(homePath), 'Home.jsx deve existir');

    const content = fs.readFileSync(homePath, 'utf-8');
    assert.ok(content.includes('HeroVideoScrub'), 'Home.jsx deve importar e utilizar HeroVideoScrub');
    assert.ok(content.includes('O Match Perfeito'), 'Deve manter o título original');
    assert.ok(content.includes('100% dos carros com Laudo Cautelar'), 'Deve manter o badge de procedência');
    assert.ok(content.includes('Ver Vitrine Digital'), 'Deve manter o botão principal GlowButton');
    assert.ok(content.includes('Como funciona?'), 'Deve manter o botão WipeButton');
  });

  test('HVS-08: Rodapé inclui aviso legal discreto sobre mídias geradas por IA', () => {
    const homePath = path.join(rootDir, 'src', 'pages', 'Home.jsx');
    const content = fs.readFileSync(homePath, 'utf-8');

    assert.ok(
      content.includes('inteligência artificial') || content.includes('inteligencia artificial'),
      'Rodapé deve conter nota sobre IA'
    );
    assert.ok(
      content.includes('loja fictícia') || content.includes('demonstração') || content.includes('demonstracao'),
      'Rodapé deve esclarecer caráter demonstrativo'
    );
  });

  test('HVS-09: Arquivos de mídia físicos presentes em frontend/public', () => {
    const videoPath = path.join(rootDir, 'public', 'videos', 'hero-scrub.mp4');
    const posterImgPath = path.join(rootDir, 'public', 'images', 'hero-video-poster.jpg');
    const posterVidPath = path.join(rootDir, 'public', 'videos', 'poster.jpg');

    assert.ok(fs.existsSync(videoPath), 'frontend/public/videos/hero-scrub.mp4 deve existir');
    const videoStat = fs.statSync(videoPath);
    assert.ok(videoStat.size > 10 * 1024 * 1024, 'hero-scrub.mp4 deve ter mais de 10 MB');

    assert.ok(fs.existsSync(posterImgPath), 'frontend/public/images/hero-video-poster.jpg deve existir');
    assert.ok(fs.existsSync(posterVidPath), 'frontend/public/videos/poster.jpg deve existir');
  });

});
