'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, Flame, ArrowRight } from 'lucide-react';
import { getSubjectById } from '@/lib/subjects/config';
import { PostSessionFeedback } from '@/components/feedback/PostSessionFeedback';

interface SessionSummaryProps {
  xpEarned: number;
  messageCount: number;
  subject: string;
  onNewSession: () => void;
  isGuest?: boolean;
}

export function SessionSummary({ xpEarned, messageCount, subject, onNewSession, isGuest }: SessionSummaryProps) {
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);
  const subjectInfo = getSubjectById(subject);

  // getAllSubjects doesn't exist — use hardcoded fallback
  const suggestions = [
    { id: 'math', name: 'Matemática', icon: '🔢' },
    { id: 'portuguese', name: 'Português', icon: '📝' },
    { id: 'science', name: 'Ciências', icon: '🔬' },
    { id: 'history', name: 'História', icon: '📜' },
  ].filter(s => s.id !== subject).slice(0, 2);

  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-1 gap-6 py-8 px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Confetti particles */}
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-2.5 h-2.5 rounded-sm pointer-events-none"
          style={{
            background: i % 4 === 0 ? '#F5A623' : i % 4 === 1 ? '#00B4D8' : i % 4 === 2 ? '#8B5CF6' : '#10B981',
            top: '40%',
            left: `${20 + (i * 4)}%`,
            zIndex: 10,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: -300, opacity: 0, rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 1.5, delay: i * 0.05, ease: 'easeOut' }}
        />
      ))}

      {/* Trophy */}
      <motion.div
        className="text-8xl"
        animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.9, delay: 0.3 }}
      >
        🏆
      </motion.div>

      <div className="text-center">
        <h2 className="text-white text-2xl font-extrabold mb-1">Sessao incrivel!</h2>
        <p className="text-sm" style={{ color: 'rgba(240,244,248,0.5)' }}>
          {subjectInfo?.name ?? subject} · {messageCount} trocas com o Edu
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <motion.div
          className="rounded-2xl px-6 py-4 text-center"
          style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-3xl font-extrabold flex items-center gap-1 justify-center" style={{ color: '#F5A623' }}>
            <Sparkles size={20} />
            +{xpEarned}
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(240,244,248,0.4)' }}>XP ganhos</div>
        </motion.div>

        <motion.div
          className="rounded-2xl px-6 py-4 text-center"
          style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-3xl font-extrabold flex items-center gap-1 justify-center" style={{ color: '#F97316' }}>
            <Flame size={20} />
            +1
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(240,244,248,0.4)' }}>streak</div>
        </motion.div>
      </div>

      {/* Guest CTA — register to continue */}
      {isGuest ? (
        <motion.div
          className="w-full max-w-xs space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <p className="text-white font-bold text-sm mb-1">Quer continuar estudando?</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(240,244,248,0.5)' }}>
              Crie uma conta gratuita para sessoes ilimitadas, XP e conquistas
            </p>
            <a
              href="/register"
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-sm text-center shadow-lg shadow-purple-600/25 hover:opacity-90 transition-all"
            >
              Criar conta gratuita
            </a>
          </div>
          <a
            href="/login"
            className="block w-full py-2.5 rounded-xl text-sm text-center font-medium text-white/40 hover:text-white/60 transition-all"
          >
            Ja tenho conta
          </a>
        </motion.div>
      ) : (
        <>
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <motion.div
              className="w-full max-w-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs text-center mb-3" style={{ color: 'rgba(240,244,248,0.4)' }}>
                Continuar estudando?
              </p>
              <div className="flex gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={onNewSession}
                    className="flex-1 flex items-center gap-2 p-3 rounded-xl text-xs font-medium text-white transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span>{s.icon}</span>
                    <span>{s.name}</span>
                    <ArrowRight size={12} className="ml-auto opacity-40" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* New session button */}
          <motion.button
            onClick={onNewSession}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,244,248,0.7)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <RotateCcw size={15} />
            Nova sessao
          </motion.button>
        </>
      )}

      {!feedbackDismissed && (
        <PostSessionFeedback
          triggered={true}
          subjectContext={subjectInfo?.name}
          onDismiss={() => setFeedbackDismissed(true)}
        />
      )}
    </motion.div>
  );
}
