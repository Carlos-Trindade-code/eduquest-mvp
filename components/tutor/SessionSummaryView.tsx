// components/tutor/SessionSummaryView.tsx
'use client';

import { SessionSummary } from './SessionSummary';

interface SessionSummaryViewProps {
  sessionXp: number;
  sessionMessageCount: number;
  subject: string;
  sessionDuration: number;
  summaryResult: {
    topics_covered: string[];
    strengths: string[];
    difficulties: string[];
    ai_suggestion: string;
    parent_tip: string;
  } | null;
  summaryLoading: boolean;
  isGuest: boolean;
  onNewSession: () => void;
}

export function SessionSummaryView({
  sessionXp,
  sessionMessageCount,
  subject,
  sessionDuration,
  summaryResult,
  summaryLoading,
  isGuest,
  onNewSession,
}: SessionSummaryViewProps) {
  return (
    <SessionSummary
      xpEarned={sessionXp}
      messageCount={sessionMessageCount}
      subject={subject}
      durationMinutes={sessionDuration}
      summaryResult={summaryResult}
      summaryLoading={summaryLoading}
      onNewSession={onNewSession}
      isGuest={isGuest}
    />
  );
}
