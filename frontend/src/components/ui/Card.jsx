import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Card = forwardRef(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-slate-200/90 bg-white text-slate-900 shadow-xs transition-shadow duration-150',
        className
      )}
      {...props}
    />
  );
});

export const CardHeader = forwardRef(function CardHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />;
});

export const CardTitle = forwardRef(function CardTitle({ className, children, ...props }, ref) {
  return (
    <h3
      ref={ref}
      className={cn('text-base font-bold leading-tight tracking-tight text-slate-900', className)}
      {...props}
    >
      {children}
    </h3>
  );
});

export const CardDescription = forwardRef(function CardDescription({ className, ...props }, ref) {
  return <p ref={ref} className={cn('text-xs text-slate-500 leading-normal', className)} {...props} />;
});

export const CardContent = forwardRef(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />;
});

export const CardFooter = forwardRef(function CardFooter({ className, ...props }, ref) {
  return <div ref={ref} className={cn('flex items-center p-5 pt-0', className)} {...props} />;
});

export default Card;

