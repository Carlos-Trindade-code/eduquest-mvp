// components/tutor/ActiveSession.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCcw, Sparkles, Clock } from 'lucide-react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { XPBar } from '@/components/gamification/XPBar';
import { BuildProgress } from '@/components/gamification/BuildProgress';
import { SubjectIcon } from '@/components/illustrations/SubjectIcons';
import { getSubjectById } from '@/lib/subjects/config';
import type { ChatMessage } from '@/lib/auth/types';

interface ActiveSessionProps {
  subject: string;
  totalXp: number;
  xpGained: number | null;
  sessionPieces: number;
  milestoneMessage: string | null;
  elapsedMinutes: number;
  messages: ChatMessage[];
  loading: boolean;
  chatError: boolean;
  suggestions: string[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSuggestionClick: (suggestion: string) => void;
  onRetry: () => void;
  onReset: () => void;
}

export function ActiveSession({
  subject,
  totalXp,
  xpGained,
  sessionPieces,
  milestoneMessage,
  elapsedMinutes,
  messages,
  loading,
  chatError,
  suggestions,
  input,
  onInputChange,
  onSend,
  onSuggestionClick,
  onRetry,
  onReset,
}: ActiveSessionProps) {
  const subjectInfo = getSubjectById(subject);

  return (
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
        {elapsedMinutes > 0 && (
          <span className="text-[var(--eq-text-muted)] text-xs flex items-center gap-1 shrink-0">
            <Clock size={10} />
            {elapsedMinutes}min
          </span>
        )}
        <button
          onClick={onReset}
          className="text-[var(--eq-text-muted)] hover:text-[var(--eq-text)] text-xs shrink-0 transition-colors flex items-center gap-1"
        >
          <RotateCcw size={12} />
          trocar
        </button>
      </motion.div>

      <MessageList messages={messages} loading={loading} error={chatError} onRetry={onRetry} />

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
                onClick={() => onSuggestionClick(s)}
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
          onChange={onInputChange}
          onSend={onSend}
          disabled={loading}
          placeholder="Digite sua resposta..."
        />
      </div>
    </>
  );
}
