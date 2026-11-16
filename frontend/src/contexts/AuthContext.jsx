import { api, isDemoModeEnabled } from '../services/apiClient';
import { readSessionToken, canUseOfflineFallback } from '../services/sessionStorage';
/**
 * AuthContext.jsx — Provedor de contexto global de autenticação e sessão do usuário.
 * 
 * Objetivo e Motivo da Criação:
 *   - Criado para gerenciar estado de login, perfil de usuário (buyer/dealer), armazenamento seguro
 *     de tokens JWT e métodos de login/logout em toda a aplicação React.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

// ===========================================================================
// Utilitários Internos
// ===========================================================================

/**
 * Hash unidirecional para credenciais locais (fallback offline).
 * Evita exposição de senhas em plaintext no sessionStorage.
 */
const hashPasswordLocal = async (plainPassword) => {
  if (typeof crypto !== 'undefined' && crypto?.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(plainPassword);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (_) { /* O recurso opcional mantém seu estado anterior. */ }
  }
  let hash = 0;
  for (let i = 0; i < plainPassword.length; i++) {
    hash = ((hash << 5) - hash) + plainPassword.charCodeAt(i);
    hash |= 0;
  }
  return 'sh_' + Math.abs(hash);
};

// ===========================================================================
// AuthProvider
// ===========================================================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * P4 — "sempre que o usuário entrar no site ele deve fazer login":
   * A sessão é armazenada em sessionStorage (apagada quando o browser/aba fecha).
   * O usuário precisa fazer login a cada nova sessão de navegação.
   * localStorage é usado apenas para a lista de contas locais (fallback offline).
   */
  useEffect(() => {
    const savedUser = sessionStorage.getItem('automatch_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role === 'comprador' || parsed?.role === 'vendedor') {
          parsed.role = 'comum';
        }
        setUser(parsed);
      } catch (e) {
        sessionStorage.removeItem('automatch_user');
        sessionStorage.removeItem('automatch_token');
      }
    }
    setLoading(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Helpers de persistência (sessionStorage)
  // ---------------------------------------------------------------------------
  const _persistSession = (userData) => {
    sessionStorage.setItem('automatch_user', JSON.stringify(userData));
    if (userData?.token) {
      sessionStorage.setItem('automatch_token', userData.token);
    } else {
      sessionStorage.removeItem('automatch_token');
    }
  };

  const _clearSession = () => {
    sessionStorage.removeItem('automatch_user');
    sessionStorage.removeItem('automatch_token');
  };

  // ---------------------------------------------------------------------------
  // login
  // ---------------------------------------------------------------------------
  const login = async (rawEmail, password) => {
    const cleanEmail = (rawEmail || '').trim().replace(/^@+/, '').toLowerCase();

    try {
      const userData = await api.post('/api/login', { email: cleanEmail, password });
      // Reconcilia role: usa o que o backend retorna (fonte da verdade)
      const rawRole = userData.role || 'comum';
      const effectiveRole = (rawRole === 'comprador' || rawRole === 'vendedor') ? 'comum' : rawRole;
      const resolvedUser = {
        ...userData,
        role: effectiveRole,
        accountType: effectiveRole === 'lojista' ? 'store' : (effectiveRole === 'admin' ? 'store' : 'buyer')
      };

      setUser(resolvedUser);
      _persistSession(resolvedUser);
      return resolvedUser;

    } catch (error) {
      if (!canUseOfflineFallback(error, isDemoModeEnabled())) throw error;
      // Fallback demo — APENAS em ambiente de desenvolvimento com VITE_ENABLE_DEMO_DATA=true
      if (isDemoModeEnabled() && cleanEmail === 'admin@automatch.com' && password === 'admin123') {
        const demoAdmin = {
          id: 1,
          name: 'Administrador Automatch',
          email: 'admin@automatch.com',
          accountType: 'store',
          role: 'admin',
          sub_role: 'owner',
          store_id: 1,
          memberSince: 'Março 2024',
          photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          token: 'demo-admin-token'
        };
        setUser(demoAdmin);
        _persistSession(demoAdmin);
        return demoAdmin;
      }

      // Fallback offline — contas registradas localmente (sem backend)
      if (isDemoModeEnabled()) {
        try {
          const localAccounts = JSON.parse(localStorage.getItem('@automatch:registered_users') || '[]');
          const inputHash = await hashPasswordLocal(password);
          const found = localAccounts.find(u =>
            u.email.toLowerCase() === cleanEmail &&
            (u.passwordHash === inputHash || u.password === password)
          );
          if (found) {
            const { password: _p, passwordHash: _ph, ...userData } = found;
            setUser(userData);
            _persistSession(userData);
            return userData;
          }
        } catch (storageErr) {
          console.warn('Erro ao consultar contas locais:', storageErr);
        }
      }

      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // register
  // ---------------------------------------------------------------------------
  const register = async (name, rawEmail, password, extraData = {}) => {
    const cleanEmail = (rawEmail || '').trim().replace(/^@+/, '').toLowerCase();

    // Mapeia accountType do frontend para role do backend
    const roleMap = {
      store: 'lojista',
      seller: 'lojista',
      buyer: 'comum',
      comum: 'comum',
    };
    const mappedRole = roleMap[extraData.accountType] || 'comum';

    try {
      const userData = await api.post('/api/register', {
        name: name.trim(), email: cleanEmail, password,
        role: mappedRole, store_name: extraData.storeName || null
      });

      const rawRole = userData.role || mappedRole;
      const effectiveRole = (rawRole === 'comprador' || rawRole === 'vendedor') ? 'comum' : rawRole;
      const fullUser = {
        ...userData,
        role: effectiveRole,
        // O role vem do backend (fonte da verdade)
        accountType: effectiveRole === 'lojista' ? 'store' : 'buyer',
        phone: extraData.phone || '',
        city: extraData.city || '',
        storeName: extraData.storeName || '',
        document: extraData.document || '',
        planId: extraData.planId || 'free'
      };

      setUser(fullUser);
      _persistSession(fullUser);

      // Persiste conta local para fallback offline (sem expor senha)
      if (isDemoModeEnabled()) {
        try {
          const localAccounts = JSON.parse(localStorage.getItem('@automatch:registered_users') || '[]');
          const updated = localAccounts.filter(u => u.email.toLowerCase() !== cleanEmail);
          const { password: _p, ...safeUser } = fullUser;
          const passwordHash = await hashPasswordLocal(password);
          updated.push({ ...safeUser, passwordHash });
          localStorage.setItem('@automatch:registered_users', JSON.stringify(updated));
        } catch (e) { /* O recurso opcional mantém seu estado anterior. */ }
      }

      return fullUser;

    } catch (error) {
      // Fallback local resiliente (apenas em modo demo)
      if (!canUseOfflineFallback(error, isDemoModeEnabled())) throw error;
      const accounts = JSON.parse(localStorage.getItem('@automatch:registered_users') || '[]');
      if (accounts.some(account => account.email.toLowerCase() === cleanEmail)) {
        throw new Error('Este e-mail já está cadastrado no sistema.');
      }

      console.warn('Modo cadastro local resiliente (demo):', error.message);
      const fallbackRole = mappedRole;
      const fallbackUser = {
        id: 'user-' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        memberSince: new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
        photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
        role: fallbackRole,
        accountType: fallbackRole === 'lojista' ? 'store' : 'buyer',
        phone: extraData.phone || '',
        city: extraData.city || '',
        storeName: extraData.storeName || '',
        document: extraData.document || '',
        planId: extraData.planId || 'free',
        token: 'local-jwt-token-' + Date.now()
      };

      try {
        const localAccounts = JSON.parse(localStorage.getItem('@automatch:registered_users') || '[]');
        const updated = localAccounts.filter(u => u.email.toLowerCase() !== cleanEmail);
        const passwordHash = await hashPasswordLocal(password);
        updated.push({ ...fallbackUser, passwordHash });
        localStorage.setItem('@automatch:registered_users', JSON.stringify(updated));
      } catch (e) { /* O recurso opcional mantém seu estado anterior. */ }

      setUser(fallbackUser);
      _persistSession(fallbackUser);
      return fallbackUser;
    }
  };

  // ---------------------------------------------------------------------------
  // logout
  // ---------------------------------------------------------------------------
  const logout = () => {
    setUser(null);
    _clearSession();
  };

  // ---------------------------------------------------------------------------
  // updateProfile
  // ---------------------------------------------------------------------------
  const updateProfile = async (updates) => {
    try {
      const updated = await api.put('/api/users/profile', updates);
      // Respostas de perfil não renovam o JWT. Não sobrescrever a sessão com token:null.
      const merged = { ...user, ...updated, token: updated.token || readSessionToken() };
      setUser(merged);
      _persistSession(merged);
      return merged;
    } catch (error) {
      if (error.status === 401) logout();
      if (!canUseOfflineFallback(error, isDemoModeEnabled())) throw error;
      const safeUpdates = Object.fromEntries(Object.entries(updates).filter(([key]) => ['name', 'email', 'photo'].includes(key)));
      const merged = { ...user, ...safeUpdates };
      setUser(merged);
      _persistSession(merged);
      return merged;
    }
  };

  // ---------------------------------------------------------------------------
  // Helpers expostos
  // ---------------------------------------------------------------------------

  /** Retorna true se o usuário tem acesso ao painel B2B/Dashboard (C1). */
  const canAccessB2B = () => {
    return ['lojista', 'admin'].includes(user?.role);
  };

  /** Retorna o token da sessão atual. */
  const getToken = readSessionToken;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      canAccessB2B,
      getToken,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
