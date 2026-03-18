'use client';

import { motion } from 'framer-motion';
import { BarChart3, Trophy, Flame, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

const mockStats = [
  { icon: BarChart3, label: 'Sessões esta semana', value: '8', color: '#00B4D8' },
  { icon: Clock, label: 'Minutos estudados', value: '142', color: '#8B5CF6' },
  { icon: Trophy, label: 'XP acumulado', value: '840', color: '#F5A623' },
  { icon: Flame, label: 'Dias seguidos', value: '5 🔥', color: '#F97316' },
];

const features = [
  'Sessões por dia, semana e mês',
  'Matérias com mais dificuldade',
  'Streak e XP em tempo real',
  'Badges e conquistas desbloqueadas',
];

export function ParentDashboardPreview() {
  return (
    <section className="relative py-24 md:py-32" style={{ background: 'linear-gradient(180deg, transparent, rgba(26,46,66,0.6), transparent)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.span variants={fadeInUp('medium')} className="text-sm font-medium" style={{ color: '#00B4D8' }}>
              Para os pais
            </motion.span>
            <motion.h2 variants={fadeInUp('medium')} className="mt-3 text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Você acompanha tudo.<br />
              <span style={{ color: '#F5A623' }}>Em tempo real.</span>
            </motion.h2>
            <motion.p variants={fadeInUp('medium')} className="mt-4 text-lg leading-relaxed" style={{ color: 'rgba(240,244,248,0.6)' }}>
              Sem precisar perguntar "fez a lição?". O dashboard mostra exatamente o que seu filho estudou, por quanto tempo, e onde tem dificuldade.
            </motion.p>

            <motion.ul variants={staggerContainer} className="mt-6 space-y-3">
              {features.map((f) => (
                <motion.li key={f} variants={fadeInUp('medium')} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(240,244,248,0.65)' }}>
                  <CheckCircle size={16} style={{ color: '#F5A623', flexShrink: 0 }} />
                  {f}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={fadeInUp('medium')} className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: '#F5A623', color: '#0D1B2A', boxShadow: '0 4px 20px rgba(245,166,35,0.3)' }}
              >
                Criar conta gratuita para pais
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: mock dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="rounded-2xl p-6 shadow-2xl" style={{ background: '#1A2E42', border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Mock header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-white font-bold">Dashboard</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(240,244,248,0.4)' }}>Beatriz, 11 anos</div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'rgba(0,180,216,0.2)' }}>
                  👧
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {mockStats.map((s) => (
                  <div key={s.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <s.icon size={16} style={{ color: s.color }} className="mb-2" />
                    <div className="text-2xl font-extrabold text-white">{s.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(240,244,248,0.4)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Mock XP bar */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white font-medium">Nível 4 — Explorador</span>
                  <span className="text-xs" style={{ color: '#F5A623' }}>840 / 1000 XP</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #F5A623, #FBBF24)' }}
                    initial={{ width: 0 }}
                    whileInView={{ width: '84%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
