export default function PageHeaderCard({
  title,
  subtitle,
  icon,
  titleAdornment,
  actions,
}) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition-shadow">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {icon && (
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-caparao-50 text-caparao-700">
                {icon}
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {titleAdornment}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}