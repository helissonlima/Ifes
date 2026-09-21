import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { FiAlertCircle, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const iconMap = {
  success: FiCheckCircle,
  warning: FiAlertTriangle,
  error: FiAlertCircle,
  info: FiInfo,
};

export const Alert = forwardRef(function Alert(
  { className, variant = 'info', icon, title, action, children, ...props },
  ref
) {
  const IconComponent = icon || iconMap[variant] || FiInfo;

  const variants = {
    info: 'bg-sky-50/80 text-sky-900 border-sky-200/80 [&>svg]:text-sky-600',
    success: 'bg-emerald-50/80 text-emerald-950 border-emerald-200/80 [&>svg]:text-emerald-600',
    warning: 'bg-amber-50/80 text-amber-950 border-amber-200/80 [&>svg]:text-amber-600',
    error: 'bg-red-50/80 text-red-950 border-red-200/80 [&>svg]:text-red-600',
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-xl border p-4 text-sm flex gap-3 items-start',
        variants[variant],
        className
      )}
      {...props}
    >
      <span className="shrink-0 mt-0.5 text-base">
        {typeof IconComponent === 'function' ? <IconComponent /> : IconComponent}
      </span>
      <div className="flex-1 min-w-0">
        {title && <h5 className="font-bold leading-tight mb-1">{title}</h5>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
      {action && <div className="shrink-0 ml-2">{action}</div>}
    </div>
  );
});

export default Alert;
