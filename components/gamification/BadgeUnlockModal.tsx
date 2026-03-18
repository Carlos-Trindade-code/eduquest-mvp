'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getBadgeById } from '@/lib/gamification/badges';

interface BadgeUnlockModalProps {
  badgeIds: string[];
  onClose: () => void;
}

export function BadgeUnlockModal({ badgeIds, onClose }: BadgeUnlockModalProps) {
  const [current, setCurrent] = useState(0);
  const badge = getBadgeById(badgeIds[current]);

  useEffect(() => {
    if (badgeIds.length === 0) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [badgeIds, onClose]);

  if (!badge || badgeIds.length === 0) return null;

  const rarityColors: Record<string, string> = {
    common: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F5A623',
  };
  const color = rarityColors[badge.rarity] || '#F5A623';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative rounded-3xl p-8 text-center max-w-xs w-full shadow-2xl"
          style={{ background: '#1A2E42', border: `1px solid ${color}30` }}
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white">
            <X size={16} />
          </button>

          {/* Glow */}
          <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: `0 0 60px ${color}20` }} />

          {/* Confetti particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 3 === 0 ? color : i % 3 === 1 ? '#F0F4F8' : '#F5A623',
                top: '50%',
                left: '50%',
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: (Math.cos((i / 12) * Math.PI * 2) * 120),
                y: (Math.sin((i / 12) * Math.PI * 2) * 120),
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            />
          ))}

          <motion.div
            className="text-7xl mb-4"
            animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {badge.icon}
          </motion.div>

          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color }}>
            Badge Desbloqueado!
          </div>
          <h3 className="text-white text-xl font-extrabold mb-2">{badge.name}</h3>
          <p className="text-sm" style={{ color: 'rgba(240,244,248,0.55)' }}>{badge.description}</p>

          <motion.div
            className="mt-6 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
          >
            {badge.rarity}
          </motion.div>

          {badgeIds.length > 1 && current < badgeIds.length - 1 && (
            <button
              onClick={() => setCurrent(c => c + 1)}
              className="mt-4 block w-full text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              +{badgeIds.length - current - 1} badge(s) mais →
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
