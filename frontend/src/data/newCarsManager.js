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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
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
  
  // 1. Remove do storage local de carros adicionados
  const cars = getNewCars();
  const filtered = cars.filter(car => String(car.id) !== String(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  // 2. Registra na lista de IDs excluídos da plataforma
  try {
    const deleted = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
    if (!deleted.includes(String(id))) {
      deleted.push(String(id));
      localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
    }
  } catch (e) {
    console.error('Error saving deleted car ID', e);
  }

  // 3. Notifica o backend para exclusão no banco PostgreSQL (se existir)
  try {
    await fetch(`/api/cars/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Backend delete notification skipped or failed', e);
  }

  return true;
};
