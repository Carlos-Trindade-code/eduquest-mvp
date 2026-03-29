'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X } from 'lucide-react';

const STREAK_KEY = 'studdo_last_session_date';
const DISMISSED_KEY = 'studdo_streak_dismissed';

export function StreakReminder() {
  const [show, setShow] = useState(false);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    const lastSession = localStorage.getItem(STREAK_KEY);
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    const today = new Date().toISOString().split('T')[0];

    // Already dismissed today
    if (dismissed === today) return;

    // Already studied today
    if (lastSession === today) return;

    if (!lastSession) return;

    // Check if yesterday was the last session (streak at risk)
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastSession === yesterday) {
      // Parse streak from localStorage or default
      const streak = parseInt(localStorage.getItem('studdo_current_streak') || '0', 10);
      if (streak >= 2) {
        setStreakDays(streak);
        setShow(true);
      }
    }
  }, []);

  const dismiss = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(DISMISSED_KEY, today);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)]"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl shadow-orange-900/30 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.95), rgba(234,88,12,0.95))',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <motion.span
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🔥
            </motion.span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">
                Seu streak de {streakDays} dias vai acabar!
              </p>
              <p className="text-white/70 text-xs">
                Estude hoje para manter a sequencia
              </p>
            </div>
            <button
              onClick={dismiss}
              className="shrink-0 text-white/50 hover:text-white p-1 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Call this after a session ends to update streak tracking in localStorage
export function updateStreakTracking(currentStreak: number) {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(STREAK_KEY, today);
  localStorage.setItem('studdo_current_streak', String(currentStreak));
}
