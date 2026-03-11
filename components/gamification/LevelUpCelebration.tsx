'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { ConfettiEffect } from './ConfettiEffect';
import { Button } from '@/components/ui/button';
import { getLevelTitle } from '@/lib/gamification/xp';

interface LevelUpCelebrationProps {
  level: number;
  open: boolean;
  onClose: () => void;
}

export function LevelUpCelebration({ level, open, onClose }: LevelUpCelebrationProps) {
  const title = getLevelTitle(level);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  return (
    <>
      <ConfettiEffect active={open} />
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Content */}
            <motion.div
              className="relative z-10 text-center px-8 py-10"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/20 via-purple-500/10 to-amber-500/20 blur-3xl" />

              <div className="relative">
                {/* Mascot */}
                <div className="flex justify-center mb-6">
                  <MascotOwl expression="celebrating" size="xl" />
                </div>

                {/* Level up text */}
                <motion.h2
                  className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  LEVEL UP!
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-amber-500/30">
                    {level}
                  </div>
                  <p className="text-amber-200 text-lg font-semibold">{title}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6"
                >
                  <Button variant="accent" size="lg" rounded="full" onClick={onClose}>
                    Continuar
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
