import { api } from '../services/apiClient.js';
import { canUseOfflineFallback } from '../services/sessionStorage.js';
import { isDemoModeEnabled } from '../services/apiClient.js';
/**
 * newCarsManager.js — Gerenciador local de anúncios de veículos recém-cadastrados.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para persistir em memória e localStorage novos anúncios criados pelo usuário
 *     garantindo que apareçam imediatamente na vitrine e na página de Meus Anúncios.
 */
// src/data/newCarsManager.js

const STORAGE_KEY = '@automatch:newCars';

export const getNewCars = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(car => car && typeof car === 'object') : [];
  } catch (e) {
    console.error('Error parsing cars from localStorage', e);
    return [];
  }
};

export const getNewCarById = (id) => {
  const cars = getNewCars();
  return cars.find(car => String(car.id) === String(id));
};

export const addNewCar = (carData) => {
  const cars = getNewCars();
  const newCar = {
    ...carData,
    id: carData.id != null ? String(carData.id) : crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };
  const existing = cars.findIndex(car => String(car.id) === newCar.id);
  if (existing >= 0) cars[existing] = { ...cars[existing], ...newCar };
  else cars.push(newCar);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
  } catch (e) {
    console.warn('QuotaExceededError detectado no localStorage. Aplicando mitigação de quota:', e);
    // Mantém apenas os anúncios mais recentes e normaliza dados pesados
    const trimmed = cars.slice(-10).map(c => {
      if (c.image && c.image.length > 400000) {
        return { ...c, image: '/images/FotoCorollaCross.jpg' };
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
  } catch {
    return false;
  }
};

export const deleteNewCar = async (id) => {
  if (!id) return false;
  
  // Nenhum dado local é removido antes da confirmação da API.
  try {
    await api.delete('/api/cars/' + encodeURIComponent(id));
  } catch (error) {
    if (!canUseOfflineFallback(error, isDemoModeEnabled())) throw error;
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
