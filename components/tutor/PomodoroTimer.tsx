'use client';
import { Clock, RotateCcw } from 'lucide-react';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';

interface PomodoroTimerProps {
  onComplete?: () => void;
  labels?: {
    start: string;
    pause: string;
  };
}

export function PomodoroTimer({ onComplete, labels }: PomodoroTimerProps) {
  const { formattedTime, timerActive, isWarning, toggleTimer, resetTimer } =
    usePomodoroTimer(onComplete);

  return (
    <div className="flex items-center gap-2">
      <div
        className={
          'flex items-center gap-2 px-3 py-2 rounded-full font-mono font-bold ' +
          (isWarning ? 'bg-red-500 text-white' : 'bg-white/10 text-white')
        }
      >
        <Clock size={15} />
        {formattedTime}
      </div>
      <button
        onClick={toggleTimer}
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
      <button
        onClick={resetTimer}
        className="text-white/40 hover:text-white p-2 transition-colors"
        aria-label="Reset timer"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}
