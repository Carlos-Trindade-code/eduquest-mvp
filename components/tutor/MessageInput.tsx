'use client';

import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  placeholder?: string;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = 'Digite sua resposta...',
}: MessageInputProps) {
  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="flex gap-2 mt-3 shrink-0">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && canSend) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder={placeholder}
        className={cn(
          'flex-1 bg-[var(--eq-surface)] text-[var(--eq-text)] placeholder:text-[var(--eq-text-muted)]',
          'rounded-[var(--eq-radius-sm)] px-4 py-3',
          'border border-[var(--eq-surface-border)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--eq-primary)]/40 focus:border-[var(--eq-primary)]',
          'text-[var(--eq-bubble-font-size)] transition-all backdrop-blur-md'
        )}
      />
      <motion.button
        onClick={onSend}
        disabled={!canSend}
        whileHover={canSend ? { scale: 1.05 } : undefined}
        whileTap={canSend ? { scale: 0.95 } : undefined}
        className={cn(
          'rounded-[var(--eq-radius-sm)] px-4 transition-all',
          'disabled:opacity-30 disabled:cursor-not-allowed',
          'text-white'
        )}
        style={{ background: canSend ? 'var(--eq-primary)' : 'var(--eq-surface)' }}
        aria-label="Enviar mensagem"
      >
        <Send size={18} />
      </motion.button>
    </div>
  );
}
