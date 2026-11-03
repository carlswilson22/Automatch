/**
 * tourGuideData.js — Base de dados estruturada e configurações dos tours guiados interativos do Automatch.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para alimentar o sistema de tours interativos por spotlight, definindo âncoras estáveis no DOM,
 *     passos concisos (<= 25 palavras) em português do Brasil e restrição de acesso por perfil (RBAC).
 */

/**
 * Âncoras estáveis canônicas para marcação dos elementos no DOM com data-tour="...".
 * Centralizadas para evitar referências soltas e permitir validação automatizada.
 */
export const TOUR_ANCHORS = {
  // Tour Quero Comprar
  CATALOG_SEARCH_BAR: 'vitrine-barra-busca',
  CATALOG_FIRST_CARD: 'vitrine-primeiro-card',
  DETAILS_GALLERY_360: 'detalhes-varredura-360',
  DETAILS_PERICIAL_VIDEO: 'detalhes-video-pericial',
  DETAILS_DOSSIER_BTN: 'detalhes-botao-dossie',
  DETAILS_TCO_CARD: 'detalhes-simulador-tco',
  DETAILS_AI_CHAT: 'detalhes-consultor-ia',

  // Tour Quero Anunciar
  NAV_SELL_CAR: 'nav-vender-carro',
  AD_FORM_MEDIA: 'anuncio-upload-midia',
  AD_SCAN_AI: 'anuncio-scanner-ia',
  MY_ADS_LIST: 'meus-anuncios-painel',

  // Tour Sou Lojista (Exclusivo B2B)
  DASHBOARD_ASSETS_TABLE: 'dashboard-tabela-ativos',
  DASHBOARD_B2B_PARTNERS: 'dashboard-rede-parceiros',
};

/**
 * Lista de tours guiados disponíveis no Automatch.
 * Cada passo respeita o limite de cerca de 25 palavras, sem jargões técnicos e sem citar itens descontinuados.
 */
