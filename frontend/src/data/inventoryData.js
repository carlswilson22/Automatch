export const stores = [
  {
    id: 'store-1',
    name: 'AutoMatch Premium',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=AP&backgroundColor=2563eb',
    color_theme: '#2563eb', // Brand Blue
  },
  {
    id: 'store-2',
    name: 'Luxury Car Center',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=LC&backgroundColor=8b5cf6',
    color_theme: '#8b5cf6', // Violet
  },
  {
    id: 'store-3',
    name: 'EcoDrive Motors',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=ED&backgroundColor=10b981',
    color_theme: '#10b981', // Emerald
  }
];

export const inventory = [
  {
    id: 'inv-001',
    storeId: 'store-1',
    model: 'Corolla Altis',
    brand: 'Toyota',
    plate: 'ABC-1234',
    sale_value: 165900,
    financial_status: 'paid', // 'paid', 'pending', 'financed'
    image: '/images/FotoHondaCivic.jpeg',
  },
  {
    id: 'inv-002',
    storeId: 'store-1',
    model: 'Golf GTI',
    brand: 'Volkswagen',
    plate: 'XYZ-9876',
    sale_value: 215000,
    financial_status: 'pending',
    image: '/images/FotoGolfGTI.jpeg',
  },
  {
    id: 'inv-003',
    storeId: 'store-2',
    model: 'Jeep Compass',
    brand: 'Jeep',
    plate: 'LUX-0001',
    sale_value: 189900,
    financial_status: 'paid',
    image: '/images/FotoJeepCompassLimited.jpeg',
  },
  {
    id: 'inv-004',
    storeId: 'store-2',
    model: 'Hilux SRX',
    brand: 'Toyota',
    plate: 'STA-7777',
    sale_value: 285000,
    financial_status: 'financed',
    image: '/images/FotoNovaHilux.jpeg',
  },
  {
    id: 'inv-005',
    storeId: 'store-3',
    model: 'Tesla Model 3',
    brand: 'Tesla',
    plate: 'ECO-9999',
    sale_value: 289000,
    financial_status: 'paid',
    image: '/images/FotoTeslaModel3.jpeg',
  },
  {
    id: 'inv-006',
    storeId: 'store-3',
    model: 'BYD Dolphin',
    brand: 'BYD',
    plate: 'ELT-4444',
    sale_value: 149800,
    financial_status: 'pending',
    image: 'https://images.unsplash.com/photo-1681283627993-9c84e1b9b1e5?auto=format&fit=crop&q=80&w=400',
  }
];
