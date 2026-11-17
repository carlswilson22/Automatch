/**
 * aiConsultantCore.js — Lógica de recomendação e cálculo de compatibilidade de veículos.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para calcular a aderência entre as preferências do comprador (orçamento, uso, consumo)
 *     e as características técnicas dos carros do estoque.
 */
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
  avarias: [
    'avaria', 'avarias', 'dano', 'danos', 'risco', 'riscos', 'amassado', 'amassados', 'ralado', 'ralados', 'defeito', 'defeitos', 'detalhe', 'detalhes', 'batida', 'batido', 'sinistro', 'recuperado', 'lataria avariada'
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
export function generateVehicleConsultantAnswer(userMsg, car) {
  if (!car) return 'Selecione um veículo para consultar as informações do anúncio.';
  const message = normalizeText(userMsg);
  const topics = identifyTopics(message);
  const name = car.name || [car.brand, car.model].filter(Boolean).join(' ') || 'veículo';
  const specs = car.specs || {};
  const value = input => input == null || input === '' ? 'não informado' : String(input);
  const fields = {
    direcao: ['Direção', specs.direcao], freios: ['Freios', specs.freios], motor: ['Motor', specs.motor || car.motor],
    quilometragem: ['Quilometragem', typeof (car.mileage ?? car.km) === 'number' ? (car.mileage ?? car.km).toLocaleString('pt-BR') + ' km' : car.mileage ?? car.km], cambio: ['Transmissão', specs.cambio || car.transmission],
    consumo: ['Combustível e consumo informado (INMETRO, quando cadastrado)', [specs.combustivel || car.fuel, specs.consumoInmetro || specs.consumo].filter(Boolean).join(' · ')],
    cor: ['Cor', car.color || car.cor], ano: ['Ano/modelo', car.year || car.ano],
    airbags: ['Airbags', specs.airbags], tracao: ['Tração', specs.tracao], portas_espaco: ['Portas', specs.portas],
    preco: ['Preço anunciado', typeof car.price === 'number' ? car.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : car.price],
    laudo: ['Situação do laudo informada', car.laudoStatus || car.laudo_status],
    equipamentos: ['Equipamentos', searchInDescription(car, ['teto', 'multimidia', 'couro', 'carplay', 'camera', 'sensor'])],
    garantia: ['Garantia', searchInDescription(car, ['garantia'])],
  };
  const answers = topics.map(topic => {
    if (topic === 'avarias') {
      const damages = car.damagePoints || car.damages;
      const details = Array.isArray(damages) ? damages.map(d => typeof d === 'string' ? d : [d.part, d.type, d.desc || d.description].filter(Boolean).join(': ')).join('; ') : '';
      return details ? `Apontamentos informados no cadastro: ${details}. A gravidade e a estrutura exigem avaliação.` : 'Não há apontamentos informados no cadastro. Isso não comprova ausência de avarias; confira a vistoria.';
    }
    if (topic === 'documentacao') return 'DETRAN, IPVA, multas e gravames não foram consultados. Confira os documentos com o anunciante.';
    if (topic === 'financiamento') return 'Experimente o simulador do anúncio. Parcelas são estimativas; taxas, condições e aprovação dependem da instituição.';
    if (topic === 'troca') return 'Experimente o simulador de troca. A aceitação e o valor dependem da avaliação da loja.';
    if (topic === 'seguranca') return `Segurança: ${value(searchInDescription(car, ['safety sense', 'ponto cego', 'faixa', 'acc', 'frenagem']))}.`;
    const field = fields[topic];
    return field ? `${field[0]}: **${value(field[1])}**.` : '';
  }).filter(Boolean);
  if (!answers.length) {
    const words = message.split(' ').filter(word => word.length > 3);
    const snippet = searchInDescription(car, words);
    return snippet ? `Segundo a descrição do anunciante: ${snippet}.` : `Não há informação sobre esse item no cadastro de ${name}. Consulte o vendedor para confirmar.`;
  }
  return `${answers.join('\n\n')}\n\nInformações do anúncio, sem certificação ou consulta oficial.`;
}
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
      return `Temos o **${found.name}** na Vitrine Digital por **${preco}**, com quilometragem informada de ${found.mileage?.toLocaleString('pt-BR') || 'não informada'} km. Acesse a aba Vitrine para ver fotos em 360°, laudo e simulação!`;
    }
  }

  if (topics.includes('laudo') || norm.includes('vistoria') || norm.includes('cautelar')) {
    return 'A demonstração permite visualizar os dados e documentos dos anúncios. Confira a vistoria e a procedência; o cadastro não comprova aprovação pericial.';
  }

  if (topics.includes('financiamento') || norm.includes('parcela') || norm.includes('banco') || norm.includes('juros')) {
    return 'Trabalhamos com os principais bancos parceiros (Santander, Itaú, Bradesco, BV) com taxas competitivas a partir de 1,29% ao mês. Você pode simular parcelas diretamente na página de qualquer veículo.';
  }

  if (topics.includes('troca') || norm.includes('usado') || norm.includes('troco')) {
    return 'Aceitamos seu veículo usado na troca com avaliação rápida pela Tabela FIPE e estado de conservação. Experimente também nosso Simulador de Troca com Troco nas páginas dos anúncios!';
  }

  if (topics.includes('preco') || norm.includes('fipe')) {
    return 'Os anúncios podem informar uma referência FIPE. Confira código e mês antes de comparar os preços; não há consulta oficial em tempo real na demonstração.';
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
