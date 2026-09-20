import { Car } from 'lucide-react';

export const showcaseCars = [
  {
    id: 'sc-001', name: 'Toyota Corolla Cross XRX', brand: 'Toyota', model: 'Corolla Cross',
    year: 2024, price: 185000, fipePrice: 192000, originalPrice: 194000,
    priceHistory: [
      { date: '15/08/2026', price: 194000, label: 'Preço Inicial' },
      { date: '02/09/2026', price: 189000, label: 'Ajuste de Mercado' },
      { date: '18/09/2026', price: 185000, label: 'Super Desconto Automatch' }
    ],
    color: 'Branco Pérola',
    mileage: 12000, image: '/images/FotoCorollaCross.jpg',
    bodyType: 'SUV',
    icon: Car, featured: true, location: 'São Paulo, SP', storeId: 'store-1',
    description: 'SUV híbrido flex topo de linha, teto solar elétrico, pacote Toyota Safety Sense e revisões em concessionária.',
    fullDescription: `Veículo impecável em estado de zero quilômetro, com apenas 12.000 km rodados e histórico integralmente documentado. Versão topo de linha XRX Híbrida, equipada com motor 1.8 aliado ao sistema elétrico auto-recarregável de altíssima eficiência energética (médias de até 18 km/l em ciclo urbano).

Conta com teto solar elétrico panorâmico, bancos revestidos em couro claro com ajustes elétricos, painel de instrumentos digital personalizável e central multimídia de 10 polegadas compatível com Apple CarPlay e Android Auto sem fio.

O pacote de segurança ativa Toyota Safety Sense inclui controle de cruzeiro adaptativo (ACC), frenagem autônoma de emergência, alerta de ponto cego e assistente de permanência em faixa. 

Laudo cautelar 100% aprovado, sem qualquer retoque de funilaria ou histórico de sinistro/leilão. Garantia de fábrica vigente de 5 anos no veículo e 8 anos no sistema híbrido. Possui manual, chave reserva presencial e IPVA 2026 totalmente quitado.`,
    tags: ['Híbrido Flex', 'Teto Solar', 'Safety Sense', 'Único Dono', 'Garantia de Fábrica'],
    specs: { motor: '1.8 Híbrido Flex', cambio: 'Automático CVT', combustivel: 'Flex / Elétrico Híbrido', portas: '4 portas', direcao: 'Elétrica Progressiva', freios: 'ABS com EBD nas 4 rodas', airbags: '7 airbags (frontais, laterais, cortina e joelho)', tracao: 'Dianteira' },
    seller: { name: 'Automatch Oficial', avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=100&h=100', rating: 4.8, ads: 23, since: '2021', bio: 'Loja oficial certificada Automatch.' },
  },
  {
    id: 'sc-002', name: 'Volkswagen Polo TSI', brand: 'Volkswagen', model: 'Polo TSI',
    year: 2023, price: 98000, fipePrice: 104000, originalPrice: 103000,
    priceHistory: [
      { date: '01/09/2026', price: 103000, label: 'Preço Inicial' },
      { date: '14/09/2026', price: 98000, label: 'Preço Baixou' }
    ],
    color: 'Vermelho',
    mileage: 18500, image: '/images/FotoPoloTSI.jpg',
    bodyType: 'Hatch',
    icon: Car, featured: false, location: 'Campinas, SP', storeId: 'store-2',
    description: 'Hatch esportivo e econômico com motor 1.0 TSI Turbo, painel 100% digital Active Info Display e VW Play.',
    fullDescription: `Excelente exemplar do Volkswagen Polo TSI 2023, combinando agilidade urbana, economia surpreendente e excelente dirigibilidade. Equipado com o consagrado motor 1.0 Turbo TSI com injeção direta de combustível e transmissão automática sequencial de 6 velocidades.

Destaque para o cockpit tecnológico com o painel digital Active Info Display totalmente configurável, central multimídia VW Play de alta resolução com comandos no volante e conectividade para smartphones.

Veículo de uso estritamente particular, com todas as revisões periódicas efetuadas rigorosamente por tempo na concessionária autorizada VW. Pneus dianteiros e traseiros em perfeito estado de conservação, interior impecável sem desgastes e lataria com pintura 100% original de fábrica.

Acompanha laudo pericial cautelar sem apontamentos, manual do proprietário com carimbos de revisão, chave presencial e documentação 2026 totalmente liberada para transferência imediata.`,
    tags: ['1.0 Turbo TSI', 'Painel Digital', 'VW Play', 'Câmbio Automático 6M', 'Laudo Aprovado'],
    specs: { motor: '1.0 Turbo TSI Flex', cambio: 'Automático Tiptronic 6 marchas', combustivel: 'Flex', portas: '4 portas', direcao: 'Elétrica', freios: 'Discos ventilados com ABS e ESC', airbags: '4 airbags', tracao: 'Dianteira' },
    seller: { name: 'João Carlos', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100', rating: 4.5, ads: 5, since: '2022', bio: 'Vendedor particular.' },
  },
  {
    id: 'sc-003', name: 'Hyundai HB20 Platinum', brand: 'Hyundai', model: 'HB20',
    year: 2024, price: 105000, fipePrice: 110000, color: 'Prata',
    mileage: 5000, image: '/images/FotoHyundaiHB20.jpg',
    bodyType: 'Hatch',
    icon: Car, featured: true, location: 'Rio de Janeiro, RJ', storeId: 'store-3',
    description: 'Versão Platinum com motor TGDI Turbo, pacote Hyundai SmartSense de segurança e apenas 5.000 km rodados.',
    fullDescription: `Oportunidade única para adquirir um HB20 Platinum 2024 praticamente zero quilômetro, com apenas 5.000 km rodados de garagem. Visual sofisticado com nova grade frontal, assinatura em LED contínua e acabamento refinado com materiais premium no habitáculo.

Sob o capô, traz a excelente motorização 1.0 TGDI Turbo com injeção direta e 120 cv de potência, entregando torque expressivo desde baixas rotações com baixo consumo de combustível.

Vem equipado de série com câmera de ré com guias ativas, sensores de estacionamento, chave presencial Smart Key com partida remota na chave, partida por botão, carregador de celular por indução e espelhamento sem fio de tela.

Veículo com procedência certificada de único dono, selo de vistoria cautelar 100% aprovada e garantia total de fábrica Hyundai até 2029. Não possui qualquer detalhe estético ou mecânico.`,
    tags: ['1.0 TGDI Turbo', 'SmartSense', 'Chave Presencial', 'Garantia até 2029', 'Apenas 5.000 km'],
    specs: { motor: '1.0 TGDI Turbo Flex', cambio: 'Automático de 6 marchas', combustivel: 'Flex', portas: '4 portas', direcao: 'Elétrica progressiva', freios: 'ABS com EBD e controle de tração', airbags: '6 airbags', tracao: 'Dianteira' },
    seller: { name: 'Maria Souza', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100', rating: 4.9, ads: 2, since: '2023', bio: 'Venda de veículo particular de garagem.' },
  },
  {
    id: 'sc-004', name: 'Chevrolet Tracker Premier', brand: 'Chevrolet', model: 'Tracker',
    year: 2024, price: 152000, fipePrice: 159000, originalPrice: 158000,
    priceHistory: [
      { date: '20/08/2026', price: 158000, label: 'Preço Inicial' },
      { date: '10/09/2026', price: 152000, label: 'Preço Baixou' }
    ],
    color: 'Azul Escuro',
    mileage: 8500, image: '/images/FotoChevroletTracker.jpg',
    bodyType: 'SUV',
    icon: Car, featured: true, location: 'Curitiba, PR', storeId: 'store-1',
    description: 'SUV Premier com teto solar panorâmico, motor 1.2 Turbo, assistente de estacionamento autônomo e Wi-Fi nativo.',
    fullDescription: `Chevrolet Tracker Premier 2024 na exclusiva cor Azul Escuro metálica. Versão de topo mais completa da linha, pensada para famílias que não abrem mão de máximo conforto, segurança e tecnologia de conectividade a bordo.

Impulsionado pelo potente motor 1.2 Turbo flex de 133 cv acoplado ao câmbio automático suave de 6 marchas. Destaque para o generoso teto solar panorâmico elétrico, acabamento bicolor dos bancos e painel com toque emborrachado.

Equipado com o assistente de estacionamento semiautônomo Easy Park (estaciona sozinho em vagas paralelas e perpendiculares), alerta de colisão frontal com frenagem autônoma de emergência, sensor de ponto cego nos retrovisores, ar-condicionado digital automático e Wi-Fi embarcado com conexão para até 7 aparelhos simultâneos.

Carro de único proprietário, revisado em concessionária, sem qualquer avaria ou histórico desabonador. Laudo pericial atesta estrutura 100% íntegra.`,
    tags: ['1.2 Turbo', 'Teto Panorâmico', 'Easy Park', 'Wi-Fi Nativo', 'Alerta Ponto Cego'],
    specs: { motor: '1.2 Turbo Flex 133cv', cambio: 'Automático de 6 marchas', combustivel: 'Flex', portas: '4 portas', direcao: 'Elétrica', freios: 'Discos dianteiros com ABS/ESC', airbags: '6 airbags', tracao: 'Dianteira' },
    seller: { name: 'Automatch Oficial', avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=100&h=100', rating: 4.8, ads: 23, since: '2021', bio: 'Loja oficial certificada Automatch.' },
  },
  {
    id: 'sc-005', name: 'Fiat Pulse Abarth', brand: 'Fiat', model: 'Pulse Abarth',
    year: 2024, price: 145000, fipePrice: 149900, color: 'Vermelho',
    mileage: 3200, image: '/images/FotoFiatPulse.jpg',
    bodyType: 'SUV',
    icon: Car, featured: true, location: 'Belo Horizonte, MG', storeId: 'store-2',
    description: 'O puro esportivo da divisão do escorpião com motor Turbo 270 de 185 cv, modo Poison e escape esportivo duplo.',
    fullDescription: `Verdadeiro ícone esportivo desenvolvido sob a chancela da lendária divisão de corrida Abarth. O Pulse Abarth 2024 ostenta o poderoso motor 1.3 Turbo 270 Flex com incríveis 185 cv e 27,5 kgfm de torque, acelerando de 0 a 100 km/h em impressionantes 7,6 segundos.

Conta com suspensão rebaixada e calibrada pela engenharia italiana com molas mais rígidas e barras estabilizadoras redimensionadas, freios redimensionados para alto desempenho e o característico escapamento esportivo duplo cromado com ronco encorpado e esportivo.

No volante em couro com base achatada, o botão vermelho "Poison" ativa o mapeamento agressivo de aceleração e trocas de marcha esportivas. Interior exclusivo com bancos esportivos em couro com costuras vermelhas e o emblema do escorpião gravado em relevo.

Veículo com apenas 3.200 km, impecável, sem detalhes. Laudo cautelar com conformidade total, IPVA 2026 quitado e garantia integral de fábrica.`,
    tags: ['Abarth Oficial', 'Turbo 270 (185cv)', 'Modo Poison', 'Escapamento Duplo', 'Apenas 3.200 km'],
    specs: { motor: '1.3 Turbo 270 Flex 185cv', cambio: 'Automático esportivo 6 marchas', combustivel: 'Flex', portas: '4 portas', direcao: 'Elétrica calibragem esportiva', freios: 'Discos dianteiros de 305mm com ABS', airbags: '4 airbags', tracao: 'Dianteira esportiva' },
    seller: { name: 'Beto Motors', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100', rating: 4.6, ads: 12, since: '2020', bio: 'Especialista em esportivos e exclusivos.' },
  },
];
