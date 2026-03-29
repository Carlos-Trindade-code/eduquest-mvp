'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Send, Loader2 } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import { MascotOwl } from '@/components/illustrations/MascotOwl';

const mobileChatMessages = [
  { role: 'kid' as const, text: 'Não entendo frações' },
  { role: 'edu' as const, text: 'Vamos pensar juntos! Se você tem uma pizza cortada em 4 pedaços e come 1, que fração sobra?' },
  { role: 'kid' as const, text: '3/4!' },
  { role: 'edu' as const, text: 'Exatamente! Você já sabe mais do que imagina!' },
];

function MobileChatPreview() {
  return (
    <motion.div
      className="lg:hidden mt-12 w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="flex items-center gap-3 px-4 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <MascotOwl expression="waving" size="sm" animated={false} decorative />
          <div>
            <div className="text-sm font-semibold text-white">Edu</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs" style={{ color: 'rgba(240,244,248,0.45)' }}>online</span>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          {mobileChatMessages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${msg.role === 'kid' ? 'justify-end' : 'justify-start'} items-end gap-2`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.25 }}
            >
              {msg.role === 'edu' && (
                <div className="w-5 h-5 rounded-full flex-shrink-0 overflow-hidden">
                  <MascotOwl expression="encouraging" size="sm" animated={false} className="w-5 h-5" decorative />
                </div>
              )}
              <div
                className="max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-snug"
                style={
                  msg.role === 'kid'
                    ? { background: '#8B5CF6', color: 'white', borderBottomRightRadius: 4 }
                    : { background: 'rgba(255,255,255,0.07)', color: 'rgba(240,244,248,0.9)', borderBottomLeftRadius: 4 }
                }
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="px-4 pb-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] text-center" style={{ color: 'rgba(240,244,248,0.5)' }}>
            Experimente — pergunte algo ao Edu no desktop
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const stats = [
  { value: '7', label: 'matérias disponíveis' },
  { value: '4-18', label: 'anos de idade' },
  { value: '100%', label: 'gratuito' },
  { value: '🔒', label: 'dados protegidos' },
];

const trustItems = [
  'Grátis durante o beta — comece em 10 segundos',
  'Quiz interativo com feedback instantâneo',
  'Dashboard em tempo real para os pais',
];

const chatMessages = [
  { role: 'kid', text: 'Não entendi nada de frações 😭', delay: 0.2 },
  { role: 'edu', text: 'Tudo bem! Se você partir uma pizza em 4 pedaços e comer 1, quanto sobrou?', delay: 1.2 },
  { role: 'kid', text: '3 pedaços?', delay: 2.4 },
  { role: 'edu', text: 'Isso! Então você comeu ¼ da pizza. Ficou mais claro? 🍕', delay: 3.4 },
  { role: 'kid', text: 'Ahh! Agora entendi!!! 🤩', delay: 4.4 },
];

function ChatPreview() {
  const [messages, setMessages] = useState(chatMessages.map(m => ({ role: m.role as 'edu' | 'kid', text: m.text })));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setInteracted(true);
    setMessages(prev => [...prev, { role: 'kid', text: userMsg }]);
    setLoading(true);

    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const allMessages = [...messages, { role: 'kid', text: userMsg }].map(m => ({
        role: m.role === 'kid' ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.slice(-4),
          homework: '',
          subject: 'other',
          ageGroup: '10-12',
          behavioralProfile: 'default',
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, { role: 'edu', text: data.message }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'edu', text: 'Ops! Tente de novo em alguns segundos.' }]);
    }
    setLoading(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div
      className="relative w-full max-w-sm mx-auto"
      style={{ filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.5))' }}
    >
      <div
        className="relative rounded-[2rem] overflow-hidden"
        style={{ background: '#0D1B2A', border: '1px solid rgba(255,255,255,0.08)' }}
      >
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
              <span className="text-xs" style={{ color: 'rgba(240,244,248,0.45)' }}>
                {interacted ? 'respondendo ao vivo' : 'online'}
              </span>
            </div>
          </div>
          {interacted && (
            <div className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
              AO VIVO
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="px-4 py-3 space-y-2.5 h-[260px] overflow-y-auto">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${msg.role === 'kid' ? 'justify-end' : 'justify-start'} items-end gap-2`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === 'edu' && (
                <div className="w-5 h-5 rounded-full flex-shrink-0 overflow-hidden">
                  <MascotOwl expression="encouraging" size="sm" animated={false} className="w-5 h-5" decorative />
                </div>
              )}
              <div
                className="max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-snug"
                style={
                  msg.role === 'kid'
                    ? { background: '#8B5CF6', color: 'white', borderBottomRightRadius: 4 }
                    : { background: 'rgba(255,255,255,0.07)', color: 'rgba(240,244,248,0.9)', borderBottomLeftRadius: 4 }
                }
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex-shrink-0 overflow-hidden">
                <MascotOwl expression="thinking" size="sm" animated={false} className="w-5 h-5" />
              </div>
              <div className="flex gap-1 px-3 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                {[0, 0.2, 0.4].map((d, j) => (
                  <motion.span key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(240,244,248,0.4)' }}
                    animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 pb-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte algo ao Edu..."
              className="flex-1 bg-white/5 text-white placeholder-white/40 rounded-xl px-3 py-2 text-xs border border-white/10 focus:outline-none focus:border-purple-500/50"
            />
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30"
              style={{ background: '#8B5CF6' }}
              whileTap={{ scale: 0.9 }}
            >
              {loading ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
            </motion.button>
          </div>
          {!interacted && (
            <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(240,244,248,0.5)' }}>
              Experimente — digite uma pergunta real
            </p>
          )}
        </div>
      </div>

      {/* Floating badges */}
      <AnimatePresence>
        {!interacted && (
          <>
            <motion.div
              className="absolute -right-4 top-12 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              style={{ background: '#10B981', color: 'white', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ delay: 2.0 }}
            >
              <span>✓</span> Método Socrático
            </motion.div>
            <motion.div
              className="absolute -left-4 bottom-20 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              style={{ background: '#8B5CF6', color: 'white', boxShadow: '0 4px 16px rgba(139,92,246,0.4)' }}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ delay: 3.0 }}
            >
              ✨ Teste ao vivo
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
                Testar tutor grátis
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #4F46E5)', color: '#FFFFFF', boxShadow: '0 8px 32px rgba(139,92,246,0.35)' }}
              >
                Fazer um quiz
              </Link>
            </motion.div>

            {/* Stat bar */}
            <motion.div
              variants={fadeInUp('high')}
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#F5A623' }}>{s.value}</div>
                  <div className="text-xs mt-1 leading-snug" style={{ color: 'rgba(240,244,248,0.45)' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Mobile static chat preview */}
            <MobileChatPreview />
          </motion.div>

          {/* RIGHT: chat preview — desktop: interactive, mobile: static animated */}
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
