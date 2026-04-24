# 🚀 SmartAttend – QR Based Employee Attendance System

## 📌 Overview

SmartAttend is a full-stack employee attendance management system that uses QR code scanning for fast and secure check-ins. It includes an admin dashboard, reporting tools, and smart tracking features to simulate a real-world HR system.

---

## 🛠️ Tech Stack

**Frontend:**

* React.js
* Axios
* Bootstrap / Tailwind CSS

**Backend:**

* Node.js
* Express.js

**Database:**

* MySQL

---

## ✨ Features

### 👨‍💼 Employee Side

* Scan QR code to mark attendance
* Instant check-in/check-out
* View attendance history

### 🧑‍💻 Admin Dashboard

* Generate dynamic QR codes
* View real-time attendance
* Manage employees
* Track late/early entries

### 📊 Reports

* Daily & monthly attendance reports
* Export data (CSV / Excel)
* Attendance analytics

---

## 🔐 Advanced Features

* Dynamic QR code (prevents misuse)
* Location-based validation (optional)
* Role-based authentication (Admin / Employee)
* Late/half-day calculation system

---

## 📁 Project Structure

/client   → React frontend
/server   → Node.js backend
/database → SQL scripts

Current scaffold in this workspace:

* `/client/src/components/RoleBasedNavbar.jsx` → Role-based navbar UI
* `/client/src/components/ProtectedRoute.jsx` → Route access guard by role
* `/client/src/config/navigation.js` → Admin/Employee menu configuration
* `/client/src/context/AuthContext.jsx` → Simple role auth state + theme toggle
* `/client/src/index.css` → Tailwind CSS entry file

---

## ⚙️ Installation & Setup

### Quick Start (Navbar Demo in this repo)

```bash
cd client
npm install
npm run dev
```

Demo behavior implemented:

* Role-based navbar (Admin vs Employee)
* Active page highlighting
* Protected routes for unauthorized page blocking
* Fixed top navbar + responsive hamburger menu
* Profile dropdown with role badge and logout
* Notification bell and dark/light mode toggle
* Tailwind CSS utility-based styling

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/smartattend.git
cd smartattend
```

### 2️⃣ Setup Backend

```bash
cd server
npm install
```

Create a `.env` file:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smartattend
JWT_SECRET=your_secret_key
```

Run server:

```bash
npm start
```

---

### 3️⃣ Setup Frontend

```bash
cd client
npm install
npm start
```

---

### 4️⃣ Setup Database

* Create MySQL database: `smartattend`
* Import SQL file from `/database`

---

## 🗄️ Database Tables

* employees
* attendance
* qr_codes
* leaves
* departments

---

## 📸 Screenshots (Add Later)

* Login Page
* QR Scanner
* Admin Dashboard
* Reports Page

---

## 🚀 Future Improvements

* Mobile app (React Native)
* Face recognition integration
* Email/SMS notifications
* Cloud deployment (AWS / Firebase)

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

Developed by [Your Name]

---
