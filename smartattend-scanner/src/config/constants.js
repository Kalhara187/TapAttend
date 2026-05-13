export const MESSAGES = {
  // Login
  LOGIN_EMPTY: 'Please provide username and password',
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_FAILED: 'Login failed',
  
  // Scan
  SCAN_PERMISSION_REQUEST: 'Requesting camera permission...',
  SCAN_NO_PERMISSION: 'Camera permission not granted. Please enable it in settings.',
  SCAN_INVALID_QR: 'Invalid QR code. Please try again.',
  SCAN_ALREADY_COMPLETED: 'Attendance already completed for today',
  SCAN_CHECKIN: 'Check-In recorded successfully',
  SCAN_CHECKOUT: 'Check-Out recorded successfully',
  SCAN_DUPLICATE: 'Scan received',
  SCAN_READY: 'Point camera at QR code',
  SCAN_PROCESSING: 'Processing scan...',
  
  // Network
  NETWORK_ERROR: 'Network error. Check your connection.',
  REQUEST_TIMEOUT: 'Request timeout. Please try again.',
  
  // General
  ERROR: 'Error',
  SUCCESS: 'Success',
  LOADING: 'Loading...',
  RETRY: 'Retry',
  CANCEL: 'Cancel',
  SIGNIN: 'Sign In',
  SIGNOUT: 'Sign Out',
  SCAN_AGAIN: 'Scan Again',
};

export const ATTENDANCE_STATUS = {
  CHECKIN: 'check-in',
  CHECKOUT: 'check-out',
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
};

export const API_ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  ATTENDANCE_SCAN: '/attendance/scan',
  ATTENDANCE_HISTORY: '/attendance/history',
};

export const SCAN_DEBOUNCE_TIME = 2000; // milliseconds
export const VIBRATION_DURATION = 500; // milliseconds
export const SUCCESS_MESSAGE_DURATION = 2000; // milliseconds
