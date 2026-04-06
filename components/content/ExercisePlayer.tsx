'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, ChevronRight, ChevronLeft, Eye, EyeOff, CheckCircle, X, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exercise {
  number: number;
  type: string;
  question: string;
  hint?: string;
  answer: string;
  explanation: string;
}

interface ExercisePlayerProps {
  exercises: Exercise[];
  subject: string;
  onComplete: () => void;
  onClose: () => void;
}

export function ExercisePlayer({ exercises, subject, onComplete, onClose }: ExercisePlayerProps) {
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const exercise = exercises[current];
  const isLast = current === exercises.length - 1;
  const allCompleted = completed.size === exercises.length;
  const progress = Math.round((completed.size / exercises.length) * 100);

  const handleCheck = () => {
    setShowAnswer(true);
    setCompleted((prev) => new Set(prev).add(current));
  };

  const handleNext = () => {
    if (isLast && allCompleted) {
      onComplete();
      return;
    }
    setUserAnswer('');
    setShowAnswer(false);
    setShowHint(false);
    setCurrent((prev) => Math.min(prev + 1, exercises.length - 1));
  };

  const handlePrev = () => {
    setUserAnswer('');
    setShowAnswer(false);
    setShowHint(false);
    setCurrent((prev) => Math.max(prev - 1, 0));
  };

  const typeLabel: Record<string, string> = {
    fill_blank: 'Completar',
    true_false: 'V ou F',
    short_answer: 'Resposta curta',
    matching: 'Associação',
    calculation: 'Cálculo',
  };

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool size={20} className="text-emerald-400" />
          <h2 className="text-white font-bold text-lg">Exercícios</h2>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white p-1 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-white/40">
          <span>Exercício {current + 1} de {exercises.length}</span>
          <span>{progress}% completo</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Exercise card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="glass rounded-xl p-5"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
        >
          {/* Type badge */}
          <span
            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-3"
            style={{ background: 'rgba(16,185,129,0.1)', color: 'rgb(16,185,129)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            {typeLabel[exercise.type] || exercise.type}
          </span>

          {/* Question */}
          <p className="text-white text-sm leading-relaxed mb-4">{exercise.question}</p>

          {/* Hint */}
          {exercise.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-xs text-amber-400/60 hover:text-amber-400 mb-3 transition-colors"
            >
              <Lightbulb size={12} />
              {showHint ? 'Esconder dica' : 'Ver dica'}
            </button>
          )}
          {showHint && exercise.hint && (
            <motion.p
              className="text-amber-300/60 text-xs mb-3 pl-3"
              style={{ borderLeft: '2px solid rgba(245,158,11,0.3)' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {exercise.hint}
            </motion.p>
          )}

          {/* Answer input */}
          {!showAnswer && (
            <div className="space-y-3">
              <input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && userAnswer.trim()) handleCheck(); }}
                placeholder="Digite sua resposta..."
                className="w-full bg-white/5 text-white placeholder:text-white/20 rounded-xl px-4 py-3 text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />
              <button
                onClick={handleCheck}
                disabled={!userAnswer.trim()}
                className={cn(
                  'w-full py-2.5 rounded-xl text-sm font-bold transition-all',
                  userAnswer.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-white/5 text-white/20 cursor-not-allowed',
                )}
              >
                Verificar
              </button>
            </div>
          )}

          {/* Answer reveal */}
          {showAnswer && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* User's answer */}
              <div className="flex items-start gap-2 text-xs">
                <span className="text-white/30 shrink-0">Sua resposta:</span>
                <span className="text-white/60">{userAnswer}</span>
              </div>

              {/* Correct answer */}
              <div
                className="rounded-xl p-3"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span className="text-emerald-300 text-xs font-bold">Resposta correta</span>
                </div>
                <p className="text-white/70 text-sm">{exercise.answer}</p>
              </div>

              {/* Explanation */}
              <div className="rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.06)' }}>
                <p className="text-white/40 text-xs font-bold mb-1">Explicação</p>
                <p className="text-white/60 text-xs leading-relaxed">{exercise.explanation}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-2">
        <button
          onClick={handlePrev}
          disabled={current === 0}
          className="px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={showAnswer ? handleNext : undefined}
          disabled={!showAnswer}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1',
            showAnswer
              ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
              : 'bg-white/5 text-white/20 cursor-not-allowed',
          )}
        >
          {isLast && allCompleted ? 'Concluir' : 'Próximo'}
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Exercise dots */}
      <div className="flex justify-center gap-1.5">
        {exercises.map((_, i) => (
          <button
            key={i}
            onClick={() => { setUserAnswer(''); setShowAnswer(false); setShowHint(false); setCurrent(i); }}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              i === current ? 'bg-purple-400 scale-125' : completed.has(i) ? 'bg-emerald-500' : 'bg-white/10',
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}
