'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, FileText, PenTool, HelpCircle, Loader2, AlertCircle } from 'lucide-react';
import { QuizPlayer } from '@/components/activities/QuizPlayer';
import { SummaryView } from './SummaryView';
import { ExercisePlayer } from './ExercisePlayer';
import type { QuizQuestion, AgeGroup } from '@/lib/auth/types';

type ContentMode = 'menu' | 'quiz' | 'summary' | 'exercises' | 'loading';

interface ContentActionsProps {
  materialText: string;
  subject: string;
  ageGroup: AgeGroup;
  onStudyWithTutor: () => void;
}

export function ContentActions({ materialText, subject, ageGroup, onStudyWithTutor }: ContentActionsProps) {
  const [mode, setMode] = useState<ContentMode>('menu');
  const [loadingType, setLoadingType] = useState('');
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [summaryData, setSummaryData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [exercisesData, setExercisesData] = useState<any>(null);

  const generate = async (type: 'quiz' | 'summary' | 'exercises') => {
    setError('');
    setMode('loading');
    setLoadingType(type === 'quiz' ? 'quiz' : type === 'summary' ? 'resumo' : 'exercícios');

    try {
      const endpoint = `/api/generate-${type}`;
      const body: Record<string, unknown> = { materialText, subject, ageGroup };
      if (type === 'quiz') body.questionCount = 5;
      if (type === 'exercises') body.exerciseCount = 5;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao gerar conteúdo');
      }

      const data = await res.json();

      if (type === 'quiz') {
        setQuizData(data.questions);
        setMode('quiz');
      } else if (type === 'summary') {
        setSummaryData(data);
        setMode('summary');
      } else {
        setExercisesData(data.exercises);
        setMode('exercises');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar conteúdo');
      setMode('menu');
    }
  };

  const backToMenu = () => {
    setMode('menu');
    setError('');
  };

  if (mode === 'loading') {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-4 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Loader2 size={32} className="text-purple-400 animate-spin" />
        <p className="text-white/60 text-sm">Gerando {loadingType}...</p>
        <p className="text-white/25 text-xs">O Edu está preparando tudo para você</p>
      </motion.div>
    );
  }

  if (mode === 'quiz' && quizData) {
    return (
      <QuizPlayer
        questions={quizData}
        subject={subject}
        title="Quiz do material"
        onComplete={() => backToMenu()}
        onClose={backToMenu}
      />
    );
  }

  if (mode === 'summary' && summaryData) {
    return <SummaryView data={summaryData} onClose={backToMenu} />;
  }

  if (mode === 'exercises' && exercisesData) {
    return (
      <ExercisePlayer
        exercises={exercisesData}
        subject={subject}
        onComplete={backToMenu}
        onClose={backToMenu}
      />
    );
  }

  // Menu mode
  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-white/50 text-xs font-medium text-center mb-2">
        O que quer fazer com esse material?
      </p>

      <AnimatePresence>
        {error && (
          <motion.div
            className="flex items-center gap-2 text-red-300 text-xs p-3 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          icon={<MessageCircle size={20} />}
          label="Estudar com o Edu"
          description="Conversar sobre o conteúdo"
          color="purple"
          onClick={onStudyWithTutor}
        />
        <ActionButton
          icon={<HelpCircle size={20} />}
          label="Gerar Quiz"
          description="Perguntas de múltipla escolha"
          color="amber"
          onClick={() => generate('quiz')}
        />
        <ActionButton
          icon={<FileText size={20} />}
          label="Gerar Resumo"
          description="Resumo estruturado"
          color="cyan"
          onClick={() => generate('summary')}
        />
        <ActionButton
          icon={<PenTool size={20} />}
          label="Exercícios"
          description="Prática com respostas"
          color="emerald"
          onClick={() => generate('exercises')}
        />
      </div>
    </motion.div>
  );
}

function ActionButton({
  icon,
  label,
  description,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
}) {
  const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    purple: { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', text: 'rgba(139,92,246,0.9)', icon: 'text-purple-400' },
    amber: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: 'rgba(245,158,11,0.9)', icon: 'text-amber-400' },
    cyan: { bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)', text: 'rgba(6,182,212,0.9)', icon: 'text-cyan-400' },
    emerald: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', text: 'rgba(16,185,129,0.9)', icon: 'text-emerald-400' },
  };
  const c = colors[color] || colors.purple;

  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all hover:scale-[1.02] active:scale-95"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      <span className={c.icon}>{icon}</span>
      <span className="text-xs font-bold" style={{ color: c.text }}>{label}</span>
      <span className="text-[10px] text-white/30">{description}</span>
    </motion.button>
  );
}
