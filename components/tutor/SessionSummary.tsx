'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Flame, ArrowRight, CheckCircle, AlertTriangle, Lightbulb, BookOpen } from 'lucide-react';
import { getSubjectById } from '@/lib/subjects/config';
import { PostSessionFeedback } from '@/components/feedback/PostSessionFeedback';

interface SummaryData {
  topics_covered: string[];
  strengths: string[];
  difficulties: string[];
  ai_suggestion: string;
  parent_tip: string;
}

interface SessionSummaryProps {
  xpEarned: number;
  messageCount: number;
  subject: string;
  durationMinutes?: number;
  summaryResult: SummaryData | null;
  summaryLoading?: boolean;
  onNewSession: () => void;
  isGuest?: boolean;
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <motion.div
      className={`rounded-lg ${className ?? ''}`}
      style={{ background: 'rgba(139,92,246,0.15)' }}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function LoadingSkeleton() {
  return (
    <motion.div
      className="w-full max-w-sm space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center gap-3 justify-center mb-2">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <BookOpen size={20} className="text-purple-400" />
        </motion.div>
        <p className="text-sm text-purple-300 font-medium">
          O Edu está analisando sua sessão...
        </p>
      </div>
      <SkeletonPulse className="h-10 w-full" />
      <SkeletonPulse className="h-16 w-full" />
      <SkeletonPulse className="h-12 w-3/4 mx-auto" />
      <SkeletonPulse className="h-16 w-full" />
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.4 },
  }),
};

