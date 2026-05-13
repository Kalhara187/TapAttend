# 🚀 SmartAttend Scanner - Setup Guide

Complete setup instructions for the React Native Expo QR Attendance Scanner app.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Configuration](#configuration)
4. [Running the App](#running-the-app)
5. [Testing](#testing)
6. [Building for Production](#building-for-production)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js** v16+ (https://nodejs.org)
- **npm** v8+ (comes with Node.js)
- **Git** (for version control)
- **Java Development Kit (JDK)** 11+ (for Android development)
- **Android SDK** (for Android emulator)
- **Android Studio** (recommended)

### Optional Tools

- **Expo CLI**: `npm install -g expo-cli`
- **Android Emulator** or physical Android device (7.0+)
- **USB Cable** (for physical device testing)

### Backend Services

- SmartAttend backend server running on `http://localhost:5000`
- MySQL database configured and running
- Required tables: `users`, `employees`, `attendance`, `qr_codes`

## Development Setup

### Step 1: Install Node.js

1. Visit https://nodejs.org
2. Download LTS version
3. Install with default settings
4. Verify installation:

```bash
node --version
npm --version
```

### Step 2: Clone/Download Project

```bash
# Navigate to your projects directory
cd d:\project\TapAttend

# Project is already in smartattend-scanner folder
cd smartattend-scanner
```

### Step 3: Install Dependencies

```bash
# Install npm packages
npm install

# Or use yarn (if installed)
yarn install
```

This will install:
- React Native framework
- Expo SDK
- Required libraries (axios, navigation, camera, etc.)

### Step 4: Install Expo CLI (Recommended)

```bash
npm install -g expo-cli
```

Verify installation:
```bash
expo --version
```

## Configuration

### API Endpoint Configuration

1. **Open** `src/config/theme.js`

2. **For Android Emulator** (default):
```javascript
export const API_BASE_URL = 'http://10.0.2.2:5000/api';
```

3. **For Physical Android Device**:
   - Find your PC's IP address:
     - **Windows**: Run `ipconfig` in Command Prompt
     - **Mac/Linux**: Run `ifconfig`
   - Look for IPv4 Address (e.g., 192.168.1.10)
   - Update the URL:
```javascript
export const API_BASE_URL = 'http://192.168.1.10:5000/api';
```

### Verify Backend is Running

Before starting the app, ensure the backend server is running:

```bash
# From backend-server directory
npm start

# Expected output:
# 🚀 Server running on http://localhost:5000
```

### Test API Connectivity

Test the connection using curl or Postman:

```bash
curl http://localhost:5000/api/health

# Expected response:
# {"success":true,"message":"SmartAttend API is running"}
```

## Running the App

### Option 1: Android Emulator

#### Setup Android Emulator

1. **Open Android Studio**
2. Go to **AVD Manager** (Tools → Device Manager)
3. Click **Create Device**
4. Select a device (e.g., Pixel 4)
5. Select API level 30 or higher
6. Click **Finish**

#### Start Emulator

```bash
# List available devices
emulator -list-avds

# Start emulator
emulator -avd <device_name>

# Wait for emulator to fully boot (takes 1-2 minutes)
```

#### Run App on Emulator

```bash
# In smartattend-scanner directory
npm run android

# Or
expo run:android
```

### Option 2: Physical Android Device

#### Setup Device

1. **Enable Developer Mode**:
   - Go to Settings → About Phone
   - Tap Build Number 7 times
   - Go back to Settings → Developer Options
   - Enable USB Debugging

2. **Connect via USB**:
   - Connect device with USB cable
   - Allow USB debugging when prompted

3. **Verify Connection**:
```bash
adb devices
# Your device should appear in the list
```

#### Run App on Device

```bash
# In smartattend-scanner directory
npm run android

# Or
expo run:android
```

### Option 3: Expo Go (Recommended for Testing)

#### Using Expo Go App

1. **Install Expo Go**:
   - Open Google Play Store
   - Search for "Expo Go"
   - Install the app

2. **Start Expo Server**:
```bash
npm start

# Or
expo start
```

3. **Scan QR Code**:
   - Open Expo Go app
   - Scan the QR code shown in terminal
   - App will load automatically

## Testing

### Pre-Launch Checklist

- [ ] Backend server is running
- [ ] MySQL database is accessible
- [ ] API endpoints are responding
- [ ] Android emulator/device is connected
- [ ] Camera permissions are enabled
- [ ] API base URL is correctly configured

### Test Login

1. **Launch the app**
2. **Wait for splash screen** to disappear
3. **Enter credentials**:
   - Username: `employee1`
   - Password: `password`
4. **Click Sign In**
5. **Verify**: You should see the scanner screen

### Test QR Scanning

1. **Generate Test QR Code**:
   - Use https://www.qr-code-generator.com/
   - Encode: `QR_TOKEN_HERE`
   - Generate QR code

2. **Scan QR Code**:
   - Open the app
   - Point camera at QR code
   - Scan should trigger success screen

3. **Verify Database**:
   - Check MySQL `attendance` table
   - Should show check-in record with timestamp

### Test Check-Out

1. **Scan same QR code again**
2. **Verify**: Success message shows "Check-Out recorded"
3. **Check database**: `check_out_time` should be populated

### Test Duplicate Scan Prevention

1. **Scan QR code three times in quick succession**
2. **Expected**: Third scan should show error
3. **Message**: "Attendance already completed for today"

## Building for Production

### Generate Android APK

```bash
# Using Expo
eas build --platform android --build-type apk

# Or using local build
expo build:android -t apk
```

### Generate Android App Bundle (Play Store)

```bash
eas build --platform android --build-type app-bundle
```

### Build Locally (Advanced)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build locally
eas build --platform android --local
```

### Manual APK Build

```bash
# Export APK for testing
expo export --public-url https://example.com/app

# Build APK
npx react-native run-android --variant release
```

## Troubleshooting

### Issue: "Cannot connect to backend"

**Solutions**:
1. Verify backend is running: `http://localhost:5000/api/health`
2. Check API URL in `src/config/theme.js`
3. For emulator, ensure URL is `http://10.0.2.2:5000`
4. For physical device, use your PC's IP address
5. Check firewall settings (port 5000 must be open)

### Issue: "Camera permission denied"

**Solutions**:
1. Android: Settings → Apps → SmartAttend Scanner → Permissions → Camera → Allow
2. Uninstall and reinstall the app
3. Clear app cache and data

### Issue: "QR code not scanning"

**Solutions**:
1. Ensure good lighting
2. Clean camera lens
3. Verify QR code is valid (use https://www.qr-code-generator.com/)
4. QR code must contain text/token
5. Try zooming in or moving closer

### Issue: "Login fails with 401 error"

**Solutions**:
1. Verify credentials are correct
2. Check user exists in database
3. Verify backend authentication logic
4. Check token generation in backend
5. Restart backend server

### Issue: "Blank white screen after startup"

**Solutions**:
1. Ensure App.js is properly formatted
2. Check for JavaScript syntax errors: `npm start`
3. Clear Expo cache: `expo start --clear`
4. Restart emulator/device
5. Check React Native version compatibility

### Issue: "Out of Memory" on emulator

**Solutions**:
1. Allocate more RAM to emulator
2. Close other applications
3. Restart emulator
4. Clear app cache: `adb shell pm clear com.smartattend.scanner`

### Issue: "Module not found" error

**Solutions**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
expo start --clear

# Restart app
```

## Development Workflow

### Daily Setup

```bash
# 1. Start backend server (in backend-server directory)
npm start

# 2. Open new terminal, start Expo
cd smartattend-scanner
npm start

# 3. Scan QR code with phone or press 'i' for iOS/Android emulator
```

### Making Changes

1. **Edit component** in `src/`
2. **Save file**
3. **App automatically reloads** (hot reload)
4. **Test changes** on device

### Debugging

```bash
# View logs in terminal
npm start

# Device logs:
adb logcat | grep RN

# Or use React DevTools
# Shake device → Inspect Element
```

## Performance Tips

- Use **release builds** for testing performance
- Disable **fast refresh** during performance testing
- Monitor **memory usage** with Android Monitor
- Test with realistic **network conditions** (emulator can throttle)
- Use **Profiler** to identify bottlenecks

## Next Steps

1. **Customize branding** (colors, logo, app name)
2. **Add attendance history** screen
3. **Implement offline sync** with SQLite
4. **Add push notifications**
5. **Deploy to Google Play Store**
6. **Set up continuous deployment** (GitHub Actions)

---

For questions or issues, refer to:
- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Project README](./README.md)
