'use client';
import { Sparkles } from 'lucide-react';
import { PomodoroTimer } from '@/components/tutor/PomodoroTimer';

interface HeaderProps {
  appName?: string;
  timerLabels?: { start: string; pause: string };
  onTimerComplete?: () => void;
}

export function Header({
  appName = 'Studdo',
  timerLabels,
  onTimerComplete,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black/20 shrink-0">
      <div className="flex items-center gap-2">
        <Sparkles className="text-yellow-400" size={22} />
        <span className="text-white font-bold text-xl">{appName}</span>
      </div>
      <PomodoroTimer onComplete={onTimerComplete} labels={timerLabels} />
    </header>
  );
}
