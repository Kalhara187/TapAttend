import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { authApi } from '../services/api';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('smartattend_token');
    const storedTheme = localStorage.getItem('smartattend_theme') || 'light';

    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');

    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken) => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data;

      if (data.success) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('smartattend_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartattend_token');
  };

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('smartattend_theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      theme,
      isAuthenticated: Boolean(user && token),
      isLoading: loading,
      login,
      logout,
      toggleTheme,
    }),
    [theme, user, token, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      <div className={`theme-root ${theme}`}>{children}</div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}

