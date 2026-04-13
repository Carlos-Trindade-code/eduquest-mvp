// components/tutor/ChatInterface.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TrialExpiredGate } from './TrialExpiredGate';
import { HomeworkSetupView } from './HomeworkSetupView';
import { ActiveSession } from './ActiveSession';
import { SessionSummaryView } from './SessionSummaryView';
import { AgeThemeProvider } from '@/components/providers/AgeThemeProvider';
import { BadgeToast } from '@/components/gamification/BadgeToast';
import { useChatSession } from '@/hooks/useChatSession';
import { useAuth } from '@/hooks/useAuth';
import { getSubjectById } from '@/lib/subjects/config';
import { getSuggestions } from '@/lib/subjects/suggestions';
import { getBuildForSubject, TOTAL_PIECES } from '@/lib/gamification/builds';
import { createClient } from '@/lib/supabase/client';
import { getUserStats, addXP, checkAndAwardBadges, saveSessionSummary, getKidPendingTasks, completeParentTask, getKidActivities } from '@/lib/supabase/queries';
import { updateStreakTracking } from '@/components/gamification/StreakReminder';
import { markDailyChallengeCompleted, isDailyChallengeCompleted } from '@/lib/gamification/daily-challenge';
import { XP_REWARDS } from '@/lib/gamification/xp';
import type { AgeGroup, BehavioralProfile, DifficultyLevel, ParentTask, GuidedActivity } from '@/lib/auth/types';

const TRIAL_KEY = 'studdo_trial_sessions';
const TRIAL_FP_KEY = 'studdo_trial_fp';

function getLocalTrialCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(TRIAL_KEY) || '0', 10);
}

function setLocalTrialCount(count: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRIAL_KEY, String(count));
}

function incrementLocalTrialCount() {
  if (typeof window === 'undefined') return;
  setLocalTrialCount(getLocalTrialCount() + 1);
}

// Generate a fingerprint hash from browser characteristics
async function generateFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return '';
  const raw = [
    navigator.userAgent,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.languages?.join(',') ?? '',
    navigator.hardwareConcurrency?.toString() ?? '',
    navigator.maxTouchPoints?.toString() ?? '',
  ].join('|');
  // Hash with SubtleCrypto (SHA-256)
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Cache fingerprint in localStorage so we don't recompute every time
async function getFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return '';
  const cached = localStorage.getItem(TRIAL_FP_KEY);
  if (cached && cached.length >= 16) return cached;
  const fp = await generateFingerprint();
  localStorage.setItem(TRIAL_FP_KEY, fp);
  return fp;
}

// Fetch server-side trial count for fingerprint
async function getServerTrialCount(fp: string): Promise<number> {
  try {
    const res = await fetch(`/api/trial?fp=${encodeURIComponent(fp)}`);
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data.count === 'number' ? data.count : 0;
  } catch {
    return 0;
  }
}

