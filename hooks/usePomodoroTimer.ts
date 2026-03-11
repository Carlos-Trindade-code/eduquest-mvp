'use client';
import { useState, useEffect, useCallback } from 'react';

interface UsePomodoroTimerReturn {
  timer: number;
  timerActive: boolean;
  formattedTime: string;
  isWarning: boolean;
  durationMinutes: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  setDuration: (minutes: number) => void;
}

export function usePomodoroTimer(
  onComplete?: () => void,
  initialMinutes: number = 25
): UsePomodoroTimerReturn {
  const [durationMinutes, setDurationMinutes] = useState(initialMinutes);
  const [timer, setTimer] = useState(initialMinutes * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setTimerActive(false);
      onComplete?.();
      setTimer(durationMinutes * 60);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer, onComplete, durationMinutes]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const toggleTimer = useCallback(() => {
    setTimerActive((a) => !a);
  }, []);

  const resetTimer = useCallback(() => {
    setTimer(durationMinutes * 60);
    setTimerActive(false);
  }, [durationMinutes]);

  const setDuration = useCallback((minutes: number) => {
    setDurationMinutes(minutes);
    setTimer(minutes * 60);
    setTimerActive(false);
  }, []);

  return {
    timer,
    timerActive,
    formattedTime: formatTime(timer),
    isWarning: timer < 300 && timer > 0,
    durationMinutes,
    toggleTimer,
    resetTimer,
    setDuration,
  };
}
