# Quick Start: Admin Employee Creation

## 🚀 How to Create Employee Accounts

### Via Admin Panel (Recommended)

1. **Log in as Admin**
   - Go to: http://localhost:3000/admin/dashboard
   - Login with: `admin` / `admin123`

2. **Navigate to Employee Management**
   - Click "Employee Management" in sidebar
   - Or go to: http://localhost:3000/admin/employees

3. **Click "+ Add Employee"**
   - Green button in top-right corner

4. **Fill the Form**
   ```
   Field              | Example Value      | Required
   ─────────────────────────────────────────────────
   Full Name          | John Doe           | ✓ Yes
   Email              | john@company.com   | ✓ Yes
   Department         | Engineering        | ✓ Yes
   Role               | Employee / Admin   | ✓ Yes (NEW!)
   Username           | johndoe            | Optional
   Password           | (auto-generated)   | Optional
   ```

5. **Click "Create Employee"**
   - System generates credentials
   - QR code displayed
   - Share with employee

---

## 📋 What Gets Generated

When you create an employee, the system automatically creates:

| Item | Example | Used For |
|------|---------|----------|
| **Employee ID** | EMP-0001 | Database tracking |
| **Username** | johndoe | Login credential |
| **Password** | 7K9mZ2wx | Login credential |
| **QR Token** | a3f91e2c... | QR code scanning |
| **QR Code** | (image) | Print & scan for attendance |

---

## 🎯 The New Role Field

### Options:
- **Employee** (Default)
  - Can scan QR codes for attendance
  - Can view own attendance history
  - Can request leaves
  - Limited dashboard access

- **Admin**
  - Full admin dashboard access
  - Can create other employees
  - Can manage all attendance
  - Can generate QR codes
  - Can view reports

### Example:
```
Creating a new IT Admin account:
├─ Full Name: Sarah Johnson
├─ Email: sarah@company.com
├─ Department: IT
├─ Role: Admin ← This is the new field!
├─ Username: sarahjohnson
└─ Auto-generate password: ✓
```

---

## ✅ Verification Checklist

After creating an employee, verify:

- [ ] Employee appears in Employee List
- [ ] Email is correct
- [ ] Role is set correctly (Employee/Admin)
- [ ] Username matches what you provided
- [ ] QR code displays
- [ ] Department is correct

---

## 🔒 Security Reminders

1. **Don't leave admin panel without sharing credentials**
   - Copy/note the generated password before closing modal
   - QR code should be printed or photographed

2. **Share securely**
   - Use secure channels to send password
   - Don't email plain text passwords
   - Consider encrypted communication

3. **Employee should change password on first login**
   - First login uses temporary password
   - Encourage users to set their own password

---

## ❌ Employee Registration is DISABLED

**Self-Registration**
- ❌ Employees CANNOT create their own accounts
- ❌ Registration page shows: "Accounts are created by admins"
- ❌ API endpoint returns: 403 Forbidden

**Why?**
- Maintains security
- Prevents unauthorized account creation
- Allows admin to verify employee details
- Ensures proper role assignment

---

## 🧪 Quick Test

### Test 1: Create Employee
1. Go to Admin Panel → Employee Management
2. Click "+ Add Employee"
3. Fill form with test data
4. Click "Create Employee"
5. **Result**: ✅ Employee created with credentials

### Test 2: View in List
1. Look at Employee List
2. Find newly created employee
3. **Result**: ✅ Employee appears in table

### Test 3: Login as Employee
1. Go to Login page
2. Use provided username & password
3. **Result**: ✅ Can log in and see employee dashboard

### Test 4: Try Self-Registration
1. Go to Register page
2. Attempt to create account
3. **Result**: ❌ Shows error (as expected)

---

## 🆘 Troubleshooting

**"Email already registered"**
- Error: User with that email already exists
- Solution: Use different email address

**"Username taken"**
- Error: Username already in use
- Solution: Leave username blank for auto-generation

**"Employee not appearing in list"**
- Solution: Click "Refresh" button
- Or reload page (F5)

**"Can't log in with provided credentials"**
- Verify email/username match what admin created
- Check for typos in password
- Case-sensitive: verify correct capitalization

---

## 📞 Support

For issues or questions:
1. Check the comprehensive guide: `ADMIN_EMPLOYEE_CREATION.md`
2. Review logs in browser console (F12)
3. Check server logs for backend errors

---

## 🔗 Related Pages

- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Employee List**: http://localhost:3000/admin/employees
- **QR Generator**: http://localhost:3000/admin/qr
- **Reports**: http://localhost:3000/admin/reports
- **Scanner Site**: http://localhost:3001

---

**Last Updated**: May 2026
**System Version**: TapAttend v1.0 (Admin-Only Creation)
