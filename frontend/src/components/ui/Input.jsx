import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(function Input(
  { className, type = 'text', startAdornment, endAdornment, error, ...props },
  ref
) {
  if (startAdornment || endAdornment) {
    return (
      <div
        className={cn(
          'flex items-center w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-2xs transition-colors',
          error
            ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-400 focus-within:border-red-500'
            : 'border-slate-300 focus-within:ring-2 focus-within:ring-[#1B4D24]/20 focus-within:border-[#1B4D24]',
          className
        )}
      >
        {startAdornment && <span className="mr-2 text-slate-400 shrink-0">{startAdornment}</span>}
        <input
          ref={ref}
          type={type}
          className="w-full bg-transparent p-0 text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {endAdornment && <span className="ml-2 text-slate-400 shrink-0">{endAdornment}</span>}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-400'
          : 'border-slate-300 focus:border-[#1B4D24] focus:ring-[#1B4D24]/20',
        className
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea(
  { className, error, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-400'
          : 'border-slate-300 focus:border-[#1B4D24] focus:ring-[#1B4D24]/20',
        className
      )}
      {...props}
    />
  );
});
