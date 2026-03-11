'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  showShimmer?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  height?: string;
}

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, showShimmer = false, gradientFrom, gradientTo, height, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative w-full overflow-hidden rounded-full bg-[var(--eq-surface)]',
      className
    )}
    style={{ height: height || 'var(--eq-xp-height)' }}
    {...props}
  >
    <ProgressPrimitive.Indicator asChild>
      <motion.div
        className="h-full rounded-full relative overflow-hidden"
        style={{
          background: `linear-gradient(90deg, ${gradientFrom || 'var(--eq-xp-from)'}, ${gradientTo || 'var(--eq-xp-to)'})`,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {showShimmer && (
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              width: '50%',
            }}
          />
        )}
      </motion.div>
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
));
Progress.displayName = 'Progress';

export { Progress };
