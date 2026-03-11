'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import { cn } from '@/lib/utils';

const ageGroups = [
  {
    id: '4-6',
    label: '4-6 anos',
    title: 'Pre-escola',
    description: 'Linguagem simples com emojis, sessoes de 10 minutos, muito incentivo e celebracoes.',
    features: ['Mascote interativo', 'Animacoes divertidas', 'Texto grande e colorido', 'Sessoes curtas'],
    color: '#8B5CF6',
    bgGradient: 'from-purple-600/20 to-pink-600/20',
    expression: 'encouraging' as const,
  },
  {
    id: '7-9',
    label: '7-9 anos',
    title: '1o ao 3o ano',
    description: 'Desafios progressivos, vocabulario adequado e feedback positivo constante.',
    features: ['Mascote guia', 'Gamificacao ativa', 'Perguntas adaptadas', 'Dicas visuais'],
    color: '#3B82F6',
    bgGradient: 'from-blue-600/20 to-cyan-600/20',
    expression: 'waving' as const,
  },
  {
    id: '10-12',
    label: '10-12 anos',
    title: '4o e 5o ano',
    description: 'Metodo Feynman, modo explorador e conexoes entre materias.',
    features: ['Metodo Feynman', 'Modo explorador', 'Interface balanceada', 'Desafios extras'],
    color: '#14B8A6',
    bgGradient: 'from-teal-600/20 to-emerald-600/20',
    expression: 'thinking' as const,
  },
  {
    id: '13-15',
    label: '13-15 anos',
    title: '6o ao 8o ano',
    description: 'Pensamento de alta ordem, debates e analise de produtividade.',
    features: ['HOTS Questions', 'Debates socraticos', 'Interleaving', 'Analise de produtividade'],
    color: '#6366F1',
    bgGradient: 'from-indigo-600/20 to-violet-600/20',
    expression: 'neutral' as const,
  },
  {
    id: '16-18',
    label: '16-18 anos',
    title: 'Ensino Medio',
    description: 'Interface profissional, sessoes longas e auto-monitoramento.',
    features: ['Auto-monitoramento', 'Sessoes de 45min', 'Interface minimalista', 'Analise completa'],
    color: '#6366F1',
    bgGradient: 'from-slate-600/20 to-zinc-600/20',
    expression: 'reading' as const,
  },
];

export function AgeGroupShowcase() {
  const [selected, setSelected] = useState(0);
  const group = ageGroups[selected];

  return (
    <section id="ages" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.span
            variants={fadeInUp('medium')}
            className="text-sm font-medium text-purple-400"
          >
            Para todas as idades
          </motion.span>
          <motion.h2
            variants={fadeInUp('medium')}
            className="mt-3 text-3xl sm:text-4xl font-bold text-white"
          >
            Uma experiencia unica para cada faixa etaria
          </motion.h2>
        </motion.div>

        {/* Age tabs */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {ageGroups.map((ag, i) => (
            <button
              key={ag.id}
              onClick={() => setSelected(i)}
              className={cn(
                'relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
                selected === i
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              )}
            >
              {selected === i && (
                <motion.div
                  layoutId="age-tab-bg"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: ag.color }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{ag.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'glass rounded-2xl p-8 md:p-12 bg-gradient-to-br',
              group.bgGradient
            )}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Info */}
              <div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium mb-4"
                  style={{ background: `${group.color}25`, color: group.color }}
                >
                  {group.title}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{group.label}</h3>
                <p className="text-white/60 mb-6 leading-relaxed">{group.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  {group.features.map((feat) => (
                    <div
                      key={feat}
                      className="flex items-center gap-2 text-sm text-white/70"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: group.color }}
                      />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mascot preview */}
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full blur-3xl opacity-20"
                    style={{ background: group.color }}
                  />
                  <MascotOwl expression={group.expression} size="xl" />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
