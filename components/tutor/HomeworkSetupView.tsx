// components/tutor/HomeworkSetupView.tsx
'use client';

import { memo } from 'react';

import { motion } from 'framer-motion';
import { UserPlus, ClipboardList, Sparkles } from 'lucide-react';
import { HomeworkSetup } from './HomeworkSetup';
import { DailyChallenge } from '@/components/gamification/DailyChallenge';
import { ActivityCard } from '@/components/activities/ActivityCard';
import { QuizPlayer } from '@/components/activities/QuizPlayer';
import { getSubjectById } from '@/lib/subjects/config';
import { createClient } from '@/lib/supabase/client';
import { addXP, updateActivityStatus } from '@/lib/supabase/queries';
import type { AgeGroup, BehavioralProfile, ParentTask, GuidedActivity } from '@/lib/auth/types';

interface HomeworkSetupViewProps {
  isGuest: boolean;
  pendingTasks: ParentTask[];
  guidedActivities: GuidedActivity[];
  activeQuiz: GuidedActivity | null;
  ageGroup: AgeGroup;
  behavioralProfile: BehavioralProfile;
  profileId: string | undefined;
  onStart: (config: {
    homework: string;
    subject: string;
    ageGroup: AgeGroup;
    behavioralProfile: BehavioralProfile;
  }) => void;
  onStartDailyChallenge?: (config: {
    homework: string;
    subject: string;
    ageGroup: AgeGroup;
    behavioralProfile: BehavioralProfile;
  }) => void;
  onStartFromTask: (task: ParentTask) => void;
  onSetActiveQuiz: (quiz: GuidedActivity | null) => void;
  onQuizComplete: (activityId: string, xpEarned: number) => Promise<void>;
  onRemoveActivity: (activityId: string) => void;
}

export const HomeworkSetupView = memo(function HomeworkSetupView({
  isGuest,
  pendingTasks,
  guidedActivities,
  activeQuiz,
  ageGroup,
  behavioralProfile,
  profileId,
  onStart,
  onStartDailyChallenge,
  onStartFromTask,
  onSetActiveQuiz,
  onQuizComplete,
  onRemoveActivity,
}: HomeworkSetupViewProps) {
  return (
    <>
      {/* Daily Challenge */}
      {!isGuest && (
        <DailyChallenge
          ageGroup={ageGroup}
          onAccept={(subject, topic) => (onStartDailyChallenge ?? onStart)({
            homework: topic,
            subject,
            ageGroup,
            behavioralProfile,
          })}
        />
      )}

      {/* Guest trial banner */}
      {isGuest && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-xs"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <UserPlus size={14} className="text-purple-400 shrink-0" />
          <span style={{ color: 'rgba(240,244,248,0.6)' }}>
            Sessão gratuita de teste —{' '}
            <a href="/register?redirect=/tutor" className="text-purple-400 font-semibold hover:underline">
              crie uma conta
            </a>{' '}
            para continuar estudando
          </span>
        </div>
      )}
      {pendingTasks.length > 0 && (
        <div className="mb-4 space-y-3">
          <p className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
            <ClipboardList size={14} />
            Tarefas sugeridas
          </p>
          {pendingTasks.map((task) => {
            const subjectInfo = getSubjectById(task.subject);
            return (
              <motion.div
                key={task.id}
                className="glass rounded-[var(--eq-radius-sm)] p-4"
                style={{ border: '1px solid rgba(245,158,11,0.2)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{subjectInfo?.icon || '📚'}</span>
                  <span className="text-white text-sm font-semibold">{subjectInfo?.name || task.subject}</span>
                </div>
                <p className="text-white/60 text-xs mb-3">{task.description}</p>
                <button
                  onClick={() => onStartFromTask(task)}
                  className="w-full py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(99,102,241,0.8))',
                    color: 'white',
                  }}
                >
                  Começar esta tarefa
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
      {/* Guided activities from parents */}
      {guidedActivities.length > 0 && !activeQuiz && (
        <div className="mb-4 space-y-3">
          <p className="text-purple-400 text-xs font-bold flex items-center gap-1.5">
            <Sparkles size={14} />
            Atividades do pai/mãe
          </p>
          {guidedActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onStart={(a) => {
                if (a.activity_type === 'quiz' && a.questions) {
                  onSetActiveQuiz(a);
                  // Mark as in_progress
                  const supabase = createClient();
                  updateActivityStatus(supabase, a.id, {
                    status: 'in_progress',
                    started_at: new Date().toISOString(),
                  });
                } else {
                  // For reading/exercise/review, start a tutor session with context
                  const context = [
                    a.instructions ? `[Instruções do pai/mãe: ${a.title}]\n${a.instructions}` : '',
                  ].filter(Boolean).join('\n\n');
                  onStart({
                    homework: context,
                    subject: a.subject,
                    ageGroup,
                    behavioralProfile: 'default',
                  });
                }
              }}
            />
          ))}
        </div>
      )}
      {/* Active quiz */}
      {activeQuiz && activeQuiz.questions && (
        <QuizPlayer
          questions={activeQuiz.questions}
          subject={activeQuiz.subject}
          title={activeQuiz.title}
          parentNote={activeQuiz.parent_note}
          onComplete={async (score, total) => {
            const xpEarned = score * 10;
            const percentage = Math.round((score / total) * 100);
            const supabase = createClient();
            await updateActivityStatus(supabase, activeQuiz.id, {
              status: 'completed',
              kid_score: percentage,
              xp_earned: xpEarned,
              completed_at: new Date().toISOString(),
            });
            // Award XP
            if (profileId) {
              await addXP(supabase, profileId, xpEarned);
            }
            await onQuizComplete(activeQuiz.id, xpEarned);
          }}
          onClose={() => onSetActiveQuiz(null)}
        />
      )}
      {!activeQuiz && <HomeworkSetup onStart={onStart} />}
    </>
  );
});
