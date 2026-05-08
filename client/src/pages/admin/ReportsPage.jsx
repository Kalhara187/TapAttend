import { useEffect, useState } from 'react';
import { HiArrowDownTray } from 'react-icons/hi2';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { reportApi } from '../../services/api';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [monthlyRes, summaryRes] = await Promise.allSettled([
          reportApi.monthly(),
          reportApi.summary(),
        ]);

        if (!mounted) return;

        if (monthlyRes.status === 'fulfilled' && monthlyRes.value.data?.success) {
          setMonthlyData(Array.isArray(monthlyRes.value.data.data) ? monthlyRes.value.data.data : []);
        }

        if (summaryRes.status === 'fulfilled' && summaryRes.value.data?.success) {
          const data = summaryRes.value.data.data;
          setHighlights(Array.isArray(data) ? data : []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const intervalId = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const chartData = monthlyData.map((item) => ({
    month: item.month ? new Date(`${item.month}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A',
    present: item.present || 0,
    late: item.late || 0,
    absent: item.absent || 0,
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
        {loading && <p className="text-sm text-slate-500">Loading reports...</p>}
        {!loading && highlights.length === 0 && <p className="text-sm text-slate-500">No report data available</p>}
        {highlights.map((item) => (
          <div key={item.label || item.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
            <p className="text-sm font-medium text-slate-500">{item.label || 'Metric'}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{item.value || '-'}</p>
          </div>
        ))}
      </section>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Monthly trend</h3>
        {loading && <p className="text-sm text-slate-500">Loading chart...</p>}
        {!loading && chartData.length === 0 && <p className="text-sm text-slate-500">No monthly data available</p>}
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