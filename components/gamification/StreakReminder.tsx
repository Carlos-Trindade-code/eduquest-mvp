'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, Bell } from 'lucide-react';

const STREAK_KEY = 'studdo_last_session_date';
const DISMISSED_KEY = 'studdo_streak_dismissed';
const NOTIF_PERMISSION_KEY = 'studdo_notif_asked';

// Request notification permission (once)
function requestNotificationPermission() {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'default') return;
  if (localStorage.getItem(NOTIF_PERMISSION_KEY) === 'true') return;

  localStorage.setItem(NOTIF_PERMISSION_KEY, 'true');
  Notification.requestPermission();
}

// Send a browser notification for streak at risk
function sendStreakNotification(streakDays: number) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification('🔥 Seu streak vai acabar!', {
      body: `Você estudou ${streakDays} dias seguidos. Estude hoje para não perder!`,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'streak-reminder',
    });
  } catch {
    // Notification may fail in some contexts
  }
}

export function StreakReminder() {
  const [show, setShow] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);

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
      const streak = parseInt(localStorage.getItem('studdo_current_streak') || '0', 10);
      if (streak >= 2) {
        setStreakDays(streak);
        setShow(true);

        // Also send a browser notification
        sendStreakNotification(streak);

        // If notifications not yet asked, prompt
        if ('Notification' in window && Notification.permission === 'default') {
          setShowNotifPrompt(true);
        }
      }
    }
  }, []);

  const dismiss = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(DISMISSED_KEY, today);
    setShow(false);
  };

  const enableNotifications = () => {
    requestNotificationPermission();
    setShowNotifPrompt(false);
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
            className="rounded-2xl shadow-2xl shadow-orange-900/30 backdrop-blur-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.95), rgba(234,88,12,0.95))',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
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
                  Estude hoje para manter a sequência
                </p>
              </div>
              <button
                aria-label="Fechar lembrete"
                onClick={dismiss}
                className="shrink-0 text-white/50 hover:text-white p-1 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Notification permission prompt */}
            {showNotifPrompt && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-white/15 px-4 py-2.5 flex items-center gap-2"
              >
                <Bell size={12} className="text-white/60 shrink-0" />
                <p className="text-white/60 text-[11px] flex-1">
                  Quer receber lembretes do streak?
                </p>
                <button
                  onClick={enableNotifications}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  Ativar
                </button>
                <button
                  onClick={() => setShowNotifPrompt(false)}
                  className="text-white/30 hover:text-white/60 text-[11px] transition-colors"
                >
                  Agora não
                </button>
              </motion.div>
            )}
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

  // Good time to ask for notification permission (user is engaged)
  requestNotificationPermission();
}
