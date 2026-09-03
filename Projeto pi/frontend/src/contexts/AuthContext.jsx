import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check persistence on mount
    const storedUser = localStorage.getItem('automatch_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'E-mail ou senha incorretos.');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('automatch_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Erro ao realizar cadastro.');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('automatch_user', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem('automatch_token', userData.token);
      }
      return userData;
    } catch (error) {
      // Fallback local se a API estiver fora do ar
      if (name && email && password.length >= 6) {
        const fallbackUser = {
          id: 'user-' + Date.now(),
          name,
          email,
          memberSince: 'Março 2024',
          photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
        };
        setUser(fallbackUser);
        localStorage.setItem('automatch_user', JSON.stringify(fallbackUser));
        return fallbackUser;
      }
      throw error;
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
