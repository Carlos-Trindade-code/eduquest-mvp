'use client';

import { motion } from 'framer-motion';
import { Shield, Brain, GraduationCap, Sparkles, CheckCircle2 } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

const methods = [
  {
    icon: Brain,
    title: 'Método Socrático',
    description: 'Técnica milenar usada por Sócrates, validada por Harvard Education Review como superior ao ensino direto.',
    badge: 'Validado cientificamente',
    color: '#8B5CF6',
  },
  {
    icon: GraduationCap,
    title: 'Repetição Espaçada (SM-2)',
    description: 'Algoritmo que otimiza a revisão de conteúdo nos intervalos ideais, aumentando retenção em até 90%.',
    badge: 'Usado por +50M estudantes',
    color: '#3B82F6',
  },
  {
    icon: Sparkles,
    title: 'IA de Última Geração',
    description: 'Google Gemini com raciocínio avançado, adaptando linguagem e dificuldade para cada faixa etária.',
    badge: 'Tecnologia de ponta',
    color: '#EC4899',
  },
  {
    icon: Shield,
    title: 'Privacidade Total',
    description: 'Dados protegidos com criptografia e Row Level Security. Cada usuário só acessa o que é seu.',
    badge: 'Dados seguros',
    color: '#10B981',
  },
];

const trustItems = [
  'Método comprovado por mais de 2.400 anos de prática',
  'IA treinada para NUNCA dar respostas prontas',
  'Adaptado para 5 faixas etárias (4-18 anos)',
  'Dashboard completo para pais acompanharem',
  'Gamificação baseada em psicologia motivacional',
  'Funciona com qualquer matéria escolar',
];

export function SocialProof() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.span
            variants={fadeInUp('medium')}
            className="text-sm font-medium text-purple-400"
          >
            Por que funciona
          </motion.span>
          <motion.h2
            variants={fadeInUp('medium')}
            className="mt-3 text-3xl sm:text-4xl font-bold text-[#1E1B4B]"
          >
            Baseado em{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              ciência
            </span>
            , potencializado por{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              IA
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp('medium')}
            className="mt-4 text-gray-500 text-lg"
          >
            Não inventamos a roda. Combinamos os métodos de ensino mais eficazes
            do mundo com inteligência artificial de última geração.
          </motion.p>
        </motion.div>

        {/* Methods grid */}
        <motion.div
          className="grid sm:grid-cols-2 gap-6 mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {methods.map((method) => (
            <motion.div
              key={method.title}
              variants={fadeInUp('medium')}
              className="group relative rounded-2xl p-6 bg-white hover:bg-gray-50/50 transition-all duration-300 border border-gray-100 hover:border-gray-200 shadow-sm"
            >
              {/* Badge */}
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold mb-4"
                style={{
                  background: `${method.color}15`,
                  color: method.color,
                  border: `1px solid ${method.color}25`,
                }}
              >
                <CheckCircle2 className="w-3 h-3" />
                {method.badge}
              </span>

              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${method.color}15` }}
                >
                  <method.icon className="w-6 h-6" style={{ color: method.color }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1E1B4B] mb-1 break-words">{method.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{method.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust checklist */}
        <motion.div
          className="max-w-2xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <motion.div variants={fadeInUp('medium')} className="text-center mb-8">
            <h3 className="text-xl font-bold text-[#1E1B4B]">O que torna o Studdo único</h3>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-3">
            {trustItems.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp('medium')}
                className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100"
              >
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span className="text-gray-500 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
