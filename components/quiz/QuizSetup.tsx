'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Loader2, Home } from 'lucide-react';
import Link from 'next/link';
import { SubjectSelector } from '@/components/tutor/SubjectSelector';
import { AgeGroupSelector } from '@/components/tutor/AgeGroupSelector';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import type { AgeGroup } from '@/lib/auth/types';
import type { ExamData } from '@/components/exam/ExamGenerator';

interface QuizSetupProps {
  onQuizReady: (exam: ExamData) => void;
}

export function QuizSetup({ onQuizReady }: QuizSetupProps) {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('math');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('10-12');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    const subjectLabels: Record<string, string> = {
      math: 'Matemática geral',
      portuguese: 'Português geral',
      history: 'História geral',
      science: 'Ciências geral',
      geography: 'Geografia geral',
      english: 'Inglês geral',
      other: 'Conhecimentos gerais',
    };
    const effectiveTopic = topic.trim() || subjectLabels[subject] || subject;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: effectiveTopic, subject, ageGroup, questionCount }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onQuizReady(data.exam);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center flex-1 py-6 px-4 max-w-lg mx-auto w-full"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp('medium')} className="mb-4">
        <MascotOwl expression="thinking" size="lg" animated />
      </motion.div>

      <motion.h1 variants={fadeInUp('medium')} className="text-white text-2xl font-extrabold mb-1 text-center">
        Modo Quiz
      </motion.h1>
      <motion.p variants={fadeInUp('medium')} className="text-sm text-center mb-6" style={{ color: 'rgba(240,244,248,0.5)' }}>
        Teste seus conhecimentos com perguntas geradas pelo Edu
      </motion.p>

      <motion.div variants={fadeInUp('medium')} className="w-full space-y-4">
        {/* Subject */}
        <div>
          <label className="text-white/50 text-xs font-medium block mb-2">Materia</label>
          <SubjectSelector selected={subject} onSelect={setSubject} />
        </div>

        {/* Age */}
        <div>
          <label className="text-white/50 text-xs font-medium block mb-2">Faixa etaria</label>
          <AgeGroupSelector selected={ageGroup} onSelect={setAgeGroup} />
        </div>

        {/* Topic */}
        <div>
          <label className="text-white/50 text-xs font-medium block mb-2">Tema do quiz <span className="text-white/30">(opcional)</span></label>
          <input
            type="text"
            value={topic}
            onChange={(e) => { setTopic(e.target.value); setError(''); }}
            placeholder="Deixe vazio para tema geral, ou digite: Frações, Verbos..."
            className="w-full bg-white/5 text-white placeholder-white/40 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm"
          />
        </div>

        {/* Question count */}
        <div>
          <label className="text-white/50 text-xs font-medium block mb-2">Quantidade</label>
          <div className="flex gap-2">
            {[5, 10].map((n) => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  questionCount === n
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                }`}
                style={questionCount !== n ? { border: '1px solid rgba(255,255,255,0.06)' } : {}}
              >
                {n} questoes
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs text-center">{error}</p>
        )}

        {/* Start button */}
        <motion.button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #4F46E5)', color: 'white', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Gerando quiz...
            </>
          ) : (
            <>
              <Zap size={16} />
              Comecar quiz
            </>
          )}
        </motion.button>

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors py-1"
        >
          <Home size={12} />
          Voltar ao inicio
        </Link>
      </motion.div>
    </motion.div>
  );
}
