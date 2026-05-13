# 🚀 SmartAttend Scanner - Quick Start Guide

Get the mobile QR attendance scanner running in 5 minutes!

## Prerequisites

✅ **Already Installed**:
- Node.js v16+ 
- npm
- SmartAttend backend running on `http://localhost:5000`

❌ **If Not Installed**:
- Download Node.js from https://nodejs.org
- Install SmartAttend backend first

## ⚡ Quick Start (5 Steps)

### 1️⃣ Install Dependencies

```bash
cd d:\project\TapAttend\smartattend-scanner
npm install
```

**Time**: ~2-3 minutes

### 2️⃣ Configure Backend URL

For Android Emulator (default - no changes needed):
```
API_BASE_URL = http://10.0.2.2:5000/api ✓
```

For Physical Android Device:
1. Find your PC IP: Open Command Prompt, run `ipconfig`
2. Edit `src/config/theme.js`
3. Change URL:
```javascript
export const API_BASE_URL = 'http://YOUR.IP.HERE:5000/api';
// Example: http://192.168.1.10:5000/api
```

### 3️⃣ Verify Backend is Running

```bash
curl http://localhost:5000/api/health
```

Expected output:
```json
{"success":true,"message":"SmartAttend API is running"}
```

### 4️⃣ Start Expo Server

```bash
npm start
```

You should see:
```
Expo DevTools is running at http://localhost:19000
Press 'i' for iOS, 'a' for Android, 'w' for web
```

### 5️⃣ Run on Device/Emulator

**Option A: Android Emulator**
```bash
Press 'a' in terminal
# Or manually:
npm run android
```

**Option B: Physical Android Device**
1. Install "Expo Go" from Google Play Store
2. Scan QR code shown in terminal
3. App opens automatically

**Option C: Physical Device with Web**
```bash
npm run web
```

## ✅ Test the App

1. **Login**:
   - Username: `employee1`
   - Password: `password`
   - Click "Sign In"

2. **Scanner Screen**:
   - Point camera at QR code
   - Scan should succeed
   - See success screen

3. **Verify in Database**:
   ```sql
   SELECT * FROM attendance WHERE employee_id = 'EMP001';
   ```
   Should show your check-in record

## 📱 App Flow

```
Splash (2 sec) 
    ↓
Login Screen
    ↓ (enter username/password)
Scanner Screen
    ↓ (scan QR code)
Success Screen
    ↓ (auto return after 3 sec)
Scanner Screen (ready for next scan)
```

## 🎯 First QR Code Test

Need a QR code to test?

### Option 1: Generate Free QR Code
1. Visit https://www.qr-code-generator.com/
2. Enter text: `QR_TEST_TOKEN`
3. Download QR code
4. Print or display on screen
5. Scan with app

### Option 2: Use Existing QR Codes
1. Check your database for existing QR codes:
   ```sql
   SELECT code FROM qr_codes LIMIT 5;
   ```
2. Generate QR code from the `code` value
3. Scan with app

## 🔧 Common Issues & Quick Fixes

| Issue | Solution |
|-------|----------|
| "Cannot connect to backend" | Make sure backend is running: `npm start` in backend directory |
| "Android emulator won't start" | Open Android Studio → Device Manager → Start device |
| "Camera permission denied" | Android: Settings → Apps → SmartAttend → Permissions → Allow Camera |
| "QR code won't scan" | Ensure good lighting, clean lens, QR is valid |
| "Login fails" | Verify credentials exist in database, check backend logs |
| "Blank white screen" | Clear Expo cache: `expo start --clear` |

## 📚 Next Steps

After successful test:

1. **Customize** (Optional):
   - Change app colors in `src/config/theme.js`
   - Update app name in `app.json`
   - Change API timeout if needed

2. **Add Assets** (Optional):
   - Add success.wav sound to `src/assets/`
   - Add icon.png (1024x1024) to `src/assets/`
   - See `src/assets/README.md` for details

3. **Deploy** (When Ready):
   - Build APK: `eas build --platform android --build-type apk`
   - Test on multiple devices
   - Submit to Google Play Store

4. **Enable Features** (Future):
   - Attendance history screen
   - Settings page
   - Offline sync
   - Push notifications

## 📖 Full Documentation

- **README.md** - Complete feature overview
- **SETUP_GUIDE.md** - Detailed installation & troubleshooting
- **FEATURES.md** - Feature documentation & development guide
- **src/assets/README.md** - How to add sounds/icons

## 🆘 Get Help

1. **Check the logs** in terminal
2. **Review documentation** above
3. **Check backend logs** for API errors
4. **Clear cache**: `expo start --clear`
5. **Restart everything**: Stop Expo, backend, and emulator

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Install dependencies | 2-3 min |
| Configure API URL | 1 min |
| Start Expo server | 1 min |
| Start emulator | 2-3 min |
| First test run | 1 min |
| **Total** | **~10 min** |

## 🎉 Success Indicators

✅ You'll know it's working when:
- Login succeeds and shows scanner screen
- QR scan shows success message
- Database receives attendance record
- App returns to scanner automatically
- No errors in console

## 💡 Pro Tips

1. **Keep terminal open** while developing
2. **Use Expo Go app** for quick testing
3. **Test on real device** before release
4. **Check backend logs** if API fails
5. **Use Chrome DevTools** for debugging (web version)

## 🚀 You're All Set!

The SmartAttend Scanner app is production-ready. Now it's just:
1. Install dependencies
2. Configure backend URL
3. Run the app
4. Test it!

**Happy scanning! 📱✨**

---

### Still have questions?
Check the full docs:
- [README.md](./README.md)
- [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- [FEATURES.md](./FEATURES.md)
