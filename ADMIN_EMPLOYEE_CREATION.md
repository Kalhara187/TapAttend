# Admin-Only Employee Creation System

## Overview
The TapAttend system has been configured to enforce **admin-only employee account creation**. Employees cannot self-register; only admins can create employee accounts through the Admin Panel.

---

## ✅ What Was Changed

### 1. **Employee Creation Form - Enhanced**
**Location**: `/client/src/pages/admin/EmployeeManagementPage.jsx` and `/admin-employee-portal/src/pages/admin/EmployeeManagementPage.jsx`

**Added Fields**:
- ✅ Employee Name (already existed)
- ✅ Email (already existed) 
- ✅ Department (already existed)
- ✅ **Role** (NEW) - Dropdown with options: Employee, Admin
- ✅ Username (auto-generate or custom)
- ✅ Password (auto-generate or custom)

**Form Features**:
```
┌─────────────────────────────────┐
│     Add Employee Modal          │
├─────────────────────────────────┤
│ Full Name: [________]           │
│ Email: [________]               │
│ Department: [▼] Operations      │
│ Role: [▼] Employee / Admin      │ ← NEW
│ Username: [________]            │
│ ☑ Auto-generate password        │
│ [Custom password field if ☐]    │
│                                 │
│ [Cancel] [Create Employee]      │
└─────────────────────────────────┘
```

### 2. **Backend Controller - Updated**
**Location**: 
- `/backend-server/controllers/adminController.js`
- `/server/controllers/adminController.js` (backup)

**Changes to `createEmployee` function**:
- ✅ Now accepts `role` parameter (default: 'employee')
- ✅ Validates role against allowed values: ['admin', 'employee']
- ✅ Stores selected role in database
- ✅ Includes role in generated QR code data
- ✅ Route protected by `requireAdmin` middleware

**Request Payload Example**:
```json
{
  "fullName": "John Doe",
  "email": "john@company.com",
  "department": "Engineering",
  "role": "employee",
  "username": "johndoe",
  "password": "CustomPassword123",
  "autoGeneratePassword": false
}
```

### 3. **Public Registration - Disabled**
**Location**: 
- `/backend-server/controllers/authController.js`
- `/server/controllers/authController.js` (backup)

**Changes to `register` endpoint**:
- ✅ POST `/api/auth/register` now returns `403 Forbidden`
- ✅ Error message: *"Employee accounts are created only by admins. Please contact your administrator."*
- ✅ Self-registration is completely disabled

### 4. **Employee Registration Page - Already Disabled**
**Location**: `/client/src/pages/auth/RegisterPage.jsx`

**Status**: ✅ Already displays admin-only message:
> *"Employee accounts are created by admins"*
> *"Use the Employee Management page to create usernames, passwords, and QR codes."*

---

## 🔒 Security Features

### Admin-Only Access
- All employee creation endpoints require authentication + admin role
- Protected by `requireAdmin` middleware on backend routes

### Data Validation
- Email uniqueness enforced in database
- Automatic password generation with crypto (6+ characters)
- Automatic username generation if not provided
- Role validation against whitelist

### Generated Artifacts
When an employee is created, the system automatically:
1. ✅ Creates user account in database
2. ✅ Generates unique Employee ID (EMP-0001, EMP-0002, etc.)
3. ✅ Creates QR code with embedded credentials
4. ✅ Generates unique username and/or password
5. ✅ Stores credentials securely (passwords hashed with bcrypt)

---

## 📋 Admin Employee Creation Workflow

### Step 1: Open Admin Panel
Navigate to: **http://localhost:3000/admin/employees** (or 3003 if port shifted)

### Step 2: Click "Add Employee"
Click the green "+ Add Employee" button in the top right

### Step 3: Fill Employee Details
- **Full Name**: Employee's full name (required)
- **Email**: Unique email address (required)
- **Department**: Select from dropdown
- **Role**: Select "Employee" or "Admin"
- **Username**: Leave blank for auto-generation or enter custom
- **Password**: Check "Auto-generate" or enter custom password

### Step 4: Create Employee
Click "Create Employee" button

### Step 5: View Credentials & QR Code
The system displays:
- ✅ Generated username
- ✅ Temporary password
- ✅ Employee ID (EMP-XXXX)
- ✅ QR code (can be printed or emailed)
- ✅ QR token for system

### Step 6: Share with Employee
- Share username and password securely
- Share or print QR code for attendance scanning
- Employee can now log in with provided credentials

---

## 👤 Employee Login

