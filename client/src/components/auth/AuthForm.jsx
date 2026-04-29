import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowPath, HiEnvelope, HiLockClosed, HiUser, HiBuildingOffice2 } from 'react-icons/hi2';
import FormInput from '../FormInput';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

const roleOptions = [
  { label: 'Employee', value: 'employee' },
  { label: 'Admin', value: 'admin' },
];

export default function AuthForm({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Operations',
    role: 'employee',
    rememberMe: true,
  });

  const validate = () => {
    const nextErrors = {};

    if (!isLogin && !formData.name.trim()) nextErrors.name = 'Full name is required';
    if (!formData.email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Enter a valid email';
    if (!formData.password.trim()) nextErrors.password = 'Password is required';
    else if (formData.password.length < 6) nextErrors.password = 'Use at least 6 characters';
    if (!isLogin && formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    if (!isLogin && !formData.department.trim()) nextErrors.department = 'Department is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const response = isLogin
        ? await authApi.login({ email: formData.email, password: formData.password })
        : await authApi.register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            department: formData.department,
          });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('smartattend_token', data.token);
      login(data.user, data.token);

      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/employee/scan-qr', {
        replace: true,
      });
    } catch (authError) {
      setError(authError?.response?.data?.message || authError.message || 'Unable to complete authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLogin && (
        <FormInput
          id="name"
          label="Full Name"
          placeholder="Jane Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          icon={HiUser}
          required
        />
      )}

      <FormInput
        id="email"
        label="Email"
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-semibold text-slate-700">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <FormInput
            id="department"
            label="Department"
            placeholder="Operations"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
            icon={HiBuildingOffice2}
            required
          />
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
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 accent-teal-600"
          />
          Remember me on this device
        </label>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-600/25 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <HiArrowPath className="h-5 w-5 animate-spin" /> : null}
        {isLogin ? 'Sign in to SmartAttend' : 'Create account'}
      </button>
    </form>
  );
}