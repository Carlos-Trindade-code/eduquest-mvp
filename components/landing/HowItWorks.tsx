'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

const steps = [
  {
    number: '01',
    emoji: '📸',
    title: 'Envie a tarefa',
    description: 'Foto, texto ou digitado. A IA extrai o conteúdo automaticamente.',
    color: '#00B4D8',
  },
  {
    number: '02',
    emoji: '🤔',
    title: 'Edu faz perguntas',
    description: 'Em vez de dar a resposta, o tutor guia o raciocínio com perguntas certeiras.',
    color: '#8B5CF6',
  },
  {
    number: '03',
    emoji: '💡',
    title: 'A criança descobre',
    description: 'Ela chega à resposta sozinha — e isso fica gravado na memória de verdade.',
    color: '#F5A623',
  },
  {
    number: '04',
    emoji: '🔗',
    title: 'Conecte a família',
    description: 'Pai cria conta e recebe um código. O filho digita o código e pronto — tudo conectado.',
    color: '#F59E0B',
  },
  {
    number: '05',
    emoji: '📊',
    title: 'Você acompanha',
    description: 'Dashboard com sessões, XP, streak e matérias. Tudo em tempo real.',
    color: '#10B981',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,180,216,0.04),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Problem/Solution header */}
        <motion.div
          className="grid lg:grid-cols-2 gap-8 mb-20 items-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {/* Problem */}
          <motion.div
            variants={fadeInUp('medium')}
            className="rounded-2xl p-8"
            style={{ background: 'rgba(255,100,100,0.05)', border: '1px solid rgba(255,100,100,0.1)' }}
          >
            <div className="text-3xl mb-4">😓</div>
            <h3 className="text-xl font-bold text-[#1E1B4B] mb-3">O problema que você conhece</h3>
            <p className="text-base leading-relaxed" style={{ color: '#6B7280' }}>
              Seu filho chega da escola com dúvida. Você não sabe explicar — ou explica e ele não entende do seu jeito. Ele vai dormir sem entender. E amanhã é a mesma coisa.
            </p>
          </motion.div>

          {/* Solution */}
          <motion.div
            variants={fadeInUp('medium')}
            className="rounded-2xl p-8"
            style={{ background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.15)' }}
          >
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-[#1E1B4B] mb-3">A solução que funciona</h3>
            <p className="text-base leading-relaxed" style={{ color: '#6B7280' }}>
              Em 12 minutos, seu filho explica a matéria pra você. Não porque decorou — porque o Edu fez as perguntas certas até ele entender sozinho.
            </p>
          </motion.div>
        </motion.div>

        {/* Section title */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B]">Como funciona</h2>
          <p className="mt-3 text-base" style={{ color: '#9CA3AF' }}>5 passos, resultado em minutos</p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={fadeInUp('medium')}
              className="relative rounded-2xl p-6 text-center"
              style={{ background: 'white', border: '1px solid rgba(99,102,241,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%+12px)] w-6 h-px"
                  style={{ background: 'rgba(99,102,241,0.15)' }} />
              )}

              <div className="text-4xl mb-4">{step.emoji}</div>
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white mb-3"
                style={{ background: step.color }}>
                {i + 1}
              </div>
              <h3 className="font-bold text-[#1E1B4B] mb-2">{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
