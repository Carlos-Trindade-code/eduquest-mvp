'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { SubjectSelector } from '@/components/tutor/SubjectSelector';
import { AgeGroupSelector } from '@/components/tutor/AgeGroupSelector';
import { PhotoUpload } from '@/components/tutor/PhotoUpload';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { TimerSelector } from '@/components/exam/ExamTimer';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import type { AgeGroup } from '@/lib/auth/types';

export interface ExamData {
  title: string;
  subject: string;
  ageGroup: string;
  instructions: string;
  questions: {
    number: number;
    type: 'multiple_choice' | 'essay';
    text: string;
    options: string[] | null;
    correctAnswer: string;
    explanation: string;
    visuals?: Array<{ type: 'image' | 'figure' | 'chart'; url: string; alt?: string }>;
  }[];
}

interface ExamGeneratorProps {
  onExamGenerated: (exam: ExamData, timerMinutes: number) => void;
}

const questionCountOptions = [
  { value: 5, label: '5 questões' },
  { value: 10, label: '10 questões' },
  { value: 15, label: '15 questões' },
  { value: 20, label: '20 questões' },
];

export function ExamGenerator({ onExamGenerated }: ExamGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('other');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('10-12');
  const [questionCount, setQuestionCount] = useState(10);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim() && !fileContent.trim()) {
      setError('Informe um tema ou envie um arquivo com o conteúdo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          subject,
          ageGroup,
          questionCount,
          fileContent: fileContent.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao gerar prova');
      }

      onExamGenerated(data.exam, timerMinutes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar prova');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="glass p-6 sm:p-8 rounded-[var(--eq-radius-lg)] max-w-2xl mx-auto"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeInUp('high')} className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <MascotOwl expression="reading" size="lg" />
        </div>
        <h1 className="text-[var(--eq-text)] text-xl sm:text-2xl font-bold mb-2">
          Gerador de Provas
        </h1>
        <p className="text-[var(--eq-text-secondary)] text-sm">
          Crie provas personalizadas com gabarito explicado!
        </p>
      </motion.div>

      {/* Age Group */}
      <motion.div variants={fadeInUp('medium')}>
        <AgeGroupSelector
          selected={ageGroup}
          onSelect={setAgeGroup}
          label="Faixa etária do aluno"
        />
      </motion.div>

      {/* Subject */}
      <motion.div variants={fadeInUp('medium')}>
        <SubjectSelector
          selected={subject}
          onSelect={setSubject}
          label="Matéria"
        />
      </motion.div>

      {/* Topic */}
      <motion.div variants={fadeInUp('medium')}>
        <label className="text-[var(--eq-text-secondary)] text-sm font-medium block mb-2">
          Tema da prova
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ex: Revolução Francesa, Frações, Verbo To Be, Sistema Solar..."
          className="w-full bg-[var(--eq-surface)] text-[var(--eq-text)] placeholder:text-[var(--eq-text-muted)] rounded-[var(--eq-radius-sm)] p-4 min-h-24 resize-none border border-[var(--eq-surface-border)] focus:outline-none focus:ring-2 focus:ring-[var(--eq-primary)]/40 focus:border-[var(--eq-primary)] text-sm transition-all backdrop-blur-md"
        />
      </motion.div>

      {/* File Upload */}
      <motion.div variants={fadeInUp('medium')} className="mt-4">
        <p className="text-[var(--eq-text-secondary)] text-sm mb-2 font-medium">
          Ou envie material de referência (opcional):
        </p>
        <PhotoUpload onTextExtracted={(text) => setFileContent(text)} />
        {fileContent && (
          <div className="mt-2 flex items-center gap-2 text-green-400 text-xs">
            <FileText size={14} />
            Material carregado com sucesso!
          </div>
        )}
      </motion.div>

      {/* Question Count */}
      <motion.div variants={fadeInUp('medium')} className="mt-5">
        <label className="text-[var(--eq-text-secondary)] text-sm font-medium block mb-2">
          Quantidade de questões
        </label>
        <div className="grid grid-cols-4 gap-2">
          {questionCountOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setQuestionCount(opt.value)}
              className={`py-2 px-3 rounded-[var(--eq-radius-sm)] text-sm font-medium transition-all border ${
                questionCount === opt.value
                  ? 'bg-[var(--eq-primary)]/20 border-[var(--eq-primary)]/50 text-[var(--eq-primary)]'
                  : 'bg-[var(--eq-surface)] border-[var(--eq-surface-border)] text-[var(--eq-text-secondary)] hover:bg-[var(--eq-surface-hover)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Timer */}
      <motion.div variants={fadeInUp('medium')} className="mt-5">
        <TimerSelector selected={timerMinutes} onSelect={setTimerMinutes} />
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-red-500/15 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3"
        >
          {error}
        </motion.div>
      )}

      {/* Generate Button */}
      <motion.div variants={fadeInUp('medium')} className="mt-6">
        <Button
          onClick={handleGenerate}
          disabled={loading || (!topic.trim() && !fileContent.trim())}
          variant="primary"
          size="lg"
          rounded="lg"
          className="w-full gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando prova...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Gerar Prova
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
