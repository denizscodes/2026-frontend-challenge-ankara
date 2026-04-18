import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-lg border border-border bg-card py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50',
              icon ? 'pl-10 pr-4' : 'px-4',
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
