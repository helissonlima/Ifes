import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Table = forwardRef(function Table({ className, ...props }, ref) {
  return (
    <div className="relative w-full overflow-auto rounded-xl border border-slate-200/90 bg-white shadow-2xs">
      <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
});

export const TableHeader = forwardRef(function TableHeader({ className, ...props }, ref) {
  return <thead ref={ref} className={cn('bg-slate-50/90 border-b border-slate-200', className)} {...props} />;
});

export const TableBody = forwardRef(function TableBody({ className, ...props }, ref) {
  return <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
});

export const TableHead = forwardRef(function TableHead({ className, ...props }, ref) {
  return (
    <th
      ref={ref}
      className={cn(
        'h-11 px-4 text-left align-middle font-bold text-slate-500 uppercase tracking-wider text-[11px] select-none',
        className
      )}
      {...props}
    />
  );
});

export const TableRow = forwardRef(function TableRow({ className, ...props }, ref) {
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-slate-100 transition-colors hover:bg-slate-50/70 data-[state=selected]:bg-slate-100',
        className
      )}
      {...props}
    />
  );
});

export const TableCell = forwardRef(function TableCell({ className, ...props }, ref) {
  return (
    <td
      ref={ref}
      className={cn('p-4 align-middle text-slate-700 text-sm [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  );
});
