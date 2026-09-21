import { cn } from '../../utils/cn';

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  icon,
  style,
  ...props
}) {
  const base =
    'inline-flex items-center font-bold tracking-tight rounded-md select-none transition-colors';

  const variants = {
    default: 'bg-slate-100 text-slate-800 border border-slate-200/80',
    primary: 'bg-[#1B4D24]/10 text-[#1B4D24] border border-[#1B4D24]/20',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border border-amber-200',
    danger: 'bg-red-50 text-red-800 border border-red-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
    outline: 'text-slate-700 border border-slate-300 bg-transparent',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1 leading-tight',
    sm: 'text-xs px-2 py-0.5 gap-1 leading-normal',
    md: 'text-xs px-2.5 py-1 gap-1.5 leading-normal',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={cn(base, variants[variant], sizes[size], className)}
      style={style}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
