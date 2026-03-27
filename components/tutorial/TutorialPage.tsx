'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  FileText,
  MessageCircleQuestion,
  Trophy,
  Clock,
  Upload,
  Sparkles,
  BookOpen,
  Brain,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { DemoChatSimulation } from './DemoChatSimulation';
import { XPAnimation } from './XPAnimation';
import { fadeInUp, staggerContainer, bounceIn } from '@/lib/design/animations';
import type { MascotExpression } from '@/components/illustrations/MascotOwl';

// ============================================================
// Step configuration
// ============================================================
interface TutorialStep {
  number: string;
  title: string;
  subtitle: string;
  mascot: MascotExpression;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const steps: TutorialStep[] = [
  {
    number: '01',
    title: 'Escolha sua idade',
    subtitle: 'O Edu adapta a linguagem e dificuldade para voce',
    mascot: 'waving',
    color: '#3B82F6',
    icon: Sparkles,
  },
  {
    number: '02',
    title: 'Escolha a materia',
    subtitle: '7 materias cobrindo todo o curriculo escolar',
    mascot: 'reading',
    color: '#8B5CF6',
    icon: BookOpen,
  },
  {
    number: '03',
    title: 'Envie sua tarefa',
    subtitle: 'Tire foto, anexe material ou digite o exercicio',
    mascot: 'thinking',
    color: '#06B6D4',
    icon: Camera,
  },
  {
    number: '04',
    title: 'Converse com o Edu',
    subtitle: 'Ele te guia a descobrir a resposta por conta propria',
    mascot: 'encouraging',
    color: '#10B981',
    icon: MessageCircleQuestion,
  },
  {
    number: '05',
    title: 'Ganhe XP e suba de nivel!',
    subtitle: 'Conquistas, badges e streaks te motivam a estudar todo dia',
    mascot: 'celebrating',
    color: '#F59E0B',
    icon: Trophy,
  },
];

// ============================================================
// Age group mini demo
// ============================================================
const ageGroups = [
  { range: '4-6', emoji: '🧒', label: 'Pequenos', color: '#10B981' },
  { range: '7-9', emoji: '👦', label: 'Curiosos', color: '#3B82F6' },
  { range: '10-12', emoji: '🧑', label: 'Exploradores', color: '#8B5CF6' },
  { range: '13-15', emoji: '👩‍🎓', label: 'Jovens', color: '#F59E0B' },
  { range: '16-18', emoji: '🎓', label: 'Vestibulandos', color: '#EF4444' },
];

const subjects = [
  { name: 'Matematica', emoji: '🔢', color: '#3B82F6' },
  { name: 'Portugues', emoji: '📖', color: '#10B981' },
  { name: 'Historia', emoji: '🏛️', color: '#F59E0B' },
  { name: 'Ciencias', emoji: '🔬', color: '#8B5CF6' },
  { name: 'Geografia', emoji: '🌍', color: '#06B6D4' },
  { name: 'Ingles', emoji: '🇺🇸', color: '#EF4444' },
];

// ============================================================
// Section wrapper
// ============================================================
function TutorialSection({
  step,
  children,
  reverse = false,
}: {
  step: TutorialStep;
  children: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section className="relative py-20 md:py-28">
      {/* Subtle glow */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background: `radial-gradient(ellipse at ${reverse ? 'left' : 'right'} center, ${step.color}, transparent 70%)`,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${reverse ? 'lg:grid-flow-dense' : ''}`}>
          {/* Text side */}
          <motion.div
            className={`text-center lg:text-left ${reverse ? 'lg:col-start-2' : ''}`}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {/* Step number */}
            <motion.div variants={fadeInUp('high')} className="mb-4">
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${step.color}15`,
                  color: step.color,
                  border: `1px solid ${step.color}30`,
                }}
              >
                <step.icon size={14} />
                Passo {step.number}
              </span>
            </motion.div>

            {/* Mascot */}
            <motion.div
              variants={bounceIn('high')}
              className="flex justify-center lg:justify-start mb-4"
            >
              <MascotOwl expression={step.mascot} size="lg" animated />
            </motion.div>

            {/* Title */}
            <motion.h2
              variants={fadeInUp('high')}
              className="text-3xl sm:text-4xl font-bold text-white mb-3"
            >
              {step.title}
            </motion.h2>

            <motion.p
              variants={fadeInUp('high')}
              className="text-white/50 text-lg max-w-md mx-auto lg:mx-0"
            >
              {step.subtitle}
            </motion.p>
          </motion.div>

          {/* Interactive demo side */}
          <motion.div
            className={reverse ? 'lg:col-start-1' : ''}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Main TutorialPage
// ============================================================
export function TutorialPage() {
  return (
    <div className="min-h-screen bg-[#0A0A1A]">
      {/* ========== HERO ========== */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900/40 to-indigo-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.2),transparent_60%)]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative text-center px-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <MascotOwl expression="celebrating" size="xl" animated />
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mt-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Como usar o{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Studdo
            </span>
          </motion.h1>

          <motion.p
            className="text-white/50 text-lg mt-4 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Em 5 passos simples voce vai aprender a estudar de um jeito totalmente novo.
            Vamos la?
          </motion.p>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <a href="#step-01" className="inline-flex flex-col items-center text-white/30 hover:text-white/60 transition-colors">
              <span className="text-sm mb-2">Rolar para comecar</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronDown size={24} />
              </motion.div>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ========== STEP 1: Age Groups ========== */}
      <div id="step-01">
        <TutorialSection step={steps[0]}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ageGroups.map((age, i) => (
              <motion.div
                key={age.range}
                className="glass rounded-xl p-4 text-center cursor-default"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, borderColor: `${age.color}40` }}
                style={{ borderWidth: 1, borderColor: 'transparent' }}
              >
                <span className="text-3xl block mb-1">{age.emoji}</span>
                <p className="text-white font-bold text-sm">{age.range} anos</p>
                <p className="text-white/40 text-xs">{age.label}</p>
              </motion.div>
            ))}
          </div>
        </TutorialSection>
      </div>

      {/* ========== STEP 2: Subjects ========== */}
      <TutorialSection step={steps[1]} reverse>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {subjects.map((subj, i) => (
            <motion.div
              key={subj.name}
              className="glass rounded-xl p-4 text-center cursor-default"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{
                scale: 1.05,
                backgroundColor: `${subj.color}15`,
              }}
            >
              <span className="text-2xl block mb-1">{subj.emoji}</span>
              <p className="text-white font-medium text-sm">{subj.name}</p>
            </motion.div>
          ))}
        </div>
      </TutorialSection>

      {/* ========== STEP 3: Upload ========== */}
      <TutorialSection step={steps[2]}>
        <div className="space-y-4">
          {/* Photo option */}
          <motion.div
            className="glass rounded-xl p-5 flex items-center gap-4"
            whileInView={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -20 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-14 h-14 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Camera size={28} className="text-cyan-400" />
            </motion.div>
            <div>
              <p className="text-white font-semibold text-sm">Tire uma foto</p>
              <p className="text-white/40 text-xs mt-0.5">
                Aponte a camera pro exercicio e a IA le automaticamente
              </p>
            </div>
          </motion.div>

          {/* File upload option */}
          <motion.div
            className="glass rounded-xl p-5 flex items-center gap-4"
            whileInView={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -20 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <div className="w-14 h-14 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
              <Upload size={28} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Anexe o material</p>
              <p className="text-white/40 text-xs mt-0.5">
                Envie PDF ou imagem do conteudo para o Edu extrair o que estudar
              </p>
            </div>
          </motion.div>

          {/* Type option */}
          <motion.div
            className="glass rounded-xl p-5 flex items-center gap-4"
            whileInView={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -20 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-14 h-14 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
              <FileText size={28} className="text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Digite o exercicio</p>
              <p className="text-white/40 text-xs mt-0.5">
                Cole ou escreva a questao diretamente
              </p>
            </div>
          </motion.div>
        </div>
      </TutorialSection>

      {/* ========== STEP 4: Chat Demo ========== */}
      <TutorialSection step={steps[3]} reverse>
        <DemoChatSimulation />
      </TutorialSection>

      {/* ========== STEP 5: Gamification ========== */}
      <TutorialSection step={steps[4]}>
        <XPAnimation />
      </TutorialSection>

      {/* ========== BONUS: Study Method ========== */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.06),transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div variants={fadeInUp('high')} className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <Clock size={14} className="text-indigo-400" />
                <span className="text-indigo-400 text-xs font-bold">BONUS</span>
              </div>
            </motion.div>

            <motion.div variants={bounceIn('high')} className="mb-4">
              <MascotOwl expression="thinking" size="lg" animated />
            </motion.div>

            <motion.h2 variants={fadeInUp('high')} className="text-3xl font-bold text-white mb-3">
              O Edu cuida do seu descanso
            </motion.h2>
            <motion.p variants={fadeInUp('high')} className="text-white/50 text-lg mb-8">
              Baseado na Tecnica Pomodoro, o Edu avisa quando e hora de fazer uma pausa.
              Estudar com intervalos regulares melhora a memorizacao em ate 40%!
            </motion.p>

            <motion.div variants={fadeInUp('high')} className="grid sm:grid-cols-3 gap-4">
              {[
                { time: '25 min', label: 'Foco total', emoji: '🧠', desc: 'Estude concentrado' },
                { time: '5 min', label: 'Pausa curta', emoji: '☕', desc: 'Descanse e respire' },
                { time: 'Repita!', label: 'Ciclo Pomodoro', emoji: '🔄', desc: 'A cada 4 ciclos, pausa longa' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="glass rounded-xl p-4"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <span className="text-2xl block mb-2">{item.emoji}</span>
                  <p className="text-white font-bold text-lg">{item.time}</p>
                  <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Continue studying prompt */}
            <motion.div
              variants={fadeInUp('high')}
              className="mt-8 glass rounded-2xl p-5 border border-green-500/20 inline-block"
            >
              <div className="flex items-center gap-3">
                <Brain size={20} className="text-green-400 shrink-0" />
                <p className="text-white/70 text-sm text-left">
                  Ao terminar, o Edu pergunta:{' '}
                  <span className="text-green-400 font-semibold">
                    &quot;Quer continuar avancando nesse assunto?&quot;
                  </span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== CTA Final ========== */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent" />
        <div className="relative max-w-xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <MascotOwl expression="celebrating" size="xl" animated />
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-white mt-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Pronto para comecar?
          </motion.h2>

          <motion.p
            className="text-white/50 text-lg mt-3 mb-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Crie sua conta gratis e comece a estudar com o Edu agora mesmo!
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button variant="primary" size="xl" rounded="lg" asChild>
              <Link href="/register" className="gap-2">
                Criar Conta Gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="secondary" size="xl" rounded="lg" asChild>
              <Link href="/login" className="gap-2">
                Ja tenho conta
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="h-8" />

      {/* Sticky CTA — visible after scrolling past hero */}
      <motion.div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3 }}
      >
        <Button variant="primary" size="lg" rounded="lg" asChild className="shadow-2xl shadow-purple-900/50">
          <Link href="/register" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Criar Conta Gratis
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
