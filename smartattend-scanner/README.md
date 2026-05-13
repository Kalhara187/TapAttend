# 📱 SmartAttend Scanner - Mobile QR Attendance App

A professional mobile QR code attendance scanner app built with **React Native** and **Expo** for Android devices. It enables employees to check in and check out by scanning QR codes using their smartphone's camera.

## ✨ Features

### 🎯 Core Features
- **🔐 Secure Login** - JWT-based authentication with username and password
- **📷 Real-time QR Scanning** - Uses device camera to scan employee QR codes
- **⏰ Automatic Check-In/Check-Out** - First scan = check-in, second scan = check-out
- **🔔 Audio & Haptic Feedback** - Sound and vibration on successful scan
- **🎨 Modern Dark Theme UI** - Professional, modern interface with smooth animations
- **⚡ Offline Ready** - Works without internet (with proper setup)

### 🔐 Security
- JWT token-based authentication
- Secure token storage using AsyncStorage
- Auto-logout on unauthorized responses
- Protected API endpoints

### 📊 Data Management
- Automatic attendance sync to MySQL database
- Check-in and check-out time recording
- Duplicate scan prevention
- Attendance history tracking

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React Native 0.71.8, Expo 48 |
| **State Management** | React Context API |
| **API Client** | Axios with interceptors |
| **Storage** | AsyncStorage (secure token storage) |
| **Camera** | Expo Camera for QR scanning |
| **Audio** | Expo AV for success sound |
| **Navigation** | React Navigation v6 |
| **Backend API** | Node.js/Express (REST API) |
| **Database** | MySQL |

## 📦 Prerequisites

### System Requirements
- **Node.js** v16 or higher
- **npm** or **yarn**
- **Android Device** with Android 7.0 or higher (for development testing)
- **Expo CLI** (optional, but recommended)

### Backend Requirements
- Running SmartAttend backend server (Node.js/Express)
- MySQL database with `attendance` and `qr_codes` tables
- API endpoints available at `http://10.0.2.2:5000/api` (Android emulator default)
- Or your custom IP address for physical devices

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd smartattend-scanner
npm install
```

Or with yarn:
```bash
yarn install
```

### 2. Configure API Base URL

Edit `src/config/theme.js` to set your backend API URL:

```javascript
// For Android Emulator (default)
export const API_BASE_URL = 'http://10.0.2.2:5000/api';

// For Physical Android Device - replace with your PC IP
// export const API_BASE_URL = 'http://192.168.1.10:5000/api';
```

### 3. Start the Development Server

```bash
# Start Expo server
npm start

# Or use Expo CLI
expo start
```

### 4. Run on Android

**Option A: Android Emulator**
```bash
npm run android
# or
expo run:android
```

**Option B: Physical Android Device**
1. Install **Expo Go** app from Google Play Store
2. Scan the QR code from terminal using Expo Go
3. App will open on your device

## 📱 App Screens

### 1. **Splash Screen**
- Professional intro with logo and animations
- Transitions to login after 2 seconds

### 2. **Login Screen**
- Username/email and password input fields
- Form validation
- Remember me checkbox
- Demo credentials display
- Error alerts

### 3. **QR Scanner Screen**
- Real-time camera preview
- Scan frame overlay with instructions
- Visual feedback (animations, sounds, vibrations)
- Display of logged-in user
- Sign out button
- Auto-debounce to prevent duplicate scans

### 4. **Success Screen**
- Confirmation of check-in/check-out
- Display of time and date
- Auto-return to scanner after 3 seconds
- Manual scan again button

## 🔐 Authentication Flow

```
1. User enters credentials on Login screen
2. POST /api/auth/login with username and password
3. Server returns JWT token
4. Token stored in AsyncStorage
5. Token attached to all subsequent requests via interceptor
6. User navigated to Scanner screen
7. On logout, token removed and user returned to Login
```

## 📡 API Integration

### Login Endpoint
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "employee1",
  "password": "password"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "employee1",
    "email": "employee1@example.com"
  }
}
```

### Attendance Scan Endpoint
```http
POST /api/attendance/scan
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "qrToken": "QR_CODE_VALUE"
}

Response (Check-in):
{
  "success": true,
  "message": "Check-In recorded successfully",
  "type": "checkin",
  "attendance": {
    "id": 1,
    "employeeId": "EMP001",
    "attendanceDate": "2024-05-13",
    "checkInTime": "08:30:00",
    "status": "present"
  }
}

Response (Check-out):
{
  "success": true,
  "message": "Check-Out recorded successfully",
  "type": "checkout",
  "attendance": {
    "id": 1,
    "employeeId": "EMP001",
    "checkOutTime": "17:30:00"
  }
}
```

