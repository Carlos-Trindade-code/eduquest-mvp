'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, Brain, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroIllustration } from '@/components/illustrations/HeroIllustration';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900/50 to-indigo-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Mascote animado e frases motivacionais */}
          <motion.div className="flex flex-col items-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <MascotOwl expression="encouraging" size="xl" animated className="mb-2" />
            <span className="text-lg text-purple-300 font-semibold">"Aprender é divertido! Você consegue!"</span>
            <span className="text-md text-blue-200 mt-1">Pais: acompanhem o progresso do seu filho em tempo real.</span>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp('high')} className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                Tutor IA com Metodo Socratico
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp('high')}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              Seu filho aprende{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                de verdade
              </span>
              . Sem respostas prontas.
            </motion.h1>

            <motion.p
              variants={fadeInUp('high')}
              className="mt-6 text-lg text-white/60 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              O Studdo usa inteligencia artificial de ultima geracao para guiar criancas
              de 4 a 18 anos a pensar, questionar e descobrir as respostas por conta propria.
              Metodo socratico + IA = aprendizado real.
            </motion.p>

            <motion.div
              variants={fadeInUp('high')}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button variant="primary" size="xl" rounded="lg" asChild>
                <Link href="/register" className="gap-2">
                  Comece Gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="secondary" size="xl" rounded="lg" asChild>
                <a href="#demo" className="gap-2">
                  <Play className="w-4 h-4" />
                  Veja como funciona
                </a>
              </Button>
              <Button variant="outline" size="xl" rounded="lg" asChild>
                <Link href="/parent/dashboard" className="gap-2">
                  Pais: Veja o progresso
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={fadeInUp('high')}
              className="mt-10 flex flex-wrap items-center gap-4 justify-center lg:justify-start"
            >
              {[
                { icon: Brain, text: 'Metodo cientificamente validado' },
                { icon: Zap, text: 'IA com raciocinio avancado' },
                { icon: Shield, text: 'Dados 100% protegidos' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-white/40 text-xs">
                  <item.icon className="w-3.5 h-3.5 text-purple-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp('high')}
              className="mt-8 flex items-center gap-8 justify-center lg:justify-start"
            >
              {[
                { value: '5', label: 'Faixas etarias' },
                { value: '7+', label: 'Materias' },
                { value: '100%', label: 'Adaptativo' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
