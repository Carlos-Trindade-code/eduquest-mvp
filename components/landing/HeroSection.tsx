'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import { MascotOwl } from '@/components/illustrations/MascotOwl';

const stats = [
  { value: '94%', label: 'entendem o conteúdo na 1ª sessão' },
  { value: '3×', label: 'mais retenção que aula expositiva' },
  { value: '12min', label: 'em média para resolver uma dúvida' },
];

const trustItems = [
  'Sem respostas prontas — a criança pensa sozinha',
  'Dashboard em tempo real para os pais',
  'Funciona para 4 a 18 anos',
];

const chatMessages = [
  { role: 'kid', text: 'Não entendi nada de frações 😭', delay: 0.2 },
  { role: 'edu', text: 'Tudo bem! Se você partir uma pizza em 4 pedaços e comer 1, quanto sobrou?', delay: 1.2 },
  { role: 'kid', text: '3 pedaços?', delay: 2.4 },
  { role: 'edu', text: 'Isso! Então você comeu ¼ da pizza. Ficou mais claro? 🍕', delay: 3.4 },
  { role: 'kid', text: 'Ahh! Agora entendi!!! 🤩', delay: 4.4 },
];

function ChatPreview() {
  return (
    <div
      className="relative w-full max-w-sm mx-auto"
      style={{ filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.5))' }}
    >
      {/* Phone frame */}
      <div
        className="relative rounded-[2rem] overflow-hidden"
        style={{
          background: '#0D1B2A',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-xs font-medium" style={{ color: 'rgba(240,244,248,0.4)' }}>9:41</span>
          <div className="flex items-center gap-1">
            {[4, 3, 2].map((h) => (
              <div key={h} className="rounded-sm" style={{ width: 3, height: h * 2, background: 'rgba(240,244,248,0.35)' }} />
            ))}
            <div className="w-4 h-2 rounded-sm ml-1" style={{ background: 'rgba(240,244,248,0.35)' }} />
          </div>
        </div>

        {/* Chat header */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <MascotOwl expression="waving" size="sm" animated />
          <div>
            <div className="text-sm font-semibold text-white">Edu</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs" style={{ color: 'rgba(240,244,248,0.45)' }}>online</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.2)', color: '#F5A623' }}>
            🔥 5
          </div>
        </div>

        {/* Messages */}
        <div className="px-4 py-4 space-y-3 min-h-[240px]">
          {chatMessages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${msg.role === 'kid' ? 'justify-end' : 'justify-start'} items-end gap-2`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: msg.delay, duration: 0.4 }}
            >
              {msg.role === 'edu' && (
                <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden">
                  <MascotOwl expression="encouraging" size="sm" animated={false} className="w-6 h-6" />
                </div>
              )}
              <div
                className="max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-snug"
                style={
                  msg.role === 'kid'
                    ? { background: '#00B4D8', color: 'white', borderBottomRightRadius: 4 }
                    : { background: 'rgba(255,255,255,0.07)', color: 'rgba(240,244,248,0.9)', borderBottomLeftRadius: 4 }
                }
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 5.6, duration: 1.5, repeat: Infinity }}
          >
            <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden">
              <MascotOwl expression="thinking" size="sm" animated={false} className="w-6 h-6" />
            </div>
            <div className="flex gap-1 px-3 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', borderBottomLeftRadius: 4 }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'rgba(240,244,248,0.4)' }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* XP bar at bottom */}
        <motion.div
          className="px-4 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.8 }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium" style={{ color: '#F5A623' }}>+25 XP ganhos! 🏆</span>
            <span className="text-xs" style={{ color: 'rgba(240,244,248,0.4)' }}>Nível 3</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #F5A623, #FBBF24)' }}
              initial={{ width: '40%' }}
              animate={{ width: '72%' }}
              transition={{ delay: 4.9, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Floating badges */}
      <motion.div
        className="absolute -right-4 top-16 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        style={{ background: '#10B981', color: 'white', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 3.0 }}
      >
        <span>✓</span> Entendeu!
      </motion.div>

      <motion.div
        className="absolute -left-4 bottom-24 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        style={{ background: '#8B5CF6', color: 'white', boxShadow: '0 4px 16px rgba(139,92,246,0.4)' }}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 5.2 }}
      >
        🏅 Primeiro Badge
      </motion.div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #0F2942 50%, #0D1B2A 100%)' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,180,216,0.1),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,166,35,0.06),transparent_55%)]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT: copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp('high')} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
                style={{ background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.25)', color: '#38BDF8' }}>
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Tutor IA com Método Socrático
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp('high')}
              className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] tracking-tight"
            >
              Seu filho vai parar de dizer{' '}
              <span style={{ color: '#F5A623' }}>"não entendi"</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeInUp('high')}
              className="mt-6 text-xl leading-relaxed"
              style={{ color: 'rgba(240,244,248,0.65)' }}
            >
              O Studdo usa IA para fazer perguntas — não dar respostas. Seu filho{' '}
              <strong className="text-white">pensa, descobre e aprende de verdade</strong>. Você acompanha tudo em tempo real.
            </motion.p>

            {/* Trust checklist */}
            <motion.ul variants={fadeInUp('high')} className="mt-6 space-y-2">
              {trustItems.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(240,244,248,0.55)' }}>
                  <CheckCircle size={15} style={{ color: '#F5A623', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </motion.ul>

            {/* CTA */}
            <motion.div variants={fadeInUp('high')} className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/tutor"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
                style={{ background: '#F5A623', color: '#0D1B2A', boxShadow: '0 8px 32px rgba(245,166,35,0.35)' }}
              >
                Testar gratis agora
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-base transition-all hover:bg-white/10"
                style={{ color: 'rgba(240,244,248,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                Criar conta gratuita
              </Link>
            </motion.div>

            {/* Stat bar */}
            <motion.div
              variants={fadeInUp('high')}
              className="mt-12 grid grid-cols-3 gap-6 pt-8"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#F5A623' }}>{s.value}</div>
                  <div className="text-xs mt-1 leading-snug" style={{ color: 'rgba(240,244,248,0.45)' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: chat preview */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          >
            <ChatPreview />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
