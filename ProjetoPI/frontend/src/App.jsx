import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ShowcaseCatalog from './pages/ShowcaseCatalog';
import ShowcaseVehicleDetails from './pages/ShowcaseVehicleDetails';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import PlansPage from './pages/PlansPage';
import CheckoutPage from './pages/CheckoutPage';
import Dashboard from './pages/Dashboard';
import NewCarAdForm from './pages/NewCarAdForm';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/encontrar" element={<ShowcaseCatalog />} />
          <Route path="/encontrar/:id" element={<ShowcaseVehicleDetails />} />
          <Route path="/planos" element={<PlansPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/novo-anuncio" element={<NewCarAdForm />} />
          
          {/* Protected Routes */}
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
