import { cn } from '../../utils/cn';

export function Progress({ value = 0, max = 100, className, indicatorClassName, indicatorColor }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}
    >
      <div
        className={cn('h-full w-full flex-1 transition-all duration-300 rounded-full', indicatorClassName)}
        style={{
          transform: `translateX(-${100 - percentage}%)`,
          backgroundColor: indicatorColor || undefined,
        }}
      />
    </div>
  );
}

export default Progress;
