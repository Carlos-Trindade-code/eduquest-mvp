import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--eq-surface)] text-[var(--eq-text)] border border-[var(--eq-surface-border)]',
        primary: 'bg-[var(--eq-primary)]/20 text-[var(--eq-primary-light)] border border-[var(--eq-primary)]/30',
        secondary: 'bg-[var(--eq-secondary)]/20 text-[var(--eq-secondary)] border border-[var(--eq-secondary)]/30',
        accent: 'bg-[var(--eq-accent)]/20 text-[var(--eq-accent)] border border-[var(--eq-accent)]/30',
        success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        danger: 'bg-red-500/20 text-red-300 border border-red-500/30',
      },
      size: {
        sm: 'text-xs px-2 py-0.5 rounded-md',
        md: 'text-sm px-2.5 py-1 rounded-lg',
        lg: 'text-base px-3 py-1.5 rounded-xl',
      },
      rarity: {
        common: '',
        rare: 'shadow-[0_0_10px_rgba(59,130,246,0.3)]',
        epic: 'shadow-[0_0_15px_rgba(139,92,246,0.4)] animate-pulse-glow',
        legendary: 'shadow-[0_0_20px_rgba(251,191,36,0.5)] border-amber-400/50',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, rarity, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, rarity }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