## 🎨 UI/UX Features

### Theme System
- **Dark Theme** (default) - `colors.dark`
- **Light Theme** - `colors.light` (extensible)
- Consistent spacing, typography, and shadows

### Animations
- Scale and fade animations on splash screen
- Spring animations on success screen
- Smooth focus animations on scan
- Transition animations between screens

### User Feedback
- Toast alerts for success/error/warning
- Loading states on buttons
- Visual feedback on button press
- Haptic vibration feedback
- Audio confirmation sound

## 📁 Project Structure

```
smartattend-scanner/
├── src/
│   ├── screens/
│   │   ├── SplashScreen.jsx       # Intro screen with animation
│   │   ├── LoginScreen.jsx        # User authentication
│   │   ├── ScannerScreen.jsx      # QR scanner main screen
│   │   └── SuccessScreen.jsx      # Scan confirmation
│   │
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state management
│   │
│   ├── services/
│   │   └── api.js                 # Axios instance with interceptors
│   │
│   ├── components/
│   │   └── UIComponents.jsx       # Reusable UI components
│   │
│   ├── config/
│   │   ├── theme.js               # Color, spacing, typography
│   │   └── constants.js           # App constants and messages
│   │
│   └── utils/
│       └── helpers.js             # Utility functions
│
├── App.js                         # Root component
├── app.json                       # Expo configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory (optional):

```env
API_BASE_URL=http://10.0.2.2:5000/api
REQUEST_TIMEOUT=10000
VIBRATION_DURATION=500
SCAN_DEBOUNCE_TIME=2000
```

### API Configuration
Edit `src/config/theme.js`:

```javascript
export const API_BASE_URL = 'http://10.0.2.2:5000/api';
export const REQUEST_TIMEOUT = 10000;
```

## 🔐 Permissions

### Android Permissions Required
- **CAMERA** - For QR code scanning
- **VIBRATE** - For haptic feedback
- **INTERNET** - For API requests
- **RECORD_AUDIO** - For camera audio (optional)

These are automatically configured in `app.json`.

## 📝 Demo Credentials

For testing purposes:

```
Username: employee1
Password: password

Username: employee2
Password: password
```

(Configure these in your backend authentication system)

## 🐛 Troubleshooting

### Camera Permission Denied
- Android: Go to Settings → App Permissions → Camera → Allow
- Grant permission when prompted on first app launch

### Connection to Backend Failed
- **Emulator**: Ensure backend runs on `http://10.0.2.2:5000`
- **Physical Device**: Update API_BASE_URL with your PC's IP address
- **Check**: Backend server is running and accessible
- **Firewall**: Ensure port 5000 is open

### QR Code Not Scanning
- Clean camera lens
- Ensure adequate lighting
- QR code must be valid and within frame
- Check that QR contains proper employee token

### Token Expired
- Restart app to login again
- Token will be refreshed on each login
- Implement token refresh logic if needed (future enhancement)

## 📈 Performance Optimization

### Current Optimizations
- ✅ Debounced scan processing (2 second delay between scans)
- ✅ Axios request/response interceptors
- ✅ AsyncStorage for token persistence
- ✅ Memoized components
- ✅ Lazy animations

### Future Enhancements
- [ ] Redux for complex state management
- [ ] SQLite for offline sync
- [ ] Push notifications for attendance alerts
- [ ] Attendance history view
- [ ] Settings screen with timezone configuration
- [ ] Face recognition as backup authentication
- [ ] Multi-language support (i18n)
- [ ] Dark/light theme toggle

## 🚀 Building for Production

### Android APK
```bash
# Generate APK for distribution
eas build --platform android --build-type apk

# Or use Expo:
expo build:android -t apk
```

### Android App Bundle (Google Play)
```bash
# Generate AAB for Play Store
eas build --platform android --build-type app-bundle
```

## 📞 Support & Documentation

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Axios Docs**: https://axios-http.com/
- **AsyncStorage**: https://react-native-async-storage.github.io/

## 📄 License

This project is part of the SmartAttend attendance management system.

---

**SmartAttend Scanner v1.0.0** - Built with ❤️ using React Native & Expo
