// src/data/favoritesManager.js
const STORAGE_KEY = '@automatch:favorites';
const EVENT_NAME = 'automatch:favorites-updated';

const notifyListeners = (favs) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: favs }));
  }
};

export const getFavorites = () => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing favorites from localStorage', e);
    return [];
  }
};

export const isFavorite = (carId) => {
  if (!carId) return false;
  return getFavorites().includes(String(carId));
};

export const toggleFavorite = (carId) => {
  if (!carId) return getFavorites();
  const idStr = String(carId);
  const favs = getFavorites();
  const index = favs.indexOf(idStr);
  if (index > -1) {
    favs.splice(index, 1);
  } else {
    favs.push(idStr);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  notifyListeners(favs);
  return favs;
};

export const removeFavorite = (carId) => {
  if (!carId) return getFavorites();
  const idStr = String(carId);
  const favs = getFavorites().filter(id => id !== idStr);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  notifyListeners(favs);
  return favs;
};

export const subscribeFavorites = (callback) => {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => callback(e.detail || getFavorites());
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};
