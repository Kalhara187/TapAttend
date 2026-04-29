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
    const token = localStorage.getItem('smartattend_token');

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
      localStorage.removeItem('smartattend_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
};

export const adminApi = {
  getSummary: () => api.get('/admin/summary'),
  getAttendanceTrends: (range = 30) => api.get(`/admin/attendance-trends?range=${range}`),
  getEmployees: () => api.get('/admin/employees'),
};

export const attendanceApi = {
  scan: (payload) => api.post('/attendance/scan', payload),
  history: () => api.get('/attendance/history'),
  records: () => api.get('/attendance/records'),
};

export const reportApi = {
  monthly: () => api.get('/reports/monthly'),
  summary: () => api.get('/reports/summary'),
};

export const leaveApi = {
  list: () => api.get('/leaves'),
  submit: (payload) => api.post('/leaves', payload),
  update: (id, payload) => api.patch(`/leaves/${id}`, payload),
};

export const qrApi = {
  create: (payload) => api.post('/qr/generate', payload),
};

export default api;

