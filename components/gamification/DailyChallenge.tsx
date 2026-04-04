'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Check, Target } from 'lucide-react';
import { getDailyChallenge, isDailyChallengeCompleted } from '@/lib/gamification/daily-challenge';
import type { AgeGroup } from '@/lib/auth/types';

interface DailyChallengeProps {
  ageGroup: AgeGroup;
  onAccept: (subject: string, topic: string) => void;
}

export const DailyChallenge = memo(function DailyChallenge({ ageGroup, onAccept }: DailyChallengeProps) {
  const challenge = getDailyChallenge(ageGroup);
  const completed = isDailyChallengeCompleted();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 mb-4"
      style={{
        background: completed ? 'rgba(16,185,129,0.08)' : 'rgba(245,166,35,0.08)',
        border: `1px solid ${completed ? 'rgba(16,185,129,0.2)' : 'rgba(245,166,35,0.2)'}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: completed ? 'rgba(16,185,129,0.15)' : 'rgba(245,166,35,0.15)' }}
        >
          {completed ? <Check size={20} className="text-emerald-400" /> : <Target size={20} className="text-amber-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold">
            {completed ? 'Desafio concluído!' : 'Desafio do Dia'}
          </p>
          <p className="text-white/50 text-xs truncate">
            {challenge.subjectIcon} {challenge.topic} — {challenge.subjectName}
          </p>
        </div>
        {!completed && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
              <Zap size={12} /> +{challenge.xpBonus} XP
            </span>
            <button
              onClick={() => onAccept(challenge.subject, challenge.topic)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors"
            >
              Aceitar
            </button>
          </div>
        )}
        {completed && (
          <span className="text-emerald-400 text-xs font-bold">✅</span>
        )}
      </div>
    </motion.div>
  );
});
