'use client';

import { motion } from 'framer-motion';
import { Camera, MessageCircleQuestion, Lightbulb, BarChart3 } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

const steps = [
  {
    icon: Camera,
    number: '01',
    title: 'Envie a tarefa',
    description: 'Tire uma foto ou digite o exercicio. A IA extrai o texto automaticamente.',
    color: '#06B6D4',
  },
  {
    icon: MessageCircleQuestion,
    number: '02',
    title: 'Perguntas guiadas',
    description: 'Em vez de dar a resposta, o tutor faz perguntas que guiam o raciocinio.',
    color: '#8B5CF6',
  },
  {
    icon: Lightbulb,
    number: '03',
    title: 'Descoberta ativa',
    description: 'A crianca descobre a resposta sozinha, construindo entendimento real.',
    color: '#F59E0B',
  },
  {
    icon: BarChart3,
    number: '04',
    title: 'Pais acompanham',
    description: 'Dashboard com graficos, alertas inteligentes e recomendacoes de atividades.',
    color: '#10B981',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.05),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Como funciona
          </motion.span>
          <motion.h2
            variants={fadeInUp('medium')}
            className="mt-3 text-3xl sm:text-4xl font-bold text-white"
          >
            Simples como 1, 2, 3, 4
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={fadeInUp('medium')}
              className="relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-gradient-to-r from-white/10 to-white/5" />
              )}

              <div className="text-center">
                {/* Icon */}
                <div className="relative inline-flex mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: `${step.color}15` }}
                  >
                    <step.icon className="w-8 h-8" style={{ color: step.color }} />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: step.color }}
                  >
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
