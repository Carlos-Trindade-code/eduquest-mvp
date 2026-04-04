'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Camera,
  Trophy,
  Star,
  Zap,
  BookOpen,
  Sparkles,
  Play,
  ChevronRight,
} from 'lucide-react';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

// ============================================================
// Chat messages for the auto-playing demo
// ============================================================
const demoMessages = [
  {
    role: 'user' as const,
    text: 'Quais foram as causas da Revolução Francesa?',
    delay: 0,
  },
  {
    role: 'assistant' as const,
    text: 'Boa pergunta! Antes de falar das causas, me conta: como você acha que era a vida de um camponês na França em 1789?',
    delay: 2000,
  },
  {
    role: 'user' as const,
    text: 'Acho que era bem difícil... eles trabalhavam muito e não tinham dinheiro?',
    delay: 4500,
  },
  {
    role: 'assistant' as const,
    text: 'Exatamente! E enquanto o povo passava fome, quem você acha que vivia em palácios luxuosos? Pense em quem governava...',
    delay: 7000,
  },
  {
    role: 'user' as const,
    text: 'O rei! O Rei Luís XVI vivia no Palácio de Versalhes!',
    delay: 9500,
  },
  {
    role: 'assistant' as const,
    text: 'Isso mesmo! Agora, se o povo passava fome e o rei vivia no luxo, o que você acha que as pessoas sentiram? Isso ajuda a entender uma das causas!',
    delay: 11500,
    xpGain: true,
  },
];

// ============================================================
// Demo scenes for the visual showcase
// ============================================================
type SceneId = 'photo' | 'chat' | 'gamification' | 'parent';

const scenes: { id: SceneId; label: string; icon: React.ElementType }[] = [
  { id: 'photo', label: 'Envie a tarefa', icon: Camera },
  { id: 'chat', label: 'Tutor IA', icon: BookOpen },
  { id: 'gamification', label: 'Gamificação', icon: Trophy },
  { id: 'parent', label: 'Pais', icon: Star },
];

// ============================================================
// Phone frame wrapper
// ============================================================
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto max-w-[340px] w-full">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20 rounded-[3rem] blur-2xl" />

      {/* Phone body */}
      <div className="relative bg-[#0D0D1A] rounded-[2.5rem] border border-gray-200 shadow-2xl shadow-purple-500/10 p-2 overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0D0D1A] rounded-b-2xl z-20" />

        {/* Status bar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-2 pb-1">
          <span className="text-[10px] text-gray-400 font-medium">9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-gray-500 rounded-sm" />
            <div className="w-3 h-2 bg-gray-500 rounded-sm" />
          </div>
        </div>

        {/* Screen content */}
        <div className="relative bg-gradient-to-b from-[#0F0F2A] to-[#0A0A1A] rounded-[2rem] min-h-[460px] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Scene: Photo Upload
