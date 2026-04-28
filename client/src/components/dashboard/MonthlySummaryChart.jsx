import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const statusColors = {
  present: '#0d9488',   // teal-600
  late: '#f97316',      // orange-500
  absent: '#ef4444',    // red-500
  halfDay: '#f59e0b',   // amber-500
};

export default function MonthlySummaryChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-400">No monthly data available</p>
      </div>
    );
  }

  // Transform data for stacked/grouped bar chart
  const chartData = data.map((item) => ({
    month: item.month ? new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
    present: Number(item.present) || 0,
    late: Number(item.late) || 0,
    absent: Number(item.absent) || 0,
    halfDay: Number(item.halfDay) || 0,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Monthly Attendance Summary
          </h3>
          <p className="text-xs text-slate-500">
            Present vs Late vs Absent vs Half Day
          </p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
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
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            />
            <Bar dataKey="present" name="Present" fill={statusColors.present} radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" name="Late" fill={statusColors.late} radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" name="Absent" fill={statusColors.absent} radius={[4, 4, 0, 0]} />
            <Bar dataKey="halfDay" name="Half Day" fill={statusColors.halfDay} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