export const TOURS_CONFIG = [
  {
    id: 'comprar',
    title: 'Quero Comprar',
    badge: 'Jornada do Comprador',
    duration: '60s',
    initialRoute: '/encontrar',
    description: 'Aprenda a buscar, filtrar, inspecionar em 360° e validar o laudo do seu próximo veículo.',
    allowedRoles: null, // Público: disponível para visitantes e todos os perfis
    steps: [
      {
        id: 'busca-filtros',
        targetAnchor: TOUR_ANCHORS.CATALOG_SEARCH_BAR,
        targetRoute: '/encontrar',
        title: 'Encontre pelo Seu Estilo',
        text: 'Busque por modelo, marca ou placa. Use os filtros rápidos para ajustar preço e ano com facilidade.',
        placement: 'bottom',
      },
      {
        id: 'card-veiculo',
        targetAnchor: TOUR_ANCHORS.CATALOG_FIRST_CARD,
        targetRoute: '/encontrar',
        title: 'Transparência sem Letras Miúdas',
        text: 'Veja o preço oficial em reais, a procedência da loja parceira e selos que indicam redução real de valor.',
        placement: 'right',
      },
      {
        id: 'inspecao-360-video',
        targetAnchor: TOUR_ANCHORS.DETAILS_GALLERY_360,
        targetRoute: '/encontrar/sc-001',
        title: 'Inspeção Visual Completa',
        text: 'Gire o veículo em 8 ângulos reais de 45° ou assista à filmagem pericial de 20s com foco em pintura e estrutura.',
        placement: 'bottom',
      },
      {
        id: 'dossie-oficial',
        targetAnchor: TOUR_ANCHORS.DETAILS_DOSSIER_BTN,
        targetRoute: '/encontrar/sc-001',
        title: 'Certidão e Dossiê com 1 Clique',
        text: 'Abra a certidão pericial auditada. Você pode imprimir a via física ou baixar o arquivo PDF na hora.',
        placement: 'top',
      },
      {
        id: 'consultor-ia',
        targetAnchor: TOUR_ANCHORS.DETAILS_AI_CHAT,
        targetRoute: '/encontrar/sc-001',
        title: 'Tire Dúvidas com Dados Reais',
        text: 'Converse com a IA baseada exclusivamente no laudo e ficha do carro, sem respostas inventadas.',
        placement: 'left',
      },
    ],
  },
  {
    id: 'anunciar',
    title: 'Quero Anunciar',
    badge: 'Jornada do Vendedor',
    duration: '45s',
    initialRoute: '/novo-anuncio',
    description: 'Veja como criar anúncios auditados com fotos, vídeo pericial e validação por IA.',
    allowedRoles: null, // Público
    steps: [
      {
        id: 'menu-vender',
        targetAnchor: TOUR_ANCHORS.NAV_SELL_CAR,
        targetRoute: '/',
        title: 'Anuncie em Poucos Minutos',
        text: 'Cadastre seu veículo sem burocracia para compradores qualificados em toda a plataforma.',
        placement: 'bottom',
      },
      {
        id: 'upload-midia',
        targetAnchor: TOUR_ANCHORS.AD_FORM_MEDIA,
        targetRoute: '/novo-anuncio',
        title: 'Galeria e Vídeo de 20s',
        text: 'Envie fotos nítidas e adicione um vídeo pericial curto para valorizar a proposta do seu carro.',
        placement: 'bottom',
      },
      {
        id: 'scanner-ia',
        targetAnchor: TOUR_ANCHORS.AD_SCAN_AI,
        targetRoute: '/novo-anuncio',
        title: 'Auditoria de Lataria com IA',
        text: 'A inteligência artificial analisa fotos para identificar pequenos reparos e assegurar confiança no laudo.',
        placement: 'bottom',
      },
      {
        id: 'meus-anuncios',
        targetAnchor: TOUR_ANCHORS.MY_ADS_LIST,
        targetRoute: '/meus-anuncios',
        title: 'Controle Total das Suas Vendas',
        text: 'Acompanhe seus anúncios ativos, edite detalhes e pause publicações quando quiser.',
        placement: 'top',
      },
    ],
  },
  {
    id: 'lojista',
    title: 'Sou Lojista (B2B)',
    badge: 'Gestão Concessionária',
    duration: '50s',
    initialRoute: '/dashboard',
    description: 'Recursos dedicados a lojistas credenciados: gestão de estoque, margem de repasse e rede B2B.',
    allowedRoles: ['lojista', 'admin'], // Omitido categoricamente para visitante e comum
    steps: [
      {
        id: 'gestao-ativos',
        targetAnchor: TOUR_ANCHORS.DASHBOARD_ASSETS_TABLE,
        targetRoute: '/dashboard',
        title: 'Gestão Centralizada de Estoque',
        text: 'Monitore todo o inventário da loja, valor de venda sugerido e laudos emitidos em um só lugar.',
        placement: 'top',
      },
      {
        id: 'rede-b2b',
        targetAnchor: TOUR_ANCHORS.DASHBOARD_B2B_PARTNERS,
        targetRoute: '/dashboard',
        title: 'Estoque Compartilhado B2B',
        text: 'Acesse estoque de outras lojas credenciadas e use a trava de reserva para negociações exclusivas sem conflitos.',
        placement: 'top',
      },
    ],
  },
];

/**
 * Retorna os tours permitidos com base no perfil do usuário autenticado.
 * Perfis visitante ou comum não recebem tours B2B.
 */
export function getAvailableTours(userRole = null) {
  return TOURS_CONFIG.filter((tour) => {
    if (!tour.allowedRoles) return true;
    return Boolean(userRole && tour.allowedRoles.includes(userRole));
  });
}

/**
 * Localiza um tour pelo identificador validando a permissão do usuário.
 */
export function getTourById(tourId, userRole = null) {
  const tour = TOURS_CONFIG.find((t) => t.id === tourId);
  if (!tour) return null;
  if (!tour.allowedRoles) return tour;
  const isAllowed = Boolean(userRole && tour.allowedRoles.includes(userRole));
  return isAllowed ? tour : null;
}

