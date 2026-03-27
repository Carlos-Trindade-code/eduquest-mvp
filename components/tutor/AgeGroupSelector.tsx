'use client';

import { motion } from 'framer-motion';
import { ageConfigs } from '@/lib/age/config';
import { cn } from '@/lib/utils';
import type { AgeGroup } from '@/lib/auth/types';

interface AgeGroupSelectorProps {
  selected: AgeGroup;
  onSelect: (group: AgeGroup) => void;
  label?: string;
}

const ageColors: Record<AgeGroup, string> = {
  '4-6': '#8B5CF6',
  '7-9': '#3B82F6',
  '10-12': '#14B8A6',
  '13-15': '#6366F1',
  '16-18': '#6366F1',
};

export function AgeGroupSelector({
  selected,
  onSelect,
  label = 'Qual sua idade?',
}: AgeGroupSelectorProps) {
  const groups = Object.values(ageConfigs);

  return (
    <div className="mb-5">
      <p className="text-[var(--eq-text-secondary)] text-sm mb-3 font-medium">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {groups.map((config) => {
          const isSelected = selected === config.ageGroup;
          const color = ageColors[config.ageGroup];
          return (
            <motion.button
              key={config.ageGroup}
              onClick={() => onSelect(config.ageGroup)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2.5 rounded-[var(--eq-radius-sm)] text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
                isSelected
                  ? 'text-white font-semibold'
                  : 'bg-[var(--eq-surface)] text-[var(--eq-text-muted)] hover:bg-[var(--eq-surface-hover)] hover:text-[var(--eq-text)]'
              )}
              style={
                isSelected
                  ? {
                      background: `${color}25`,
                      boxShadow: `0 0 15px ${color}20`,
                    }
                  : undefined
              }
            >
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-[var(--eq-radius-sm)] border-2"
                  style={{ borderColor: color }}
                  layoutId="age-selector"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{config.emoji}</span>
              <span className="relative z-10 font-medium">{config.ageGroup}</span>
              <span className="relative z-10 text-xs opacity-60 hidden sm:inline">
                {config.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
