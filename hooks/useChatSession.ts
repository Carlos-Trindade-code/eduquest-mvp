'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { XP_REWARDS } from '@/lib/gamification/xp';
import { createClient } from '@/lib/supabase/client';
import { createSession, endSession, saveMessage } from '@/lib/supabase/queries';
import { trackEvent } from '@/lib/analytics/track';
import type { ChatMessage, AgeGroup, BehavioralProfile } from '@/lib/auth/types';

interface FinishSessionResult {
  sessionId: string | null;
  durationMinutes: number;
}

interface UseChatSessionReturn {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  error: boolean;
  sessionXp: number;
  setInput: (value: string) => void;
  sendMessage: () => Promise<void>;
  sendMessageText: (text: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  initSession: (homework: string, greeting: string, subjectOverride?: string) => void;
  resetSession: () => void;
  finishSession: () => Promise<FinishSessionResult | null>;
}

export function useChatSession(
  homework: string,
  subject: string,
  ageGroup: AgeGroup = '10-12',
  behavioralProfile: BehavioralProfile = 'default',
  onXPEarned?: (xp: number) => void,
  userId?: string | null
): UseChatSessionReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const lastUserMessageRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const sessionXpRef = useRef(0);

  // Keep ref in sync for beforeunload (avoids stale closure)
  useEffect(() => { sessionXpRef.current = sessionXp; }, [sessionXp]);

  // Auto-finalize session on page leave/close
  useEffect(() => {
    const autoFinish = () => {
      if (!sessionIdRef.current || !sessionStartRef.current) return;
      const durationMinutes = Math.round(
        (Date.now() - sessionStartRef.current.getTime()) / 60000
      );
      const supabase = createClient();
      // Use sendBeacon-style: fire and forget
      endSession(supabase, sessionIdRef.current, durationMinutes, sessionXpRef.current).catch(() => {});
      sessionIdRef.current = null;
      sessionStartRef.current = null;
    };

    const handleBeforeUnload = () => autoFinish();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') autoFinish();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      autoFinish(); // cleanup on unmount (e.g. navigating away within SPA)
    };
  }, []);

  const initSession = useCallback(async (hw: string, greeting: string, subjectOverride?: string) => {
    setMessages([{ role: 'assistant', content: greeting }]);
    setSessionXp(0);
    sessionStartRef.current = new Date();

    trackEvent('session_started', { subject: subjectOverride ?? subject });
    if (userId) {
      try {
        const supabase = createClient();
        const { data } = await createSession(supabase, userId, subjectOverride ?? subject, hw);
        if (data?.id) sessionIdRef.current = data.id;
      } catch {
        // sessão não crítica — continua sem persistir
      }
    }
  }, [userId, subject]);

  const resetSession = useCallback(() => {
    setMessages([]);
    setInput('');
    setSessionXp(0);
    sessionIdRef.current = null;
    sessionStartRef.current = null;
  }, []);

  const finishSession = useCallback(async (): Promise<FinishSessionResult | null> => {
    if (!sessionIdRef.current || !sessionStartRef.current) return null;
    const durationMinutes = Math.round(
      (Date.now() - sessionStartRef.current.getTime()) / 60000
    );
    const sessionId = sessionIdRef.current;
    trackEvent('session_ended', { duration_minutes: durationMinutes, xp: sessionXp });
    try {
      const supabase = createClient();
      await endSession(supabase, sessionId, durationMinutes, sessionXp);
    } catch {
      // silencioso
    }
    return { sessionId, durationMinutes };
  }, [sessionXp]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(false);
    lastUserMessageRef.current = input;

    // Salva mensagem do usuário
    if (sessionIdRef.current) {
      const supabase = createClient();
      saveMessage(supabase, sessionIdRef.current, 'user', input).catch(() => {});
    }

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          homework,
          subject,
          ageGroup,
          behavioralProfile,
        }),
      });
      const data = await res.json();

      if (res.ok && data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
        if (sessionIdRef.current) {
          const supabase = createClient();
          saveMessage(supabase, sessionIdRef.current, 'assistant', data.message).catch(() => {});
        }
        const xp = XP_REWARDS.MESSAGE_SENT;
        setSessionXp((prev) => prev + xp);
        onXPEarned?.(xp);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, homework, subject, ageGroup, behavioralProfile, onXPEarned]);

  const sendMessageText = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);
    setError(false);
    lastUserMessageRef.current = text;

    if (sessionIdRef.current) {
      const supabase = createClient();
      saveMessage(supabase, sessionIdRef.current, 'user', text).catch(() => {});
    }

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          homework,
          subject,
          ageGroup,
          behavioralProfile,
        }),
      });
      const data = await res.json();

      if (res.ok && data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
        if (sessionIdRef.current) {
          const supabase = createClient();
          saveMessage(supabase, sessionIdRef.current, 'assistant', data.message).catch(() => {});
        }
        const xp = XP_REWARDS.MESSAGE_SENT;
        setSessionXp((prev) => prev + xp);
        onXPEarned?.(xp);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, homework, subject, ageGroup, behavioralProfile, onXPEarned]);

  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessageRef.current || loading) return;
    setError(false);
    setLoading(true);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          homework,
          subject,
          ageGroup,
          behavioralProfile,
        }),
      });
      const data = await res.json();

      if (res.ok && data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
        if (sessionIdRef.current) {
          const supabase = createClient();
          saveMessage(supabase, sessionIdRef.current, 'assistant', data.message).catch(() => {});
        }
        const xp = XP_REWARDS.MESSAGE_SENT;
        setSessionXp((prev) => prev + xp);
        onXPEarned?.(xp);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, homework, subject, ageGroup, behavioralProfile, onXPEarned]);

  return {
    messages,
    input,
    loading,
    error,
    sessionXp,
    setInput,
    sendMessage,
    sendMessageText,
    retryLastMessage,
    initSession,
    resetSession,
    finishSession,
  };
}
