import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary';
import RouteLoadingSkeleton from './components/common/RouteLoadingSkeleton';

// Code Splitting: Lazy loading dinâmico de rotas para reduzir o tamanho inicial do bundle
const Home = React.lazy(() => import('./pages/Home'));
const ShowcaseCatalog = React.lazy(() => import('./pages/ShowcaseCatalog'));
const ShowcaseVehicleDetails = React.lazy(() => import('./pages/ShowcaseVehicleDetails'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const HowItWorksPage = React.lazy(() => import('./pages/HowItWorksPage'));
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const NewCarAdForm = React.lazy(() => import('./pages/NewCarAdForm'));
const PublicValidationPage = React.lazy(() => import('./pages/PublicValidationPage'));
const MyAdsPage = React.lazy(() => import('./pages/MyAdsPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <ScrollToTop />
          <Suspense fallback={<RouteLoadingSkeleton />}>
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
            <ProtectedRoute allowedRoles={['admin', 'lojista']}>
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
      </Suspense>
    </Router>
    </AuthProvider>
  </GlobalErrorBoundary>
  );
}

export default App;
