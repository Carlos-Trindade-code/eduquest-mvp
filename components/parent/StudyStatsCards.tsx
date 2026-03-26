'use client';

import { motion } from 'framer-motion';
import { BookOpen, Clock, Trophy, Flame, GraduationCap, BarChart3 } from 'lucide-react';
import { fadeInUp } from '@/lib/design/animations';
import type { KidStudyStats } from '@/lib/auth/types';

interface StudyStatsCardsProps {
  stats: KidStudyStats | null;
}

function formatTime(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${minutes}min`;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

function StatItem({ icon, label, value, color }: StatItemProps) {
  return (
    <motion.div
      className="glass rounded-[var(--eq-radius)] p-4"
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="mb-2" style={{ color }}>{icon}</div>
      <div className="text-[var(--eq-text)] text-2xl font-bold">{value}</div>
      <div className="text-[var(--eq-text-secondary)] text-xs">{label}</div>
    </motion.div>
  );
}

export function StudyStatsCards({ stats }: StudyStatsCardsProps) {
  if (!stats) return null;

  const cards: StatItemProps[] = [
    {
      icon: <BookOpen size={20} />,
      label: 'Total sessoes',
      value: stats.total_sessions,
      color: '#3B82F6',
    },
    {
      icon: <Clock size={20} />,
      label: 'Tempo total',
      value: formatTime(stats.total_minutes),
      color: '#10B981',
    },
    {
      icon: <Trophy size={20} />,
      label: 'XP total',
      value: stats.total_xp,
      color: '#F59E0B',
    },
    {
      icon: <Flame size={20} />,
      label: 'Streak atual',
      value: `${stats.current_streak} dias`,
      color: '#F97316',
    },
    {
      icon: <GraduationCap size={20} />,
      label: 'Materias estudadas',
      value: stats.subjects_studied?.length || 0,
      color: '#8B5CF6',
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'Sessoes esta semana',
      value: stats.sessions_this_week,
      color: '#06B6D4',
    },
  ];

  return (
    <motion.div
      variants={fadeInUp('medium')}
      className="grid grid-cols-2 md:grid-cols-3 gap-3"
    >
      {cards.map((card) => (
        <StatItem key={card.label} {...card} />
      ))}
    </motion.div>
  );
}
