'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MascotOwl } from './MascotOwl';

export function HeroIllustration() {
  const shouldReduceMotion = useReducedMotion();
  const isAnimated = !shouldReduceMotion;

  const floatingItems = [
    { emoji: '📖', x: -60, y: -50, delay: 0, size: 28 },
    { emoji: '💡', x: 70, y: -40, delay: 0.3, size: 24 },
    { emoji: '⭐', x: -70, y: 30, delay: 0.6, size: 20 },
    { emoji: '🔢', x: 80, y: 20, delay: 0.9, size: 22 },
    { emoji: '🧪', x: -40, y: 70, delay: 1.2, size: 24 },
    { emoji: '🌍', x: 60, y: 65, delay: 0.4, size: 22 },
  ];

  return (
    <div className="relative flex items-center justify-center w-full h-[350px] md:h-[450px]">
      {/* Glow background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      {/* Orbiting ring */}
      {isAnimated && (
        <motion.div
          className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full border border-white/5"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Floating items */}
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ fontSize: item.size }}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            isAnimated
              ? {
                  opacity: 1,
                  scale: 1,
                  x: item.x,
                  y: [item.y - 5, item.y + 5, item.y - 5],
                }
              : { opacity: 1, scale: 1, x: item.x, y: item.y }
          }
          transition={{
            opacity: { delay: item.delay, duration: 0.5 },
            scale: { delay: item.delay, duration: 0.5, type: 'spring' },
            x: { delay: item.delay, duration: 0.5 },
            y: {
              delay: item.delay + 0.5,
              duration: 3 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Central mascot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <MascotOwl expression="encouraging" size="xl" animated={isAnimated} />
      </motion.div>

      {/* Decorative dots */}
      {isAnimated &&
        Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 140;
          return (
            <motion.div
              key={`dot-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/20"
              style={{
                left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                top: `calc(50% + ${Math.sin(angle) * radius}px)`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
              }}
            />
          );
        })}
    </div>
  );
}
