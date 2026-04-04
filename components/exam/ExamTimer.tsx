'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface ExamTimerProps {
  totalMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export function ExamTimer({ totalMinutes, onTimeUp, isPaused = false }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);
  const [showFlash, setShowFlash] = useState(false);

  const stableOnTimeUp = useCallback(onTimeUp, [onTimeUp]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          stableOnTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalMinutes, stableOnTimeUp, isPaused]);

  // Flash warnings at thresholds
  useEffect(() => {
    if (secondsLeft === 300 || secondsLeft === 60) {
      setShowFlash(true);
      const timeout = setTimeout(() => setShowFlash(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isWarning = secondsLeft <= 300 && secondsLeft > 60; // 5 min
  const isCritical = secondsLeft <= 60; // 1 min
  const totalSeconds = totalMinutes * 60;
  const progress = (secondsLeft / totalSeconds) * 100;

  const timerColor = isCritical
    ? '#EF4444'
    : isWarning
    ? '#F59E0B'
    : '#8B5CF6';

  const bgColor = isCritical
    ? 'rgba(239,68,68,0.15)'
    : isWarning
    ? 'rgba(245,158,11,0.15)'
    : 'rgba(139,92,246,0.1)';

  const borderColor = isCritical
    ? 'rgba(239,68,68,0.3)'
    : isWarning
    ? 'rgba(245,158,11,0.3)'
    : 'rgba(139,92,246,0.2)';

  return (
    <>
      {/* Flash overlay for warnings */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0, 0.2, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              background: isCritical
                ? 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Timer display */}
      <motion.div
        className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
        style={{
          background: bgColor,
          border: `1px solid ${borderColor}`,
        }}
        animate={
          isCritical
            ? {
                scale: [1, 1.03, 1],
                boxShadow: [
                  '0 0 0px rgba(239,68,68,0)',
                  '0 0 12px rgba(239,68,68,0.4)',
                  '0 0 0px rgba(239,68,68,0)',
                ],
              }
            : {}
        }
        transition={
          isCritical
            ? { duration: 1, repeat: Infinity, ease: 'easeInOut' }
            : {}
        }
      >
        {isCritical ? (
          <AlertTriangle size={16} style={{ color: timerColor }} />
        ) : (
          <Clock size={16} style={{ color: timerColor }} />
        )}

        <span
          className="font-mono font-bold text-sm tabular-nums"
          style={{ color: timerColor }}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>

        {/* Mini progress bar */}
        <div className="w-16 h-1.5 rounded-full overflow-hidden bg-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: timerColor }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    </>
  );
}

// Timer duration options for setup screens
export const timerOptions = [
  { value: 0, label: 'Sem limite' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
];

interface TimerSelectorProps {
  selected: number;
  onSelect: (minutes: number) => void;
}

export function TimerSelector({ selected, onSelect }: TimerSelectorProps) {
  return (
    <div>
      <label className="text-[var(--eq-text-secondary)] text-sm font-medium block mb-2">
        <Clock size={14} className="inline mr-1.5 -mt-0.5" />
        Tempo limite (Modo Prova)
      </label>
      <div className="grid grid-cols-5 gap-2">
        {timerOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`py-2 px-2 rounded-[var(--eq-radius-sm)] text-xs sm:text-sm font-medium transition-all border ${
              selected === opt.value
                ? 'bg-[var(--eq-primary)]/20 border-[var(--eq-primary)]/50 text-[var(--eq-primary)]'
                : 'bg-[var(--eq-surface)] border-[var(--eq-surface-border)] text-[var(--eq-text-secondary)] hover:bg-[var(--eq-surface-hover)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
