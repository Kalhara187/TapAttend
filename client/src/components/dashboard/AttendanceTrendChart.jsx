import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function AttendanceTrendChart({ data, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = data?.map((item) => ({
    ...item,
    displayDate: formatDate(item.date),
  })) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <p className="mb-1 text-sm font-semibold text-slate-700">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className
