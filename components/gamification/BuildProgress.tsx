// components/gamification/BuildProgress.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { getBuildForSubject, TOTAL_PIECES } from '@/lib/gamification/builds';

interface BuildProgressProps {
  subject: string;
  pieces: number; // 0 to TOTAL_PIECES
  milestoneMessage?: string | null;
}

export function BuildProgress({ subject, pieces, milestoneMessage }: BuildProgressProps) {
  const build = getBuildForSubject(subject);

  return (
    <div className="flex flex-col gap-1 mb-3 px-1">
      <div className="flex items-center gap-2">
        <span className="text-base leading-none shrink-0">{build.emoji}</span>
        <div className="flex gap-1 flex-1">
          {Array.from({ length: TOTAL_PIECES }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 h-2 rounded-full"
              style={{
                background:
                  i < pieces
                    ? 'linear-gradient(90deg, #8B5CF6, #A78BFA)'
                    : 'rgba(255,255,255,0.08)',
              }}
              initial={i === pieces - 1 ? { scale: 1.6, opacity: 0.5 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            />
          ))}
        </div>
        <span
          className="text-xs shrink-0 tabular-nums"
          style={{ color: 'rgba(240,244,248,0.35)' }}
        >
          {pieces}/{TOTAL_PIECES}
        </span>
      </div>

      <AnimatePresence>
        {milestoneMessage && (
          <motion.p
            className="text-xs text-center font-semibold"
            style={{ color: '#F5A623' }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            {milestoneMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
