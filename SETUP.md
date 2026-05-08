# 📦 SmartAttend Setup Guide

Complete step-by-step instructions for setting up the SmartAttend system with the new three-app architecture.

---

## ✅ Prerequisites

Ensure you have installed:
- **Node.js** 16+ → [Download](https://nodejs.org/)
- **npm** 8+ (comes with Node.js)
- **MySQL Server** 8.0+ → [Download](https://dev.mysql.com/downloads/mysql/)
  - Running on default port `3306`
  - User: `root`
  - Password: (empty or none)
  - ⚠️ **Note:** Database will be created automatically

Verify installations:
```bash
node --version      # Should be v16+
npm --version       # Should be v8+
mysql --version     # Should be v8.0+
```

---

## 🚀 Complete Setup (5 Minutes)

### Option A: Automated Setup (Recommended)

```bash
# 1. Navigate to project root
cd smartattend

# 2. Run setup command (installs all dependencies + creates database)
npm run setup

# 3. Start all three apps
npm start

# 4. Done! Open your browser:
# - Portal:  http://localhost:3000
# - Scanner: http://localhost:3001
# - Backend: http://localhost:5000 (API)
```

### Option B: Manual Setup

```bash
# 1. Install root dependencies
npm install

# 2. Setup Backend
cd backend-server
npm install
npm run initdb      # Initialize MySQL database
npm run dev         # Start backend (keep this running)
cd ..

# 3. Setup Admin & Employee Portal (new terminal)
cd admin-employee-portal
npm install
npm run dev         # Starts on http://localhost:3000
cd ..

# 4. Setup QR Scanner (new terminal)
cd qr-scanner-site
npm install
npm run dev         # Starts on http://localhost:3001
```

---

## 🔄 Migration from Old Structure

If you have existing code in the `client/` folder, follow these steps:

### Step 1: Copy Client Files to Admin Portal

```bash
# Copy src folder
cp -r client/src admin-employee-portal/

# Copy public folder (if exists)
cp -r client/public admin-employee-portal/

# Copy .env file (if exists)
cp client/.env admin-employee-portal/.env
```

**On Windows (PowerShell):**
```powershell
# Copy src folder
Copy-Item -Path "client/src" -Destination "admin-employee-portal/" -Recurse

# Copy public folder (if exists)
Copy-Item -Path "client/public" -Destination "admin-employee-portal/" -Recurse
```

### Step 2: Copy Server to Backend

```bash
# Copy server files to backend-server
cp -r server/* backend-server/

# Copy .env file
cp server/.env backend-server/.env
```

**On Windows:**
```powershell
Copy-Item -Path "server/*" -Destination "backend-server/" -Recurse
```

### Step 3: Verify Structure

```bash
# Verify folders exist
ls admin-employee-portal/src
ls qr-scanner-site/src
ls backend-server/server.js

# Or on Windows:
dir admin-employee-portal\src
dir qr-scanner-site\src
dir backend-server\server.js
```

### Step 4: Run Setup

```bash
npm run setup
```

---

## 📂 Expected Directory Structure

```
smartattend/
├── admin-employee-portal/
│   ├── src/                          ✅ From client/src
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── data/
│   ├── public/
│   ├── vite.config.js
│   ├── package.json
│   ├── index.html
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── qr-scanner-site/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── components/
│   │       └── QRScanner.jsx
│   ├── vite.config.js
│   ├── package.json
│   ├── index.html
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend-server/
│   ├── controllers/                  ✅ From server/controllers
│   ├── routes/                       ✅ From server/routes
│   ├── services/
│   ├── middleware/
│   ├── config/
│   ├── scripts/
│   ├── server.js                     ✅ From server/server.js
│   ├── package.json
│   └── .env
│
├── database/
│   └── schema.sql
│
└── package.json (root)
```

---

## 🔐 Environment Configuration

### Backend Server (.env)

Create `backend-server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smartattend
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1d
LATE_ATTENDANCE_TIME=09:00:00
VITE_API_URL=http://localhost:5000/api
```

### Frontend Apps

Create `.env` in both `admin-employee-portal/` and `qr-scanner-site/`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄️ Database Setup

### Automatic Setup
```bash
cd backend-server
npm run initdb
```

This will:
1. ✅ Create `smartattend` database
2. ✅ Create all required tables
3. ✅ Seed demo data
4. ✅ Create demo users

### Manual Setup

If automatic setup fails:
```bash
# 1. Connect to MySQL
mysql -u root

# 2. Run SQL commands
CREATE DATABASE smartattend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartattend;
source path/to/database/schema.sql;
```

---

## 👤 Demo Accounts

After database initialization, use these to login:

### Admin Account
```
Email: admin@smartattend.com
Password: admin123
Role: Admin
```

### Employee Accounts
```
Email: john@smartattend.com
Password: employee123
Role: Employee

Email: jane@smartattend.com
Password: employee123
Role: Employee

...and more (see database/schema.sql for complete list)
```

---

## 🚀 Running the Applications

### Option 1: Run All Together (Recommended)
```bash
npm start
```
This starts all three apps with one command:
- Backend: http://localhost:5000
- Portal: http://localhost:3000
- Scanner: http://localhost:3001

### Option 2: Run Individually
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Portal
npm run dev:portal

# Terminal 3 - Scanner
npm run dev:scanner
```

### Option 3: Run Specific Apps
```bash
cd backend-server && npm run dev    # Backend only
cd admin-employee-portal && npm run dev  # Portal only
cd qr-scanner-site && npm run dev    # Scanner only
```

---

## 🌐 Access Points

| Component | URL | Purpose |
|-----------|-----|---------|
| **Admin & Employee Portal** | http://localhost:3000 | Main web app |
| **QR Scanner Site** | http://localhost:3001 | QR scanning kiosk |
| **Backend API** | http://localhost:5000/api | REST API |
| **API Health** | http://localhost:5000/api/health | Server status |

---

## 🔍 Verify Everything Works

### Check Backend
```bash
curl http://localhost:5000/api/health
# Should return: {"success":true,"message":"SmartAttend API is running"}
```

### Check Database
```bash
mysql -u root smartattend
SHOW TABLES;
SELECT COUNT(*) FROM users;
EXIT;
```

### Check Frontend
Open http://localhost:3000 in your browser:
- Should show login page
- Try login with demo account
- Should redirect to dashboard

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9      # macOS/Linux
netstat -ano | findstr :3000        # Windows (find PID)
taskkill /PID <PID> /F             # Windows (kill process)

# Change port in vite.config.js
# Change port in package.json script
```

### Issue: Database Connection Error

```bash
# Verify MySQL is running
mysql -u root -e "SELECT 1"

# Check credentials in .env
# If password is needed, add to DB_PASSWORD

# Reinitialize database
cd backend-server
npm run initdb
```

### Issue: CORS Error in Frontend

```bash
# Ensure backend is running on port 5000
# Check VITE_API_URL in .env file
# Restart both backend and frontend
```

### Issue: Camera Not Working in Scanner

```bash
# Only works on HTTPS or localhost
# Mobile: Request camera permissions
# Desktop: Allow browser camera access
# Try in Chrome/Edge (better compatibility)
```

### Issue: Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For all apps
npm run install:all
```

---

## 📝 Common Commands

```bash
# Setup
npm run setup                    # Complete setup
npm run install:all            # Install all dependencies

# Development
npm start                       # Run all apps
npm run dev:backend           # Backend only
npm run dev:portal            # Portal only
npm run dev:scanner           # Scanner only

# Database
cd backend-server
npm run initdb               # Initialize database

# Build for Production
npm run build:all            # Build all apps
```

---

## 🚀 Next Steps

1. ✅ Setup complete - verify all apps running
2. ✅ Login with demo account on portal
3. ✅ Customize configuration (theme, settings)
4. ✅ Add real employees to database
5. ✅ Deploy to production (see deployment guide)

---

## 📚 Additional Resources

- [Architecture Overview](#README_ARCHITECTURE.md)
- [API Documentation](#) (Coming soon)
- [Frontend Guide](#) (Coming soon)
- [Deployment Guide](#) (Coming soon)

---

## 💡 Tips for Success

✅ **Use the same terminal window for all npm commands** to see logs from all apps  
✅ **Keep MySQL server running** throughout development  
✅ **Check .env files** if something isn't connecting  
✅ **Clear browser cache** if UI changes don't appear  
✅ **Restart apps** if database is modified  

---

## 🆘 Need Help?

If you encounter issues:
1. Check this guide
2. Review error messages in terminal
3. Check logs: `backend-server/server.js` output
4. Verify MySQL is running
5. Ensure all dependencies installed: `npm run install:all`
6. Restart all apps

---

**Last Updated:** May 8, 2026  
**Version:** 1.0.0
