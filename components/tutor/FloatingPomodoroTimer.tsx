'use client';
import { useState, useEffect } from 'react';
import { Clock, Pause, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface PomodoroTimerState {
  formattedTime: string;
  timerActive: boolean;
  isWarning: boolean;
  toggleTimer: () => void;
}

interface FloatingPomodoroTimerProps {
  timerState: PomodoroTimerState;
}

export function FloatingPomodoroTimer({ timerState }: FloatingPomodoroTimerProps) {
  const { formattedTime, timerActive, isWarning, toggleTimer } = timerState;
  const [showHint, setShowHint] = useState(true);

  // Auto-hide hint after first render
  useEffect(() => {
    if (showHint) {
      const timeout = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [showHint]);

  return (
    <AnimatePresence>
      {timerActive && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-20 sm:bottom-4 right-4 z-40"
        >
          {/* Hint tooltip */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute -top-10 right-0 bg-emerald-600/90 text-white text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap flex items-center gap-1.5 shadow-lg"
              >
                Timer ativo!
                <button onClick={() => setShowHint(false)} className="text-white/60 hover:text-white">
                  <X size={8} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={
              'flex items-center gap-2 px-3 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border ' +
              (isWarning
                ? 'bg-red-500/20 border-red-500/40 animate-pulse shadow-red-900/30'
                : 'bg-gray-900/80 border-white/10 shadow-black/50')
            }
          >
            <Clock
              size={14}
              className={isWarning ? 'text-red-400' : 'text-emerald-400'}
            />
            <span
              className={
                'font-mono font-bold text-sm tabular-nums ' +
                (isWarning ? 'text-red-300' : 'text-white')
              }
            >
              {formattedTime}
            </span>
            <button
              onClick={toggleTimer}
              className={
                'w-7 h-7 rounded-full flex items-center justify-center transition-colors ' +
                (timerActive
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30')
              }
            >
              {timerActive ? <Pause size={12} /> : <Play size={12} />}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
