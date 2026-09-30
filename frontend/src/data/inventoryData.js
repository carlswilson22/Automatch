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
    floor_price: 172000,
    financial_status: 'paid', // 'paid' | 'pending' | 'financed'
    operational_status: 'available', // 'available' | 'negotiation' | 'reserved' | 'sold'
    year: '2023/2024',
    mileage: 21500,
    color: 'Branco Polar',
    fuel: 'Híbrido Flex',
    visible_showcase: true,
    visible_b2b: true,
    notes: 'Revisões em dia na concessionária. Laudo 100% aprovado.',
    image: '/images/FotoCorollaCross.jpg',
  },
  {
    id: 'inv-002',
    storeId: 'store-2',
    model: 'Polo TSI',
    brand: 'Volkswagen',
    plate: 'XYZ-9876',
    sale_value: 98000,
    floor_price: 90000,
    financial_status: 'pending',
    operational_status: 'negotiation',
    year: '2022/2023',
    mileage: 34000,
    color: 'Cinza Platinum',
    fuel: 'Flex',
    visible_showcase: true,
    visible_b2b: true,
    notes: 'Aguardando baixa de gravame pelo banco emissor.',
    image: '/images/FotoPoloTSI.jpg',
  },
  {
    id: 'inv-003',
    storeId: 'store-3',
    model: 'HB20 Platinum',
    brand: 'Hyundai',
    plate: 'LUX-0001',
    sale_value: 105000,
    floor_price: 97000,
    financial_status: 'paid',
    operational_status: 'available',
    year: '2024/2024',
    mileage: 12800,
    color: 'Prata Sand',
    fuel: 'Flex',
    visible_showcase: true,
    visible_b2b: true,
    notes: 'Único dono, chave reserva e manual inclusos.',
    image: '/images/FotoHyundaiHB20.jpg',
  },
  {
    id: 'inv-004',
    storeId: 'store-1',
    model: 'Tracker Premier',
    brand: 'Chevrolet',
    plate: 'STA-7777',
    sale_value: 152000,
    floor_price: 141000,
    financial_status: 'financed',
    operational_status: 'reserved',
    year: '2023/2023',
    mileage: 29000,
    color: 'Preto Ouro Negro',
    fuel: 'Turbo Flex',
    visible_showcase: true,
    visible_b2b: true,
    notes: 'Reserva B2B efetuada com sinal via plataforma.',
    image: '/images/FotoChevroletTracker.jpg',
  },
  {
    id: 'inv-005',
    storeId: 'store-2',
    model: 'Pulse Abarth',
    brand: 'Fiat',
    plate: 'ECO-9999',
    sale_value: 145000,
    floor_price: 134000,
    financial_status: 'paid',
    operational_status: 'available',
    year: '2024/2024',
    mileage: 8500,
    color: 'Vermelho Montecarlo',
    fuel: 'Turbo Flex',
    visible_showcase: true,
    visible_b2b: true,
    notes: 'Pneus novos, sem detalhes estéticos.',
    image: '/images/FotoFiatPulse.jpg',
  }
];

const STORAGE_KEY = 'automatch_b2b_inventory_data_v2';

export const getStoredInventory = () => {
  if (typeof window === 'undefined') return inventory;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let items = inventory;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed;
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    }

    // Auto-heal de imagens faltantes em itens padrão
    const validated = items.map(item => {
      const img = item.image || item.imagem;
      if (!img) {
        const defaultMatch = inventory.find(i => i.id === item.id || (i.brand === item.brand && i.model === item.model));
        return {
          ...item,
          image: defaultMatch ? defaultMatch.image : '/images/FotoGolfGTI.jpeg'
        };
      }
      return {
        ...item,
        image: img
      };
    });

    // Sincroniza anúncios criados pelo usuário (se houver no localStorage)
    try {
      const newCarsRaw = localStorage.getItem('@automatch:newCars');
      if (newCarsRaw) {
        const newCars = JSON.parse(newCarsRaw);
        if (Array.isArray(newCars) && newCars.length > 0) {
          newCars.forEach(car => {
            const alreadyExists = validated.some(i => String(i.id) === String(car.id) || (car.plate && i.plate === car.plate));
            if (!alreadyExists) {
              validated.push({
                id: String(car.id),
                storeId: car.storeId || 'store-1',
                model: car.modelo || car.model || 'Veículo',
                brand: car.marca || car.brand || 'Marca',
                plate: car.plate || 'ABC-1234',
                sale_value: Number(car.preco || car.price) || 0,
                floor_price: Math.round((Number(car.preco || car.price) || 0) * 0.92),
                financial_status: 'paid',
                operational_status: 'available',
                year: String(car.ano || car.year || '2024'),
                mileage: Number(car.km || car.mileage) || 0,
                color: car.cor || car.color || 'Prata',
                fuel: car.combustivel || car.fuel || 'Flex',
                visible_showcase: true,
                visible_b2b: true,
                notes: car.descricao || car.description || '',
                image: car.imagem || car.image || '/images/FotoGolfGTI.jpeg'
              });
            }
          });
        }
      }
    } catch (_) {}

    return validated;
  } catch (e) {
    console.warn('Erro ao ler inventário do localStorage, usando dados padrão:', e);
    return inventory;
  }
};

export const saveStoredInventory = (items) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Erro ao salvar inventário no localStorage:', e);
  }
};

export const updateInventoryAsset = (updatedAsset) => {
  const current = getStoredInventory();
  const index = current.findIndex(i => String(i.id) === String(updatedAsset.id));
  let updatedList;
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = { ...updatedList[index], ...updatedAsset };
  } else {
    updatedList = [updatedAsset, ...current];
  }
  saveStoredInventory(updatedList);
  return updatedList;
};

export const deleteInventoryAsset = (id) => {
  const current = getStoredInventory();
  const updatedList = current.filter(i => String(i.id) !== String(id));
  saveStoredInventory(updatedList);
  return updatedList;
};

export const resetInventoryToDefault = () => {
  saveStoredInventory(inventory);
  return inventory;
};
