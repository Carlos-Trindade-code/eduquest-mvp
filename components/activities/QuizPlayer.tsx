'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Trophy, RotateCcw } from 'lucide-react';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { useAgeTheme } from '@/components/providers/AgeThemeProvider';
import { playCorrectAnswer, playWrongAnswer, playLevelUp } from '@/lib/audio/sounds';
import type { QuizQuestion } from '@/lib/auth/types';

interface QuizPlayerProps {
  questions: QuizQuestion[];
  subject: string;
  title: string;
  parentNote?: string | null;
  onComplete: (score: number, total: number) => void;
  onClose: () => void;
}

export function QuizPlayer({ questions, subject, title, parentNote, onComplete, onClose }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const { tokens } = useAgeTheme();
  const isYoungKid = tokens.animationIntensity === 'high';

  const currentQ = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQ?.correctIndex;
  const progress = ((currentIndex + (showExplanation ? 1 : 0)) / questions.length) * 100;

  const handleAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);

    if (index === currentQ.correctIndex) {
      setCorrectCount(prev => prev + 1);
      playCorrectAnswer();
    } else {
      playWrongAnswer();
    }
  }, [selectedAnswer, currentQ]);

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      const finalCorrect = correctCount + (isCorrect ? 0 : 0); // already counted
      setFinished(true);
      playLevelUp();
      onComplete(correctCount, questions.length);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  // Results screen
  if (finished) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const mascotExpression = percentage >= 70 ? 'celebrating' : percentage >= 40 ? 'encouraging' : 'thinking';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 text-center space-y-4"
      >
        <MascotOwl expression={mascotExpression} size={isYoungKid ? 'xl' : 'lg'} animated />
        <div>
          <h2 className={`text-white font-bold ${isYoungKid ? 'text-2xl' : 'text-xl'}`}>
            {percentage >= 70 ? 'Parabens!' : percentage >= 40 ? 'Bom trabalho!' : 'Continue tentando!'}
          </h2>
          <p className="text-white/50 text-sm mt-1">{title}</p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className={`text-amber-400 font-bold ${isYoungKid ? 'text-4xl' : 'text-3xl'}`}>
              {correctCount}/{questions.length}
            </p>
            <p className="text-white/40 text-xs mt-1">acertos</p>
          </div>
          <div className="text-center">
            <p className={`text-purple-400 font-bold ${isYoungKid ? 'text-4xl' : 'text-3xl'}`}>
              {percentage}%
            </p>
            <p className="text-white/40 text-xs mt-1">nota</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white/70 rounded-xl text-sm transition-colors"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl p-4 sm:p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white text-sm font-semibold">{title}</h3>
          <p className="text-white/30 text-xs">Pergunta {currentIndex + 1} de {questions.length}</p>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 text-xs">
          Sair
        </button>
      </div>

      {/* Parent note */}
      {parentNote && currentIndex === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3"
        >
          <p className="text-blue-300 text-xs">💬 Mensagem do pai/mae: {parentNote}</p>
        </motion.div>
      )}

      {/* Progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-3"
        >
          <p className={`text-white font-medium ${isYoungKid ? 'text-lg' : 'text-base'}`}>
            {currentQ.question}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedAnswer === i;
              const isRight = i === currentQ.correctIndex;
              let style = 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20';

              if (showExplanation) {
                if (isRight) {
                  style = 'bg-green-500/15 border-green-500/30 text-green-300';
                } else if (isSelected && !isRight) {
                  style = 'bg-red-500/15 border-red-500/30 text-red-300';
                } else {
                  style = 'bg-white/[0.02] border-white/5 text-white/30';
                }
              }

              return (
                <motion.button
                  key={i}
                  whileTap={!showExplanation ? { scale: 0.98 } : undefined}
                  onClick={() => handleAnswer(i)}
                  disabled={showExplanation}
                  className={`w-full text-left rounded-xl border transition-all flex items-center gap-3 ${style} ${
                    isYoungKid ? 'p-4 text-base' : 'p-3 text-sm'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    showExplanation && isRight ? 'bg-green-500/30 text-green-300' :
                    showExplanation && isSelected ? 'bg-red-500/30 text-red-300' :
                    'bg-white/10 text-white/50'
                  }`}>
                    {showExplanation && isRight ? <CheckCircle size={14} /> :
                     showExplanation && isSelected ? <XCircle size={14} /> :
                     String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className={`rounded-xl p-3 ${
                  isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {isYoungKid && (
                      <MascotOwl
                        expression={isCorrect ? 'celebrating' : 'encouraging'}
                        size="sm"
                        animated
                      />
                    )}
                    <p className={`text-sm font-medium ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                      {isCorrect ? 'Acertou! 🎉' : 'Resposta incorreta'}
                    </p>
                  </div>
                  {!isCorrect && (
                    <p className="text-red-200/70 text-sm mb-1">
                      Resposta correta: <strong>{currentQ.options[currentQ.correctIndex]}</strong>
                    </p>
                  )}
                  <p className={`text-sm ${isCorrect ? 'text-green-200/70' : 'text-red-200/70'}`}>{currentQ.explanation}</p>
                </div>

                <button
                  onClick={handleNext}
                  className={`w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors ${
                    isYoungKid ? 'py-3 text-base' : 'py-2.5 text-sm'
                  }`}
                >
                  {currentIndex + 1 >= questions.length ? (
                    <>
                      <Trophy size={16} />
                      Ver resultado
                    </>
                  ) : (
                    <>
                      Proxima
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
