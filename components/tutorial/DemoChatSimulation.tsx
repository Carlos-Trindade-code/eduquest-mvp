'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotOwl } from '@/components/illustrations/MascotOwl';

interface ChatMsg {
  role: 'tutor' | 'student';
  text: string;
  delay: number;
}

const demoConversation: ChatMsg[] = [
  { role: 'student', text: 'Edu, preciso resolver: 2x + 6 = 14', delay: 0 },
  { role: 'tutor', text: 'Legal! Vamos pensar juntos. O que voce precisa descobrir nessa equacao?', delay: 1200 },
  { role: 'student', text: 'O valor de x?', delay: 2800 },
  { role: 'tutor', text: 'Isso! E qual seria o primeiro passo pra isolar o x? Olha pro +6...', delay: 4200 },
  { role: 'student', text: 'Tirar o 6 dos dois lados! 2x = 8', delay: 6000 },
  { role: 'tutor', text: 'Perfeito! Agora so falta um passo. O que fazer com o 2 na frente do x?', delay: 7400 },
  { role: 'student', text: 'Dividir! x = 4! 🎉', delay: 8800 },
  { role: 'tutor', text: 'Voce descobriu sozinho! +15 XP! Quer tentar um mais desafiador?', delay: 10000 },
];

export function DemoChatSimulation() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    demoConversation.forEach((msg, i) => {
      const timer = setTimeout(() => {
        setVisibleMessages(i + 1);
      }, msg.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [started]);

  // Auto-start when component enters view
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Chat header */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <MascotOwl expression="encouraging" size="sm" animated />
        <div>
          <p className="text-white text-sm font-semibold">Edu, seu tutor</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs">Online</span>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="glass rounded-2xl p-4 space-y-3 min-h-[320px] max-h-[380px] overflow-hidden">
        <AnimatePresence>
          {demoConversation.slice(0, visibleMessages).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'student'
                    ? 'bg-purple-600 text-white rounded-br-sm'
                    : 'bg-white/10 text-white/90 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {visibleMessages > 0 && visibleMessages < demoConversation.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="w-2 h-2 rounded-full bg-white/50"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: dot * 0.15,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Replay button */}
      {visibleMessages >= demoConversation.length && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => {
            setVisibleMessages(0);
            setStarted(false);
            setTimeout(() => setStarted(true), 300);
          }}
          className="mt-3 mx-auto block text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors"
        >
          Repetir demo
        </motion.button>
      )}
    </div>
  );
}
