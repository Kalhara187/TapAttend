import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiEnvelope,
  HiLockClosed,
  HiUser,
  HiArrowPath,
} from 'react-icons/hi2';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setFormError('');
    setErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'employee',
      rememberMe: false,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validate()) return;

    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Store token
      if (formData.rememberMe || !isLogin) {
        localStorage.setItem('smartattend_token', data.token);
      } else {
        sessionStorage.setItem('smartattend_token', data.token);
      }

      // Update auth context
      login(data.user, data.token);

      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/scan-qr', { replace: true });
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[radial-gradient(circle_at_90%_10%,rgba(249,115,22,0.12),transparent_40%),radial-gradient(circle_at_10%_20%,rgba(15,118,110,0.18),transparent_36%),#f7faf9]">
      {/* Left Panel - Branding */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-teal-700 to-emerald-600 p-10 text-white lg:flex lg:w-1/2 xl:w-5/12">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl bg-white/20 after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-3 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white" />
            <div>
              <p className="text-xl font-bold leading-none">SmartAttend</p>
              <span className="mt-1 block text-xs text-teal-100">
                QR Attendance System
              </span>
            </div>
          </div>
          <h2 className="mb-4 text-4xl font-bold leading-tight">
            Smart attendance
            <br />
            for modern teams
          </h2>
          <p className="max-w-sm text-base text-teal-100">
            Streamline your workforce attendance with dynamic QR codes,
            real-time tracking, and powerful admin insights.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm text-teal-50">
              Dynamic QR codes prevent buddy punching and ensure secure check-ins
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm text-teal-50">
              Role-based access for admins and employees with full audit trails
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm text-teal-50">
              Generate reports and analytics for payroll and compliance
            </p>
          </div>
        </div>

        <p className="text-xs text-teal-200">
          © {new Date().getFullYear()} SmartAttend. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2 xl:w-7/12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-teal-700 to-emerald-500 after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-3 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-white" />
            <div>
              <p className="text-lg font-bold text-slate-900">SmartAttend</p>
              <span className="text-xs text-slate-500">QR Attendance System</span>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Fill in your details to get started with SmartAttend'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => !isLogin && toggleMode()}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => isLogin && toggleMode()}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Error */}
          {formError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <FormInput
                id="name"
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                icon={HiUser}
                required
              />
            )}

            <FormInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={HiEnvelope}
              required
              autoComplete="email"
            />

            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="role" className="text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={HiLockClosed}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />

            {!isLogin && (
              <FormInput
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                icon={HiLockClosed}
                required
                autoComplete="new-password"
              />
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 accent-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-teal-700 transition hover:text-teal-600"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-all hover:shadow-xl hover:shadow-teal-900/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <HiArrowPath className="h-5 w-5 animate-spin" />
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="font-semibold text-teal-700 transition hover:text-teal-600"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

