import { HiArrowDownTray } from 'react-icons/hi2';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { mockMonthlyAttendance, mockReportHighlights } from '../../data/mockData';

export default function ReportsPage() {
  const chartData = mockMonthlyAttendance.map((item) => ({
    month: new Date(`${item.month}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    present: item.present,
    late: item.late,
    absent: item.absent,
  }));

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-[2rem] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Reports</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Attendance analytics, summaries, and export-ready reports.</h2>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">
            <HiArrowDownTray className="h-5 w-5" /> Export Excel / CSV
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mockReportHighlights.map((item) => (
          <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Monthly trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="18%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#0f766e" radius={[10, 10, 0, 0]} />
              <Bar dataKey="late" fill="#f97316" radius={[10, 10, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}