import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--eq-text-muted)]">
            {icon}
          </div>
          <input
            type={type}
            className={cn(
              'flex h-11 w-full rounded-[var(--eq-radius-sm)] bg-[var(--eq-surface)] border border-[var(--eq-surface-border)] pl-10 pr-4 py-2',
              'text-[var(--eq-font-size)] text-[var(--eq-text)] placeholder:text-[var(--eq-text-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--eq-primary)]/50 focus:border-[var(--eq-primary)]',
              'transition-all backdrop-blur-md',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-[var(--eq-radius-sm)] bg-[var(--eq-surface)] border border-[var(--eq-surface-border)] px-4 py-2',
          'text-[var(--eq-font-size)] text-[var(--eq-text)] placeholder:text-[var(--eq-text-muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--eq-primary)]/50 focus:border-[var(--eq-primary)]',
          'transition-all backdrop-blur-md',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
