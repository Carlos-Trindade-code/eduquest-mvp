// components/gamification/BadgeToast.tsx
'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBadgeById } from '@/lib/gamification/badges';

interface BadgeToastProps {
  badgeIds: string[];
  onClose: () => void;
}

const rarityColors: Record<string, string> = {
  common: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F5A623',
};

export function BadgeToast({ badgeIds, onClose }: BadgeToastProps) {
  const badge = getBadgeById(badgeIds[0]);
  // Use ref to avoid restarting the timer when onClose reference changes
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (badgeIds.length === 0) return;
    const t = setTimeout(() => onCloseRef.current(), 4000);
    return () => clearTimeout(t);
  }, [badgeIds.length]); // only re-run when count changes, not on every render

  const color = badge ? (rarityColors[badge.rarity] || '#F5A623') : '#F5A623';

  return (
    <AnimatePresence>
      {badge && badgeIds.length > 0 && (
        <motion.button
          key="badge-toast"
          onClick={onClose}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-left max-w-[240px]"
          style={{ background: '#1A2E42', border: `1px solid ${color}40` }}
          initial={{ opacity: 0, x: 80, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <span className="text-3xl leading-none">{badge.icon}</span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color }}>
              Badge Ganho!
            </p>
            <p className="text-white text-sm font-semibold truncate">{badge.name}</p>
          </div>
          {badgeIds.length > 1 && (
            <span className="text-xs shrink-0 ml-auto pl-2" style={{ color: 'rgba(240,244,248,0.4)' }}>
              +{badgeIds.length - 1}
            </span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
