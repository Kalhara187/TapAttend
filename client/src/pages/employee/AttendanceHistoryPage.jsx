import { mockAttendanceHistory } from '../../data/mockData';

const statusStyles = {
  Present: 'bg-emerald-50 text-emerald-700',
  Late: 'bg-amber-50 text-amber-700',
  Absent: 'bg-rose-50 text-rose-700',
};

export default function AttendanceHistoryPage() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">My Attendance</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Attendance history and worked-hour summary</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              {['Date', 'Check-In', 'Check-Out', 'Duration', 'Status'].map((heading) => <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockAttendanceHistory.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4 text-sm text-slate-700">{row.date}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{row.checkIn}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{row.checkOut}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{row.duration}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status] || statusStyles.Present}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}