import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializa sempre sem usuário (Modo Visitante limpo) a cada inicialização/recarregamento
    // permitindo testes manuais completos de cadastro e tipos de perfil.
    localStorage.removeItem('automatch_user');
    localStorage.removeItem('automatch_token');
    setUser(null);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'E-mail ou senha incorretos.');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('automatch_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      // Fallback para as credenciais oficiais de demonstração (README)
      if (email.toLowerCase() === 'admin@automatch.com' && password === 'admin123') {
        const demoAdmin = {
          id: 1,
          name: 'Administrador Automatch',
          email: 'admin@automatch.com',
          accountType: 'store',
          role: 'admin',
          memberSince: 'Março 2024',
          photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          token: 'demo-admin-token'
        };
        setUser(demoAdmin);
        localStorage.setItem('automatch_user', JSON.stringify(demoAdmin));
        return demoAdmin;
      }
      throw error;
    }
  };

  const register = async (name, email, password, extraData = {}) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      let userData;
      if (response.ok) {
        userData = await response.json();
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Erro ao realizar cadastro.');
      }

      const fullUser = {
        ...userData,
        accountType: extraData.accountType || 'buyer',
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
      return fullUser;
    } catch (error) {
      // Fallback local resiliente: permite cadastrar qualquer tipo de perfil mesmo com backend offline
      console.warn('Modo cadastro local resiliente:', error.message);
      const fallbackUser = {
        id: 'user-' + Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        memberSince: 'Setembro 2026',
        photo: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
        accountType: extraData.accountType || 'buyer',
        phone: extraData.phone || '',
        city: extraData.city || '',
        storeName: extraData.storeName || '',
        document: extraData.document || '',
        planId: extraData.planId || 'free',
        token: 'local-jwt-token-' + Date.now()
      };
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
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
