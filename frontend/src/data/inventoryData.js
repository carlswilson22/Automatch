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
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'inv-002',
    storeId: 'store-1',
    model: 'Nivus Highline',
    brand: 'Volkswagen',
    plate: 'XYZ-9876',
    sale_value: 115900,
    financial_status: 'pending',
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'inv-003',
    storeId: 'store-2',
    model: 'BMW 320i',
    brand: 'BMW',
    plate: 'LUX-0001',
    sale_value: 265000,
    financial_status: 'paid',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'inv-004',
    storeId: 'store-2',
    model: 'Mercedes C-Class',
    brand: 'Mercedes',
    plate: 'STA-7777',
    sale_value: 245000,
    financial_status: 'financed',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'inv-005',
    storeId: 'store-3',
    model: 'Tesla Model 3',
    brand: 'Tesla',
    plate: 'ECO-9999',
    sale_value: 289000,
    financial_status: 'paid',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=400',
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
