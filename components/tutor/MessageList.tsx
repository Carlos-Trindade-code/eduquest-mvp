'use client';

import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { useAgeTheme } from '@/components/providers/AgeThemeProvider';
import type { ChatMessage as ChatMessageType } from '@/lib/auth/types';

interface MessageListProps {
  messages: ChatMessageType[];
  loading: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export function MessageList({ messages, loading, error, onRetry }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { tokens } = useAgeTheme();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, error]);

  return (
    <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
      <AnimatePresence mode="popLayout">
        {messages.map((msg, i) => (
          <ChatMessage key={`${msg.role}-${i}`} message={msg} />
        ))}
      </AnimatePresence>

      {/* Error state with sad mascot */}
      {error && !loading && (
        <motion.div
          className="flex flex-col items-center gap-3 py-4 px-4 rounded-2xl mx-2"
          style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
        >
          <MascotOwl expression="sad" size="sm" animated decorative />
          <p className="text-sm text-center" style={{ color: 'rgba(240,244,248,0.7)' }}>
            Ops, algo deu errado! {'\uD83D\uDE22'} Tente enviar sua mensagem novamente.
          </p>
          {onRetry && (
            <motion.button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: 'rgba(139,92,246,0.2)',
                border: '1px solid rgba(139,92,246,0.3)',
                color: 'rgba(240,244,248,0.9)',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <RotateCcw size={14} />
              Tentar novamente
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Loading indicator */}
      {loading && (
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          aria-live="polite"
          aria-label="Edu esta pensando..."
        >
          <div className="shrink-0">
            {tokens.showMascot ? (
              <MascotOwl expression="thinking" size="sm" decorative />
            ) : (
              <div
                className="flex items-center justify-center rounded-full text-white text-xs font-bold"
                style={{
                  width: tokens.avatarSize,
                  height: tokens.avatarSize,
                  background: tokens.primary,
                }}
              >
                AI
              </div>
            )}
          </div>
          <div
            className="px-4 py-3"
            style={{
              background: tokens.assistantBubbleColor,
              borderRadius: tokens.bubbleBorderRadius,
            }}
          >
            <div className="flex gap-1.5">
              {[0, 150, 300].map((d) => (
                <motion.div
                  key={d}
                  className="w-2 h-2 rounded-full"
                  style={{ background: tokens.textMuted }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: d / 1000,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
