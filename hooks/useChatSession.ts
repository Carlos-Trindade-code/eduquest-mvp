'use client';
import { useState, useCallback } from 'react';
import type { ChatMessage, AgeGroup, BehavioralProfile } from '@/lib/auth/types';

interface UseChatSessionReturn {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  setInput: (value: string) => void;
  sendMessage: () => Promise<void>;
  initSession: (homework: string, greeting: string) => void;
  resetSession: () => void;
}

export function useChatSession(
  homework: string,
  subject: string,
  ageGroup: AgeGroup = '10-12',
  behavioralProfile: BehavioralProfile = 'default'
): UseChatSessionReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const initSession = useCallback((hw: string, greeting: string) => {
    setMessages([{ role: 'assistant', content: greeting }]);
  }, []);

  const resetSession = useCallback(() => {
    setMessages([]);
    setInput('');
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

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
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ops! Tenta de novo!' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, homework, subject, ageGroup, behavioralProfile]);

  return {
    messages,
    input,
    loading,
    setInput,
    sendMessage,
    initSession,
    resetSession,
  };
}
