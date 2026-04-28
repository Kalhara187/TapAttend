import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#0d9488', '#f97316', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6'];

export default function DepartmentChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-400">No department data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.name,
    value: Number(item.present) + Number(item.late) + Number(item.absent),
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">
          Department Distribution
        </h3>
        <p className="text-xs text-slate-500">
          Total attendance records by department
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} records (${((value / total) * 100).toFixed(1)}%)`, name]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '13px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '4px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
  );
}