### First Login
Employees use credentials provided by admin:
```
Username: [provided by admin]
Password: [provided by admin]
```

### After Login
Employees can:
- ✅ View their attendance history
- ✅ Request leaves
- ✅ Scan QR codes for check-in/check-out
- ✅ View their profile and department info

---

## 🔑 Database Schema

The `users` table includes:
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(150) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  password VARCHAR(255) NOT NULL,
  account_status ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
  employee_id VARCHAR(50),
  qr_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing the Implementation

### Test Case 1: Admin Creating Employee
1. Log in as admin
2. Navigate to Employee Management
3. Click "Add Employee"
4. Fill in: John Doe | john@test.com | Engineering | Employee role
5. Click "Create Employee"
6. **Expected**: Employee created, QR code displayed

### Test Case 2: Public Registration Blocked
1. Navigate to Register page or POST to `/api/auth/register`
2. Attempt to create account manually
3. **Expected**: 403 Forbidden error with message

### Test Case 3: Employee Login
1. Use credentials provided by admin
2. Log in successfully
3. **Expected**: Employee dashboard loads

### Test Case 4: Role-Based Access
1. Create both Employee and Admin accounts from Admin Panel
2. Log in as Employee (limited access)
3. Log in as Admin (full admin access)
4. **Expected**: Different UI and permissions based on role

---

## 📝 API Endpoints

### Create Employee (Admin Only)
```
POST /api/admin/employees
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "email": "jane@company.com",
  "department": "Marketing",
  "role": "employee",
  "autoGeneratePassword": true
}

Response: {
  "success": true,
  "employee": { id, username, employeeId, ... },
  "generatedPassword": "ABC123XY",
  "qrToken": "abc123...",
  "qrData": "{...}"
}
```

### Get Employees List (Admin Only)
```
GET /api/admin/employees
Authorization: Bearer {token}

Response: [
  {
    id, username, employeeId, fullName, email, 
    department, role, accountStatus, registrationDate
  },
  ...
]
```

### Login (Public)
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "ABC123XY"
}

Response: {
  "token": "eyJhbGc...",
  "user": { id, username, name, email, role, ... }
}
```

### Register (Disabled)
```
POST /api/auth/register
→ Returns 403 Forbidden
  "Employee accounts are created only by admins."
```

---

## 🚀 Current Status

✅ **All features implemented and tested**

- [x] Email field present in employee creation form
- [x] Role field added (Employee/Admin selection)
- [x] Backend accepts and stores role
- [x] Public registration disabled
- [x] Admin-only employee creation enforced
- [x] QR codes generated automatically
- [x] Employees can log in with provided credentials
- [x] Employee registration page disabled
- [x] Database schema supports roles

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `/client/src/pages/admin/EmployeeManagementPage.jsx` | Frontend employee creation form |
| `/admin-employee-portal/src/pages/admin/EmployeeManagementPage.jsx` | Portal version of form |
| `/backend-server/controllers/adminController.js` | Backend employee creation logic |
| `/backend-server/controllers/authController.js` | Disabled public registration |
| `/client/src/pages/auth/RegisterPage.jsx` | Disabled registration UI |
| `/database/schema.sql` | Database schema with email & role fields |

---

## 🔐 Security Best Practices

1. ✅ Admin credentials verified before creation
2. ✅ Passwords hashed before storage (bcrypt)
3. ✅ Email uniqueness enforced
4. ✅ Role validation whitelisted
5. ✅ JWT tokens used for authentication
6. ✅ Public registration endpoint disabled
7. ✅ All admin routes protected by middleware

---

## ❓ FAQ

**Q: Can employees change their password?**
A: Check the updateMe endpoint in AuthContext for password change functionality.

**Q: What if admin forgets to share credentials?**
A: Credentials are displayed after creation. Admin should secure copy/print before modal closes.

**Q: Can role be changed after creation?**
A: Currently role is set at creation. Extend editEmployee endpoint if change is needed.

**Q: What happens if email already exists?**
A: System returns 409 Conflict error: "Email already registered"

**Q: Can employees register new accounts?**
A: No, the registration endpoint returns 403 Forbidden.

---

## 🛠️ Next Steps (Optional Enhancements)

- [ ] Email notification to employees with credentials
- [ ] Password reset functionality
- [ ] Bulk employee import from CSV
- [ ] Edit existing employee details (admin)
- [ ] Employee account deactivation/deletion (admin)
- [ ] Audit log of employee creations
- [ ] Multi-factor authentication for admin accounts
