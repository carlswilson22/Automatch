import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ShowcaseCatalog from './pages/ShowcaseCatalog';
import ShowcaseVehicleDetails from './pages/ShowcaseVehicleDetails';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import HowItWorksPage from './pages/HowItWorksPage';
import FavoritesPage from './pages/FavoritesPage';
import CheckoutPage from './pages/CheckoutPage';
import Dashboard from './pages/Dashboard';
import NewCarAdForm from './pages/NewCarAdForm';
import PublicValidationPage from './pages/PublicValidationPage';
import MyAdsPage from './pages/MyAdsPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/encontrar" element={<ShowcaseCatalog />} />
          <Route path="/encontrar/:id" element={<ShowcaseVehicleDetails />} />
          <Route path="/como-funciona" element={<HowItWorksPage />} />
          <Route path="/planos" element={<Navigate to="/encontrar" replace />} />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/novo-anuncio" element={
            <ProtectedRoute>
              <NewCarAdForm />
            </ProtectedRoute>
          } />
          <Route path="/validar/:protocolo" element={<PublicValidationPage />} />
          
          {/* Protected Routes (Apenas após cadastro / login) */}
          <Route path="/favoritos" element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          } />
          <Route path="/meus-anuncios" element={
            <ProtectedRoute>
              <MyAdsPage />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Legacy / Compatibility Aliases to prevent 404s */}
          <Route path="/catalog" element={<Navigate to="/encontrar" replace />} />
          <Route path="/catalogo" element={<Navigate to="/encontrar" replace />} />
          <Route path="/novo-catalogo" element={<Navigate to="/encontrar" replace />} />
          <Route path="/vehicle/:id" element={<ShowcaseVehicleDetails />} />
          <Route path="/novo-catalogo/:id" element={<ShowcaseVehicleDetails />} />
          
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
