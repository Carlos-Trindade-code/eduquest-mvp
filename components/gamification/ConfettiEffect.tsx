'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface ConfettiEffectProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
}

const COLORS = ['#8B5CF6', '#3B82F6', '#F59E0B', '#10B981', '#EC4899', '#06B6D4', '#F97316'];

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
}

export function ConfettiEffect({ active, duration = 3000, particleCount = 40 }: ConfettiEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active || shouldReduceMotion) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 720 - 360,
      delay: Math.random() * 0.5,
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), duration);
    return () => clearTimeout(timer);
  }, [active, duration, particleCount, shouldReduceMotion]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: `${p.x}%`,
                top: -20,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
              }}
              initial={{ y: -20, rotate: 0, opacity: 1 }}
              animate={{
                y: window.innerHeight + 20,
                rotate: p.rotation,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: p.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              exit={{ opacity: 0 }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