// Increment server-side trial count
async function incrementServerTrialCount(fp: string): Promise<number> {
  try {
    const res = await fetch('/api/trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint: fp }),
    });
    if (!res.ok) return -1;
    const data = await res.json();
    return typeof data.count === 'number' ? data.count : -1;
  } catch {
    return -1;
  }
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
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('intermediario');
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
  const [guidedActivities, setGuidedActivities] = useState<GuidedActivity[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<GuidedActivity | null>(null);
  const [summaryResult, setSummaryResult] = useState<{
    topics_covered: string[];
    strengths: string[];
    difficulties: string[];
    ai_suggestion: string;
    parent_tip: string;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const finishCalledRef = useRef(false);
  const [dailyChallengeActive, setDailyChallengeActive] = useState(false);
  const { profile, loading: authLoading } = useAuth();
  const isGuest = !profile;

  // Check if guest trial is expired (combine localStorage + server count)
  useEffect(() => {
    if (authLoading || !isGuest) return;
    const localCount = getLocalTrialCount();
    // Immediately gate if localStorage already shows expired
    if (localCount >= 3) {
      setTrialExpired(true);
    }
    // Also check server-side (async) — uses MAX of both counts
    (async () => {
      const fp = await getFingerprint();
      if (!fp) return;
      const serverCount = await getServerTrialCount(fp);
      const realCount = Math.max(localCount, serverCount);
      // Sync localStorage up if server has a higher count
      if (serverCount > localCount) {
        setLocalTrialCount(serverCount);
      }
      if (realCount >= 3) {
        setTrialExpired(true);
      }
    })();
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

  // Load pending tasks and guided activities from parents
  useEffect(() => {
    if (profile?.id && !homeworkSet) {
      const supabase = createClient();
      getKidPendingTasks(supabase, profile.id).then(({ data }) => {
        setPendingTasks(data);
      });
      getKidActivities(supabase, profile.id, ['pending', 'in_progress']).then(({ data }) => {
        setGuidedActivities(data);
      });
    }
  }, [profile, homeworkSet]);

  // Track elapsed session time
  useEffect(() => {
    if (!sessionStartTime || showSummary) return;
    const interval = setInterval(() => {
      setElapsedMinutes(Math.floor((Date.now() - sessionStartTime) / 60000));
    }, 30000);
    return () => clearInterval(interval);
  }, [sessionStartTime, showSummary]);

  const handleCloseBadgeModal = useCallback(() => setNewBadgeIds([]), []);

  const handleXPEarned = useCallback(async (xp: number) => {
    setTotalXp((prev) => prev + xp);
    setXpGained(xp);
    setTimeout(() => setXpGained(null), 3500);

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

    // Persist XP + track streak locally
    if (profile?.id) {
      const supabase = createClient();
      const result = await addXP(supabase, profile.id, xp);
      if (result.data) {
        updateStreakTracking(result.data.current_streak);
      }
      const earnedBadgeIds = await checkAndAwardBadges(supabase, profile.id);
      if (earnedBadgeIds.length > 0) setNewBadgeIds(earnedBadgeIds);
    }
  }, [profile, subject]);

  const {
    messages,
    input,
    loading,
    streaming,
    error: chatError,
    sessionXp,
    setInput,
    sendMessage,
    sendMessageText,
    retryLastMessage,
    initSession,
    resetSession,
    finishSession,
  } = useChatSession(homework, subject, ageGroup, behavioralProfile, handleXPEarned, profile?.id, difficultyLevel);

  const handleStart = (config: {
    homework: string;
    subject: string;
    ageGroup: AgeGroup;
    behavioralProfile: BehavioralProfile;
    difficultyLevel?: DifficultyLevel;
  }) => {
    if (config.difficultyLevel) setDifficultyLevel(config.difficultyLevel);
    const subjectInfo = getSubjectById(config.subject);
    const subjectName = subjectInfo?.name ?? 'esta matéria';

    setHomework(config.homework);
    setSubject(config.subject);
    setAgeGroup(config.ageGroup);
    setHomeworkSet(true);
    setSessionPieces(0);
    setSuggestions([]);
    setSessionStartTime(Date.now());
    setElapsedMinutes(0);
    finishCalledRef.current = false;
    onSessionStart?.();

    if (config.homework) {
      // Photo/material was uploaded — include content in greeting so it's visible in chat history
      const truncated = config.homework.length > 800
        ? config.homework.slice(0, 800) + '...'
        : config.homework;
      initSession(
        config.homework,
        `Oi! 👋 Li o conteúdo que você enviou:\n\n> ${truncated.split('\n').join('\n> ')}\n\nPor onde você quer começar?`,
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

    // Award daily challenge bonus XP
    if (dailyChallengeActive && !isDailyChallengeCompleted()) {
      markDailyChallengeCompleted();
      handleXPEarned(XP_REWARDS.DAILY_CHALLENGE_BONUS);
      setDailyChallengeActive(false);
    }

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
            estimated_accuracy: summary.estimated_accuracy ?? null,
            correct_concepts: summary.correct_concepts ?? null,
            struggled_concepts: summary.struggled_concepts ?? null,
          });
        }
      }
    } catch {
      setSummaryResult({
        topics_covered: [],
        strengths: [],
        difficulties: [],
        ai_suggestion: 'Não foi possível gerar o resumo automático.',
        parent_tip: '',
      });
    }

    // Complete parent task if session was started from one
    if (activeTaskId && profile?.id && sessionData?.sessionId) {
      const supabase = createClient();
      await completeParentTask(supabase, activeTaskId, sessionData.sessionId);
      setActiveTaskId(null);
    }

    setSummaryLoading(false);
    if (isGuest) {
      incrementLocalTrialCount();
      // Also increment server-side (fire-and-forget, don't block UX)
      getFingerprint().then((fp) => {
        if (fp) incrementServerTrialCount(fp);
      });
    }
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

  const handleQuizComplete = async (activityId: string, xpEarned: number) => {
    setTotalXp((prev) => prev + xpEarned);
    setGuidedActivities((prev) => prev.filter((a) => a.id !== activityId));
  };

  const handleRemoveActivity = (activityId: string) => {
    setGuidedActivities((prev) => prev.filter((a) => a.id !== activityId));
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
        <HomeworkSetupView
          isGuest={isGuest}
          pendingTasks={pendingTasks}
          guidedActivities={guidedActivities}
          activeQuiz={activeQuiz}
          ageGroup={ageGroup}
          behavioralProfile={behavioralProfile}
          profileId={profile?.id}
          onStart={(config) => { setDailyChallengeActive(false); handleStart(config); }}
          onStartDailyChallenge={(config) => { setDailyChallengeActive(true); handleStart(config); }}
          onStartFromTask={handleStartFromTask}
          onSetActiveQuiz={setActiveQuiz}
          onQuizComplete={handleQuizComplete}
          onRemoveActivity={handleRemoveActivity}
        />
      </AgeThemeProvider>
    );
  }

  return (
    <AgeThemeProvider ageGroup={ageGroup}>
      {showSummary ? (
        <SessionSummaryView
          sessionXp={sessionXp}
          sessionMessageCount={sessionMessageCount}
          subject={subject}
          sessionDuration={sessionDuration}
          summaryResult={summaryResult}
          summaryLoading={summaryLoading}
          isGuest={isGuest}
          onNewSession={handleReset}
        />
      ) : (
        <ActiveSession
          subject={subject}
          totalXp={totalXp}
          xpGained={xpGained}
          sessionPieces={sessionPieces}
          milestoneMessage={milestoneMessage}
          elapsedMinutes={elapsedMinutes}
          messages={messages}
          loading={loading}
          streaming={streaming}
          chatError={chatError}
          suggestions={suggestions}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          onSuggestionClick={handleSuggestionClick}
          onRetry={retryLastMessage}
          onReset={handleReset}
        />
      )}

      {newBadgeIds.length > 0 && (
        <BadgeToast badgeIds={newBadgeIds} onClose={handleCloseBadgeModal} />
      )}
    </AgeThemeProvider>
  );
}
