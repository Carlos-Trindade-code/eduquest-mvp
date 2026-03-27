'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Trophy, RotateCcw, Sparkles, BookOpen, Share2 } from 'lucide-react';
import type { ExamData } from '@/components/exam/ExamGenerator';
import { getSubjectById } from '@/lib/subjects/config';

interface QuizRunnerProps {
  exam: ExamData;
  onFinish: (score: number, total: number) => void;
  onRestart: () => void;
}

type QuestionState = 'unanswered' | 'correct' | 'incorrect';

export function QuizRunner({ exam, onFinish, onRestart }: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questionState, setQuestionState] = useState<QuestionState>('unanswered');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ selected: string; correct: boolean }[]>([]);

  const mcQuestions = exam.questions.filter((q) => q.type === 'multiple_choice');
  const question = mcQuestions[currentIndex];
  const total = mcQuestions.length;
  const isLast = currentIndex === total - 1;
  const subjectInfo = getSubjectById(exam.subject);

  const handleSelect = (option: string) => {
    if (questionState !== 'unanswered') return;
    setSelectedAnswer(option);
  };

  const handleConfirm = () => {
    if (!selectedAnswer || !question) return;

    // Extract letter from selected option (e.g., "A) Texto" → "A")
    const selectedLetter = selectedAnswer.charAt(0);
    const correctLetter = question.correctAnswer.charAt(0);
    const isCorrect = selectedLetter === correctLetter;

    setQuestionState(isCorrect ? 'correct' : 'incorrect');
    setAnswers((prev) => [...prev, { selected: selectedAnswer, correct: isCorrect }]);
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (isLast) {
      const finalScore = score + (questionState === 'correct' ? 0 : 0); // score already updated
      setShowResult(true);
      onFinish(score, total);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setQuestionState('unanswered');
  };

  if (showResult) {
    const percentage = Math.round((score / total) * 100);
    const emoji = percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : percentage >= 40 ? '💪' : '📚';
    const message =
      percentage >= 80 ? 'Excelente!' :
      percentage >= 60 ? 'Muito bom!' :
      percentage >= 40 ? 'Bom esforco!' :
      'Continue praticando!';

    return (
      <motion.div
        className="flex flex-col items-center justify-center flex-1 gap-6 py-8 px-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="text-7xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6 }}
        >
          {emoji}
        </motion.div>

        <div className="text-center">
          <h2 className="text-white text-2xl font-extrabold mb-1">{message}</h2>
          <p className="text-sm" style={{ color: 'rgba(240,244,248,0.5)' }}>
            {subjectInfo?.name || exam.subject} · {exam.title}
          </p>
        </div>

        {/* Score */}
        <div className="flex gap-4">
          <motion.div
            className="rounded-2xl px-8 py-5 text-center"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-4xl font-extrabold" style={{ color: '#10B981' }}>
              {score}/{total}
            </div>
            <div className="text-xs mt-1" style={{ color: 'rgba(240,244,248,0.4)' }}>acertos</div>
          </motion.div>
          <motion.div
            className="rounded-2xl px-8 py-5 text-center"
            style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-4xl font-extrabold flex items-center gap-1 justify-center" style={{ color: '#F5A623' }}>
              <Sparkles size={20} />
              +{score * 20}
            </div>
            <div className="text-xs mt-1" style={{ color: 'rgba(240,244,248,0.4)' }}>XP ganhos</div>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(240,244,248,0.4)' }}>
            <span>{percentage}% de acerto</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: percentage >= 60 ? '#10B981' : '#F59E0B' }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </div>

        {/* Answer summary */}
        <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
          {answers.map((a, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{
                background: a.correct ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: a.correct ? '#10B981' : '#EF4444',
                border: `1px solid ${a.correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            onClick={async () => {
              const subjectName = subjectInfo?.name || exam.subject;
              const text = `${emoji} Acertei ${score}/${total} no quiz de ${subjectName} no Studdo! (${percentage}%)\n\nTeste voce tambem: www.studdo.com.br/quiz`;
              if (navigator.share) {
                try {
                  await navigator.share({ title: `Quiz Studdo — ${subjectName}`, text, url: 'https://www.studdo.com.br/quiz' });
                } catch { /* user cancelled */ }
              } else {
                await navigator.clipboard.writeText(text);
                alert('Resultado copiado!');
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #4F46E5)', color: 'white' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Share2 size={15} />
            Compartilhar
          </motion.button>
          <motion.button
            onClick={onRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,244,248,0.7)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RotateCcw size={15} />
            Gerar novo quiz
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 py-12 px-4 text-center">
        <BookOpen size={40} className="text-white/20" />
        <p className="text-white/50 text-sm">Nenhuma questão disponível para este quiz.</p>
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,244,248,0.7)' }}
        >
          <RotateCcw size={15} />
          Gerar novo quiz
        </button>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div className="flex flex-col flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/40 text-xs font-medium">
            Questao {currentIndex + 1} de {total}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-xs">
              {score} acerto{score !== 1 ? 's' : ''}
            </span>
            <button
              onClick={onRestart}
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-purple-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          <div
            className="rounded-2xl p-5 mb-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-white text-sm leading-relaxed">{question.text}</p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {question.options?.map((option, i) => {
              const letter = option.charAt(0);
              const isSelected = selectedAnswer === option;
              const isCorrectOption = letter === question.correctAnswer.charAt(0);

              let bgColor = 'rgba(255,255,255,0.03)';
              let borderColor = 'rgba(255,255,255,0.06)';
              let textColor = 'rgba(240,244,248,0.8)';

              if (questionState !== 'unanswered') {
                if (isCorrectOption) {
                  bgColor = 'rgba(16,185,129,0.1)';
                  borderColor = 'rgba(16,185,129,0.3)';
                  textColor = '#10B981';
                } else if (isSelected && !isCorrectOption) {
                  bgColor = 'rgba(239,68,68,0.1)';
                  borderColor = 'rgba(239,68,68,0.3)';
                  textColor = '#EF4444';
                }
              } else if (isSelected) {
                bgColor = 'rgba(139,92,246,0.1)';
                borderColor = 'rgba(139,92,246,0.3)';
                textColor = '#FFFFFF';
              }

              return (
                <motion.button
                  key={i}
                  onClick={() => handleSelect(option)}
                  disabled={questionState !== 'unanswered'}
                  className="w-full text-left rounded-xl p-4 transition-all"
                  style={{ background: bgColor, border: `1px solid ${borderColor}`, color: textColor }}
                  whileHover={questionState === 'unanswered' ? { scale: 1.01 } : {}}
                  whileTap={questionState === 'unanswered' ? { scale: 0.99 } : {}}
                >
                  <div className="flex items-center gap-3">
                    {questionState !== 'unanswered' && isCorrectOption && (
                      <CheckCircle size={18} className="text-green-400 shrink-0" />
                    )}
                    {questionState !== 'unanswered' && isSelected && !isCorrectOption && (
                      <XCircle size={18} className="text-red-400 shrink-0" />
                    )}
                    <span className="text-sm">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {questionState !== 'unanswered' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl p-4"
                style={{
                  background: questionState === 'correct' ? 'rgba(16,185,129,0.06)' : 'rgba(245,166,35,0.06)',
                  border: `1px solid ${questionState === 'correct' ? 'rgba(16,185,129,0.12)' : 'rgba(245,166,35,0.12)'}`,
                }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: questionState === 'correct' ? '#10B981' : '#F5A623' }}>
                  {questionState === 'correct' ? '✅ Correto!' : '💡 Explicacao:'}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,244,248,0.6)' }}>
                  {question.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Action button */}
      <div className="mt-4 pt-3 border-t border-white/5">
        {questionState === 'unanswered' ? (
          <motion.button
            onClick={handleConfirm}
            disabled={!selectedAnswer}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #4F46E5)', color: 'white' }}
            whileHover={selectedAnswer ? { scale: 1.01 } : {}}
            whileTap={{ scale: 0.99 }}
          >
            Confirmar resposta
          </motion.button>
        ) : (
          <motion.button
            onClick={handleNext}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #4F46E5)', color: 'white' }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {isLast ? (
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
          </motion.button>
        )}
      </div>
    </div>
  );
}
