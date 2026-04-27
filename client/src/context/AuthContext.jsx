import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const storedToken =
      localStorage.getItem('smartattend_token') ||
      sessionStorage.getItem('smartattend_token');

    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        // Token invalid, clear storage
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
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartattend_token');
    sessionStorage.removeItem('smartattend_token');
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
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

