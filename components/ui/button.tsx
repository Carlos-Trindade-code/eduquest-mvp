'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--eq-primary)] text-white hover:brightness-110 shadow-lg shadow-[var(--eq-primary)]/20',
        secondary:
          'bg-[var(--eq-surface)] text-[var(--eq-text)] border border-[var(--eq-surface-border)] hover:bg-[var(--eq-surface-hover)] backdrop-blur-md',
        ghost:
          'text-[var(--eq-text-secondary)] hover:bg-[var(--eq-surface)] hover:text-[var(--eq-text)]',
        accent:
          'bg-[var(--eq-accent)] text-gray-900 hover:brightness-110 shadow-lg shadow-[var(--eq-accent)]/20',
        danger:
          'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
      rounded: {
        default: 'rounded-[var(--eq-radius-sm)]',
        lg: 'rounded-[var(--eq-radius)]',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  animated?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, animated = true, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, rounded, className }))}
          ref={ref}
          {...props}
        />
      );
    }

    if (animated) {
      return (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          className={cn(buttonVariants({ variant, size, rounded, className }))}
          ref={ref}
          {...(props as HTMLMotionProps<'button'>)}
        />
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
