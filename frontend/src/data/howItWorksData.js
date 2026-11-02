/**
 * howItWorksData.js — Conteúdo informativo sobre a metodologia de trabalho do Automatch.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para alimentar as seções explicativas da jornada de compra segura, vistoria por IA
 *     e certificação de procedência veicular, mantendo linguagem concisa e objetiva.
 */

/**
 * Base de dados estruturada do Guia "Como Funciona" da plataforma Automatch.
 * Reflete estritamente as funcionalidades reais implementadas no projeto.
 */
export const howItWorksSections = [
  {
    id: 'navegacao-vitrine',
    badge: 'Vitrine Digital',
    title: '1. Encontrando seu Veículo Ideal',
    summary: 'Explore o catálogo completo com visualização flexível em grade ou lista e ordenação inteligente.',
    whatIsIt: 'Ponto central para busca e comparação de carros certificados, com visualizações rápidas e ordenação por preço, ano e relevância.',
    steps: [
      'Acesse a Vitrine Digital pelo menu superior ou pelo botão principal na tela de início.',
      'Alterne entre os modos Grade ou Lista conforme sua preferência de visualização.',
      'Ordene por menor preço, maior preço ou destaques com 1 clique.',
      'Clique em qualquer veículo para abrir a página de detalhes periciais.'
    ],
    tips: [
      'O modo Lista facilita a comparação direta de quilometragem e ano.',
      'O contador no topo informa os veículos correspondentes em tempo real.'
    ]
  },
  {
    id: 'filtros-busca',
    badge: 'Busca Rápida',
    title: '2. Filtros Inteligentes e Limpeza com 1 Clique',
    summary: 'Encontre o carro certo combinando filtros por marca, categoria, faixa de preço, ano e concessionária.',
    whatIsIt: 'Filtros rápidos que refinam o estoque instantaneamente, com botão para reiniciar parâmetros em um clique.',
    steps: [
      'Digite modelo, versão ou placa na barra de busca superior.',
      'Selecione a categoria desejada: SUV, Sedan, Hatch ou Picape.',
      'Ajuste os filtros de valor máximo, quilometragem e ano.',
      'Clique em "Limpar Filtros" para restaurar o catálogo completo a qualquer momento.'
    ],
    tips: [
      'Combine busca por texto e categoria para encontrar versões raras.',
      'O catálogo exibe atalho de restauração caso nenhum veículo combine com a busca.'
    ]
  },
  {
    id: 'leitura-anuncios',
    badge: 'Transparência de Preço',
    title: '3. Leitura dos Anúncios e Selos de Confiança',
    summary: 'Entenda os preços formatados em padrão brasileiro, o selo de oportunidade e os identificadores de loja.',
    whatIsIt: 'Informações visuais transparentes para rápida avaliação de valor, procedência e redução real de margem.',
    steps: [
      'Confira o preço oficial no padrão brasileiro (ex: R$ 185.000,00).',
      'Observe a estrela de destaque ao lado do nome do veículo.',
      'Verifique o selo "Preço Baixou" quando houver desconto real em relação ao anúncio original.',
      'Identifique a concessionária parceira responsável pelo atendimento físico.'
    ],
    tips: [
      'O selo Preço Baixou sinaliza redução direta aplicada pelo anunciante.',
      'Clique no coração para salvar o carro nos seus Favoritos.'
    ]
  },
  {
    id: 'detalhes-veiculo',
    badge: 'Inspeção Pericial',
    title: '4. Página do Veículo, Varredura 360° e Dossiê Oficial',
    summary: 'Inspecione o carro em 8 ângulos reais, leia o laudo de integridade e baixe o Dossiê Oficial sob demanda.',
    whatIsIt: 'Auditoria técnica completa do veículo com rotação orbital em 8 ângulos e emissão imediata de laudo oficial.',
    steps: [
      'Use a Varredura 360° para girar o veículo em 8 ângulos de alta resolução.',
      'Assista à filmagem pericial de 20s com foco em lataria, pneus e motor.',
      'Abra o Dossiê Oficial Automatch para consultar a perícia técnica completa.',
      'Utilize os botões Baixar PDF ou Imprimir para arquivar sua certidão.'
    ],
    tips: [
      'O Dossiê Oficial abre sob demanda em janela modal rápida e segura.',
      'Todos os laudos atestam integridade estrutural e pintura padrão de fábrica.'
    ]
  },
  {
    id: 'tco-simuladores',
    badge: 'Planejamento Financeiro',
    title: '5. Calculadora de Custo Total (TCO) e Financiamento',
    summary: 'Calcule despesas reais de IPVA, seguro, revisões e combustível antes de fechar negócio.',
    whatIsIt: 'Projeção financeira transparente dos custos de posse (IPVA, seguro, combustível e revisões) para 1, 2 ou 3 anos.',
    steps: [
      'Abra o Simulador de Custo Mensal na página do veículo.',
      'Alterne entre as estimativas de 1 ano, 2 anos ou 3 anos.',
      'Confira o detalhamento de IPVA, seguro médio anual e revisões.',
      'Simule opções de entrada e parcelamento com bancos parceiros.'
    ],
    tips: [
      'Modelos híbridos mostram economia acentuada no gasto de combustível.',
      'A estimativa ajuda no planejamento mensal sustentável.'
    ]
  },
  {
    id: 'consultor-ia',
    badge: 'Inteligência Artificial',
    title: '6. Consultor IA Automatch e Ausência Honesta',
    summary: 'Tire dúvidas técnicas, compare especificações e receba respostas fundamentadas exclusivamente em dados reais.',
    whatIsIt: 'Assistente virtual fundamentado estritamente no laudo pericial, anúncio e ficha técnica oficial.',
    steps: [
      'Abra a aba do Consultor IA no painel lateral do veículo.',
      'Envie perguntas livres ou clique nos atalhos sugeridos (Consumo, Laudo, Motor).',
      'Observe o princípio de Ausência Honesta: dados não periciados não são inventados.',
      'Tire dúvidas técnicas comparativas antes de agendar a visita presencial.'
    ],
    tips: [
      'A IA nunca supõe opcionais que não estejam formalmente comprovados no laudo.',
      'O histórico da conversa fica disponível durante toda a sua navegação.'
    ]
  },
  {
    id: 'anunciar-gerenciar',
    badge: 'Meus Anúncios',
    title: '7. Criação e Gerenciamento de Anúncios',
    summary: 'Cadastre seu veículo pelo fluxo guiado e acompanhe o status das suas publicações.',
    whatIsIt: 'Fluxo direto para publicação de veículos com upload de fotos, vídeo de até 20s e gestão de vendas ativas.',
    steps: [
      'Acesse "Meus Anúncios" e clique em "Anunciar Novo Veículo".',
      'Preencha dados essenciais: marca, modelo, ano, quilometragem e cor.',
      'Envie fotos em boa resolução e o vídeo pericial de até 20s.',
      'Acompanhe e gerencie seus anúncios diretamente no painel.'
    ],
    tips: [
      'Anúncios com fotos em múltiplos ângulos aumentam o índice de propostas.',
      'É possível editar valores ou pausar a exibição a qualquer momento.'
    ]
  }
];

