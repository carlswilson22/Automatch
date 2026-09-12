// src/data/favoritesManager.js
const STORAGE_KEY = '@automatch:favorites';

export const getFavorites = () => {
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
  return getFavorites().includes(carId);
};

export const toggleFavorite = (carId) => {
  const favs = getFavorites();
  const index = favs.indexOf(carId);
  if (index > -1) {
    favs.splice(index, 1);
  } else {
    favs.push(carId);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  return favs;
};

export const removeFavorite = (carId) => {
  const favs = getFavorites().filter(id => id !== carId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  return favs;
};
