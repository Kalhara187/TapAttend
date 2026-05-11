import { useCallback, useEffect, useState } from 'react';
import { attendanceApi } from '../../services/api';

const statusStyles = {
  present: 'bg-emerald-50 text-emerald-700',
  late: 'bg-amber-50 text-amber-700',
  absent: 'bg-rose-50 text-rose-700',
  half_day: 'bg-sky-50 text-sky-700',
};

function formatTime(value) {
  if (!value) return '-';
  return value.slice(0, 5);
}

export default function AttendanceHistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    const response = await attendanceApi.history();
    setRows(response.data?.history || []);
  }, []);

  useEffect(() => {
    let mounted = true;

    const safeLoad = async () => {
      try {
        await loadHistory();
      } catch {
        if (mounted) setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    safeLoad();
    const intervalId = setInterval(safeLoad, 15000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [loadHistory]);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">My Attendance</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Attendance history and worked-hour summary</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              {['Date', 'Check-In', 'Check-Out', 'Status'].map((heading) => <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-5 text-sm text-slate-500">No attendance records found.</td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4 text-sm text-slate-700">{row.attendance_date}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{formatTime(row.check_in_time)}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{formatTime(row.check_out_time)}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status] || statusStyles.present}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}