import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useState({
    isLoading: true,
    isSignout: false,
    isLoggedIn: false,
    userToken: null,
    user: null,
    error: null,
  });

  // Bootstrap async - check if user is already logged in
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('smartattend_token');
        const userData = await AsyncStorage.getItem('smartattend_user');
        
        if (token && userData) {
          dispatch({
            isLoading: false,
            isSignout: false,
            isLoggedIn: true,
            userToken: token,
            user: JSON.parse(userData),
            error: null,
          });
        } else {
          dispatch({
            isLoading: false,
            isSignout: false,
            isLoggedIn: false,
            userToken: null,
            user: null,
            error: null,
          });
        }
      } catch (e) {
        console.error('Failed to restore token', e);
        dispatch({
          isLoading: false,
          isSignout: false,
          isLoggedIn: false,
          userToken: null,
          user: null,
          error: e.message,
        });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    signIn: useCallback(async (username, password) => {
      try {
        const res = await api.post('/auth/login', { username, password });
        const token = res.data?.token;
        const user = res.data?.user;

        if (!token) throw new Error('No token received from server');

        await AsyncStorage.setItem('smartattend_token', token);
        if (user) {
          await AsyncStorage.setItem('smartattend_user', JSON.stringify(user));
        }

        // Set default auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        dispatch({
          isLoading: false,
          isSignout: false,
          isLoggedIn: true,
          userToken: token,
          user: user || { username },
          error: null,
        });

        return { success: true, user };
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || 'Login failed';
        dispatch({
          isLoading: false,
          isSignout: false,
          isLoggedIn: false,
          userToken: null,
          user: null,
          error: message,
        });
        throw error;
      }
    }, []),

    signOut: useCallback(async () => {
      try {
        await AsyncStorage.removeItem('smartattend_token');
        await AsyncStorage.removeItem('smartattend_user');
        delete api.defaults.headers.common['Authorization'];

        dispatch({
          isLoading: false,
          isSignout: true,
          isLoggedIn: false,
          userToken: null,
          user: null,
          error: null,
        });
      } catch (error) {
        console.error('Sign out error', error);
      }
    }, []),

    clearError: useCallback(() => {
      dispatch((prevState) => ({
        ...prevState,
        error: null,
      }));
    }, []),
  };

  return (
    <AuthContext.Provider value={{ state, authContext }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
