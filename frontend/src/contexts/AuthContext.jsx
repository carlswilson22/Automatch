import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

// Hash seguro unidirecional para credenciais locais (evita exposição de senhas em plaintext no localStorage)
const hashPasswordLocal = async (plainPassword) => {
  if (typeof crypto !== 'undefined' && crypto?.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(plainPassword);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (_) {}
  }
  let hash = 0;
  for (let i = 0; i < plainPassword.length; i++) {
    hash = ((hash << 5) - hash) + plainPassword.charCodeAt(i);
    hash |= 0;
  }
  return 'sh_' + Math.abs(hash);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaura a sessão do usuário previamente salvo
    const savedUser = localStorage.getItem('automatch_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('automatch_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (rawEmail, password) => {
    const cleanEmail = (rawEmail || '').trim().replace(/^@+/, '').toLowerCase();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'E-mail ou senha incorretos.');
      }

      const userData = await response.json();
      const reconciledRole = userData.role || (userData.accountType === 'store' ? 'lojista' : 'comprador');
      const resolvedUser = { ...userData, role: reconciledRole };
      setUser(resolvedUser);
      localStorage.setItem('automatch_user', JSON.stringify(resolvedUser));
      if (resolvedUser.token) {
        localStorage.setItem('automatch_token', resolvedUser.token);
      }
      return resolvedUser;
    } catch (error) {
      // 1. Fallback para as credenciais oficiais de demonstração (README)
      if (cleanEmail === 'admin@automatch.com' && password === 'admin123') {
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
        localStorage.setItem('automatch_user', JSON.stringify(demoAdmin));
        localStorage.setItem('automatch_token', demoAdmin.token);
        return demoAdmin;
      }

      // 2. Fallback para usuários registrados localmente no navegador
      try {
        const localAccounts = JSON.parse(localStorage.getItem('@automatch:registered_users') || '[]');
        const inputHash = await hashPasswordLocal(password);
        const found = localAccounts.find(u =>
          u.email.toLowerCase() === cleanEmail &&
          (u.passwordHash === inputHash || u.password === password) // compatibilidade retroativa
        );
        if (found) {
          const { password: _p, passwordHash: _ph, ...userData } = found;
          setUser(userData);
          localStorage.setItem('automatch_user', JSON.stringify(userData));
          if (userData.token) {
            localStorage.setItem('automatch_token', userData.token);
          }
          return userData;
        }
      } catch (storageErr) {
        console.warn('Erro ao consultar contas locais:', storageErr);
      }

      throw error;
    }
  };

  const register = async (name, rawEmail, password, extraData = {}) => {
    const cleanEmail = (rawEmail || '').trim().replace(/^@+/, '').toLowerCase();
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: cleanEmail, password })
      });

      let userData;
      if (response.ok) {
        userData = await response.json();
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Erro ao realizar cadastro.');
      }

      const effectiveRole = extraData.accountType === 'store' ? 'lojista' : (userData.role === 'admin' ? 'admin' : 'comprador');
      const fullUser = {
        ...userData,
        role: effectiveRole,
        accountType: extraData.accountType || (effectiveRole === 'lojista' ? 'store' : 'buyer'),
        phone: extraData.phone || '',
        city: extraData.city || '',
        storeName: extraData.storeName || '',
        document: extraData.document || '',
        planId: extraData.planId || 'free'
      };

      setUser(fullUser);
      localStorage.setItem('automatch_user', JSON.stringify(fullUser));
      if (fullUser.token) {
        localStorage.setItem('automatch_token', fullUser.token);
      }

      // Salva cópia local para garantir login offline futuro (sem expor senha em texto claro)
      try {
        const localAccounts = JSON.parse(localStorage.getItem('@automatch:registered_users') || '[]');
        const updated = localAccounts.filter(u => u.email.toLowerCase() !== cleanEmail);
        const { password: _p, ...safeUser } = fullUser;
        const passwordHash = await hashPasswordLocal(password);
        updated.push({ ...safeUser, passwordHash });
        localStorage.setItem('@automatch:registered_users', JSON.stringify(updated));
      } catch (e) {}

      return fullUser;
    } catch (error) {
      // Fallback local resiliente: permite cadastrar qualquer tipo de perfil mesmo com backend offline
      console.warn('Modo cadastro local resiliente:', error.message);
      const fallbackRole = extraData.accountType === 'store' ? 'lojista' : 'comprador';
      const fallbackUser = {
        id: 'user-' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        memberSince: 'Setembro 2026',
        photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
        role: fallbackRole,
        accountType: extraData.accountType || 'buyer',
        phone: extraData.phone || '',
        city: extraData.city || '',
        storeName: extraData.storeName || '',
        document: extraData.document || '',
        planId: extraData.planId || 'free',
        token: 'local-jwt-token-' + Date.now()
      };

      // Persiste nas contas registradas locais (sem expor senha em texto claro)
      try {
        const localAccounts = JSON.parse(localStorage.getItem('@automatch:registered_users') || '[]');
        const updated = localAccounts.filter(u => u.email.toLowerCase() !== cleanEmail);
        const { password: _p, ...safeFallbackUser } = fallbackUser;
        const passwordHash = await hashPasswordLocal(password);
        updated.push({ ...safeFallbackUser, passwordHash });
        localStorage.setItem('@automatch:registered_users', JSON.stringify(updated));
      } catch (e) {}

      setUser(fallbackUser);
      localStorage.setItem('automatch_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('automatch_user');
    localStorage.removeItem('automatch_token');
  };

  const updateProfile = async (updates) => {
    try {
      const token = user?.token || localStorage.getItem('automatch_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updated = await response.json();
        const merged = { ...user, ...updated };
        setUser(merged);
        localStorage.setItem('automatch_user', JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      // Continua com atualização local se falhar
    }

    const newUser = { ...user, ...updates };
    setUser(newUser);
    localStorage.setItem('automatch_user', JSON.stringify(newUser));
    return newUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
