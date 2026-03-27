'use client';

import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { useAgeTheme } from '@/components/providers/AgeThemeProvider';
import type { ChatMessage as ChatMessageType } from '@/lib/auth/types';

interface MessageListProps {
  messages: ChatMessageType[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { tokens } = useAgeTheme();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
      <AnimatePresence mode="popLayout">
        {messages.map((msg, i) => (
          <ChatMessage key={`${msg.role}-${i}`} message={msg} />
        ))}
      </AnimatePresence>

      {/* Loading indicator */}
      {loading && (
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="shrink-0">
            {tokens.showMascot ? (
              <MascotOwl expression="thinking" size="sm" />
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
