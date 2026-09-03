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
