'use client';

import { motion, useReducedMotion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { useAgeTheme } from '@/components/providers/AgeThemeProvider';
import { chatMessageVariants } from '@/lib/design/animations';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/lib/auth/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const { tokens } = useAgeTheme();
  const shouldReduceMotion = useReducedMotion();
  const variants = chatMessageVariants(tokens.animationIntensity);

  return (
    <motion.div
      className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}
      variants={shouldReduceMotion ? undefined : variants}
      initial="hidden"
      animate="visible"
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="shrink-0 mt-1">
          {tokens.showMascot ? (
            <MascotOwl expression="encouraging" size="sm" animated={false} decorative />
          ) : (
            <div
              className="flex items-center justify-center rounded-full text-white text-xs font-bold"
              style={{
                width: tokens.avatarSize,
                height: tokens.avatarSize,
                minWidth: tokens.avatarSize,
                background: tokens.primary,
              }}
            >
              AI
            </div>
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className="px-4 py-3 leading-relaxed"
        style={{
          maxWidth: tokens.bubbleMaxWidth,
          fontSize: tokens.bubbleFontSize,
          borderRadius: tokens.bubbleBorderRadius,
          background: isUser ? tokens.userBubbleColor : tokens.assistantBubbleColor,
          color: isUser ? tokens.userBubbleText : tokens.assistantBubbleText,
          ...(isUser
            ? { borderBottomRightRadius: '0.25rem' }
            : { borderBottomLeftRadius: '0.25rem' }),
        }}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
              li: ({ children }) => <li className="text-sm">{children}</li>,
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {children}
                </code>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  );
}
