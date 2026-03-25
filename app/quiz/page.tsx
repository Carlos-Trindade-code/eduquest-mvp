'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { QuizSetup } from '@/components/quiz/QuizSetup';
import { QuizRunner } from '@/components/quiz/QuizRunner';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { addXP } from '@/lib/supabase/queries';
import { trackEvent } from '@/lib/analytics/track';
import type { ExamData } from '@/components/exam/ExamGenerator';

export default function QuizPage() {
  const [exam, setExam] = useState<ExamData | null>(null);
  const { profile } = useAuth();

  const handleQuizReady = (examData: ExamData) => {
    trackEvent('session_started', { subject: examData.subject, mode: 'quiz' });
    setExam(examData);
  };

  const handleFinish = useCallback(async (score: number, total: number) => {
    const xp = score * 20;
    trackEvent('session_ended', { mode: 'quiz', score, total, xp });

    if (profile?.id && xp > 0) {
      const supabase = createClient();
      await addXP(supabase, profile.id, xp);
    }
  }, [profile]);

  const handleRestart = () => {
    setExam(null);
  };

  return (
    <div className="min-h-screen bg-gradient-app flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">
        {exam ? (
          <QuizRunner exam={exam} onFinish={handleFinish} onRestart={handleRestart} />
        ) : (
          <QuizSetup onQuizReady={handleQuizReady} />
        )}
      </main>
    </div>
  );
}
