# 🚀 SmartAttend - QR-Based Employee Attendance System

Professional multi-app architecture with separate admin/employee portal and QR scanner site.

---

## 📁 Project Structure

```
smartattend/
├── admin-employee-portal/    ← Main website (Admin + Employee Portal) - Port 3000
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── qr-scanner-site/          ← Dedicated QR Scanner Site - Port 3001
│   ├── src/
│   │   ├── components/
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend-server/           ← Node.js API Server - Port 5000
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── config/
│   ├── scripts/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── database/
│   └── schema.sql
│
├── README.md                 ← This file
├── package.json              ← Root package.json for convenience scripts
└── .env                      ← Environment variables
```

---

## 🏗️ Architecture Overview

### 1. **Admin & Employee Portal** (Port 3000)
Full-featured web application for:
- ✅ Admin Dashboard
- ✅ Employee Portal
- ✅ Attendance Management
- ✅ Leave Management
- ✅ Reports & Analytics
- ✅ Employee Directory

**Tech Stack:**
- React.js 18
- Vite
- Tailwind CSS
- Axios
- React Router

---

### 2. **QR Scanner Site** (Port 3001)
Lightweight, dedicated application for:
- ✅ Fast QR code scanning
- ✅ Camera access
- ✅ Real-time attendance marking
- ✅ Success/error notifications
- ✅ Torch/flashlight support
- ✅ Mobile-optimized

**Tech Stack:**
- React.js 18
- Vite
- Tailwind CSS
- html5-qrcode
- Axios

**Why Separate?**
- Faster load time (only scanner functionality)
- Can run on dedicated tablet/kiosk at office entrance
- Independent deployment
- Better UX for scanning task
- Professional separation of concerns

---

### 3. **Backend Server** (Port 5000)
Centralized Node.js API serving both apps:
- ✅ User Authentication (JWT)
- ✅ QR Code Generation
- ✅ Attendance Scanning
- ✅ Attendance History
- ✅ Leave Management
- ✅ Admin Reports
- ✅ Employee Management

**Tech Stack:**
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcryptjs (Password Hashing)

**Database:**
- MySQL
- Host: `localhost`
- User: `root`
- Password: (empty)
- Database: `smartattend`

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL Server (running locally on port 3306)
- Git

### Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/smartattend.git
cd smartattend

# Install root dependencies
npm install
```

### Step 2: Setup Database

```bash
# Navigate to backend server
cd backend-server

# Initialize database (creates tables and seeds demo data)
npm run initdb

# Return to root
cd ..
```

### Step 3: Start All Services (Recommended)

```bash
# From root directory - starts all three apps with one command
npm start

# Or start them individually:
npm run dev:backend
npm run dev:portal
npm run dev:scanner
```

### Step 4: Access the Apps

| App | URL | Purpose |
|-----|-----|---------|
| Admin & Employee Portal | http://localhost:3000 | Main website |
| QR Scanner Site | http://localhost:3001 | Scanning QR codes |
| Backend API | http://localhost:5000/api | API endpoints |
| Health Check | http://localhost:5000/api/health | Server status |

---

## 🔐 Authentication

### Default Demo Accounts

**Admin User:**
- Email: `admin@smartattend.com`
- Password: `admin123`

**Employee Users:**
- Email: `john@smartattend.com`
- Password: `employee123`

(See database schema for all seed accounts)

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register      → Register new user
POST   /api/auth/login         → Login user
GET    /api/auth/me            → Get current user
```

### Attendance (Employee)
```
POST   /api/attendance/scan    → Scan QR code (check-in/check-out)
GET    /api/attendance/history → Get personal attendance history
```

### Leaves (Employee)
```
GET    /api/leaves             → List user's leave requests
POST   /api/leaves             → Submit new leave request
PATCH  /api/leaves/:id         → Update leave request
```

### QR Codes (Admin)
```
POST   /api/qr/generate        → Generate QR code for employee
GET    /api/qr/history         → Get QR code generation history
```

### Admin Dashboard
```
GET    /api/admin/summary          → Dashboard statistics
GET    /api/admin/attendance-trends → Attendance trends
GET    /api/admin/employees        → List all employees
```

---

## 🔄 System Flow

```
1. Admin → Logs into Portal (3000) → Generates QR Code
   ↓
2. Admin shares tablet at entrance with Scanner Site (3001)
   ↓
3. Employee → Opens Scanner Site (3001)
   ↓
4. Employee → Starts Camera → Scans QR Code
   ↓
5. Scanner → POST to Backend (5000) → /api/attendance/scan
   ↓
6. Backend → Validates QR → Saves to MySQL
   ↓
7. Scanner → Shows Success Message
   ↓
8. Admin → Refreshes Portal (3000) → Sees Updated Attendance
```

---

## 📊 Database Schema

### Key Tables
- **users** - Admin and employee accounts
- **attendance** - Daily check-in/check-out records
- **qr_codes** - Generated QR codes with expiration
- **leaves** - Leave request submissions
- **departments** - Employee departments

---

## ⚙️ Environment Variables

