'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCcw, Sparkles } from 'lucide-react';
import { HomeworkSetup } from './HomeworkSetup';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { SessionSummary } from './SessionSummary';
import { AgeThemeProvider } from '@/components/providers/AgeThemeProvider';
import { XPBar } from '@/components/gamification/XPBar';
import { BadgeUnlockModal } from '@/components/gamification/BadgeUnlockModal';
import { useChatSession } from '@/hooks/useChatSession';
import { useAuth } from '@/hooks/useAuth';
import { getSubjectById } from '@/lib/subjects/config';
import { SubjectIcon } from '@/components/illustrations/SubjectIcons';
import { createClient } from '@/lib/supabase/client';
import { getUserStats, addXP, checkAndAwardBadges } from '@/lib/supabase/queries';
import type { AgeGroup, BehavioralProfile } from '@/lib/auth/types';

interface ChatInterfaceProps {
  labels?: {
    changeHomework: string;
    typeAnswer: string;
    greeting: string;
  };
}

const defaultLabels = {
  changeHomework: 'trocar',
  typeAnswer: 'Digite sua resposta...',
  greeting:
    'Oi! Vamos resolver esse dever juntos!\n\nLi sua tarefa: "{homework}"\n\nPor onde voce acha que devemos comecar?',
};

export function ChatInterface({ labels }: ChatInterfaceProps) {
  const [homework, setHomework] = useState('');
  const [subject, setSubject] = useState('other');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('10-12');
  const [behavioralProfile, setBehavioralProfile] = useState<BehavioralProfile>('default');
  const [homeworkSet, setHomeworkSet] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionMessageCount, setSessionMessageCount] = useState(0);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const l = { ...defaultLabels, ...labels };
  const { profile } = useAuth();

  // Load XP from user_stats table
  useEffect(() => {
    if (profile?.id) {
      const supabase = createClient();
      getUserStats(supabase, profile.id).then(({ data }) => {
        if (data) setTotalXp(data.total_xp);
      });
    }
  }, [profile]);

  const handleCloseBadgeModal = useCallback(() => setNewBadgeIds([]), []);

  const handleXPEarned = useCallback(async (xp: number) => {
    setTotalXp(prev => prev + xp);
    setXpGained(xp);
    setTimeout(() => setXpGained(null), 2000);

    // Persist XP to user_stats table
    if (profile?.id) {
      const supabase = createClient();
      await addXP(supabase, profile.id, xp);

      // Verifica e concede novos badges automaticamente
      const earnedBadgeIds = await checkAndAwardBadges(supabase, profile.id);
      if (earnedBadgeIds.length > 0) setNewBadgeIds(earnedBadgeIds);
    }
  }, [profile]);

  const { messages, input, loading, sessionXp, setInput, sendMessage, initSession, resetSession, finishSession } =
    useChatSession(homework, subject, ageGroup, behavioralProfile, handleXPEarned, profile?.id);

  const handleStart = (config: {
    homework: string;
    subject: string;
    ageGroup: AgeGroup;
    behavioralProfile: BehavioralProfile;
  }) => {
    setHomework(config.homework);
    setSubject(config.subject);
    setAgeGroup(config.ageGroup);
    setBehavioralProfile(config.behavioralProfile);
    setHomeworkSet(true);
    const greeting = l.greeting.replace('{homework}', config.homework);
    initSession(config.homework, greeting);
  };

  const handleReset = () => {
    setHomeworkSet(false);
    setHomework('');
    setSubject('other');
    setShowSummary(false);
    setSessionMessageCount(0);
    resetSession();
  };

  const handleFinishSession = async () => {
    await finishSession();
    setSessionMessageCount(messages.filter(m => m.role === 'user').length);
    setShowSummary(true);
  };

  if (!homeworkSet) {
    return (
      <AgeThemeProvider ageGroup={ageGroup}>
        <HomeworkSetup onStart={handleStart} />
      </AgeThemeProvider>
    );
  }

  const subjectInfo = getSubjectById(subject);

  return (
    <AgeThemeProvider ageGroup={ageGroup}>
      {showSummary ? (
        <SessionSummary
          xpEarned={sessionXp}
          messageCount={sessionMessageCount}
          subject={subject}
          onNewSession={handleReset}
        />
      ) : (
        <>
          {/* XP Bar */}
          <div className="mb-3 relative">
            <XPBar totalXp={totalXp} compact />
            <AnimatePresence>
              {xpGained && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -5, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute right-0 top-0 flex items-center gap-1 text-amber-400 font-bold text-sm"
                >
                  <Sparkles size={14} />
                  +{xpGained} XP
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Homework banner */}
          <motion.div
            className="flex items-center gap-3 glass rounded-[var(--eq-radius-sm)] p-3 mb-3 shrink-0"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {subjectInfo ? (
              <SubjectIcon subject={subjectInfo.id} size={24} animated={false} />
            ) : (
              <BookOpen size={16} className="text-[var(--eq-accent)] shrink-0" />
            )}
            <p className="text-[var(--eq-text-secondary)] text-xs flex-1 line-clamp-2">
              {homework}
            </p>
            <button
              onClick={handleReset}
              className="text-[var(--eq-text-muted)] hover:text-[var(--eq-text)] text-xs shrink-0 transition-colors flex items-center gap-1"
            >
              <RotateCcw size={12} />
              {l.changeHomework}
            </button>
          </motion.div>

          <MessageList messages={messages} loading={loading} />

          <div className="flex flex-col gap-2 mt-2">
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={sendMessage}
              disabled={loading}
              placeholder={l.typeAnswer}
            />
            {messages.length > 2 && (
              <button
                onClick={handleFinishSession}
                className="text-white/20 hover:text-white/50 text-xs transition-colors text-center py-1"
              >
                Encerrar sessão
              </button>
            )}
          </div>
        </>
      )}
      {newBadgeIds.length > 0 && (
        <BadgeUnlockModal
          badgeIds={newBadgeIds}
          onClose={handleCloseBadgeModal}
        />
      )}
    </AgeThemeProvider>
  );
}
