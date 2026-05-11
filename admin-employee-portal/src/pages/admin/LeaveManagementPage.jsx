import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { leaveApi } from '../../services/api';

const initialForm = {
  type: 'Annual Leave',
  startDate: '',
  endDate: '',
  reason: '',
};

export default function LeaveManagementPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let mounted = true;
    
    const loadRequests = async () => {
      try {
        const res = await leaveApi.list();
        if (mounted && res.data?.success) {
          setRequests(Array.isArray(res.data.data) ? res.data.data : []);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    loadRequests();
    return () => { mounted = false; };
  }, []);

  const submitLeave = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
      };
      const res = await leaveApi.submit(payload);
      if (res.data?.success) {
        setForm(initialForm);
        const listRes = await leaveApi.list();
        if (listRes.data?.success) {
          setRequests(Array.isArray(listRes.data.data) ? listRes.data.data : []);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await leaveApi.update(id, { status });
      if (res.data?.success) {
        const listRes = await leaveApi.list();
        if (listRes.data?.success) {
          setRequests(Array.isArray(listRes.data.data) ? listRes.data.data : []);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const userRequests = requests.filter((request) => request.user_id || request.userId || request.employeeName === user?.name || request.employee === user?.name);

  if (user?.role === 'employee') {
    return (
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={submitLeave} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Apply Leave</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Submit a leave request</h2>
          <div className="mt-5 grid gap-4">
            <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3">
              {['Annual Leave', 'Sick Leave', 'Casual Leave', 'Remote Work'].map((item) => <option key={item}>{item}</option>)}
            </select>
            <div className="grid gap-4 md:grid-cols-2">
              <input type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3" />
              <input type="date" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3" />
            </div>
            <textarea value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))} rows={5} placeholder="Reason for leave" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <button type="submit" className="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-3 text-sm font-bold text-white">Submit request</button>
          </div>
        </form>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <h3 className="text-xl font-bold text-slate-900">Leave history</h3>
          <div className="mt-4 space-y-3">
            {userRequests.length === 0 && !loading && <p className="text-sm text-slate-500">No leave requests</p>}
            {userRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{request.type || 'Leave'}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{request.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{request.startDate} → {request.endDate}</p>
                <p className="mt-2 text-sm text-slate-600">{request.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Leave Approvals</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Review and manage employee leave requests</h2>
      {error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <div className="mt-5 space-y-4">
        {loading && <p className="text-sm text-slate-500">Loading requests...</p>}
        {!loading && requests.length === 0 && <p className="text-sm text-slate-500">No leave requests</p>}
        {requests.map((request) => (
          <div key={request.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{request.employee || request.employeeName || 'Employee'}</p>
                <p className="text-sm text-slate-500">{request.type || 'Leave'} · {request.startDate} → {request.endDate}</p>
                <p className="mt-1 text-sm text-slate-600">{request.reason}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(request.id, 'Approved')}
                  disabled={request.status === 'Approved'}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(request.id, 'Rejected')}
                  disabled={request.status === 'Rejected'}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}