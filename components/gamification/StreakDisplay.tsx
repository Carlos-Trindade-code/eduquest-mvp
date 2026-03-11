'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  compact?: boolean;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  compact = false,
}: StreakDisplayProps) {
  const shouldReduceMotion = useReducedMotion();

  // Flame size/intensity based on streak
  const flameScale = currentStreak >= 14 ? 1.3 : currentStreak >= 7 ? 1.15 : 1;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <motion.span
          className={cn('text-base', !shouldReduceMotion && currentStreak >= 3 && 'animate-flame')}
          style={{ display: 'inline-block', transformOrigin: 'bottom center' }}
        >
          {currentStreak >= 3 ? '🔥' : '✨'}
        </motion.span>
        <span className="text-[var(--eq-text)] font-bold text-xs">{currentStreak}</span>
        <span className="text-[var(--eq-text-muted)] text-xs">dias</span>
      </div>
    );
  }

  return (
    <div className="glass rounded-[var(--eq-radius)] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Animated flame */}
          <motion.div
            className="text-3xl"
            animate={
              !shouldReduceMotion && currentStreak >= 3
                ? {
                    scale: [flameScale, flameScale * 1.1, flameScale],
                    rotate: [-2, 2, -2],
                  }
                : undefined
            }
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'bottom center' }}
          >
            {currentStreak >= 7 ? '🔥' : currentStreak >= 3 ? '🔥' : '✨'}
          </motion.div>
          <div>
            <motion.p
              className="text-[var(--eq-text)] font-bold text-lg"
              key={currentStreak}
              initial={shouldReduceMotion ? false : { scale: 1.3 }}
              animate={{ scale: 1 }}
            >
              {currentStreak} dias
            </motion.p>
            <p className="text-[var(--eq-text-secondary)] text-xs">Sequencia atual</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[var(--eq-text-muted)] font-semibold text-sm">{longestStreak}</p>
          <p className="text-[var(--eq-text-secondary)] text-xs">Recorde</p>
        </div>
      </div>

      {/* Weekly progress dots */}
      {currentStreak > 0 && (
        <div className="flex gap-1.5 mt-3">
          {Array.from({ length: 7 }).map((_, i) => {
            const filled = i < Math.min(currentStreak, 7);
            return (
              <motion.div
                key={i}
                className={cn(
                  'flex-1 h-2 rounded-full',
                  filled
                    ? 'bg-gradient-to-r from-orange-400 to-red-500'
                    : 'bg-[var(--eq-surface)]'
                )}
                initial={shouldReduceMotion || !filled ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                style={{ transformOrigin: 'left' }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
