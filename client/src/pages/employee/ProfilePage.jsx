import { useEffect, useMemo, useState } from 'react';
import { authApi, attendanceApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { login } = useAuth();
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    department: 'Operations',
    role: 'employee',
    accountStatus: 'Active',
    createdAt: '',
  });

  const joinedDate = useMemo(() => {
    if (!form.createdAt) return '-';
    return new Date(form.createdAt).toLocaleDateString();
  }, [form.createdAt]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          authApi.me(),
          attendanceApi.history(),
        ]);

        if (!mounted) return;

        const user = profileRes.data?.user || {};
        setForm({
          employeeId: user.employee_id || user.employeeId || '',
          name: user.name || '',
          email: user.email || '',
          department: user.department || 'Operations',
          role: user.role || 'employee',
          accountStatus: user.account_status || user.accountStatus || 'Active',
          createdAt: user.created_at || user.createdAt || '',
        });
        setHistory(historyRes.data?.history || []);
      } catch {
        if (!mounted) return;
        setError('Failed to load profile data');
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const updateAvatar = (event) => {
    const file = event.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await authApi.updateMe({
        name: form.name,
        email: form.email,
        department: form.department,
      });

      const updatedUser = response.data?.user;
      if (updatedUser) {
        const token = localStorage.getItem('smartattend_token');
        if (token) {
          login(
            {
              id: updatedUser.id,
              employeeId: updatedUser.employee_id,
              name: updatedUser.name,
              email: updatedUser.email,
              department: updatedUser.department,
              role: updatedUser.role,
              accountStatus: updatedUser.account_status,
              createdAt: updatedUser.created_at,
            },
            token
          );
        }
      }

      setMessage('Profile updated successfully');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <form onSubmit={onSave} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Profile</p>
        <div className="mt-5 flex flex-col items-center text-center">
          <img src={avatar} alt={form.name || 'Profile'} className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg" />
          <label className="mt-4 inline-flex cursor-pointer rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">
            Update photo
            <input type="file" accept="image/*" className="hidden" onChange={updateAvatar} />
          </label>
          <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900">{form.name || '-'}</h2>
          <p className="text-sm text-slate-500">{form.role} · {form.department}</p>
        </div>

        <div className="mt-5 grid gap-3">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Full name"
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="Email"
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <input
            name="department"
            value={form.department}
            onChange={onChange}
            placeholder="Department"
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
        </div>

        {message && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ['Employee ID', form.employeeId || '-'],
            ['Email', form.email || '-'],
            ['Department', form.department || '-'],
            ['Account Status', form.accountStatus || 'Active'],
            ['Join Date', joinedDate],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </form>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <h3 className="text-xl font-bold text-slate-900">Recent attendance</h3>
        <div className="mt-4 space-y-3">
          {history.slice(0, 6).map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{entry.attendance_date}</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{entry.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Check-in: {entry.check_in_time || '-'} · Check-out: {entry.check_out_time || '-'}</p>
            </div>
          ))}
          {history.length === 0 && <p className="text-sm text-slate-500">No attendance records yet.</p>}
        </div>
      </div>
    </div>
  );
}