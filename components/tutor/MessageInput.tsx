'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, MicOff } from 'lucide-react';
import { useAgeTheme } from '@/components/providers/AgeThemeProvider';
import { cn } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

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
  const { ageGroup } = useAgeTheme();
  const isYoungKid = ageGroup === '4-6';
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance>(null);

  useEffect(() => {
    const SR = typeof window !== 'undefined'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;
    setSpeechSupported(!!SR);
  }, []);

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } }; resultIndex: number }) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      onChange(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      // Auto-send if there's content
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('input[data-studdo-input]');
        if (input && input.value.trim()) {
          onSend();
        }
      }, 100);
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const showMic = speechSupported;

  return (
    <div className="flex gap-2 mt-3 shrink-0">
      {/* Listening indicator */}
      {isListening && (
        <div className="absolute -top-8 left-0 right-0 flex items-center justify-center gap-2 text-xs text-red-400 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Escutando...
        </div>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && canSend) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder={isListening ? 'Escutando...' : placeholder}
        data-studdo-input
        className={cn(
          'flex-1 bg-[var(--eq-surface)] text-[var(--eq-text)] placeholder:text-[var(--eq-text-muted)]',
          'rounded-[var(--eq-radius-sm)] px-4 py-3',
          'border border-[var(--eq-surface-border)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--eq-primary)]/40 focus:border-[var(--eq-primary)]',
          'text-[var(--eq-bubble-font-size)] transition-all backdrop-blur-md'
        )}
      />
      {showMic && (
        <motion.button
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'rounded-[var(--eq-radius-sm)] px-3 transition-all',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            isListening ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60 hover:text-white',
          )}
          aria-label={isListening ? 'Parar de ouvir' : 'Falar com o Edu'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </motion.button>
      )}
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
