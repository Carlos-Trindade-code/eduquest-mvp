'use client';

import { motion } from 'framer-motion';
import {
  MessageCircleQuestion,
  Users,
  Trophy,
  BarChart3,
  Zap,
  Camera,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

const features = [
  {
    icon: MessageCircleQuestion,
    title: 'Metodo Socratico',
    description:
      'Nunca da respostas prontas. Guia o aluno com perguntas que desenvolvem o raciocinio critico.',
    color: '#8B5CF6',
  },
  {
    icon: Users,
    title: 'Adaptativo por Idade',
    description:
      'Linguagem, desafios e interface se adaptam automaticamente de 4 a 18 anos.',
    color: '#3B82F6',
  },
  {
    icon: Trophy,
    title: 'Gamificacao',
    description:
      'XP, niveis, badges e streaks que motivam o estudo diario sem perder o foco no aprendizado.',
    color: '#F59E0B',
  },
  {
    icon: BarChart3,
    title: 'Dashboard para Pais',
    description:
      'Acompanhe o progresso, receba alertas inteligentes e veja recomendacoes personalizadas.',
    color: '#10B981',
  },
  {
    icon: Zap,
    title: 'Modo Quiz',
    description:
      'Teste conhecimentos com quizzes gerados pela IA. Feedback instantaneo e XP por acerto.',
    color: '#EC4899',
  },
  {
    icon: Camera,
    title: 'OCR de Tarefas',
    description:
      'Tire foto da tarefa e a IA extrai o texto automaticamente. Comece a estudar em segundos.',
    color: '#06B6D4',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32">
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
            Recursos
          </motion.span>
          <motion.h2
            variants={fadeInUp('medium')}
            className="mt-3 text-3xl sm:text-4xl font-bold text-white"
          >
            Tudo que seu filho precisa para aprender de verdade
          </motion.h2>
          <motion.p
            variants={fadeInUp('medium')}
            className="mt-4 text-white/50 text-lg"
          >
            Combinamos ciencia cognitiva, gamificacao e inteligencia artificial para criar
            a melhor experiencia de aprendizado.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={fadeInUp('medium')}>
              <Card className="h-full group hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}20` }}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
