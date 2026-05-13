# 🎯 SmartAttend Scanner - Features & Documentation

Complete documentation of all features and development guide.

## 📱 Feature Overview

### 1. Authentication & Login

**Functionality**:
- Secure JWT-based login
- Form validation (username/password)
- Remember me checkbox
- Session persistence
- Auto logout on invalid token

**Files**:
- `src/screens/LoginScreen.jsx` - UI component
- `src/context/AuthContext.jsx` - Auth state management
- `src/services/api.js` - API integration

**API Endpoint**:
```
POST /api/auth/login
```

**Error Handling**:
- Invalid credentials → Shows error alert
- Network errors → "Network error" message
- Missing fields → Validation error message

### 2. QR Scanner

**Functionality**:
- Real-time camera preview
- Live QR code detection
- Automatic scan processing
- Duplicate scan prevention (2-second debounce)
- Visual/audio/haptic feedback
- Focus animation on successful scan

**Files**:
- `src/screens/ScannerScreen.jsx` - Scanner UI
- `src/components/UIComponents.jsx` - Reusable components

**Features**:
- Scan frame overlay with instructions
- Loading indicator during processing
- Status bar shows check-in/check-out
- User info display at bottom
- Sign out button

**API Endpoint**:
```
POST /api/attendance/scan
Authorization: Bearer <token>
```

### 3. Attendance Recording

**Functionality**:
- First scan → Records check-in time
- Second scan → Records check-out time
- Third scan → Shows "Already completed" error
- Automatic time zone handling
- Database sync

**Database Operations**:
- Check-in: `INSERT INTO attendance (user_id, employee_id, check_in_time, ...)`
- Check-out: `UPDATE attendance SET check_out_time = ? WHERE id = ?`

**Response Format**:
```json
{
  "success": true,
  "message": "Check-In recorded successfully",
  "type": "checkin",
  "attendance": {
    "id": 1,
    "employeeId": "EMP001",
    "attendanceDate": "2024-05-13",
    "checkInTime": "08:30:00"
  }
}
```

### 4. User Feedback

**Visual Feedback**:
- Success/Error alerts with icons
- Loading spinners on buttons
- Status bar shows operation result
- Color-coded messages (green for success, red for error)

**Audio Feedback**:
- Success sound on scan
- Uses `expo-av` library
- File: `assets/success.wav`

**Haptic Feedback**:
- Vibration on successful scan (500ms)
- Double vibration on error (200-100-200ms)
- Uses React Native `Vibration` API

### 5. Navigation

**Navigation Structure**:
```
Splash Screen (1.2s)
    ↓
Login Screen (conditional)
    ↓
Scanner Screen (main app)
    ↓
Success Screen (on successful scan)
    ↓
Back to Scanner
```

**Navigation Methods**:
- `navigation.replace()` - Replace current screen (no back button)
- `navigation.navigate()` - Navigate to screen (keeps stack)

### 6. Theme System

**Colors**:
```javascript
colors.primary = '#06b6d4' (Cyan)
colors.success = '#10b981' (Green)
colors.error = '#ef4444' (Red)
colors.warning = '#f59e0b' (Orange)
colors.dark.background = '#071029'
colors.dark.surface = '#081124'
colors.dark.text = '#e6eef6'
```

**Spacing**:
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- xxl: 32px

**Typography**:
- title: 28px, bold
- subtitle: 22px, semi-bold
- heading: 18px, semi-bold
- body: 14px, regular
- label: 12px, medium

### 7. Animations

**Splash Screen**:
- Fade in + scale animation (500ms)
- Smooth easing

**Success Screen**:
- Spring animation (scale)
- Fade in animation
- Natural, bouncy feel

**Scanner Screen**:
- Focus animation on scan (500ms)
- Opacity pulse effect

**Transitions**:
- Smooth screen transitions
- Hardware-accelerated animations

### 8. Error Handling

**Network Errors**:
- Connection refused → "Network error" message
- Timeout → "Request timeout" message
- Network unavailable → Graceful handling

**Authentication Errors**:
- 401 Unauthorized → "Session expired, please login again"
- Invalid token → Auto-logout and redirect to login
- Missing token → Show error alert

**Validation Errors**:
- Empty fields → Show field-specific errors
- Invalid format → Display validation messages
- Form prevents submission with errors

**API Errors**:
- 400 Bad Request → Show specific error message
- 403 Forbidden → "Access denied" message
- 404 Not Found → "Resource not found"
- 500 Server Error → "Server error, please try again"

## 🏗️ Architecture

### Component Structure

```
App (Root)
├── AuthProvider (Context)
│   └── RootNavigator
│       ├── SplashScreen
│       ├── LoginScreen
│       ├── ScannerScreen
│       └── SuccessScreen
```

### State Management