export function SessionSummary({
  xpEarned,
  messageCount,
  subject,
  durationMinutes,
  summaryResult,
  summaryLoading,
  onNewSession,
  isGuest,
}: SessionSummaryProps) {
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);
  const subjectInfo = getSubjectById(subject);

  const suggestions = [
    { id: 'math', name: 'Matemática', icon: '\uD83D\uDD22' },
    { id: 'portuguese', name: 'Português', icon: '\uD83D\uDCDD' },
    { id: 'science', name: 'Ciências', icon: '\uD83D\uDD2C' },
    { id: 'history', name: 'História', icon: '\uD83D\uDCDC' },
  ].filter((s) => s.id !== subject).slice(0, 2);

  const durationText = durationMinutes
    ? durationMinutes < 1
      ? '< 1 min'
      : `${durationMinutes} min`
    : null;

  return (
    <motion.div
      className="flex flex-col items-center flex-1 gap-5 py-6 px-4 overflow-y-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Confetti particles */}
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-2.5 h-2.5 rounded-sm pointer-events-none"
          style={{
            background:
              i % 4 === 0
                ? '#F5A623'
                : i % 4 === 1
                  ? '#00B4D8'
                  : i % 4 === 2
                    ? '#8B5CF6'
                    : '#10B981',
            top: '40%',
            left: `${20 + i * 4}%`,
            zIndex: 10,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: -300,
            opacity: 0,
            rotate: i % 2 === 0 ? 360 : -360,
          }}
          transition={{ duration: 1.5, delay: i * 0.05, ease: 'easeOut' }}
        />
      ))}

      {/* Trophy */}
      <motion.div
        className="text-7xl"
        animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.9, delay: 0.3 }}
      >
        {'\uD83C\uDFC6'}
      </motion.div>

      <div className="text-center">
        <h2 className="text-white text-2xl font-extrabold mb-1">
          Sessão incrível!
        </h2>
        <p
          className="text-sm"
          style={{ color: 'rgba(240,244,248,0.5)' }}
        >
          {subjectInfo?.name ?? subject} {'\u00B7'} {messageCount} trocas com o Edu
          {durationText && ` ${'\u00B7'} ${durationText}`}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-4">
        <motion.div
          className="rounded-2xl px-6 py-4 text-center"
          style={{
            background: 'rgba(245,166,35,0.1)',
            border: '1px solid rgba(245,166,35,0.2)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div
            className="text-3xl font-extrabold flex items-center gap-1 justify-center"
            style={{ color: '#F5A623' }}
          >
            <Sparkles size={20} />+{xpEarned}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: 'rgba(240,244,248,0.4)' }}
          >
            XP ganhos
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl px-6 py-4 text-center"
          style={{
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.2)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="text-3xl font-extrabold flex items-center gap-1 justify-center"
            style={{ color: '#F97316' }}
          >
            <Flame size={20} />+1
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: 'rgba(240,244,248,0.4)' }}
          >
            streak
          </div>
        </motion.div>
      </div>

      {/* AI Summary Section */}
      <AnimatePresence mode="wait">
        {summaryLoading ? (
          <LoadingSkeleton key="loading" />
        ) : summaryResult ? (
          <motion.div
            key="summary"
            className="w-full max-w-sm space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Topics Covered */}
            {summaryResult.topics_covered.length > 0 && (
              <motion.div
                custom={0}
                variants={staggerItem}
                initial="hidden"
                animate="visible"
              >
                <p
                  className="text-xs font-semibold mb-2"
                  style={{ color: 'rgba(240,244,248,0.5)' }}
                >
                  Tópicos estudados
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {summaryResult.topics_covered.map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: 'rgba(139,92,246,0.15)',
                        border: '1px solid rgba(139,92,246,0.25)',
                        color: 'rgba(196,167,255,0.9)',
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Strengths */}
            {summaryResult.strengths.length > 0 && (
              <motion.div
                custom={1}
                variants={staggerItem}
                initial="hidden"
                animate="visible"
                className="rounded-xl p-3.5"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle
                    size={14}
                    style={{ color: '#10B981' }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: '#10B981' }}
                  >
                    Pontos fortes
                  </span>
                </div>
                <ul className="space-y-1">
                  {summaryResult.strengths.map((s, idx) => (
                    <li
                      key={idx}
                      className="text-xs"
                      style={{ color: 'rgba(240,244,248,0.7)' }}
                    >
                      {'\u2022'} {s}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Difficulties */}
            {summaryResult.difficulties.length > 0 && (
              <motion.div
                custom={2}
                variants={staggerItem}
                initial="hidden"
                animate="visible"
                className="rounded-xl p-3.5"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle
                    size={14}
                    style={{ color: '#F59E0B' }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: '#F59E0B' }}
                  >
                    Pontos a melhorar
                  </span>
                </div>
                <ul className="space-y-1">
                  {summaryResult.difficulties.map((d, idx) => (
                    <li
                      key={idx}
                      className="text-xs"
                      style={{ color: 'rgba(240,244,248,0.7)' }}
                    >
                      {'\u2022'} {d}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* AI Suggestion */}
            {summaryResult.ai_suggestion && (
              <motion.div
                custom={3}
                variants={staggerItem}
                initial="hidden"
                animate="visible"
                className="rounded-xl p-3.5"
                style={{
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb
                    size={14}
                    style={{ color: '#8B5CF6' }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: '#8B5CF6' }}
                  >
                    Sugestão do Edu
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'rgba(240,244,248,0.7)' }}
                >
                  {summaryResult.ai_suggestion}
                </p>
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Guest CTA */}
      {isGuest ? (
        <motion.div
          className="w-full max-w-xs space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <p className="text-white font-bold text-sm mb-1">
              Quer continuar estudando?
            </p>
            <p
              className="text-xs mb-4"
              style={{ color: 'rgba(240,244,248,0.5)' }}
            >
              Crie uma conta gratuita para sessões ilimitadas, XP e conquistas
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
            Já tenho conta
          </a>
        </motion.div>
      ) : (
        <>
          {/* Subject suggestions */}
          {suggestions.length > 0 && (
            <motion.div
              className="w-full max-w-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p
                className="text-xs text-center mb-3"
                style={{ color: 'rgba(240,244,248,0.4)' }}
              >
                Continuar estudando?
              </p>
              <div className="flex gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={onNewSession}
                    className="flex-1 flex items-center gap-2 p-3 rounded-xl text-xs font-medium text-white transition-all hover:scale-105"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span>{s.icon}</span>
                    <span>{s.name}</span>
                    <ArrowRight
                      size={12}
                      className="ml-auto opacity-40"
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* New session button */}
          <motion.button
            onClick={onNewSession}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(240,244,248,0.7)',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <RotateCcw size={15} />
            Nova sessão
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
