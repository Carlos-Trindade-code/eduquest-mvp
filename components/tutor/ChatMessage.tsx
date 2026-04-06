'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Volume2, VolumeX } from 'lucide-react';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { useAgeTheme } from '@/components/providers/AgeThemeProvider';
import { chatMessageVariants } from '@/lib/design/animations';
import { cn } from '@/lib/utils';
import { speak as ttsSpeak, stopSpeaking, hasTTSSupport } from '@/lib/audio/tts';
import type { ChatMessage as ChatMessageType } from '@/lib/auth/types';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export const ChatMessage = memo(function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const { ageGroup, tokens } = useAgeTheme();
  const shouldReduceMotion = useReducedMotion();
  const variants = chatMessageVariants(tokens.animationIntensity);
  const isYoungKid = ageGroup === '4-6';
  const hasTTS = hasTTSSupport();
  const spokenRef = useRef(false);
  const [speaking, setSpeaking] = useState(false);

  // Auto-speak new assistant messages for 4-6 age group
  useEffect(() => {
    if (!isUser && isYoungKid && hasTTS && message.content && !isStreaming && !spokenRef.current) {
      spokenRef.current = true;
      ttsSpeak(message.content);
    }
  }, [isUser, isYoungKid, hasTTS, message.content, isStreaming]);

  const handleSpeak = async () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    await ttsSpeak(message.content);
    setSpeaking(false);
  };

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
        className="max-w-[85vw] sm:max-w-none px-4 py-3 leading-relaxed"
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
        {isStreaming && !isUser && (
          <span className="inline-block w-0.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-text-bottom" />
        )}
        {!isUser && hasTTS && !isStreaming && (
          <button
            onClick={handleSpeak}
            className={cn(
              'mt-1.5 flex items-center gap-1 text-xs transition-colors',
              speaking ? 'text-purple-400' : 'text-white/30 hover:text-white/60',
            )}
          >
            {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {speaking ? 'Parar' : 'Ouvir'}
          </button>
        )}
      </div>
    </motion.div>
  );
});