### Backend Server (`.env`)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smartattend
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d
LATE_ATTENDANCE_TIME=09:00:00
```

### Frontend Apps
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Development Commands

### Root Level
```bash
npm start              # Start all three apps
npm run dev:backend    # Start backend only
npm run dev:portal     # Start portal only
npm run dev:scanner    # Start scanner only
```

### Backend
```bash
cd backend-server
npm install
npm run dev            # Start development server with nodemon
npm start              # Start production server
npm run initdb         # Initialize database
```

### Admin & Employee Portal
```bash
cd admin-employee-portal
npm install
npm run dev            # Start on port 3000
npm run build          # Build for production
```

### QR Scanner Site
```bash
cd qr-scanner-site
npm install
npm run dev            # Start on port 3001
npm run build          # Build for production
```

---

## 📱 QR Scanner Features

- **Real-time Scanning**: Uses html5-qrcode library
- **Camera Control**: Start, stop, and torch support
- **JWT Authentication**: Requires valid token to submit attendance
- **Instant Feedback**: Success/error alerts
- **Mobile Optimized**: Responsive design for tablets
- **Token Persistence**: Saves JWT locally for convenience
- **Last Scan Display**: Shows decoded QR data

---

## 🎯 Employee Portal Features

### Dashboard
- Today's attendance status
- Quick attendance history
- Leave balance
- Recent notifications

### Attendance History
- View all attendance records
- Check-in/check-out times
- Status (Present, Late, Absent, Half-day)
- Filter by date range

### Leave Management
- View leave balance
- Submit leave requests
- Track request status
- View approval history

### Profile
- Edit personal information
- Upload profile picture
- View employee details
- Department information

---

## 👨‍💼 Admin Dashboard Features

### Dashboard
- Today's attendance summary (Present, Late, Absent, Half-day)
- Attendance trends chart
- Employee list with status

### Attendance Management
- View all employee records
- Filter by date and department
- Manual adjustment capabilities

### QR Code Generation
- Generate employee-specific QR codes
- Set expiration time
- View generation history

### Employee Management
- Add/edit/delete employees
- Assign departments
- Manage roles

### Leave Approval
- Review pending leave requests
- Approve/reject leaves
- View approval history

### Reports
- Attendance statistics
- Monthly summaries
- Department-wise breakdown
- Export to CSV/PDF

---

## 🔐 Security Features

✅ **JWT Authentication**
- Secure token-based authentication
- 1-day token expiration
- Refresh token support (optional)

✅ **Password Hashing**
- bcryptjs with salt rounds
- Never stored as plain text

✅ **QR Code Security**
- Dynamic generation per employee
- Time-based expiration
- Single-use validation
- Token-based validation

✅ **Role-Based Access**
- Admin: Full access
- Employee: Limited to own data

✅ **CORS Protection**
- Configured for frontend origins
- Prevents unauthorized requests

---

## 🧪 Testing

### Manual Testing with cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@smartattend.com","password":"employee123"}'

# Scan attendance
curl -X POST http://localhost:5000/api/attendance/scan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qrData":"...","employeeId":"EMP001"}'
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000  # On macOS/Linux
netstat -ano | findstr :5000  # On Windows

# Kill process and retry
npm run dev
```

### Database connection error
```bash
# Verify MySQL is running
# Check .env file has correct credentials
# Run initialization script
npm run initdb
```

### Camera not working in Scanner
```bash
# Ensure HTTPS or localhost
# Check browser permissions for camera access
# Test on mobile/tablet for best compatibility
```

### API calls failing (CORS error)
```bash
# Verify backend is running on 5000
# Check VITE_API_URL in frontend .env
# Restart backend and frontend
```

---

## 📚 Documentation

For detailed information:
- [Backend API Docs](#) - API endpoint documentation
- [Frontend Guide](#) - React component structure
- [Database Schema](#) - SQL table definitions
- [Deployment Guide](#) - Production deployment steps

---

## 🚀 Deployment

### Local Deployment (Development)
```bash
npm start  # Runs all three apps locally
```

### Production Deployment
1. Build React apps:
   ```bash
   cd admin-employee-portal && npm run build
   cd ../qr-scanner-site && npm run build
   ```

2. Deploy to hosting:
   - Portal: Vercel, Netlify, or self-hosted
   - Scanner: Vercel, Netlify, or Raspberry Pi
   - Backend: Heroku, AWS, or self-hosted VPS

3. Update environment variables in deployed apps

---

## 📝 License

MIT License - Feel free to use for personal and commercial projects

---

## 👨‍💻 Contributing

Pull requests are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

## 📞 Support

For issues and questions:
- 📧 Email: support@smartattend.com
- 🐛 GitHub Issues: [Report Bug](#)
- 💬 Discord: [Join Community](#)

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MySQL Tutorial](https://dev.mysql.com/doc/)
- [JWT Authentication](https://jwt.io)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

---

## 🙏 Acknowledgments

- Built with ❤️ for HR teams and companies
- Inspired by modern SaaS architecture
- Thanks to open-source community

---

**Last Updated:** May 8, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
