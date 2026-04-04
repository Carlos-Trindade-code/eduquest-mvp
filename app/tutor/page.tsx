'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/tutor/ChatInterface';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { StreakReminder } from '@/components/gamification/StreakReminder';
import { AgeThemeProvider } from '@/components/providers/AgeThemeProvider';
import { useAuth } from '@/hooks/useAuth';

function TutorLoadingSkeleton() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-5 py-12"
    >
      <MascotOwl expression="thinking" size="lg" animated />
      <div className="text-center">
        <p className="text-[var(--eq-text)] font-bold text-lg mb-1">Preparando sua sessão...</p>
        <p className="text-sm text-[var(--eq-text-muted)]">
          O Edu já está quase pronto!
        </p>
      </div>
      {/* Skeleton cards */}
      <div className="w-full max-w-md space-y-3 mt-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-14 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)' }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function TutorPage() {
  const [showBreak, setShowBreak] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const finishRef = useRef<(() => void) | null>(null);
  const { loading: authLoading, profile } = useAuth();
  const ageGroup = profile?.age_group || '10-12';

  return (
    <AgeThemeProvider ageGroup={ageGroup}>
    <div className="min-h-screen bg-gradient-app flex flex-col">
      <StreakReminder />
      <Header
        onTimerComplete={() => setShowBreak(true)}
        showFinish={sessionActive}
        onFinishSession={() => finishRef.current?.()}
      />

      {/* Break notification overlay */}
      <AnimatePresence>
        {showBreak && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600/95 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-900/50 flex items-center gap-4 max-w-sm"
          >
            <Coffee size={24} className="shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-sm">Hora da pausa!</p>
              <p className="text-emerald-100 text-xs mt-0.5">
                Você estudou 25 minutos. Descanse 5 minutos!
              </p>
              <button
                onClick={() => setShowBreak(false)}
                className="mt-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
              >
                Continuar estudando
              </button>
            </div>
            <button
              onClick={() => setShowBreak(false)}
              className="shrink-0 text-white/60 hover:text-white self-start"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-5 overflow-hidden">
        <AnimatePresence mode="wait">
          {authLoading ? (
            <TutorLoadingSkeleton key="loading" />
          ) : (
            <motion.div
              key="content"
              className="flex-1 flex flex-col overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ChatInterface
                onSessionStart={() => setSessionActive(true)}
                onSessionEnd={() => setSessionActive(false)}
                finishRef={finishRef}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <FeedbackButton />
    </div>
    </AgeThemeProvider>
  );
}
