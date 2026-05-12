import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Helper to get token from role-specific storage
const getAuthToken = () => {
  const activeRole = sessionStorage.getItem('smartattend_active_role') || localStorage.getItem('smartattend_active_role');

  if (activeRole === 'admin' || activeRole === 'employee') {
    const activeToken = sessionStorage.getItem(`smartattend_${activeRole}_token`) || localStorage.getItem(`smartattend_${activeRole}_token`);
    if (activeToken) {
      return activeToken;
    }
  }

  const adminToken = sessionStorage.getItem('smartattend_admin_token') || localStorage.getItem('smartattend_admin_token');
  const employeeToken = sessionStorage.getItem('smartattend_employee_token') || localStorage.getItem('smartattend_employee_token');

  return adminToken || employeeToken;
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

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
      // Remove both tokens on 401
      sessionStorage.removeItem('smartattend_admin_token');
      sessionStorage.removeItem('smartattend_admin_user');
      sessionStorage.removeItem('smartattend_employee_token');
      sessionStorage.removeItem('smartattend_employee_user');
      sessionStorage.removeItem('smartattend_active_role');
      localStorage.removeItem('smartattend_admin_token');
      localStorage.removeItem('smartattend_admin_user');
      localStorage.removeItem('smartattend_employee_token');
      localStorage.removeItem('smartattend_employee_user');
      localStorage.removeItem('smartattend_active_role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
  updateMe: (payload) => api.patch('/auth/me', payload),
};

export const adminApi = {
  getSummary: () => api.get('/admin/summary'),
  getAttendanceTrends: (range = 30) => api.get(`/admin/attendance-trends?range=${range}`),
  getEmployees: () => api.get('/admin/employees'),
  getAttendanceRecords: (params = {}) => api.get('/admin/attendance-records', { params }),
  createEmployee: (payload) => api.post('/admin/employees', payload),
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
  generate: (payload) => api.post('/qr/generate', payload),
  create: (payload) => api.post('/qr/generate', payload),
  history: () => api.get('/qr/history'),
  getMyCode: () => api.get('/qr/my-code'),
};

export default api;

