import { Navigate, Route, Routes } from 'react-router-dom';
import RoleBasedNavbar from './components/RoleBasedNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import { useAuth } from './context/AuthContext';
import { ADMIN_MENU, EMPLOYEE_MENU } from './config/navigation';

function Page({ title, details }) {
  return (
    <section className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
        SmartAttend
      </p>
      <h1 className="mb-2 text-3xl font-bold text-slate-900">{title}</h1>
      <p className="text-slate-600">{details}</p>
    </section>
  );
}

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_90%_10%,rgba(249,115,22,0.12),transparent_40%),radial-gradient(circle_at_10%_20%,rgba(15,118,110,0.18),transparent_36%),#f7faf9]">
      {isAuthenticated && <RoleBasedNavbar />}
      <main className={`px-4 pb-7 ${isAuthenticated ? 'pt-28 md:px-6' : ''}`}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <AuthPage />
              )
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <Navigate
                  to={
                    user?.role === 'admin'
                      ? ADMIN_MENU[0].path
                      : EMPLOYEE_MENU[0].path
                  }
                  replace
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Page
                  title="Admin Dashboard"
                  details="Track live attendance, late arrivals, and company-level KPIs."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Page
                  title="Employee Management"
                  details="Add, edit, and organize employee records by department and status."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Page
                  title="Company Attendance"
                  details="Review attendance logs for all teams with advanced filters."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Page
                  title="Attendance Reports"
                  details="Generate daily and monthly reports for payroll and compliance."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/qr-generator"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Page
                  title="QR Generator"
                  details="Create time-bound QR codes for secure attendance check-ins."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leaves"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Page
                  title="Leave Requests"
                  details="Approve, reject, and audit employee leave applications."
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/scan-qr"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <Page
                  title="Scan QR"
                  details="Scan today's dynamic QR to mark your arrival or departure."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/my-attendance"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <Page
                  title="My Attendance"
                  details="Check your own attendance history with worked-hour summaries."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <Page
                  title="My Profile"
                  details="Update contact information and personal details securely."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/apply-leave"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <Page
                  title="Apply Leave"
                  details="Submit leave requests and monitor approval status."
                />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

