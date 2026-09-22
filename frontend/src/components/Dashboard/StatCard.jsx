export default function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-150 hover:border-caparao-700/30 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-caparao-700">
              {icon}
            </div>
          )}
        </div>

        <div className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums leading-none mb-1.5">
          {value ?? '—'}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 leading-snug">
          {subtitle}
        </p>
      )}
    </div>
  );
}
