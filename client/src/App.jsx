import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/admin/DashboardPage';
import EmployeeManagementPage from './pages/admin/EmployeeManagementPage';
import AttendancePage from './pages/admin/AttendancePage';
import ReportsPage from './pages/admin/ReportsPage';
import QrGeneratorPage from './pages/admin/QrGeneratorPage';
import LeaveManagementPage from './pages/admin/LeaveManagementPage';
import ScannerPage from './pages/employee/ScannerPage';
import AttendanceHistoryPage from './pages/employee/AttendanceHistoryPage';
import ProfilePage from './pages/employee/ProfilePage';
import EmployeeLeavePage from './pages/employee/LeavePage';

export default function App() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_90%_10%,rgba(249,115,22,0.12),transparent_40%),radial-gradient(circle_at_10%_20%,rgba(15,118,110,0.18),transparent_36%),#f7faf9]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
      />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/home" replace /> : <RegisterPage />} />

      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'employee']}>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          path="/home"
          element={
            <Navigate
              to={user?.role === 'admin' ? '/admin/dashboard' : '/employee/scan-qr'}
              replace
            />
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EmployeeManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/qr-generator"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <QrGeneratorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leaves"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LeaveManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/scan-qr"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <ScannerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/my-attendance"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <AttendanceHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/apply-leave"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeLeavePage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

