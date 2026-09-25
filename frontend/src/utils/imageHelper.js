/**
 * imageHelper.js — Utilitário central de alta disponibilidade para imagens no AutoMatch
 * Resolve URLs estáticas respeitando o BASE_URL do Vite (/AutoMatch/), URLs externas,
 * dados em base64 e provê fallback vetorial em SVG automotivo premium.
 */

// SVG vetorial estilizado de silhueta automotiva esportiva moderna (Dark Glassmorphism)
const DEFAULT_CAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  <circle cx="400" cy="250" r="180" fill="#6366f1" opacity="0.08" />
  <path d="M 160 310 Q 200 230 280 220 L 460 210 Q 560 210 640 260 L 680 300 Q 690 320 670 330 L 140 330 Q 130 320 160 310 Z" fill="none" stroke="url(#carGrad)" stroke-width="4" stroke-linecap="round" />
  <path d="M 285 220 L 370 170 Q 450 165 520 170 L 590 230 Z" fill="none" stroke="#38bdf8" stroke-width="3" opacity="0.7" />
  <circle cx="250" cy="330" r="42" fill="url(#wheelGrad)" stroke="#38bdf8" stroke-width="4" />
  <circle cx="250" cy="330" r="20" fill="#0f172a" stroke="#6366f1" stroke-width="2" />
  <circle cx="570" cy="330" r="42" fill="url(#wheelGrad)" stroke="#38bdf8" stroke-width="4" />
  <circle cx="570" cy="330" r="20" fill="#0f172a" stroke="#6366f1" stroke-width="2" />
  <text x="400" y="410" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" text-anchor="middle" letter-spacing="2">AUTOMATCH</text>
  <text x="400" y="435" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="14" text-anchor="middle">Foto do Veículo</text>
</svg>`;

export const DEFAULT_CAR_SVG_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(DEFAULT_CAR_SVG)}`;

/**
 * Normaliza e resolve o caminho da imagem do veículo para funcionar
 * perfeitamente em dev local (localhost:5173), produção e subdiretórios (/AutoMatch/).
 */
export function getVehicleImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') {
    return DEFAULT_CAR_SVG_DATA_URI;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) {
    return DEFAULT_CAR_SVG_DATA_URI;
  }

  // URLs externas ou Base64 / Blob já são absolutas e completas
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Obtém o BASE_URL configurado no Vite (ex: '/AutoMatch/' ou '/')
  const rawBase = import.meta.env.BASE_URL || '/';
  const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  // Limpa as barras iniciais
  const cleanPath = trimmed.replace(/^\/+/, '');

  // Se já começar com 'images/', prefixa apenas com baseUrl
  if (cleanPath.startsWith('images/')) {
    return `${baseUrl}${cleanPath}`;
  }

  // Caso contrário, concatena com o diretório images/
  return `${baseUrl}images/${cleanPath}`;
}

/**
 * Manipulador de fallback em caso de erro 404 ou falha de rede ao carregar a imagem.
 * Evita loops de erro e exibe o placeholder estilizado sem quebrar o layout.
 */
export function handleVehicleImageError(event) {
  const target = event.currentTarget || event.target;
  if (target && !target.getAttribute('data-fallback-applied')) {
    target.setAttribute('data-fallback-applied', 'true');
    target.src = DEFAULT_CAR_SVG_DATA_URI;
  }
}
