export function formatTime(time) {
  if (!time) return '--:--';
  
  try {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return time;
  }
}

export function formatDate(date) {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return date;
  }
}

export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export function getAttendanceStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'present':
    case 'check-in':
    case 'check-out':
      return '#10b981';
    case 'late':
      return '#f59e0b';
    case 'absent':
      return '#ef4444';
    default:
      return '#6b7d8a';
  }
}

export function getAttendanceStatusLabel(status) {
  switch (status?.toLowerCase()) {
    case 'check-in':
      return '✓ Checked In';
    case 'check-out':
      return '✓ Checked Out';
    case 'present':
      return '✓ Present';
    case 'late':
      return '⚠ Late';
    case 'absent':
      return '✕ Absent';
    default:
      return status;
  }
}

export function isNetworkError(error) {
  return (
    !error.response &&
    (error.code === 'ECONNABORTED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.message === 'Network Error')
  );
}

export function getErrorMessage(error) {
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection.';
  }
  
  if (error.response?.status === 401) {
    return 'Unauthorized. Please log in again.';
  }
  
  if (error.response?.status === 403) {
    return 'Access denied. You do not have permission.';
  }
  
  if (error.response?.status === 404) {
    return 'Resource not found.';
  }
  
  if (error.response?.status === 500) {
    return 'Server error. Please try again later.';
  }
  
  return error?.response?.data?.message || error?.message || 'An error occurred';
}

export function validateUsername(username) {
  if (!username || username.trim().length === 0) {
    return 'Username is required';
  }
  if (username.trim().length < 3) {
    return 'Username must be at least 3 characters';
  }
  return null;
}

export function validatePassword(password) {
  if (!password || password.length === 0) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
}

export function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return (...args) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}
