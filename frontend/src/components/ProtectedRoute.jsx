/**
 * ProtectedRoute.jsx — Componente guardião de rotas privadas e autenticadas.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para proteger telas restritas (Dashboard, Novo Anúncio, Meus Anúncios, Perfil)
 *     impedindo acesso de usuários não logados e redirecionando-os de volta com o caminho de retorno.
 *   - Permite modo de demonstração assistido quando o tour interativo estiver em execução (isTourDemoActive),
 *     possibilitando que visitantes explorem as funcionalidades sem desvio precoce para tela de login.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTour } from '../contexts/TourContext';

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const { demoState } = useTour();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-brand-blue animate-spin"></div>
      </div>
    );
  }

  // Se o usuário estiver no tour guiado em modo de demonstração,
  // permite a visualização das telas reais sem desviar para login.
  const isTourDemoActive = Boolean(demoState?.isRunning);

  if (!isAuthenticated && !isTourDemoActive) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    // Visitante em demonstração tem permissão de visualização guiada
    if (!isAuthenticated && isTourDemoActive) {
      return children;
    }

    const rawRole = user?.role || (user?.accountType === 'store' ? 'lojista' : 'comum');
    const effectiveRole = (rawRole === 'comprador' || rawRole === 'vendedor') ? 'comum' : rawRole;
    if (!allowedRoles.includes(effectiveRole)) {
      return <Navigate to="/" replace state={{ accessDenied: true }} />;
    }
  }

  return children;
};

export default ProtectedRoute;
