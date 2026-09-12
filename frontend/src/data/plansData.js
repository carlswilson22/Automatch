export const PLANS_DATA = [
  {
    id: 'free',
    name: 'Particular Básico',
    badge: 'Iniciante',
    target: 'Para quem quer vender seu próprio carro',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      '1 anúncio de veículo ativo',
      'Dossiê de Procedência Básico',
      'Chat direto com compradores',
      'Fotos em alta resolução (até 5)',
      'Validação de CPF e Segurança',
    ],
    limitations: [
      'Sem IA Damage Scanner',
      'Sem destaque na vitrine',
      'Sem painel multi-estoque',
    ],
    popular: false,
    color: 'slate',
    buttonText: 'Começar Grátis',
  },
  {
    id: 'pro',
    name: 'Lojista Pro',
    badge: 'Mais Escolhido',
    target: 'Para lojistas independentes e revendas',
    monthlyPrice: 149,
    annualPrice: 119, // por mês no anual
    features: [
      'Até 15 anúncios ativos simultâneos',
      'IA Damage Scanner ilimitado',
      'Selo Preço FIPE Automatch',
      '3x Veículos em Destaque na Vitrine',
      'Comparador FIPE em tempo real',
      'Painel de Gestão de Leads e Propostas',
      'Suporte VIP via WhatsApp',
    ],
    limitations: [
      'Gestão multi-loja não inclusa',
    ],
    popular: true,
    color: 'blue',
    buttonText: 'Assinar Plano Pro',
  },
  {
    id: 'prime',
    name: 'Prime Concessionária',
    badge: 'Empresarial',
    target: 'Para grandes redes, frotistas e concessionárias',
    monthlyPrice: 399,
    annualPrice: 319, // por mês no anual
    features: [
      'Anúncios ILIMITADOS',
      'Painel B2B Multi-unidades / Lojas',
      'IA Damage Scanner + Vistoria 3D Avançada',
      'Destaque Ouro no Topo da Vitrine',
      'CRM de Vendas com Gestão de Equipe',
      'Integração via API com seu estoque/ERP',
      'Gerente de Contas Automatch dedicado',
      'Garantia Mecânica Estendida para clientes',
    ],
    limitations: [],
    popular: false,
    color: 'emerald',
    buttonText: 'Contratar Prime',
  },
];

export const FAQS = [
  {
    q: 'Como funciona o pagamento dos planos?',
    a: 'Você pode pagar via Cartão de Crédito (com renovação automática mensal ou anual em até 12x) ou PIX com desconto adicional. O cancelamento pode ser feito a qualquer momento sem multas.'
  },
  {
    q: 'O que é o IA Damage Scanner?',
    a: 'É nossa tecnologia exclusiva de visão computacional que analisa fotos dos veículos, identifica pequenas avarias na lataria e gera um orçamento estimado de reparo com precisão profissional.'
  },
  {
    q: 'Posso fazer upgrade ou downgrade de plano depois?',
    a: 'Sim! A qualquer momento você pode alterar seu plano no seu painel de perfil. O valor proporcional restante será compensado automaticamente.'
  },
  {
    q: 'Pessoas físicas podem contratar o Plano Pro?',
    a: 'Com certeza! Se você compra e vende carros com frequência como particular ou consultor automotivo, o Plano Pro oferece todos os recursos que você precisa.'
  },
];
