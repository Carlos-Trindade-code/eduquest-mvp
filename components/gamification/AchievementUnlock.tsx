'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BadgeDefinition } from '@/lib/gamification/badges';

interface AchievementUnlockProps {
  badge: BadgeDefinition | null;
  onDismiss: () => void;
}

export function AchievementUnlock({ badge, onDismiss }: AchievementUnlockProps) {
  useEffect(() => {
    if (!badge) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [badge, onDismiss]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          className="fixed top-4 left-1/2 z-[60] w-[90%] max-w-sm"
          initial={{ x: '-50%', y: -100, opacity: 0 }}
          animate={{ x: '-50%', y: 0, opacity: 1 }}
          exit={{ x: '-50%', y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="glass rounded-xl p-4 flex items-center gap-4 border border-amber-400/20 shadow-xl shadow-amber-500/10">
            {/* Badge icon */}
            <motion.span
              className="text-4xl block"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.2 }}
            >
              {badge.icon}
            </motion.span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-amber-300 text-xs font-bold uppercase tracking-wider">
                Conquista desbloqueada!
              </p>
              <p className="text-white font-semibold text-sm truncate">{badge.name}</p>
              <p className="text-white/50 text-xs truncate">{badge.description}</p>
            </div>

            {/* Close */}
            <button
              onClick={onDismiss}
              className="text-white/30 hover:text-white/60 transition-colors text-sm"
            >
              &times;
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
