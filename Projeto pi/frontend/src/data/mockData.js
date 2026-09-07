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
      engine: '2.0 TSI',
      transmission: 'DSG 6M',
      bodyType: 'Hatch Esportivo',
      fuel: 'Gasolina'
    }
  },
  {
    id: 'auto-003',
    brand: 'Tesla',
    model: 'Model 3 Standard Range',
    year: 2024,
    price: 289000,
    mileage: 5200,
    images: [
      '/images/FotoTeslaModel3.jpeg',
    ],
    trustScore: 98,
    storeId: 'store-3',
    timeline: [
      { id: 't1', type: 'laudo', status: 'approved', title: 'Laudo Cautelar', description: 'Veículo novo, aprovado integralmente.' },
      { id: 't2', type: 'leilao', status: 'approved', title: 'Histórico de Leilão', description: 'Sem passagem.' },
      { id: 't3', type: 'debitos', status: 'approved', title: 'Multas e Débitos', description: 'Livre de ônus.' },
    ],
    opinions: {
      owner: {
        text: "Experiência de condução única com o Autopilot. Carregamento muito barato em casa. Estou vendendo para pegar um Model Y.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100"
      },
      inspector: {
        text: "Estado térmico das baterias excelente. Sem nenhum detalhe na lataria ou interior.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100"
      }
    },
    damagePoints: [],
    metadata: {
      engine: 'Elétrico 283cv',
      transmission: 'Redução Fixa',
      bodyType: 'Sedan',
      fuel: '100% Elétrico'
    }
  },
  {
    id: 'auto-004',
    brand: 'Jeep',
    model: 'Compass Limited T270',
    year: 2023,
    price: 189900,
    mileage: 22000,
    images: [
      '/images/FotoJeepCompassLimited.jpeg',
    ],
    trustScore: 92,
    storeId: 'store-1',
    timeline: [
      { id: 't1', type: 'laudo', status: 'approved', title: 'Laudo Cautelar', description: 'Aprovado sem apontamentos.' },
      { id: 't2', type: 'leilao', status: 'approved', title: 'Histórico de Leilão', description: 'Nenhuma passagem.' },
      { id: 't3', type: 'debitos', status: 'approved', title: 'Multas e Débitos', description: 'Quitado.' },
    ],
    opinions: {
      owner: {
        text: "SUV muito confortável e tecnológico. O teto panorâmico é o diferencial. Revisões em dia na concessionária.",
        rating: 4.7,
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100"
      },
      inspector: {
        text: "Conjunto mecânico 1.3 Turbo muito eficiente. Acabamento interno preservado sem marcas de uso.",
        rating: 4.6,
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&h=100"
      }
    },
    damagePoints: [],
    metadata: {
      engine: '1.3 T270 Turbo',
      transmission: 'Automática 6M',
      bodyType: 'SUV',
      fuel: 'Flex'
    }
  },
  {
    id: 'auto-005',
    brand: 'Toyota',
    model: 'Hilux SRX 2.8 Diesel 4x4',
    year: 2022,
    price: 285000,
    mileage: 38000,
    images: [
      '/images/FotoNovaHilux.jpeg',
    ],
    trustScore: 95,
    storeId: 'store-1',
    timeline: [
      { id: 't1', type: 'laudo', status: 'approved', title: 'Laudo Cautelar', description: 'Aprovado com maestria.' },
      { id: 't2', type: 'leilao', status: 'approved', title: 'Histórico de Leilão', description: 'Sem registro de leilão.' },
      { id: 't3', type: 'debitos', status: 'approved', title: 'Multas e Débitos', description: 'Tudo regularizado.' },
    ],
    opinions: {
      owner: {
        text: "Tanque de guerra. Nunca me deixou na mão em viagens longas. Uso predominantemente em asfalto.",
        rating: 4.8,
        avatar: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=100&h=100"
      },
      inspector: {
        text: "Motor diesel respondendo perfeitamente. Sistema 4x4 testado e operante. Chassi impecável.",
        rating: 4.9,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100"
      }
    },
    damagePoints: [],
    metadata: {
      engine: '2.8 Diesel',
      transmission: 'Automática 6M',
      bodyType: 'Picape',
      fuel: 'Diesel'
    }
  }
];
