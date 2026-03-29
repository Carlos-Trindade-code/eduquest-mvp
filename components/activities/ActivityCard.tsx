'use client';

import { motion } from 'framer-motion';
import { FileQuestion, BookOpen, PenLine, RotateCcw, MessageSquare, ArrowRight } from 'lucide-react';
import { getSubjectById } from '@/lib/subjects/config';
import { useAgeTheme } from '@/components/providers/AgeThemeProvider';
import type { GuidedActivity } from '@/lib/auth/types';

const typeIcons: Record<string, React.ReactNode> = {
  quiz: <FileQuestion size={18} />,
  reading: <BookOpen size={18} />,
  exercise: <PenLine size={18} />,
  review: <RotateCcw size={18} />,
};

const typeLabels: Record<string, string> = {
  quiz: 'Quiz',
  reading: 'Leitura',
  exercise: 'Exercicio',
  review: 'Revisao',
};

interface ActivityCardProps {
  activity: GuidedActivity;
  onStart: (activity: GuidedActivity) => void;
}

export function ActivityCard({ activity, onStart }: ActivityCardProps) {
  const { tokens } = useAgeTheme();
  const isYoungKid = tokens.animationIntensity === 'high';
  const subjectInfo = getSubjectById(activity.subject);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="glass rounded-2xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer"
      onClick={() => onStart(activity)}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0 text-purple-300">
          {typeIcons[activity.activity_type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-white font-semibold truncate ${isYoungKid ? 'text-base' : 'text-sm'}`}>
              {activity.title}
            </p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-300 shrink-0">
              {typeLabels[activity.activity_type]}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {subjectInfo && (
              <span className="text-[11px]" style={{ color: subjectInfo.color }}>
                {subjectInfo.icon} {subjectInfo.name}
              </span>
            )}
          </div>
          {activity.parent_note && (
            <div className="flex items-center gap-1.5 mt-2 bg-blue-500/10 rounded-lg px-2.5 py-1.5">
              <MessageSquare size={12} className="text-blue-400 shrink-0" />
              <p className="text-blue-300/80 text-xs truncate">{activity.parent_note}</p>
            </div>
          )}
        </div>
        <div className="flex items-center text-purple-400/60">
          <ArrowRight size={16} />
        </div>
      </div>
    </motion.div>
  );
}
