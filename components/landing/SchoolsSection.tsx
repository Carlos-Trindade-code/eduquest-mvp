'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

const features = [
  {
    emoji: '📚',
    title: 'Upload de Materiais',
    description: 'Envie PDFs e apostilas. O tutor IA usa como base para explicações personalizadas.',
  },
  {
    emoji: '📊',
    title: 'Dashboard por Turma',
    description: 'Acompanhe o progresso de cada aluno: sessões, XP, dificuldades e pontos fortes.',
  },
  {
    emoji: '🎯',
    title: 'Código de Turma',
    description: 'Alunos entram com um código simples. Sem emails, sem complicação.',
  },
  {
    emoji: '🤖',
    title: 'Método Socrático com IA',
    description: 'O tutor nunca dá a resposta pronta. Guia o raciocínio com perguntas, como o melhor professor.',
  },
];

export function SchoolsSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0A0A1A 0%, #0D1B2A 50%, #0A0A1A 100%)' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp('high')} className="mb-6">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Para Escolas
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp('high')}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white"
          >
            Para Escolas e Professores
          </motion.h2>
          <motion.p
            variants={fadeInUp('high')}
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: 'rgba(30,41,59,0.6)' }}
          >
            Tecnologia educacional que complementa sua sala de aula
          </motion.p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp('high')}
              className="group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: 'rgba(0,0,0,0.02)',
                border: '1px solid rgba(16,185,129,0.12)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.08), transparent 70%)' }}
              />
              <div className="relative">
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(30,41,59,0.6)' }}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA + trust badge */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-14 text-center"
        >
          <motion.div variants={fadeInUp('high')}>
            <Link
              href="/escolas"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFFFFF', boxShadow: '0 8px 32px rgba(16,185,129,0.35)' }}
            >
              Saiba mais para escolas
              <ArrowRight size={18} />
            </Link>
          </motion.div>
          <motion.p
            variants={fadeInUp('high')}
            className="mt-5 inline-flex items-center gap-2 text-sm"
            style={{ color: 'rgba(16,185,129,0.7)' }}
          >
            <Shield size={15} />
            Programa piloto gratuito para escolas parceiras
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
