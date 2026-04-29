import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockLeaveRequests } from '../../data/mockData';

const initialForm = {
  type: 'Annual Leave',
  startDate: '',
  endDate: '',
  reason: '',
};

export default function LeaveManagementPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState(mockLeaveRequests);
  const [form, setForm] = useState(initialForm);

  const submitLeave = (event) => {
    event.preventDefault();
    setRequests((current) => [
      { id: Date.now(), employee: user?.name || 'You', ...form, status: 'Pending' },
      ...current,
    ]);
    setForm(initialForm);
  };

  const updateStatus = (id, status) => {
    setRequests((current) => current.map((request) => (request.id === id ? { ...request, status } : request)));
  };

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
            {requests.filter((request) => request.employee === user?.name || request.employee === 'You').map((request) => (
              <div key={request.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{request.type}</p>
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
      <div className="mt-5 space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{request.employee}</p>
                <p className="text-sm text-slate-500">{request.type} · {request.startDate} → {request.endDate}</p>
                <p className="mt-1 text-sm text-slate-600">{request.reason}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{request.status}</span>
                <button onClick={() => updateStatus(request.id, 'Approved')} className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Approve</button>
                <button onClick={() => updateStatus(request.id, 'Rejected')} className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}