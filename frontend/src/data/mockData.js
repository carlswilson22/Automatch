/* eslint-disable no-unused-vars */
export const mockCars = [
  {
    id: 'sc-001',
    brand: 'Toyota',
    model: 'Corolla Cross',
    year: 2024,
    price: 185000,
    mileage: 12000,
    images: [
      '/images/FotoCorollaCross.jpg',
    ],
    trustScore: 99,
    storeId: 'store-1',
    timeline: [
      { id: 't1', type: 'laudo', status: 'approved', title: 'Laudo Cautelar', description: 'Perfeito. 100% Pintura Original.' },
      { id: 't2', type: 'leilao', status: 'approved', title: 'Histórico de Leilão', description: 'Sem passagem.' },
      { id: 't3', type: 'debitos', status: 'approved', title: 'Multas e Débitos', description: 'Nada consta.' },
    ],
    opinions: {
      owner: {
        text: "O melhor SUV que já tive. Muito econômico por ser híbrido.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=100&h=100"
      },
      inspector: {
        text: "O carro está em estado de zero KM. Bateria híbrida em 100%.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100"
      }
    },
    damagePoints: [],
    metadata: {
      engine: '1.8 Híbrido',
      transmission: 'CVT',
      bodyType: 'SUV',
      fuel: 'Flex Híbrido'
    }
  },
  {
    id: 'sc-002',
    brand: 'Volkswagen',
    model: 'Polo TSI',
    year: 2023,
    price: 98000,
    mileage: 18500,
    images: [
      '/images/FotoPoloTSI.jpg',
    ],
    trustScore: 94,
    storeId: 'store-2',
    timeline: [
      { id: 't1', type: 'laudo', status: 'approved', title: 'Laudo Cautelar', description: 'Aprovado 100%.' },
      { id: 't2', type: 'leilao', status: 'approved', title: 'Histórico de Leilão', description: 'Não possui passagem por leilões.' },
      { id: 't3', type: 'debitos', status: 'approved', title: 'Multas e Débitos', description: 'IPVA quitado. Sem débitos.' },
    ],
    opinions: {
      owner: {
        text: "Hatch excelente e econômico. Motor 1.0 turbo responde super bem.",
        rating: 4.9,
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100"
      },
      inspector: {
        text: "Mecânica impecável e suspensão em excelente estado. Verificado alinhamento e balanceamento recentes.",
        rating: 4.8,
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&h=100"
      }
    },
    damagePoints: [],
    metadata: {
      engine: '1.0 TSI',
      transmission: 'Automático 6M',
      bodyType: 'Hatch',
      fuel: 'Flex'
    }
  },
  {
    id: 'sc-003',
    brand: 'Hyundai',
    model: 'HB20 Platinum',
    year: 2024,
    price: 105000,
    mileage: 5000,
    images: [
      '/images/FotoHyundaiHB20.jpg',
    ],
    trustScore: 98,
    storeId: 'store-3',
    timeline: [
      { id: 't1', type: 'laudo', status: 'approved', title: 'Laudo Cautelar', description: 'Veículo seminovo, aprovado integralmente.' },
      { id: 't2', type: 'leilao', status: 'approved', title: 'Histórico de Leilão', description: 'Sem passagem.' },
      { id: 't3', type: 'debitos', status: 'approved', title: 'Multas e Débitos', description: 'Livre de ônus.' },
    ],
    opinions: {
      owner: {
        text: "Carro praticamente zero, vendo porque ganhei um da empresa. Design lindo e muito econômico.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100"
      },
      inspector: {
        text: "Estado impecável, sem detalhes na lataria ou interior. Revisões em dia na concessionária.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100"
      }
    },
    damagePoints: [],
    metadata: {
      engine: '1.0 TGDI',
      transmission: 'Automático 6M',
      bodyType: 'Hatch',
      fuel: 'Flex'
    }
  },
  {
    id: 'sc-004',
    brand: 'Chevrolet',
    model: 'Tracker Premier',
    year: 2024,
    price: 152000,
    mileage: 8500,
    images: [
      '/images/FotoChevroletTracker.jpg',
    ],
    trustScore: 96,
    storeId: 'store-1',
    timeline: [
      { id: 't1', type: 'laudo', status: 'approved', title: 'Laudo Cautelar', description: 'Aprovado sem apontamentos.' },
      { id: 't2', type: 'leilao', status: 'approved', title: 'Histórico de Leilão', description: 'Nenhuma passagem.' },
      { id: 't3', type: 'debitos', status: 'approved', title: 'Multas e Débitos', description: 'Quitado.' },
    ],
    opinions: {
      owner: {
        text: "SUV muito completo para a família. Wi-Fi nativo e teto panorâmico fazem toda a diferença.",
        rating: 4.8,
        avatar: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=100&h=100"
      },
      inspector: {
        text: "Motor 1.2 turbo eficiente e silencioso. Acabamento interno bem preservado.",
        rating: 4.7,
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&h=100"
      }
    },
    damagePoints: [],
    metadata: {
      engine: '1.2 Turbo',
      transmission: 'Automático',
      bodyType: 'SUV',
      fuel: 'Flex'
    }
  },
  {
    id: 'sc-005',
    brand: 'Fiat',
    model: 'Pulse Abarth',
    year: 2024,
    price: 145000,
    mileage: 3200,
    images: [
      '/images/FotoFiatPulse.jpg',
    ],
    trustScore: 95,
    storeId: 'store-2',
    timeline: [
      { id: 't1', type: 'laudo', status: 'approved', title: 'Laudo Cautelar', description: 'Aprovado com maestria.' },
      { id: 't2', type: 'leilao', status: 'approved', title: 'Histórico de Leilão', description: 'Sem registro de leilão.' },
      { id: 't3', type: 'debitos', status: 'approved', title: 'Multas e Débitos', description: 'Tudo regularizado.' },
    ],
    opinions: {
      owner: {
        text: "Carro extremamente divertido de dirigir. Performance Abarth é viciante, escapamento esportivo incrível.",
        rating: 4.9,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100"
      },
      inspector: {
        text: "Motor T270 perfeito. Suspensão esportiva calibrada de fábrica. Pneus com 90% de vida útil.",
        rating: 4.9,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100"
      }
    },
    damagePoints: [],
    metadata: {
      engine: '1.3 Turbo 270',
      transmission: 'Automático',
      bodyType: 'SUV',
      fuel: 'Flex'
    }
  }
];
