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
    const storedUser = localStorage.getItem('smartattend_user');
    const storedTheme = localStorage.getItem('smartattend_theme') || 'light';

    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        // Verify user is still valid with API call in background
        verifyUser(storedToken, parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        logout();
        setLoading(false);
      }
    } else if (storedToken) {
      // If only token exists (old login), fetch user to restore session
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyUser = async (authToken, userData) => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data;

      if (data.success && data.user) {
        // Update user if any changes from server
        if (data.user.role !== userData.role || data.user.email !== userData.email) {
          console.warn('User data mismatch detected, updating from server');
          setUser(data.user);
          localStorage.setItem('smartattend_user', JSON.stringify(data.user));
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to verify user:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (authToken) => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data;

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('smartattend_user', JSON.stringify(data.user));
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
    localStorage.setItem('smartattend_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartattend_token');
    localStorage.removeItem('smartattend_user');
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

