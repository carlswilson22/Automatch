import { createContext, useContext } from 'react';

export const TourContext = createContext({});
export function useTour() {
  const context = useContext(TourContext);
  if (!context) throw new Error('useTour deve ser utilizado dentro de um TourProvider');
  return context;
}