**AuthContext**:
```javascript
{
  state: {
    isLoading: boolean,
    isSignout: boolean,
    isLoggedIn: boolean,
    userToken: string | null,
    user: { id, username, email } | null,
    error: string | null
  },
  authContext: {
    signIn(username, password),
    signOut(),
    clearError()
  }
}
```

### Service Layer

**API Service** (`src/services/api.js`):
- Axios instance with base configuration
- Request interceptor (adds auth header)
- Response interceptor (handles 401 errors)
- Helper functions for token management

**Helper Functions** (`src/utils/helpers.js`):
- `formatTime()` - Format time strings
- `formatDate()` - Format date strings
- `getErrorMessage()` - Extract error message
- `validateUsername()` - Username validation
- `validatePassword()` - Password validation
- `debounce()` - Debounce function calls
- `throttle()` - Throttle function calls

## 🔐 Security Features

### Token Management

1. **Login**: Receive JWT token from API
2. **Storage**: Store in AsyncStorage
3. **Attachment**: Auto-attach to requests via interceptor
4. **Expiration**: Manual logout on 401 response
5. **Cleanup**: Remove on logout

### API Security

- HTTPS support ready (configure in theme.js)
- CORS enabled on backend
- JWT validation on server
- Rate limiting possible (implement in backend)

### Local Storage

- Tokens encrypted by OS (Android Keystore)
- No sensitive data in plain text
- Persistent across app restarts
- Cleared on logout

## 📊 Database Schema

### Attendance Table

```sql
CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  employee_id VARCHAR(50),
  attendance_date DATE,
  check_in_time TIME,
  check_out_time TIME,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### QR Codes Table

```sql
CREATE TABLE qr_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(255) UNIQUE,
  employee_id VARCHAR(50),
  qr_data JSON,
  status ENUM('active', 'expired', 'revoked'),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Performance Optimizations

### Current Optimizations

1. **Debouncing**: Prevent duplicate scans (2-second delay)
2. **Caching**: AsyncStorage for token persistence
3. **Lazy Loading**: Screens loaded on demand
4. **Memoization**: React.memo for components
5. **Efficient Rendering**: Conditional rendering
6. **Network**: Axios timeout configuration (10s)

### Profiling

```bash
# React Native Profiler
# Shake device → Performance Monitor

# Or use Android Studio Profiler
# Android Studio → Profiler → CPU/Memory/Network
```

### Future Optimization Ideas

- [ ] Image compression for large QR codes
- [ ] Request batching
- [ ] GraphQL for efficient data fetching
- [ ] Redux for complex state
- [ ] Offline support with SQLite
- [ ] Service workers for offline

## 🧪 Testing

### Unit Testing

```bash
# Install Jest
npm install --save-dev jest

# Write tests in __tests__ folder
# Run tests
npm test
```

### Integration Testing

```javascript
// Test authentication flow
describe('Login', () => {
  it('should login with valid credentials', async () => {
    // Test implementation
  });
});
```

### E2E Testing

Use Detox or Appium for end-to-end testing:

```bash
npm install --save-dev detox-cli
detox test
```

## 📚 API Documentation

### Authentication

**POST /api/auth/login**
```
Request:
{
  "username": "employee1",
  "password": "password"
}

Response (200):
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "employee1",
    "email": "employee1@example.com"
  }
}
```

### Attendance Scanning

**POST /api/attendance/scan**
```
Headers:
Authorization: Bearer <jwt_token>

Request:
{
  "qrToken": "QR_CODE_VALUE"
}

Response (200):
{
  "success": true,
  "message": "Check-In recorded successfully",
  "type": "checkin",
  "attendance": {...}
}

Error (400):
{
  "success": false,
  "message": "Attendance already completed for today"
}
```

## 🔧 Development Tips

### Adding a New Screen

1. Create file in `src/screens/NewScreen.jsx`
2. Add to navigation in `App.js`
3. Add route to `RootNavigator`
4. Use `useAuth()` hook if needed

### Adding a New Component

1. Create in `src/components/`
2. Import `UIComponents` for styled components
3. Use theme colors and spacing
4. Add prop types documentation

### Modifying Theme

1. Edit `src/config/theme.js`
2. Update colors, spacing, typography
3. All components auto-update

### API Changes

1. Modify `src/services/api.js`
2. Update endpoints in `src/config/constants.js`
3. Update error handling in `src/utils/helpers.js`

## 📱 Deployment Checklist

- [ ] API URL configured for production
- [ ] Backend server deployed and accessible
- [ ] Database backups configured
- [ ] Error logging setup
- [ ] Analytics enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] SSL/TLS certificates installed
- [ ] App signed and optimized
- [ ] Play Store listing prepared
- [ ] Testing on real devices completed

## 📞 Support

For issues, questions, or feature requests:
1. Check [README.md](./README.md)
2. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. Review code comments
4. Check backend logs
5. Enable debug logging

---

**Last Updated**: May 2024
**Version**: 1.0.0
