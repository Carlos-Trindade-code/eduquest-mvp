'use client';
import { useState } from 'react';
import { Clock, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';

interface PomodoroTimerProps {
  onComplete?: () => void;
  labels?: {
    start: string;
    pause: string;
  };
}

export function PomodoroTimer({ onComplete, labels }: PomodoroTimerProps) {
  const [showHint, setShowHint] = useState(true);
  const { formattedTime, timerActive, isWarning, toggleTimer, resetTimer } =
    usePomodoroTimer(onComplete);

  return (
    <div className="flex items-center gap-2 relative">
      {/* Hint tooltip for inactive timer */}
      <AnimatePresence>
        {showHint && !timerActive && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute -bottom-12 right-0 bg-emerald-600/90 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-2 shadow-lg"
          >
            Use o timer para focar 25min!
            <button onClick={() => setShowHint(false)} className="text-white/60 hover:text-white" aria-label="Fechar dica">
              <X size={10} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={
          'flex items-center gap-2 px-3 py-2 rounded-full font-mono font-bold text-sm ' +
          (isWarning
            ? 'bg-red-500 text-white animate-pulse'
            : timerActive
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-white/10 text-white/60')
        }
      >
        <Clock size={15} />
        {formattedTime}
      </div>
      <button
        onClick={() => {
          toggleTimer();
          setShowHint(false);
        }}
        className={
          'px-3 py-2 rounded-full text-xs font-semibold transition-colors ' +
          (timerActive
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-emerald-500 text-white hover:bg-emerald-600')
        }
      >
        {timerActive
          ? labels?.pause || 'Pausar'
          : labels?.start || 'Iniciar'}
      </button>
      {timerActive && (
        <button
          onClick={resetTimer}
          className="text-white/40 hover:text-white p-2 transition-colors"
          aria-label="Reset timer"
        >
          <RotateCcw size={14} />
        </button>
      )}
    </div>
  );
}
