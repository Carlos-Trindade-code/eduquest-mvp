'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { getXpForNextLevel, getLevelTitle } from '@/lib/gamification/xp';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface XPBarProps {
  totalXp: number;
  compact?: boolean;
}

export function XPBar({ totalXp, compact = false }: XPBarProps) {
  const { currentLevel, xpInCurrentLevel, xpNeededForNext, progress } =
    getXpForNextLevel(totalXp);
  const title = getLevelTitle(currentLevel);
  const shouldReduceMotion = useReducedMotion();
  const percent = Math.min(progress * 100, 100);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <motion.span
          className="text-[var(--eq-accent)] font-bold text-xs"
          key={currentLevel}
          initial={shouldReduceMotion ? false : { scale: 1.5 }}
          animate={{ scale: 1 }}
        >
          Lv.{currentLevel}
        </motion.span>
        <Progress value={percent} showShimmer className="w-20" height="6px" />
        <span className="text-[var(--eq-text-muted)] text-xs">{totalXp} XP</span>
      </div>
    );
  }

  return (
    <div className="glass rounded-[var(--eq-radius)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Level badge */}
          <motion.div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white',
              'bg-gradient-to-br from-[var(--eq-xp-from)] to-[var(--eq-xp-to)]',
              'shadow-lg shadow-amber-500/20'
            )}
            key={currentLevel}
            initial={shouldReduceMotion ? false : { scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {currentLevel}
          </motion.div>
          <div>
            <p className="text-[var(--eq-text)] font-semibold text-sm">{title}</p>
            <p className="text-[var(--eq-text-secondary)] text-xs">
              Nivel {currentLevel}
            </p>
          </div>
        </div>
        <div className="text-right">
          <motion.p
            className="text-[var(--eq-accent)] font-bold text-sm"
            key={totalXp}
            initial={shouldReduceMotion ? false : { scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {totalXp} XP
          </motion.p>
          <p className="text-[var(--eq-text-secondary)] text-xs">
            {xpInCurrentLevel}/{xpNeededForNext}
          </p>
        </div>
      </div>
      <Progress value={percent} showShimmer />
    </div>
  );
}