// ============================================================
function PhotoScene() {
  return (
    <div className="p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-white">Studdo</span>
      </div>

      <div className="text-center mb-5">
        <p className="text-gray-500 text-xs mb-1">Escolha a matéria</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {['História', 'Matemática', 'Ciências'].map((s, i) => (
            <motion.span
              key={s}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                i === 0
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.15 }}
            >
              {s}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Photo area */}
      <motion.div
        className="flex-1 border-2 border-dashed border-white/15 rounded-2xl flex flex-col items-center justify-center gap-3 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className="w-14 h-14 rounded-2xl bg-purple-500/15 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Camera className="w-7 h-7 text-purple-400" />
        </motion.div>
        <p className="text-gray-400 text-xs text-center px-4">
          Tire uma foto da tarefa ou<br />digite o exercício
        </p>
      </motion.div>

      {/* Simulated input */}
      <motion.div
        className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-gray-400 text-xs flex-1">Causas da Revolução Francesa...</span>
        <motion.div
          className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}
        >
          <Send className="w-4 h-4 text-white" />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ============================================================
// Scene: Chat with Tutor
// ============================================================
function ChatScene() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= demoMessages.length) return;
    const timeout = setTimeout(
      () => setVisibleCount((c) => c + 1),
      visibleCount === 0 ? 500 : demoMessages[visibleCount]?.delay - (demoMessages[visibleCount - 1]?.delay ?? 0)
    );
    return () => clearTimeout(timeout);
  }, [visibleCount]);

  // Reset loop
  useEffect(() => {
    if (visibleCount >= demoMessages.length) {
      const reset = setTimeout(() => setVisibleCount(0), 5000);
      return () => clearTimeout(reset);
    }
  }, [visibleCount]);

  return (
    <div className="p-4 flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <MascotOwl expression="thinking" size="sm" />
        <div>
          <p className="text-gray-900 text-xs font-bold">Edu - Tutor IA</p>
          <p className="text-green-400 text-[10px]">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden space-y-3">
        <AnimatePresence>
          {demoMessages.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-md'
                    : 'bg-white/8 text-gray-700 rounded-bl-md border border-gray-200'
                }`}
              >
                {msg.text}
                {msg.xpGain && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="mt-2 flex items-center gap-1 text-amber-400 text-[10px] font-bold"
                  >
                    <Zap className="w-3 h-3" />
                    +25 XP
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {visibleCount < demoMessages.length && visibleCount > 0 && demoMessages[visibleCount]?.role === 'assistant' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/8 rounded-2xl rounded-bl-md px-3 py-2 border border-gray-200">
              <div className="flex gap-1">
                {[0, 1, 2].map((d) => (
                  <motion.div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-purple-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Scene: Gamification
// ============================================================
function GamificationScene() {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(4);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setXp(65), 800);
    const timer2 = setTimeout(() => setXp(90), 2500);
    const timer3 = setTimeout(() => {
      setLevel(5);
      setShowBadge(true);
    }, 4000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Reset loop
  useEffect(() => {
    if (showBadge) {
      const reset = setTimeout(() => {
        setXp(0);
        setLevel(4);
        setShowBadge(false);
      }, 6000);
      return () => clearTimeout(reset);
    }
  }, [showBadge]);

  return (
    <div className="p-5 flex flex-col items-center">
      {/* Profile */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-2 flex items-center justify-center text-2xl">
          <MascotOwl expression="celebrating" size="sm" />
        </div>
        <p className="text-gray-900 font-bold text-sm">João Pedro</p>
        <p className="text-gray-400 text-[10px]">10 anos - 5o ano</p>
      </motion.div>

      {/* XP Bar */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-purple-400 font-bold">Nível {level}</span>
          <span className="text-gray-400">{xp}/100 XP</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative"
            animate={{ width: `${xp}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 w-full mb-6">
        {[
          { label: 'Streak', value: '7 dias', icon: Zap, color: '#F59E0B' },
          { label: 'Sessões', value: '23', icon: BookOpen, color: '#8B5CF6' },
          { label: 'Badges', value: '5', icon: Trophy, color: '#10B981' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-gray-100 rounded-xl p-3 text-center border border-gray-200"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.2 }}
          >
            <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
            <p className="text-gray-900 font-bold text-xs">{stat.value}</p>
            <p className="text-gray-400 text-[9px]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Badge unlock animation */}
      <AnimatePresence>
        {showBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl p-4 text-center w-full"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl mb-2"
            >
              <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
            </motion.div>
            <p className="text-amber-400 font-bold text-sm">Novo Badge!</p>
            <p className="text-gray-500 text-[10px]">Explorador de História</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Scene: Parent Dashboard
// ============================================================
function ParentScene() {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-900 font-bold text-sm">Dashboard</p>
          <p className="text-gray-400 text-[10px]">Olá, Maria!</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-gray-900 text-[10px] font-bold">
          M
        </div>
      </div>

      {/* Child card */}
      <motion.div
        className="bg-gray-100 rounded-xl p-3 border border-gray-200 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm">
            <MascotOwl expression="waving" size="sm" />
          </div>
          <div>
            <p className="text-gray-900 text-xs font-bold">João Pedro</p>
            <p className="text-gray-400 text-[9px]">Nível 5 - 450 XP</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-green-400 text-[10px]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Ativo hoje
          </div>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '75%' }}
            transition={{ delay: 0.8, duration: 1 }}
          />
        </div>
      </motion.div>

      {/* Mini chart */}
      <motion.div
        className="bg-gray-100 rounded-xl p-3 border border-gray-200 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-gray-500 text-[10px] mb-2 font-medium">Sessões esta semana</p>
        <div className="flex items-end gap-1 h-16">
          {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-sm"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
            <span key={i} className="flex-1 text-center text-[8px] text-gray-400">{d}</span>
          ))}
        </div>
      </motion.div>

      {/* Alert */}
      <motion.div
        className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 text-[10px] font-bold">Alerta Inteligente</p>
            <p className="text-gray-500 text-[9px]">João completou 7 dias seguidos! Parabéns!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================
// Main DemoShowcase Component
// ============================================================
export function DemoShowcase() {
  const [activeScene, setActiveScene] = useState<SceneId>('chat');
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-cycle through scenes
  useEffect(() => {
    if (!autoPlay) return;
    const sceneOrder: SceneId[] = ['photo', 'chat', 'gamification', 'parent'];
    const interval = setInterval(() => {
      setActiveScene((current) => {
        const idx = sceneOrder.indexOf(current);
        return sceneOrder[(idx + 1) % sceneOrder.length];
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const renderScene = () => {
    switch (activeScene) {
      case 'photo':
        return <PhotoScene />;
      case 'chat':
        return <ChatScene />;
      case 'gamification':
        return <GamificationScene />;
      case 'parent':
        return <ParentScene />;
    }
  };

  return (
    <section id="demo" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.06),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div variants={fadeInUp('medium')} className="mb-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm">
              <Play className="w-3 h-3" />
              Demonstração ao vivo
            </span>
          </motion.div>
          <motion.h2
            variants={fadeInUp('medium')}
            className="text-3xl sm:text-4xl font-bold text-white"
          >
            Veja o Studdo em ação
          </motion.h2>
          <motion.p
            variants={fadeInUp('medium')}
            className="mt-4 text-gray-500 text-lg"
          >
            Uma experiência fluida: envie a tarefa, converse com o tutor IA,
            ganhe XP e os pais acompanham tudo.
          </motion.p>
        </motion.div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Phone with demo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <PhoneFrame>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScene}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[380px] sm:min-h-[460px]"
                >
                  {renderScene()}
                </motion.div>
              </AnimatePresence>
            </PhoneFrame>
          </motion.div>

          {/* Right: Scene selector + descriptions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
              {scenes.map((scene) => {
                const isActive = activeScene === scene.id;
                return (
                  <motion.button
                    key={scene.id}
                    onClick={() => {
                      setActiveScene(scene.id);
                      setAutoPlay(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-purple-500/10 border border-purple-500/20'
                        : 'bg-white/[0.02] border border-transparent hover:bg-gray-100 hover:border-gray-200'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-purple-500/20' : 'bg-gray-100'
                      }`}
                    >
                      <scene.icon
                        className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-gray-400'}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-500'}`}>
                        {scene.label}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {scene.id === 'photo' && 'Foto, upload ou digitação — a IA extrai o texto'}
                        {scene.id === 'chat' && 'Método socrático: perguntas que guiam o raciocínio'}
                        {scene.id === 'gamification' && 'XP, níveis, streaks e badges que motivam'}
                        {scene.id === 'parent' && 'Dashboard com gráficos, alertas e recomendações'}
                      </p>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-gray-300'}`}
                    />

                    {/* Progress bar for auto-play */}
                    {isActive && autoPlay && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-purple-500 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 8, ease: 'linear' }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Auto-play toggle */}
            <div className="mt-6 flex items-center gap-2">
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  autoPlay
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {autoPlay ? 'Auto-play ativo' : 'Auto-play pausado'}
              </button>
              <span className="text-gray-300 text-xs">Clique em qualquer cena para explorar</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
