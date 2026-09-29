export const stores = [
  {
    id: 'store-1',
    name: 'AutoShop Prime',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=AP&backgroundColor=2563eb',
    color_theme: '#2563eb', // Brand Blue
    location: 'São Paulo, SP'
  },
  {
    id: 'store-2',
    name: 'Motors Campinas',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=MC&backgroundColor=8b5cf6',
    color_theme: '#8b5cf6', // Violet
    location: 'Campinas, SP'
  },
  {
    id: 'store-3',
    name: 'Concessionária Alpha',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=CA&backgroundColor=10b981',
    color_theme: '#10b981', // Emerald
    location: 'Curitiba, PR'
  }
];

export const inventory = [
  {
    id: 'inv-001',
    storeId: 'store-1',
    model: 'Corolla Cross XRX',
    brand: 'Toyota',
    plate: 'ABC-1234',
    sale_value: 185000,
    financial_status: 'paid',
    image: '/images/FotoCorollaCross.jpg',
  },
  {
    id: 'inv-002',
    storeId: 'store-2',
    model: 'Polo TSI',
    brand: 'Volkswagen',
    plate: 'XYZ-9876',
    sale_value: 98000,
    financial_status: 'pending',
    image: '/images/FotoPoloTSI.jpg',
  },
  {
    id: 'inv-003',
    storeId: 'store-3',
    model: 'HB20 Platinum',
    brand: 'Hyundai',
    plate: 'LUX-0001',
    sale_value: 105000,
    financial_status: 'paid',
    image: '/images/FotoHyundaiHB20.jpg',
  },
  {
    id: 'inv-004',
    storeId: 'store-1',
    model: 'Tracker Premier',
    brand: 'Chevrolet',
    plate: 'STA-7777',
    sale_value: 152000,
    financial_status: 'financed',
    image: '/images/FotoChevroletTracker.jpg',
  },
  {
    id: 'inv-005',
    storeId: 'store-2',
    model: 'Pulse Abarth',
    brand: 'Fiat',
    plate: 'ECO-9999',
    sale_value: 145000,
    financial_status: 'paid',
    image: '/images/FotoFiatPulse.jpg',
  }
];
