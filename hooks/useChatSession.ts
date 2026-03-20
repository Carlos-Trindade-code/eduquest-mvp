'use client';
import { useState, useCallback, useRef } from 'react';
import { XP_REWARDS } from '@/lib/gamification/xp';
import { createClient } from '@/lib/supabase/client';
import { createSession, endSession, saveMessage } from '@/lib/supabase/queries';
import type { ChatMessage, AgeGroup, BehavioralProfile } from '@/lib/auth/types';

interface UseChatSessionReturn {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  sessionXp: number;
  setInput: (value: string) => void;
  sendMessage: () => Promise<void>;
  sendMessageText: (text: string) => Promise<void>;
  initSession: (homework: string, greeting: string) => void;
  resetSession: () => void;
  finishSession: () => Promise<void>;
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
  const [sessionXp, setSessionXp] = useState(0);
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  const initSession = useCallback(async (hw: string, greeting: string) => {
    setMessages([{ role: 'assistant', content: greeting }]);
    setSessionXp(0);
    sessionStartRef.current = new Date();

    if (userId) {
      try {
        const supabase = createClient();
        const { data } = await createSession(supabase, userId, subject, hw);
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

  const finishSession = useCallback(async () => {
    if (!sessionIdRef.current || !sessionStartRef.current) return;
    const durationMinutes = Math.round(
      (Date.now() - sessionStartRef.current.getTime()) / 60000
    );
    try {
      const supabase = createClient();
      await endSession(supabase, sessionIdRef.current, durationMinutes, sessionXp);
    } catch {
      // silencioso
    }
  }, [sessionXp]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

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
      const assistantMsg = data.message || data.error || 'Ops! Tenta de novo!';
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMsg }]);

      // Salva resposta do assistente
      if (sessionIdRef.current) {
        const supabase = createClient();
        saveMessage(supabase, sessionIdRef.current, 'assistant', assistantMsg).catch(() => {});
      }

      const xp = XP_REWARDS.MESSAGE_SENT;
      setSessionXp((prev) => prev + xp);
      onXPEarned?.(xp);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ops! Tenta de novo!' },
      ]);
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
      const assistantMsg = data.message || data.error || 'Ops! Tenta de novo!';
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMsg }]);

      if (sessionIdRef.current) {
        const supabase = createClient();
        saveMessage(supabase, sessionIdRef.current, 'assistant', assistantMsg).catch(() => {});
      }

      const xp = XP_REWARDS.MESSAGE_SENT;
      setSessionXp((prev) => prev + xp);
      onXPEarned?.(xp);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ops! Tenta de novo!' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, homework, subject, ageGroup, behavioralProfile, onXPEarned]);

  return {
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
  };
}
