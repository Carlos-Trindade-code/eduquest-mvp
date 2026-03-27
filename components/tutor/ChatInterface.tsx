// components/tutor/ChatInterface.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCcw, Sparkles, ClipboardList } from 'lucide-react';
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
import { getUserStats, addXP, checkAndAwardBadges, saveSessionSummary, getKidPendingTasks, completeParentTask } from '@/lib/supabase/queries';
import type { AgeGroup, BehavioralProfile, ParentTask } from '@/lib/auth/types';

const TRIAL_KEY = 'studdo_trial_sessions';

function getTrialCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(TRIAL_KEY) || '0', 10);
}

function incrementTrialCount() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRIAL_KEY, String(getTrialCount() + 1));
}

function TrialExpiredGate() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 py-12 px-4 text-center">
      <motion.div
        className="text-6xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        🎓
      </motion.div>
      <div>
        <h2 className="text-white text-2xl font-extrabold mb-2">Gostou da experiencia?</h2>
        <p className="text-sm" style={{ color: 'rgba(240,244,248,0.5)' }}>
          Crie uma conta gratuita para continuar estudando, ganhar XP e acompanhar seu progresso!
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href="/register?redirect=/tutor"
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-sm text-center shadow-lg shadow-purple-600/25 hover:opacity-90 transition-all"
        >
          Criar conta gratuita
        </a>
        <a
          href="/login?redirect=/tutor"
          className="w-full py-3 rounded-xl text-sm text-center font-medium transition-all text-white/50 hover:text-white hover:bg-white/5"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Ja tenho conta — Entrar
        </a>
      </div>
      <div className="flex flex-col items-center gap-2 mt-2">
        <div className="flex gap-4">
          {['🏆 XP e Niveis', '🔥 Streak', '📊 Progresso'].map((item) => (
            <span key={item} className="text-xs" style={{ color: 'rgba(240,244,248,0.35)' }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ChatInterfaceProps {
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  finishRef?: React.MutableRefObject<(() => void) | null>;
}

export function ChatInterface({ onSessionStart, onSessionEnd, finishRef }: ChatInterfaceProps) {
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
  const [trialExpired, setTrialExpired] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<ParentTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<{
    topics_covered: string[];
    strengths: string[];
    difficulties: string[];
    ai_suggestion: string;
    parent_tip: string;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const finishCalledRef = useRef(false);
  const { profile, loading: authLoading } = useAuth();
  const isGuest = !profile;

  // Check if guest trial is expired
  useEffect(() => {
    if (!authLoading && isGuest && getTrialCount() >= 1) {
      setTrialExpired(true);
    }
  }, [authLoading, isGuest]);

  // Load XP from user_stats table
  useEffect(() => {
    if (profile?.id) {
      const supabase = createClient();
      getUserStats(supabase, profile.id).then(({ data }) => {
        if (data) setTotalXp(data.total_xp);
      });
    }
  }, [profile]);

  // Load pending tasks from parents
  useEffect(() => {
    if (profile?.id && !homeworkSet) {
      const supabase = createClient();
      getKidPendingTasks(supabase, profile.id).then(({ data }) => {
        setPendingTasks(data);
      });
    }
  }, [profile, homeworkSet]);

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
    finishCalledRef.current = false;
    onSessionStart?.();

    if (config.homework) {
      // Photo was uploaded — start with photo content
      initSession(
        config.homework,
        `Oi! 👋 Li o que está na foto. Vamos explorar esse conteúdo?\n\nPor onde você quer começar?`,
        config.subject,
      );
    } else {
      // No photo — proactive: show topic suggestions
      const tips = getSuggestions(config.subject, config.ageGroup);
      setSuggestions(tips);
      initSession(
        '',
        `Oi! 👋 Sobre **${subjectName}**, o que quer estudar hoje?\n\nAqui vão algumas ideias:`,
        config.subject,
      );
    }
  };

  const handleStartFromTask = (task: ParentTask) => {
    setActiveTaskId(task.id);
    handleStart({
      homework: task.description,
      subject: task.subject,
      ageGroup,
      behavioralProfile,
    });
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
    setSummaryResult(null);
    setSummaryLoading(false);
    setSessionDuration(0);
    setActiveTaskId(null);
    finishCalledRef.current = false;
    resetSession();
    onSessionEnd?.();
  };

  const handleFinishSession = async () => {
    if (finishCalledRef.current) return;
    finishCalledRef.current = true;
    setSummaryLoading(true);
    setShowSummary(true);
    onSessionEnd?.();

    const sessionData = await finishSession();
    const userMessageCount = messages.filter((m) => m.role === 'user').length;
    setSessionMessageCount(userMessageCount);
    const duration = sessionData?.durationMinutes ?? 0;
    setSessionDuration(duration);

    // Generate AI summary
    try {
      const res = await fetch('/api/session-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          subject,
          ageGroup,
          durationMinutes: duration,
          xpEarned: sessionXp,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const summary = data.summary || data;
        setSummaryResult(summary);

        // Save to database
        if (profile?.id && sessionData?.sessionId) {
          const supabase = createClient();
          await saveSessionSummary(supabase, {
            session_id: sessionData.sessionId,
            kid_id: profile.id,
            subject,
            duration_minutes: duration,
            message_count: messages.length,
            xp_earned: sessionXp,
            topics_covered: summary.topics_covered ?? [],
            strengths: summary.strengths ?? [],
            difficulties: summary.difficulties ?? [],
            ai_suggestion: summary.ai_suggestion ?? null,
            parent_tip: summary.parent_tip ?? null,
          });
        }
      }
    } catch {
      // Fallback — show summary without AI
    }

    // Complete parent task if session was started from one
    if (activeTaskId && profile?.id && sessionData?.sessionId) {
      const supabase = createClient();
      await completeParentTask(supabase, activeTaskId, sessionData.sessionId);
      setActiveTaskId(null);
    }

    setSummaryLoading(false);
    if (isGuest) incrementTrialCount();
  };

  // Wire up finishRef so the header button can trigger finish
  useEffect(() => {
    if (finishRef) {
      finishRef.current = homeworkSet && !showSummary ? handleFinishSession : null;
    }
  });

  const handleSuggestionClick = async (suggestion: string) => {
    setSuggestions([]);
    await sendMessageText(suggestion);
  };

  const handleSend = () => {
    setSuggestions([]);
    sendMessage();
  };

  // Trial expired — show registration gate
  if (trialExpired) {
    return (
      <AgeThemeProvider ageGroup={ageGroup}>
        <TrialExpiredGate />
      </AgeThemeProvider>
    );
  }

  if (!homeworkSet) {
    return (
      <AgeThemeProvider ageGroup={ageGroup}>
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
                    onClick={() => handleStartFromTask(task)}
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
          durationMinutes={sessionDuration}
          summaryResult={summaryResult}
          summaryLoading={summaryLoading}
          onNewSession={handleReset}
          isGuest={isGuest}
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

          <div className="mt-2">
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              disabled={loading}
              placeholder="Digite sua resposta..."
            />
          </div>
        </>
      )}

      {newBadgeIds.length > 0 && (
        <BadgeToast badgeIds={newBadgeIds} onClose={handleCloseBadgeModal} />
      )}
    </AgeThemeProvider>
  );
}
