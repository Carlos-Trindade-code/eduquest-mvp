'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Flame } from 'lucide-react';

export function XPAnimation() {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [showBadge, setShowBadge] = useState(false);
  const [showXPFloat, setShowXPFloat] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!started) return;

    const steps = [
      { delay: 300, action: () => { setXP(25); setShowXPFloat(true); } },
      { delay: 1200, action: () => setShowXPFloat(false) },
      { delay: 1800, action: () => { setXP(55); setShowXPFloat(true); } },
      { delay: 2700, action: () => setShowXPFloat(false) },
      { delay: 3300, action: () => { setXP(85); setShowXPFloat(true); } },
      { delay: 4200, action: () => setShowXPFloat(false) },
      { delay: 4800, action: () => { setXP(100); setLevel(2); setShowBadge(true); } },
      { delay: 7000, action: () => { setShowBadge(false); setXP(15); } },
    ];

    const timers = steps.map(({ delay, action }) =>
      setTimeout(action, delay)
    );

    // Loop
    const loopTimer = setTimeout(() => {
      setStarted(false);
      setXP(0);
      setLevel(1);
      setShowBadge(false);
      setShowXPFloat(false);
      setTimeout(() => setStarted(true), 500);
    }, 8500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(loopTimer);
    };
  }, [started]);

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* XP Bar */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Zap size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Nivel {level}</p>
              <p className="text-white/40 text-xs">Explorador</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame size={14} className="text-orange-400" />
            <span className="text-orange-400 text-sm font-bold">3 dias</span>
          </div>
        </div>

        {/* XP bar */}
        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
            animate={{ width: `${xp}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
          {/* Shimmer */}
          <motion.div
            className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '400%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-white/40 text-xs">{xp} XP</span>
          <span className="text-white/40 text-xs">100 XP</span>
        </div>

        {/* XP float number */}
        <AnimatePresence>
          {showXPFloat && (
            <motion.div
              className="absolute top-2 right-8 text-green-400 font-bold text-lg"
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: -40, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              +15 XP
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge unlock */}
      <AnimatePresence>
        {showBadge && (
          <motion.div
            className="glass rounded-2xl p-5 border border-amber-500/30 text-center"
            initial={{ opacity: 0, scale: 0.3, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <motion.div
              className="inline-flex"
              animate={{
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                <Trophy size={32} className="text-white" />
              </div>
            </motion.div>
            <motion.p
              className="text-amber-400 font-bold text-lg mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Conquista Desbloqueada!
            </motion.p>
            <motion.p
              className="text-white/50 text-sm mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Primeiro Nivel Completo
            </motion.p>

            {/* Confetti stars */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${10 + Math.random() * 30}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  y: [0, -30 - Math.random() * 30],
                  x: [(Math.random() - 0.5) * 40],
                }}
                transition={{ duration: 1.2, delay: 0.5 + i * 0.1 }}
              >
                <Star size={12} className="text-amber-400" fill="currentColor" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
