import { useMemo, useState } from 'react';
import { HiArrowDownTray } from 'react-icons/hi2';
import { mockAttendanceRecords } from '../../data/mockData';

const badgeStyles = {
  Present: 'bg-emerald-50 text-emerald-700',
  Late: 'bg-amber-50 text-amber-700',
  Absent: 'bg-rose-50 text-rose-700',
};

export default function AttendancePage() {
  const [date, setDate] = useState('2026-04-29');
  const [employee, setEmployee] = useState('All');
  const [department, setDepartment] = useState('All');

  const filtered = useMemo(
    () =>
      mockAttendanceRecords.filter((item) => {
        const matchesDate = !date || item.date === date;
        const matchesEmployee = employee === 'All' || item.employeeId === employee;
        const matchesDepartment = department === 'All' || item.department === department;
        return matchesDate && matchesEmployee && matchesDepartment;
      }),
    [date, employee, department]
  );

  const exportCsv = () => {
    const header = ['Employee ID', 'Name', 'Department', 'Date', 'Status', 'Check-In', 'Check-Out'];
    const rows = filtered.map((item) => [item.employeeId, item.name, item.department, item.date, item.status, item.checkIn, item.checkOut]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smartattend-attendance.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-[2rem] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Attendance</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Review all attendance records with filters and export.</h2>
          </div>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">
            <HiArrowDownTray className="h-5 w-5" /> Export CSV
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
          <select value={employee} onChange={(e) => setEmployee(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <option>All</option>
            {mockAttendanceRecords.map((item) => <option key={item.employeeId} value={item.employeeId}>{item.employeeId}</option>)}
          </select>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <option>All</option>
            {Array.from(new Set(mockAttendanceRecords.map((item) => item.department))).map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              {['Employee', 'Department', 'Date', 'Status', 'Check In', 'Check Out'].map((item) => <th key={item} className="px-5 py-4 font-semibold">{item}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.employeeId}</p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">{item.department}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{item.date}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[item.status] || badgeStyles.Present}`}>{item.status}</span></td>
                <td className="px-5 py-4 text-sm text-slate-600">{item.checkIn}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{item.checkOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}