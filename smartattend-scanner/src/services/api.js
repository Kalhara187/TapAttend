import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, REQUEST_TIMEOUT } from '../config/theme';

// Create axios instance
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
instance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('smartattend_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - token might be invalid
      AsyncStorage.removeItem('smartattend_token');
      AsyncStorage.removeItem('smartattend_user');
    }
    
    // Return error with meaningful message
    return Promise.reject(error);
  }
);

// Helper function to get base URL (for testing/debugging)
export function getBaseURL() {
  return instance.defaults.baseURL;
}

// Helper function to set custom header
export function setAuthHeader(token) {
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common['Authorization'];
  }
}

export default instance;
