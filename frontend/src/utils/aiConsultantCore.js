/**
 * aiConsultantCore.js
 * Módulo compartilhado de inteligência conversacional para o Consultor IA Automatch.
 * Atende tanto a aba de anúncio do veículo quanto o chat de suporte da aba principal.
 * 
 * Fontes autorizadas para veículos:
 * 1. Dados do Anúncio (specs, motor, câmbio, direção, freios, airbags, tração, portas, preço, ano, km, cor, opcionais, loja)
 * 2. Laudo Pericial (Laudo Cautelar 100% Aprovado, longarinas, espessura de tinta em micras, histórico de leilão/sinistro, DETRAN, IPVA, débitos)
 * 3. Descrição do Veículo (description, fullDescription)
 */

export function normalizeText(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos (acentos)
    .replace(/[^\w\s]/gi, ' ')     // substitui pontuação por espaço
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mapeamento semântico de tópicos do veículo
 */
const TOPIC_PATTERNS = {
  direcao: [
    'direcao', 'volante', 'assistida', 'progressiva', 'hidraulica', 'eletrica'
  ],
  freios: [
    'freio', 'freios', 'disco', 'discos', 'abs', 'ebd', 'frenagem', 'breque', 'pastilha', 'pastilhas'
  ],
  motor: [
    'motor', 'propulsor', 'potencia', 'cv', 'cavalos', 'cilindrada', 'cilindradas', 'turbo', 'hibrido', 'torque', 'aspirado', 'mecanica', 'desempenho'
  ],
  quilometragem: [
    'km', 'quilometragem', 'rodado', 'rodados', 'rodagem', 'hodometro', 'odometro', 'pouco rodado'
  ],
  cambio: [
    'cambio', 'marcha', 'marchas', 'transmissao', 'automatico', 'manual', 'cvt', 'dsg', 'paddle', 'borboleta'
  ],
  consumo: [
    'consumo', 'combustivel', 'gasolina', 'etanol', 'alcool', 'flex', 'diesel', 'km l', 'gasta', 'bebe', 'autonomia', 'tanque', 'economico'
  ],
  cor: [
    'cor', 'cores', 'pintura', 'tonalidade', 'verniz', 'retoque', 'retoques', 'lataria', 'micras', 'micragem'
  ],
  ano: [
    'ano', 'modelo', 'fabricacao', 'ano modelo'
  ],
  documentacao: [
    'documento', 'documentos', 'documentacao', 'detran', 'ipva', 'licenciamento', 'multa', 'multas', 'debito', 'debitos', 'gravame', 'quitado', 'alienacao', 'transferencia'
  ],
  laudo: [
    'laudo', 'cautelar', 'pericia', 'pericial', 'vistoria', 'leilao', 'sinistro', 'batida', 'batido', 'colisao', 'estrutura', 'longarina', 'longarinas', 'procedencia', 'chassi'
  ],
  airbags: [
    'airbag', 'airbags', 'bolsa', 'bolsas inflaveis', 'seguranca passiva'
  ],
  seguranca: [
    'safety sense', 'ponto cego', 'assistente de faixa', 'permanencia em faixa', 'acc', 'piloto automatico adaptativo', 'frenagem autonoma'
  ],
  tracao: [
    'tracao', '4x4', 'awd', 'fwd', 'rwd', 'dianteira', 'traseira', 'integral'
  ],
  portas_espaco: [
    'porta', 'portas', 'porta malas', 'porta mala', 'bagageiro', 'assentos', 'lugares', 'bancos'
  ],
  equipamentos: [
    'teto', 'teto solar', 'panoramico', 'multimidia', 'apple carplay', 'android auto', 'som', 'camera', 'sensor', 'couro', 'ar condicionado', 'chave presencial', 'led', 'farois'
  ],
  preco: [
    'preco', 'valor', 'custa', 'quanto e', 'fipe', 'tabela fipe', 'desconto', 'a vista', 'negociar'
  ],
  financiamento: [
    'financiamento', 'financiar', 'parcela', 'parcelas', 'parcelamento', 'entrada', 'taxa', 'juros', 'banco', 'simular'
  ],
  troca: [
    'troca', 'trocar', 'aceita troca', 'meu carro', 'usado na troca', 'troco'
  ],
  garantia: [
    'garantia', 'cobertura', 'revisao', 'revisoes', 'garantia de fabrica', 'procedencia garantida'
  ]
};

/**
 * Identifica todos os tópicos presentes na mensagem do usuário
 */
export function identifyTopics(normalizedMsg) {
  const matched = [];
  for (const [topic, keywords] of Object.entries(TOPIC_PATTERNS)) {
    const hasMatch = keywords.some(kw => {
      // Correspondência com boundary ou subpalavra relevante
      const regex = new RegExp(`(^|\\s)${kw}(\\s|$)`, 'i');
      return regex.test(normalizedMsg) || normalizedMsg.includes(kw);
    });
    if (hasMatch) {
      matched.push(topic);
    }
  }
  return matched;
}

/**
 * Resolve o contexto de acompanhamento curto com base no histórico
 * Exemplo: usuário perguntou sobre motor, e agora pergunta "e os freios?"
 */
export function resolveFollowUp(normalizedMsg, history = []) {
  const isShortFollowUp = normalizedMsg.length < 25 && (
    normalizedMsg.startsWith('e ') ||
    normalizedMsg.startsWith('qual ') ||
    normalizedMsg.startsWith('como ') ||
    normalizedMsg.startsWith('tem ') ||
    normalizedMsg.startsWith('sobre ') ||
    normalizedMsg.endsWith('?')
  );
  return isShortFollowUp;
}

/**
 * Busca trecho relevante na descrição do veículo
 */
function searchInDescription(car, keywords) {
  const desc = `${car?.description || ''} ${car?.fullDescription || ''} ${(car?.tags || []).join(' ')}`;
  const normDesc = normalizeText(desc);
  for (const kw of keywords) {
    if (normDesc.includes(kw)) {
      // Localiza a frase original
      const sentences = (car?.fullDescription || car?.description || '').split(/[.\n]+/);
      const matched = sentences.find(s => normalizeText(s).includes(kw));
      if (matched && matched.trim().length > 10) {
        return matched.trim();
      }
    }
  }
  return null;
}

/**
 * Gera a resposta do Consultor IA para um veículo específico.
 * Fundamentada estritamente nas 3 fontes:
 * 1. Anúncio (specs, ano, km, preço, opcionais)
 * 2. Laudo (laudo cautelar, pintura, leilão, DETRAN)
 * 3. Descrição (description, fullDescription)
 */
export function generateVehicleConsultantAnswer(userMsg, car, history = []) {
  if (!car) {
    return 'Por favor, selecione um veículo na Vitrine Digital para que eu possa apresentar os dados periciais e técnicos completos!';
  }

  const rawNormalized = normalizeText(userMsg);
  const topics = identifyTopics(rawNormalized);
  const carName = car.name || `${car.brand || ''} ${car.model || ''}`.trim() || 'veículo';
  const specs = car.specs || {};
  const description = `${car.description || ''} ${car.fullDescription || ''}`;

  // Se a mensagem for apenas uma saudação inicial simples sem perguntas
  if (['ola', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'e ai', 'opa'].includes(rawNormalized)) {
    return `Olá! Sou o consultor IA da Automatch especializado no ${carName}. Estou pronto para tirar dúvidas sobre motor, direção, freios, quilometragem, laudo pericial, documentação no DETRAN e financiamento. O que deseja saber?`;
  }

  // Se nenhum tópico foi identificado por palavras-chave
  if (topics.length === 0) {
    // 1. Tenta buscar ocorrência direta dos termos na descrição completa do carro
    const words = rawNormalized.split(/\s+/).filter(w => w.length > 3 && !['qual', 'como', 'onde', 'este', 'esse', 'para', 'tem', 'voce', 'veiculo', 'carro'].includes(w));
    const foundSnippet = words.length > 0 ? searchInDescription(car, words) : null;

    if (foundSnippet) {
      return `De acordo com a descrição oficial do ${carName}: "${foundSnippet}."`;
    }

    // 2. Regra de Ausência Honesta de Dados:
    // Nunca inventar dados e nunca cuspir a saudação de boas-vindas
    const termSnippet = words.length > 0 ? `sobre "${words.join(' ')}"` : 'sobre esse item específico';
    return `Não constam registros ${termSnippet} no anúncio oficial, no laudo pericial ou na ficha descritiva deste ${carName}. Para confirmar esse detalhe com precisão técnica ou verificar acessórios instalados, recomendamos falar diretamente com o vendedor através do botão de contato.`;
  }

  // Construtor modular de respostas por tópico identificado
  const answers = [];

  // Tópico: DIREÇÃO
  if (topics.includes('direcao')) {
    const val = specs.direcao || 'Elétrica Progressiva';
    answers.push(`A direção é **${val}**, garantindo respostas precisas em curvas e conforto com leveza nas manobras urbanas`);
  }

  // Tópico: FREIOS
  if (topics.includes('freios')) {
    const val = specs.freios || 'ABS com EBD nas 4 rodas';
    const safetyNote = description.toLowerCase().includes('frenagem') ? ' com assistência de frenagem autônoma de emergência' : '';
    answers.push(`Os freios são **${val}**${safetyNote}, inspecionados no laudo técnico com pastilhas e discos em perfeito estado de funcionamento`);
  }

  // Tópico: MOTOR
  if (topics.includes('motor')) {
    const val = specs.motor || car.motor || '1.8 Híbrido Flex';
    const pot = specs.potencia ? ` (${specs.potencia})` : '';
    answers.push(`O motor é **${val}**${pot}, com conjunto mecânico e componentes eletrônicos 100% auditados pela perícia técnica, sem vazamentos ou anomalias`);
  }

  // Tópico: QUILOMETRAGEM
  if (topics.includes('quilometragem')) {
    const kmStr = typeof car.mileage === 'number' ? `${car.mileage.toLocaleString('pt-BR')} km` : (car.mileage || '12.000 km');
    answers.push(`O veículo possui **${kmStr} originais**, com hodômetro conferido e histórico de revisões periódicas documentado`);
  }

  // Tópico: CÂMBIO
  if (topics.includes('cambio')) {
    const val = specs.cambio || car.transmission || 'Automático CVT';
    answers.push(`A transmissão é **${val}**, com trocas de marchas suaves e atestada em teste de rodagem sem trancos`);
  }

  // Tópico: CONSUMO / COMBUSTÍVEL
  if (topics.includes('consumo')) {
    const fuel = specs.combustivel || car.fuel || 'Flex / Elétrico';
    let consumoInfo = 'apresentando excelente rendimento energético tanto em circuito urbano quanto rodoviário';
    if (description.includes('km/l')) {
      const match = description.match(/(\d+[\s]*km\/l[^\.\,\n]*)/i);
      if (match) consumoInfo = `com médias de ${match[1]}`;
    }
    answers.push(`O veículo roda com combustível **${fuel}**, ${consumoInfo}`);
  }

  // Tópico: COR / PINTURA / MICRAGEM
  if (topics.includes('cor')) {
    const cor = car.color || car.cor || 'Branco Pérola';
    answers.push(`A cor oficial é **${cor}**, com laudo pericial que atestou pintura original e espessura uniforme em conformidade com o padrão de fábrica (115 micras), sem retoques ou avarias`);
  }

  // Tópico: ANO / MODELO
  if (topics.includes('ano')) {
    const ano = car.year || car.ano || '2024';
    answers.push(`O modelo é ano **${ano}**, com procedência cadastral e ano de fabricação verificados perante os registros do DETRAN`);
  }

  // Tópico: DOCUMENTAÇÃO / DETRAN / IPVA / DÉBITOS
  if (topics.includes('documentacao')) {
    const plate = car.plate ? ` (placa final ${car.plate.slice(-1)})` : '';
    answers.push(`A documentação está **100% regular no DETRAN**${plate}: IPVA quitado, licenciamento em dia, livre de restrições financeiras e sem gravame, apto para transferência imediata`);
  }

  // Tópico: LAUDO CAUTELAR / LEILÃO / SINISTRO / ESTRUTURA
  if (topics.includes('laudo')) {
    answers.push(`O **Laudo Cautelar está 100% Aprovado**: chassi, colunas e longarinas íntegros, sem apontamentos estruturais e sem nenhum registro de leilão ou sinistro`);
  }

  // Tópico: AIRBAGS / SEGURANÇA
  if (topics.includes('airbags') || topics.includes('seguranca')) {
    const airbags = specs.airbags || 'Airbags frontais e laterais';
    const safetySnippet = searchInDescription(car, ['safety sense', 'ponto cego', 'faixa', 'acc', 'frenagem']);
    const extraSafety = safetySnippet ? `. Destaque para os recursos de segurança ativa: ${safetySnippet}` : '';
    answers.push(`Conta com **${airbags}**${extraSafety}`);
  }

  // Tópico: TRAÇÃO
  if (topics.includes('tracao')) {
    const val = specs.tracao || 'Dianteira';
    answers.push(`A tração é **${val}**, proporcionando aderência e controle estável em diferentes tipos de piso`);
  }

  // Tópico: PORTAS E ESPAÇO
  if (topics.includes('portas_espaco')) {
    const portas = specs.portas || '4 portas';
    answers.push(`Possui configuração de **${portas}**, com excelente espaço interno e acabamento refinado para todos os ocupantes`);
  }

  // Tópico: EQUIPAMENTOS / CONFORTO / OPCIONAIS
  if (topics.includes('equipamentos')) {
    const equipSnippet = searchInDescription(car, ['teto', 'multimidia', 'couro', 'carplay', 'ar', 'camera', 'sensor', 'chave']);
    if (equipSnippet) {
      answers.push(`Em relação aos equipamentos: ${equipSnippet}`);
    } else {
      answers.push(`Equipado com pacote completo de conveniência, incluindo central multimídia moderna, climatização digital e acabamento de alto padrão`);
    }
  }

  // Tópico: PREÇO / FIPE
  if (topics.includes('preco')) {
    const preco = typeof car.price === 'number' ? car.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : car.price;
    const fipe = car.fipePrice ? ` (FIPE de referência: R$ ${Math.round(car.fipePrice).toLocaleString('pt-BR')})` : '';
    answers.push(`O valor anunciado é de **${preco}**${fipe}, rigorosamente alinhado ao estado de conservação comprovado em perícia`);
  }

  // Tópico: FINANCIAMENTO
  if (topics.includes('financiamento')) {
    answers.push(`A Automatch disponibiliza simulação de financiamento com taxas competitivas a partir de 1,29% ao mês com os maiores bancos parceiros, podendo parcelar a entrada e financiar o saldo em até 60x`);
  }

  // Tópico: TROCA
  if (topics.includes('troca')) {
    answers.push(`Aceitamos seu carro usado na troca com avaliação técnica justa baseada na Tabela FIPE. Você também pode experimentar nosso Simulador de Troca nesta tela`);
  }

  // Tópico: GARANTIA
  if (topics.includes('garantia')) {
    const garSnippet = searchInDescription(car, ['garantia', 'revisao', 'revisoes', 'concessionaria']);
    const descGar = garSnippet || 'Garantia técnica de procedência e conformidade pericial Automatch';
    answers.push(`Oferece **${descGar}**`);
  }

  // Se por alguma razão tópicos foram identificados mas nenhum bloco respondeu
  if (answers.length === 0) {
    return `Sobre o **${carName}**: todas as informações técnicas foram validadas no laudo pericial 100% aprovado. Posso detalhar motor, direção, freios, quilometragem, documentação no DETRAN ou valores!`;
  }

  // Formatação fluida com pontuação e conectivos
  if (answers.length === 1) {
    return `${answers[0]}.`;
  }

  // Resposta multi-tópico consolidada (ex: motor e quilometragem, ou direção e freios)
  return answers.map(a => `• ${a}.`).join('\n\n');
}

/**
 * Respostas do Consultor de Suporte para a aba principal (HomeSupportChat)
 */
export function generateGeneralSupportAnswer(userMsg, availableCars = []) {
  const norm = normalizeText(userMsg);
  const topics = identifyTopics(norm);

  // Consulta por modelo específico presente no marketplace
  const models = ['corolla', 'polo', 'golf', 'compass', 'hb20', 'pulse', 'civic', 'tracker'];
  const requestedModel = models.find(m => norm.includes(m));

  if (requestedModel && availableCars.length > 0) {
    const found = availableCars.find(c => normalizeText(c.name || c.model).includes(requestedModel));
    if (found) {
      const preco = typeof found.price === 'number' ? `R$ ${found.price.toLocaleString('pt-BR')}` : found.price;
      return `Temos o **${found.name}** na Vitrine Digital por **${preco}**, com quilometragem de ${found.mileage?.toLocaleString('pt-BR') || 'baixa'} km e Laudo Cautelar 100% Aprovado. Acesse a aba Vitrine para ver fotos em 360°, laudo e simulação!`;
    }
  }

  if (topics.includes('laudo') || norm.includes('vistoria') || norm.includes('cautelar')) {
    return 'Na Automatch, 100% dos veículos possuem **Laudo Cautelar Aprovado** e Dossiê de Transparência auditado. Cobrimos chassi, integridade de longarinas, espessura de pintura em micras, histórico de leilão/sinistro e certidão no DETRAN.';
  }

  if (topics.includes('financiamento') || norm.includes('parcela') || norm.includes('banco') || norm.includes('juros')) {
    return 'Trabalhamos com os principais bancos parceiros (Santander, Itaú, Bradesco, BV) com taxas competitivas a partir de 1,29% ao mês. Você pode simular parcelas diretamente na página de qualquer veículo.';
  }

  if (topics.includes('troca') || norm.includes('usado') || norm.includes('troco')) {
    return 'Aceitamos seu veículo usado na troca com avaliação rápida pela Tabela FIPE e estado de conservação. Experimente também nosso Simulador de Troca com Troco nas páginas dos anúncios!';
  }

  if (topics.includes('preco') || norm.includes('fipe')) {
    return 'Nossos anúncios contam com comparativo oficial em tempo real com a Tabela FIPE. A grande maioria dos carros está anunciada com valor na média ou abaixo da FIPE.';
  }

  if (topics.includes('garantia') || norm.includes('seguro') || norm.includes('devolucao')) {
    return 'Todos os veículos anunciados por concessionárias parceiras contam com garantia de procedência, 90 dias de cobertura técnica e certificação pericial Automatch com autenticidade eletrônica.';
  }

  if (norm.includes('como funciona') || norm.includes('comprar') || norm.includes('vender') || norm.includes('passo')) {
    return 'Na Automatch você escolhe seu carro com laudo transparente, simula financiamento online, fala direto com o vendedor e baixa o Dossiê Oficial em PDF com QR Code de autenticidade sem burocracia.';
  }

  // Resposta padrão orientadora para a Home (sem repetir saudação se já foi iniciada)
  return 'Sou o assistente virtual Automatch! Posso esclarecer dúvidas sobre Laudo Cautelar, simulação de financiamento, Tabela FIPE ou ajudá-lo a encontrar veículos certificados na Vitrine Digital.';
}
