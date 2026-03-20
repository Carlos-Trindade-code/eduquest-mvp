// components/tutor/ChatInterface.tsx
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
import { BadgeToast } from '@/components/gamification/BadgeToast';
import { BuildProgress } from '@/components/gamification/BuildProgress';
import { useChatSession } from '@/hooks/useChatSession';
import { useAuth } from '@/hooks/useAuth';
import { getSubjectById } from '@/lib/subjects/config';
import { getSuggestions } from '@/lib/subjects/suggestions';
import { getBuildForSubject, TOTAL_PIECES } from '@/lib/gamification/builds';
import { SubjectIcon } from '@/components/illustrations/SubjectIcons';
import { createClient } from '@/lib/supabase/client';
import { getUserStats, addXP, checkAndAwardBadges } from '@/lib/supabase/queries';
import type { AgeGroup, BehavioralProfile } from '@/lib/auth/types';

export function ChatInterface() {
  const [homework, setHomework] = useState('');
  const [subject, setSubject] = useState('math');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('10-12');
  const [behavioralProfile] = useState<BehavioralProfile>('default');
  const [homeworkSet, setHomeworkSet] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionMessageCount, setSessionMessageCount] = useState(0);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sessionPieces, setSessionPieces] = useState(0);
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);
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
    setTotalXp((prev) => prev + xp);
    setXpGained(xp);
    setTimeout(() => setXpGained(null), 2000);

    // Increment build pieces
    setSessionPieces((prev) => {
      const next = Math.min(prev + 1, TOTAL_PIECES);
      const build = getBuildForSubject(subject);
      const msg = build.milestoneMessages[next] ?? null;
      if (msg) {
        setMilestoneMessage(msg);
        setTimeout(() => setMilestoneMessage(null), 3000);
      }
      return next;
    });

    // Persist XP
    if (profile?.id) {
      const supabase = createClient();
      await addXP(supabase, profile.id, xp);
      const earnedBadgeIds = await checkAndAwardBadges(supabase, profile.id);
      if (earnedBadgeIds.length > 0) setNewBadgeIds(earnedBadgeIds);
    }
  }, [profile, subject]);

  const {
    messages,
    input,
    loading,
    sessionXp,
    setInput,
    sendMessage,
    sendMessageText,
    initSession,
    resetSession,
    finishSession,
  } = useChatSession(homework, subject, ageGroup, behavioralProfile, handleXPEarned, profile?.id);

  const handleStart = (config: {
    homework: string;
    subject: string;
    ageGroup: AgeGroup;
    behavioralProfile: BehavioralProfile;
  }) => {
    const subjectInfo = getSubjectById(config.subject);
    const subjectName = subjectInfo?.name ?? 'esta matéria';

    setHomework(config.homework);
    setSubject(config.subject);
    setAgeGroup(config.ageGroup);
    setHomeworkSet(true);
    setSessionPieces(0);
    setSuggestions([]);

    if (config.homework) {
      // Photo was uploaded — start with photo content
      initSession(
        config.homework,
        `Oi! 👋 Li o que está na foto. Vamos explorar esse conteúdo?\n\nPor onde você quer começar?`,
      );
    } else {
      // No photo — proactive: show topic suggestions
      const tips = getSuggestions(config.subject, config.ageGroup);
      setSuggestions(tips);
      initSession(
        '',
        `Oi! 👋 Sobre **${subjectName}**, o que quer estudar hoje?\n\nAqui vão algumas ideias:`,
      );
    }
  };

  const handleReset = () => {
    setHomeworkSet(false);
    setHomework('');
    setSubject('math');
    setShowSummary(false);
    setSessionMessageCount(0);
    setSessionPieces(0);
    setSuggestions([]);
    setMilestoneMessage(null);
    resetSession();
  };

  const handleFinishSession = async () => {
    await finishSession();
    setSessionMessageCount(messages.filter((m) => m.role === 'user').length);
    setShowSummary(true);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setSuggestions([]);
    await sendMessageText(suggestion);
  };

  const handleSend = () => {
    setSuggestions([]);
    sendMessage();
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
          <div className="mb-2 relative">
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

          {/* Build Progress */}
          <BuildProgress
            subject={subject}
            pieces={sessionPieces}
            milestoneMessage={milestoneMessage}
          />

          {/* Subject banner */}
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
              {subjectInfo?.name ?? subject}
            </p>
            <button
              onClick={handleReset}
              className="text-[var(--eq-text-muted)] hover:text-[var(--eq-text)] text-xs shrink-0 transition-colors flex items-center gap-1"
            >
              <RotateCcw size={12} />
              trocar
            </button>
          </motion.div>

          <MessageList messages={messages} loading={loading} />

          {/* Topic suggestion chips — cleared on first send */}
          <AnimatePresence>
            {suggestions.length > 0 && !loading && (
              <motion.div
                className="flex flex-wrap gap-2 my-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestionClick(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(139,92,246,0.12)',
                      border: '1px solid rgba(139,92,246,0.3)',
                      color: 'rgba(240,244,248,0.8)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2 mt-2">
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              disabled={loading}
              placeholder="Digite sua resposta..."
            />
            {messages.length > 6 && (
              <button
                onClick={() => {
                  if (window.confirm('Encerrar a sessão de estudo?')) {
                    handleFinishSession();
                  }
                }}
                className="text-white/20 hover:text-white/50 text-xs transition-colors text-center py-1"
              >
                Encerrar sessão
              </button>
            )}
          </div>
        </>
      )}

      {newBadgeIds.length > 0 && (
        <BadgeToast badgeIds={newBadgeIds} onClose={handleCloseBadgeModal} />
      )}
    </AgeThemeProvider>
  );
}
