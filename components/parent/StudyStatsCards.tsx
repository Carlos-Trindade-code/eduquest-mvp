'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Trophy, Flame, GraduationCap, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { fadeInUp } from '@/lib/design/animations';
import type { KidStudyStats, SessionSummary } from '@/lib/auth/types';

interface StudyStatsCardsProps {
  stats: KidStudyStats | null;
  summaries?: SessionSummary[];
}

function formatTime(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${minutes}min`;
}

interface WeekTrends {
  sessions: { current: number; previous: number };
  xp: { current: number; previous: number };
  minutes: { current: number; previous: number };
}

function computeWeekTrends(summaries: SessionSummary[]): WeekTrends {
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const thisWeek = summaries.filter((s) => new Date(s.created_at) >= startOfThisWeek);
  const lastWeek = summaries.filter((s) => {
    const d = new Date(s.created_at);
    return d >= startOfLastWeek && d < startOfThisWeek;
  });

  return {
    sessions: {
      current: thisWeek.length,
      previous: lastWeek.length,
    },
    xp: {
      current: thisWeek.reduce((sum, s) => sum + (s.xp_earned || 0), 0),
      previous: lastWeek.reduce((sum, s) => sum + (s.xp_earned || 0), 0),
    },
    minutes: {
      current: thisWeek.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
      previous: lastWeek.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
    },
  };
}

function getTrendInfo(current: number, previous: number): { pct: number; direction: 'up' | 'down' | 'neutral' } {
  if (previous === 0 && current === 0) return { pct: 0, direction: 'neutral' };
  if (previous === 0) return { pct: 100, direction: 'up' };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return { pct, direction: 'up' };
  if (pct < 0) return { pct: Math.abs(pct), direction: 'down' };
  return { pct: 0, direction: 'neutral' };
}

interface TrendBadgeProps {
  current: number;
  previous: number;
}

function TrendBadge({ current, previous }: TrendBadgeProps) {
  const { pct, direction } = getTrendInfo(current, previous);
  if (direction === 'neutral') {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-medium text-white/30">
        <Minus size={10} />
        <span>0%</span>
      </span>
    );
  }
  const isUp = direction === 'up';
  return (
    <span
      className={`flex items-center gap-0.5 text-[10px] font-medium ${
        isUp ? 'text-emerald-400' : 'text-red-400'
      }`}
    >
      {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      <span>{pct}%</span>
    </span>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  trend?: { current: number; previous: number } | null;
}

function StatItem({ icon, label, value, color, trend }: StatItemProps) {
  return (
    <motion.div
      className="glass rounded-[var(--eq-radius)] p-4"
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div style={{ color }}>{icon}</div>
        {trend && <TrendBadge current={trend.current} previous={trend.previous} />}
      </div>
      <div className="text-[var(--eq-text)] text-2xl font-bold">{value}</div>
      <div className="text-[var(--eq-text-secondary)] text-xs">{label}</div>
    </motion.div>
  );
}

export function StudyStatsCards({ stats, summaries = [] }: StudyStatsCardsProps) {
  if (!stats) return null;

  const trends = useMemo(() => computeWeekTrends(summaries), [summaries]);

  const cards: StatItemProps[] = [
    {
      icon: <BookOpen size={20} />,
      label: 'Total sessoes',
      value: stats.total_sessions,
      color: '#3B82F6',
      trend: summaries.length > 0 ? trends.sessions : null,
    },
    {
      icon: <Clock size={20} />,
      label: 'Tempo total',
      value: formatTime(stats.total_minutes),
      color: '#10B981',
      trend: summaries.length > 0 ? trends.minutes : null,
    },
    {
      icon: <Trophy size={20} />,
      label: 'XP total',
      value: stats.total_xp,
      color: '#F59E0B',
      trend: summaries.length > 0 ? trends.xp : null,
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
