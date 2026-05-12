import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { authApi } from '../services/api';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper functions for role-based storage keys
const getTokenKey = (role) => `smartattend_${role}_token`;
const getUserKey = (role) => `smartattend_${role}_user`;
const getActiveRoleKey = () => `smartattend_active_role`;
const readAuthValue = (key) => sessionStorage.getItem(key) || localStorage.getItem(key);
const writeAuthValue = (key, value) => {
  sessionStorage.setItem(key, value);
  localStorage.removeItem(key);
};
const removeAuthValue = (key) => {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore the active session (not just any session)
    const activeRole = readAuthValue(getActiveRoleKey());
    const adminToken = readAuthValue(getTokenKey('admin'));
    const adminUser = readAuthValue(getUserKey('admin'));
    const employeeToken = readAuthValue(getTokenKey('employee'));
    const employeeUser = readAuthValue(getUserKey('employee'));
    const storedTheme = localStorage.getItem('smartattend_theme') || 'light';

    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');

    let tokenToUse = null;
    let userToUse = null;
    let roleToUse = null;

    // 1. If an active role is set, restore that session
    if (activeRole === 'admin' && adminToken && adminUser) {
      tokenToUse = adminToken;
      userToUse = adminUser;
      roleToUse = 'admin';
    } else if (activeRole === 'employee' && employeeToken && employeeUser) {
      tokenToUse = employeeToken;
      userToUse = employeeUser;
      roleToUse = 'employee';
    } 
    // 2. If active role doesn't exist, try the other one
    else if (activeRole === 'admin' && employeeToken && employeeUser) {
      tokenToUse = employeeToken;
      userToUse = employeeUser;
      roleToUse = 'employee';
      writeAuthValue(getActiveRoleKey(), 'employee');
    } else if (activeRole === 'employee' && adminToken && adminUser) {
      tokenToUse = adminToken;
      userToUse = adminUser;
      roleToUse = 'admin';
      writeAuthValue(getActiveRoleKey(), 'admin');
    }
    // 3. If no active role set, check in order: admin first, then employee
    else if (!activeRole) {
      if (adminToken && adminUser) {
        tokenToUse = adminToken;
        userToUse = adminUser;
        roleToUse = 'admin';
        writeAuthValue(getActiveRoleKey(), 'admin');
      } else if (employeeToken && employeeUser) {
        tokenToUse = employeeToken;
        userToUse = employeeUser;
        roleToUse = 'employee';
        writeAuthValue(getActiveRoleKey(), 'employee');
      }
    }

    if (tokenToUse && userToUse) {
      try {
        const parsedUser = JSON.parse(userToUse);
        setUser(parsedUser);
        setToken(tokenToUse);
        // Verify user is still valid with API call in background
        verifyUser(tokenToUse, parsedUser, roleToUse);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        logoutRole(roleToUse || 'admin');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const verifyUser = async (authToken, userData, role = 'admin') => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data;

      if (data.success && data.user) {
        // Verify role matches
        if (data.user.role !== userData.role) {
          console.warn('User role mismatch detected, logging out');
          logoutRole(role);
          return;
        }
        // Update user if any changes from server
        if (data.user.role !== userData.role || data.user.email !== userData.email) {
          console.warn('User data mismatch detected, updating from server');
          setUser(data.user);
          writeAuthValue(getUserKey(role), JSON.stringify(data.user));
        }
      } else {
        logoutRole(role);
      }
    } catch (error) {
      console.error('Failed to verify user:', error);
      if (error.response?.status === 401) {
        logoutRole(role);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (authToken, role = 'admin') => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data;

      if (data.success && data.user) {
        const userRole = data.user.role;
        setUser(data.user);
        writeAuthValue(getUserKey(userRole), JSON.stringify(data.user));
      } else {
        logoutRole(role);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logoutRole(role);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, authToken) => {
    const userRole = userData.role || 'admin';

    // Store role-specific session
    setUser(userData);
    setToken(authToken);
    writeAuthValue(getTokenKey(userRole), authToken);
    writeAuthValue(getUserKey(userRole), JSON.stringify(userData));

    // IMPORTANT: Mark this role as the active session for restores on refresh
    writeAuthValue(getActiveRoleKey(), userRole);
  };

  // Logout a specific role
  const logoutRole = (role = 'admin') => {
    setUser(null);
    setToken(null);
    removeAuthValue(getTokenKey(role));
    removeAuthValue(getUserKey(role));
    
    // If this was the active role, clear the active role marker
    const activeRole = sessionStorage.getItem(getActiveRoleKey()) || localStorage.getItem(getActiveRoleKey());
    if (activeRole === role) {
      removeAuthValue(getActiveRoleKey());
    }
  };

  // Logout current user
  const logout = () => {
    if (user && user.role) {
      logoutRole(user.role);
    } else {
      // Fallback: clear both roles
      removeAuthValue(getTokenKey('admin'));
      removeAuthValue(getUserKey('admin'));
      removeAuthValue(getTokenKey('employee'));
      removeAuthValue(getUserKey('employee'));
      removeAuthValue(getActiveRoleKey());
      setUser(null);
      setToken(null);
    }
  };

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('smartattend_theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  };

  // Check if different role is already logged in
  const getConflictingRole = () => {
    if (!user) return null;
    
    const adminToken = sessionStorage.getItem(getTokenKey('admin'));
    const employeeToken = sessionStorage.getItem(getTokenKey('employee'));
    
    if (user.role === 'admin' && employeeToken) {
      return 'employee';
    }
    if (user.role === 'employee' && adminToken) {
      return 'admin';
    }
    return null;
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
      logoutRole,
      toggleTheme,
      getConflictingRole,
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

