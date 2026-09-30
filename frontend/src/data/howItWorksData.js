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
    whatIsIt: 'A Vitrine Digital é o ponto central para busca e comparação de carros certificados na Automatch. Ela permite alternar visualizações, filtrar por critérios essenciais e encontrar veículos com histórico auditado em tempo real.',
    steps: [
      'Acesse a Vitrine Digital pelo menu superior ou pelo botão principal na tela de início.',
      'Alterne entre os modos "Grade" (cards com foco nas fotos) ou "Lista" (tabela compacta para comparação de dados técnicos).',
      'Utilize o seletor de ordenação para priorizar por menor preço, maior preço, mais recentes ou destaques.',
      'Clique em qualquer veículo para abrir sua página exclusiva de detalhes periciais.'
    ],
    tips: [
      'O modo Lista é ideal para comparar rapidamente quilometragem, ano e preços entre vários modelos.',
      'O contador no topo da vitrine informa exatamente a quantidade de carros disponíveis de acordo com a sua busca.'
    ]
  },
  {
    id: 'filtros-busca',
    badge: 'Busca Rápida',
    title: '2. Filtros Inteligentes e Limpeza com 1 Clique',
    summary: 'Encontre o carro certo combinando filtros por marca, categoria, faixa de preço, ano e concessionária.',
    whatIsIt: 'Os filtros inteligentes da Automatch refinam o estoque de forma instantânea sem recarregar a página. Caso deseje reiniciar sua pesquisa, o botão "Limpar Filtros" restaura todo o catálogo com apenas um clique.',
    steps: [
      'Digite o modelo, versão ou placa na barra de busca superior para filtragem instantânea.',
      'Selecione a categoria de carroceria desejada: SUV, Sedan, Hatch ou Picape.',
      'Ajuste os controles deslizantes para definir o valor máximo de investimento e o ano mínimo de fabricação.',
      'Para ver veículos de uma loja parceira específica, selecione a unidade desejada no filtro de concessionárias.',
      'Clique no botão "Limpar Filtros" para reiniciar todos os parâmetros e exibir o catálogo completo novamente.'
    ],
    tips: [
      'Você pode combinar a barra de texto com os filtros de categoria e preço para encontrar versões exatas.',
      'Quando nenhum veículo corresponder à combinação de filtros, a plataforma exibe uma mensagem amigável com atalho para limpar a busca.'
    ]
  },
  {
    id: 'leitura-anuncios',
    badge: 'Transparência de Preço',
    title: '3. Leitura dos Anúncios e Selos de Confiança',
    summary: 'Entenda os preços formatados em padrão brasileiro, o selo de oportunidade e os identificadores de loja.',
    whatIsIt: 'Cada anúncio na Automatch apresenta informações visuais padronizadas para facilitar a tomada de decisão sem letras miúdas ou cálculos complexos.',
    steps: [
      'Identifique o preço oficial do veículo, sempre exibido no padrão brasileiro oficial (ex: R$ 185.000,00).',
      'Observe a estrela dourada de destaque ao lado do nome do carro, indicando veículos inspecionados com alta procura.',
      'Verifique se o veículo possui o selo "Preço Baixou": ele indica que o valor de venda atual foi reduzido em relação ao preço original do anúncio.',
      'Confira a identificação da concessionária parceira (Store Identifier) para saber qual unidade física é responsável pelo veículo.'
    ],
    tips: [
      'O selo "Preço Baixou" indica oportunidades reais com redução de margem pelo vendedor.',
      'O ícone de coração permite salvar qualquer veículo na sua lista de Favoritos para acompanhar alterações de preço.'
    ]
  },
  {
    id: 'detalhes-veiculo',
    badge: 'Inspeção Pericial',
    title: '4. Página do Veículo, Varredura 360° e Dossiê Oficial',
    summary: 'Inspecione o carro em 8 ângulos reais, leia o laudo de integridade e baixe o Dossiê Oficial sob demanda.',
    whatIsIt: 'A página de detalhes do veículo reúne a auditoria pericial completa. Você pode girar o carro em 360°, consultar o histórico pericial e acionar os laudos oficiais em modais dedicados.',
    steps: [
      'Utilize a ferramenta de Varredura 360° para inspecionar o veículo em 8 ângulos de alta resolução (frente, quinas 45°, laterais e traseira).',
      'Leia o bloco "Sobre o Veículo" para conferir especificações detalhadas: motorização, câmbio, direção, freios, airbags, suspensão e consumo.',
      'Clique no botão "Dossiê Oficial Automatch" para abrir o modal auditado com histórico do carro, laudo de pintura e QR Code de autenticidade.',
      'Dentro do modal do Dossiê, utilize o botão "Imprimir" para gerar via física ou "Baixar PDF" para salvar a certidão oficial.',
      'Acesse os botões complementares: "Laudo Cautelar" (100% aprovado, sem sinistros), "Certidão Detran" (débitos e gravame) e "Preço Fipe" (comparativo de mercado).'
    ],
    tips: [
      'O Dossiê Oficial abre sob demanda em janela própria para manter a leitura da página leve e organizada.',
      'Todos os laudos cautelares atestam pintura padrão de fábrica e estrutura de chassi íntegra sem cortes ou emendas.'
    ]
  },
  {
    id: 'tco-simuladores',
    badge: 'Planejamento Financeiro',
    title: '5. Calculadora de Custo Total (TCO) e Financiamento',
    summary: 'Calcule despesas reais de IPVA, seguro, revisões e combustível antes de fechar negócio.',
    whatIsIt: 'A Calculadora de Custo Total de Posse (TCO) projeta os gastos reais de manutenção e propriedade do veículo para 1, 2 ou 3 anos, permitindo um planejamento financeiro sem surpresas.',
    steps: [
      'Localize a seção "Calculadora de Custo Total de Posse (TCO)" na página de detalhes do veículo.',
      'Alterne entre os períodos de estimativa (1 ano, 2 anos ou 3 anos) para visualizar a projeção acumulada.',
      'Analise a composição dos custos: IPVA estimado, seguro médio anual, revisões programadas e combustível conforme sua quilometragem.',
      'Utilize o simulador de financiamento para estimar o valor da entrada e parcelas com os principais bancos parceiros.'
    ],
    tips: [
      'Carros híbridos ou econômicos apresentam custos de combustível significativamente menores na projeção de longo prazo.',
      'Você também pode testar a simulação de Troca com Troco para utilizar seu veículo usado como parte do pagamento.'
    ]
  },
  {
    id: 'consultor-ia',
    badge: 'Inteligência Artificial',
    title: '6. Consultor IA Automatch e Ausência Honesta',
    summary: 'Tire dúvidas técnicas, compare especificações e receba respostas fundamentadas exclusivamente em dados reais.',
    whatIsIt: 'O Consultor IA Automatch é um assistente virtual especializado integrado à página de detalhes do carro e ao suporte da página inicial. Ele é treinado estritamente nas 3 fontes oficiais: Dados do Anúncio, Laudo Cautelar e Descrição Técnica.',
    steps: [
      'Abra a caixa do Consultor IA no painel lateral da página do veículo ou no chat de suporte.',
      'Faça perguntas livres ou clique nas pílulas de atalho sugeridas (ex: "Direção e Freios", "Motor e KM", "Consumo", "Laudo").',
      'Você pode combinar múltiplos temas na mesma mensagem (ex: "Como são a direção e os freios?") ou fazer perguntas curtas de continuidade (ex: "e o câmbio?").',
      'Observe o princípio de Ausência Honesta: se um item não constar no anúncio ou no laudo (como um acessório não especificado), a IA informará com transparência que não possui o dado e recomendará confirmar com o vendedor parceiro.'
    ],
    tips: [
      'A IA da Automatch nunca inventa equipamentos que não estejam comprovados na perícia técnica ou na ficha oficial.',
      'O chat mantém seu histórico durante a navegação para você retomar perguntas anteriores a qualquer momento.'
    ]
  },
  {
    id: 'anunciar-gerenciar',
    badge: 'Meus Anúncios',
    title: '7. Criação e Gerenciamento de Anúncios',
    summary: 'Cadastre seu veículo pelo fluxo guiado e acompanhe o status das suas publicações.',
    whatIsIt: 'A área "Meus Anúncios" permite que anunciantes e proprietários cadastrem novos veículos na plataforma, acompanhem visualizações e gerenciem seus carros ativos.',
    steps: [
      'Acesse a opção "Meus Anúncios" no menu de usuário ou no cabeçalho.',
      'Clique no botão centralizado "Anunciar Novo Veículo" para iniciar o cadastro guiado.',
      'Preencha as informações do veículo: marca, modelo, ano de fabricação, quilometragem, cor e combustível.',
      'Adicione fotos de alta qualidade e informe os destaques de procedência e laudo cautelar.',
      'Revise os dados de contato e publique o anúncio para exibição imediata no catálogo.'
    ],
    tips: [
      'Anúncios com fotos claras de vários ângulos e descrição detalhada de revisões recebem maior volume de contatos.',
      'Você pode editar valores ou pausar a exibição do anúncio a qualquer momento pela sua lista.'
    ]
  }
];

