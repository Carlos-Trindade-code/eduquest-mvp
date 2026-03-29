'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BadgeRarity } from '@/lib/gamification/badges';

interface BadgeCardProps {
  icon: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
  rarity?: BadgeRarity;
}

const rarityStyles: Record<BadgeRarity, { border: string; glow: string; label: string; labelColor: string }> = {
  common: {
    border: 'border-white/20',
    glow: '',
    label: 'Comum',
    labelColor: 'text-white/40',
  },
  rare: {
    border: 'border-blue-400/40',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    label: 'Raro',
    labelColor: 'text-blue-400',
  },
  epic: {
    border: 'border-purple-400/40',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]',
    label: 'Épico',
    labelColor: 'text-purple-400',
  },
  legendary: {
    border: 'border-amber-400/50',
    glow: 'shadow-[0_0_25px_rgba(251,191,36,0.25)]',
    label: 'Lendário',
    labelColor: 'text-amber-400',
  },
};

export function BadgeCard({
  icon,
  name,
  description,
  earned,
  earnedAt,
  rarity = 'common',
}: BadgeCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const styles = rarityStyles[rarity];

  return (
    <motion.div
      whileHover={earned ? { scale: 1.03, y: -2 } : undefined}
      className={cn(
        'relative rounded-[var(--eq-radius-sm)] p-3 transition-all border',
        earned
          ? cn('bg-[var(--eq-surface)]', styles.border, styles.glow)
          : 'bg-[var(--eq-surface)] border-white/5 opacity-50'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="relative">
          {earned ? (
            <motion.span
              className="text-3xl block"
              initial={shouldReduceMotion ? false : { scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            >
              {icon}
            </motion.span>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Lock size={14} className="text-white/30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-sm truncate', earned ? 'text-[var(--eq-text)]' : 'text-white/40')}>
            {name}
          </p>
          <p className={cn('text-xs truncate', earned ? 'text-[var(--eq-text-secondary)]' : 'text-white/40')}>
            {description}
          </p>
          {earned && earnedAt && (
            <p className="text-[var(--eq-accent)] text-xs mt-0.5 opacity-60">
              {new Date(earnedAt).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>

        {/* Rarity indicator */}
        {earned && rarity !== 'common' && (
          <span className={cn('text-[10px] font-bold uppercase', styles.labelColor)}>
            {styles.label}
          </span>
        )}
      </div>

      {/* Legendary shimmer effect */}
      {earned && rarity === 'legendary' && !shouldReduceMotion && (
        <div className="absolute inset-0 rounded-[var(--eq-radius-sm)] overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)',
              width: '50%',
            }}
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
}
