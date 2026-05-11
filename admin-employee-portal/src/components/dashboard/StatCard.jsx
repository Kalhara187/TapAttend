import { useMemo } from 'react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'teal',
  trend,
  trendLabel,
  loading = false,
}) {
  const colorClasses = useMemo(() => {
    const colors = {
      teal: 'from-teal-500 to-emerald-500 bg-teal-50 text-teal-700',
      blue: 'from-blue-500 to-indigo-500 bg-blue-50 text-blue-700',
      orange: 'from-orange-500 to-amber-500 bg-orange-50 text-orange-700',
      red: 'from-red-500 to-rose-500 bg-red-50 text-red-700',
      purple: 'from-purple-500 to-violet-500 bg-purple-50 text-purple-700',
      emerald: 'from-emerald-500 to-green-500 bg-emerald-50 text-emerald-700',
    };
    return colors[color] || colors.teal;
  }, [color]);

  const iconBgClass = colorClasses.split(' ').slice(0, 2).join(' ');
  const textClass = colorClasses.split(' ').slice(3).join(' ');

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5">
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-5 bg-gradient-to-br ${iconBgClass}`} />
      
      <div className="relative flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${iconBgClass} text-white shadow-lg`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {trend !== undefined && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  trend >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {trendLabel && (
            <p className="mt-0.5 text-xs text-slate-400">{trendLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}

