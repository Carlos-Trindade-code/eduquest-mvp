'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/tutor/ChatInterface';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';

export default function TutorPage() {
  const [showBreak, setShowBreak] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-app flex flex-col">
      <Header onTimerComplete={() => setShowBreak(true)} />

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
            <div>
              <p className="font-bold text-sm">Hora da pausa!</p>
              <p className="text-emerald-100 text-xs mt-0.5">
                Voce estudou 25 minutos. Descanse 5 minutos e volte!
              </p>
            </div>
            <button
              onClick={() => setShowBreak(false)}
              className="shrink-0 text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-5 overflow-hidden">
        <ChatInterface />
      </main>
      <FeedbackButton />
    </div>
  );
}
