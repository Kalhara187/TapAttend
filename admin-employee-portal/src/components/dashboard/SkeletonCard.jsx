export default function SkeletonCard() {
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

