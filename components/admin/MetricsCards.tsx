'use client';

import { motion } from 'framer-motion';
import { Users, GraduationCap, UserCheck, Activity, Lightbulb, Clock } from 'lucide-react';
import type { AdminMetrics } from '@/lib/auth/types';

interface MetricsCardsProps {
  metrics: AdminMetrics | null;
}

const cards = [
  { key: 'total_users', label: 'Total Usuarios', icon: Users, color: '#8B5CF6' },
  { key: 'total_kids', label: 'Alunos (Kids)', icon: GraduationCap, color: '#3B82F6' },
  { key: 'total_parents', label: 'Pais (Parents)', icon: UserCheck, color: '#10B981' },
  { key: 'total_sessions', label: 'Sessoes Totais', icon: Activity, color: '#06B6D4' },
  { key: 'active_today', label: 'Ativos Hoje', icon: Clock, color: '#F59E0B' },
  { key: 'total_suggestions', label: 'Sugestoes', icon: Lightbulb, color: '#EF4444' },
] as const;

export function MetricsCards({ metrics }: MetricsCardsProps) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          className="glass rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: `${card.color}15` }}
          >
            <card.icon size={20} style={{ color: card.color }} />
          </div>
          <p className="text-white text-2xl font-bold">
            {metrics[card.key]}
          </p>
          <p className="text-white/40 text-xs mt-0.5">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