/**
 * Pilares essenciais para exibição rápida e minimalista no topo da página.
 */
export const quickPillars = [
  {
    id: 'laudo-100',
    title: 'Laudo Pericial 100% Auditado',
    desc: 'Inspeção estrutural completa, pintura e ausência de histórico de leilão ou sinistro.',
    iconName: 'ShieldCheck'
  },
  {
    id: 'tecnologia-360',
    title: 'Varredura 360° e Vídeo de 20s',
    desc: 'Visão orbital em 8 ângulos e filmagem pericial contínua de lataria e pneus.',
    iconName: 'RotateCw'
  },
  {
    id: 'ia-honesta',
    title: 'Consultor IA com Ausência Honesta',
    desc: 'Respostas fundamentadas exclusivamente em laudos oficiais, sem dados inventados.',
    iconName: 'Bot'
  }
];

/**
 * Nota exclusiva para perfis autorizados (Administrador ou Lojista).
 * Não deve ser renderizada para usuários comuns ou visitantes não autenticados.
 */
export const b2bSectionNotice = {
  badge: 'Exclusivo para Lojistas e Administradores',
  title: '8. Rede de Parceiros Comerciais e Gestão B2B',
  summary: 'Recursos dedicados para lojistas credenciados: compartilhamento de estoque na rede e gestão avançada de ativos.',
  description: 'A Automatch oferece aos lojistas credenciados acesso à Rede B2B com compartilhamento seguro de estoque entre lojas parceiras, Trava de Negociação (Hold Lock) e painel de Gestão de Ativos com controle de preço piso e margem comercial.'
};

/**
 * Perguntas frequentes enxutas para todos os usuários.
 */
export const generalFaqList = [
  {
    q: 'Todos os carros anunciados possuem laudo cautelar aprovado?',
    a: 'Sim. Todos os veículos cadastrados nas lojas parceiras passam por perícia técnica rigorosa com Laudo Cautelar 100% Aprovado, certificando a integridade das longarinas, espessura uniforme de pintura e ausência de histórico de leilão ou sinistro.'
  },
  {
    q: 'Como posso baixar ou imprimir o Dossiê Oficial de um veículo?',
    a: 'Na página de detalhes do veículo, clique no botão "Dossiê Oficial Automatch". Uma janela modal dedicada será aberta com o resumo pericial, histórico e QR Code de autenticidade, com botões dedicados para "Imprimir" ou "Baixar PDF".'
  },
  {
    q: 'O que significa o selo "Preço Baixou"?',
    a: 'O selo indica que o anunciante reduziu o valor sugerido de venda em relação ao preço cadastrado originalmente, sinalizando oportunidade com margem reduzida.'
  },
  {
    q: 'O Consultor IA da Automatch pode inventar especificações?',
    a: 'Não. O assistente segue o princípio da Ausência Honesta: quando uma informação não consta nas fontes oficiais (anúncio, laudo e ficha técnica), a IA declara com transparência que não possui o dado e recomenda a consulta ao vendedor parceiro.'
  },
  {
    q: 'Preciso pagar para usar os filtros, varredura 360° ou consultar laudos?',
    a: 'Não. Todas as ferramentas de consulta na vitrine, varredura 360°, comparativo FIPE, cálculo de TCO e visualização do Dossiê Oficial são 100% gratuitas.'
  }
];

/**
 * Perguntas frequentes adicionais exclusivas para parceiros B2B.
 */
export const b2bFaqList = [
  {
    q: 'Como funciona a Trava de Reserva Exclusiva (Hold Lock) na Rede B2B?',
    a: 'A Trava de Reserva permite bloquear temporariamente um ativo da rede parceira durante uma negociação em andamento, impedindo propostas concorrentes enquanto a negociação é finalizada.'
  },
  {
    q: 'Onde configuro o preço piso de repasse e a margem operacional?',
    a: 'No painel de Gestão de Ativos (Dashboard), cada veículo possui campos dedicados para definir o Valor Sugerido e o Preço Mínimo de Repasse B2B, calculando o spread estimado em tempo real.'
  }
];
