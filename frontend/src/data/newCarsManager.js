// src/data/newCarsManager.js

const STORAGE_KEY = '@automatch:newCars';

export const getNewCars = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing cars from localStorage', e);
    return [];
  }
};

export const getNewCarById = (id) => {
  const cars = getNewCars();
  return cars.find(car => car.id === id);
};

export const addNewCar = (carData) => {
  const cars = getNewCars();
  const newCar = {
    ...carData,
    id: Date.now().toString(), // simple unique id
    createdAt: new Date().toISOString()
  };
  cars.push(newCar);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
  } catch (e) {
    console.warn('QuotaExceededError detectado no localStorage. Aplicando mitigação de quota:', e);
    // Mantém apenas os anúncios mais recentes e normaliza dados pesados
    const trimmed = cars.slice(-10).map(c => {
      if (c.image && c.image.length > 400000) {
        return { ...c, image: '/images/FotoToyotaCorolla.jpg' };
      }
      return c;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (saveErr) {
      console.error('Falha crítica ao persistir no localStorage:', saveErr);
    }
  }
  return newCar;
};

const DELETED_KEY = '@automatch:deletedCars';

export const isCarDeleted = (id) => {
  if (!id) return false;
  try {
    const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
    return deleted.includes(String(id));
  } catch (e) {
    return false;
  }
};

export const deleteNewCar = async (id) => {
  if (!id) return false;
  
  // 1. Consulta o backend para verificação estrita de autorização (OWASP A01)
  let token = null;
  try {
    const storedUser = JSON.parse(localStorage.getItem('automatch_user') || '{}');
    token = storedUser?.token || localStorage.getItem('automatch_token') || null;
  } catch (_) {}

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`/api/cars/${id}`, { method: 'DELETE', headers });
    if (res.status === 403) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Permissão negada. Você só pode excluir anúncios cadastrados pela sua conta.');
    }
  } catch (err) {
    // Propaga erro de autorização 403 explicitamente para a UI
    if (err.message && err.message.includes('Permissão negada')) {
      throw err;
    }
    console.warn('Aviso na exclusão de backend (modo contingência ou offline):', err);
  }

  // 2. Se autorizado (ou offline), remove do catálogo local de anúncios
  const cars = getNewCars();
  const filtered = cars.filter(car => String(car.id) !== String(id));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Erro ao atualizar storage após exclusão:', e);
  }

  // 3. Registra na lista de IDs excluídos da plataforma
  try {
    const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
    if (!deleted.includes(String(id))) {
      deleted.push(String(id));
      localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
    }
  } catch (e) {
    console.error('Error saving deleted car ID', e);
  }

  return true;
};