/**
 * Nota exclusiva para perfis autorizados (Administrador ou Lojista).
 * Não deve ser renderizada para compradores ou visitantes não autenticados.
 */
export const b2bSectionNotice = {
  badge: 'Exclusivo para Lojistas e Administradores',
  title: '8. Rede de Parceiros Comerciais e Gestão B2B',
  summary: 'Recursos dedicados para lojistas credenciados: compartilhamento de estoque na rede e gestão avançada de ativos.',
  description: 'A Automatch oferece aos lojistas e concessionárias credenciadas acesso à Rede de Conexão B2B, permitindo o compartilhamento seguro de estoque entre lojas parceiras, reservas exclusivas com Trava de Negociação (Hold Lock) e painel centralizado de Gestão de Ativos (Dashboard) com controle de preço piso e margem comercial.'
};

/**
 * Perguntas frequentes para todos os usuários.
 */
export const generalFaqList = [
  {
    q: 'Todos os carros anunciados possuem laudo cautelar aprovado?',
    a: 'Sim. Todos os veículos cadastrados nas concessionárias parceiras da Automatch passam por perícia técnica rigorosa com Laudo Cautelar 100% Aprovado, certificando a integridade das longarinas, espessura uniforme de pintura e ausência de histórico de leilão ou sinistro.'
  },
  {
    q: 'Como posso baixar ou imprimir o Dossiê Oficial de um veículo?',
    a: 'Na página de detalhes do veículo, clique no botão "Dossiê Oficial Automatch". Uma janela modal dedicada será aberta com o resumo pericial, histórico e QR Code de autenticidade. No cabeçalho da janela, você encontra botões separados para "Imprimir" ou "Baixar PDF".'
  },
  {
    q: 'O que significa o selo "Preço Baixou"?',
    a: 'O selo "Preço Baixou" indica que o anunciante reduziu o valor sugerido de venda em relação ao valor originalmente cadastrado, sinalizando uma oportunidade de compra com valor mais atrativo.'
  },
  {
    q: 'O Consultor IA da Automatch pode garantir dados mecânicos?',
    a: 'O Consultor IA responde com base estrita nas especificações cadastradas, no laudo cautelar pericial e na descrição técnica do anúncio. Quando uma informação não consta nas fontes oficiais, a IA informa honestamente que o dado não está disponível e orienta o comprador a consultar o vendedor.'
  },
  {
    q: 'Como funciona o cálculo do Custo Total de Posse (TCO)?',
    a: 'A calculadora de TCO soma as despesas médias esperadas para 1, 2 ou 3 anos de uso, englobando IPVA oficial do estado, estimativa média de seguro para a categoria, manutenções programadas de revisão e gasto estimado de combustível com base na média de rodagem.'
  },
  {
    q: 'Preciso pagar para usar os filtros, varredura 360° ou consultar os laudos?',
    a: 'Não. Todas as ferramentas de consulta, varredura 360°, comparativo FIPE, cálculo de TCO e visualização do Dossiê Oficial são 100% gratuitas para os compradores na plataforma.'
  }
];

/**
 * Perguntas frequentes adicionais exclusivas para parceiros B2B.
 */
export const b2bFaqList = [
  {
    q: 'Como funciona a Trava de Reserva Exclusiva (Hold Lock) na Rede B2B?',
    a: 'A Trava de Reserva Exclusiva permite que uma loja parceira bloqueie temporariamente um ativo da rede durante uma negociação em andamento, garantindo que o veículo não seja negociado concorrentemente por outros parceiros enquanto a proposta é concluída.'
  },
  {
    q: 'Onde configuro o preço piso de repasse e a margem operacional?',
    a: 'No painel de "Gestão de Ativos" (Dashboard), cada veículo possui a opção de configurar o Valor Sugerido de Venda e o Preço Mínimo de Repasse B2B, permitindo visualizar a margem/spread operacional estimado.'
  }
];
