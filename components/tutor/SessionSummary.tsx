'use client';

import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, BookOpen } from 'lucide-react';

interface SessionSummaryProps {
  xpEarned: number;
  messageCount: number;
  subject: string;
  onNewSession: () => void;
}

export function SessionSummary({ xpEarned, messageCount, subject, onNewSession }: SessionSummaryProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-1 gap-6 py-12"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className="text-6xl"
        animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        🎉
      </motion.div>

      <div className="text-center">
        <h2 className="text-white text-2xl font-bold mb-1">Sessão encerrada!</h2>
        <p className="text-white/50 text-sm">Ótimo trabalho em {subject}</p>
      </div>

      <div className="flex gap-4">
        <div className="glass rounded-2xl px-6 py-4 text-center">
          <div className="text-amber-400 text-3xl font-bold flex items-center gap-1 justify-center">
            <Sparkles size={20} />
            +{xpEarned}
          </div>
          <div className="text-white/40 text-xs mt-1">XP ganhos</div>
        </div>
        <div className="glass rounded-2xl px-6 py-4 text-center">
          <div className="text-purple-400 text-3xl font-bold flex items-center gap-1 justify-center">
            <BookOpen size={20} />
            {messageCount}
          </div>
          <div className="text-white/40 text-xs mt-1">trocas</div>
        </div>
      </div>

      <motion.button
        onClick={onNewSession}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-purple-600/25"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RotateCcw size={16} />
        Nova sessão
      </motion.button>
    </motion.div>
  );
}
