import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('smartattend_token') ||
      sessionStorage.getItem('smartattend_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect
      localStorage.removeItem('smartattend_token');
      sessionStorage.removeItem('smartattend_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Admin API endpoints
export const adminApi = {
  getSummary: () => api.get('/admin/summary'),
  getAttendanceTrends: (range = 30) => api.get(`/admin/attendance-trends?range=${range}`),
  getEmployees: () => api.get('/admin/employees'),
};

export default api;

