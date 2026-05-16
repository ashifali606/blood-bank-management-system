export function SkeletonCard() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-slate-800 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-800 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse">
      <div className="w-10 h-10 bg-slate-800 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-800 rounded w-1/3" />
        <div className="h-3 bg-slate-800 rounded w-1/4" />
      </div>
    </div>
  );
}
