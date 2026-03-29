'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, Minus, BookOpen, Clock, Sparkles, Flame, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { getSubjectById } from '@/lib/subjects/config';
import { getLevelTitle, getLevel } from '@/lib/gamification/xp';
import { fadeInUp } from '@/lib/design/animations';
import type { SessionSummary, UserStats } from '@/lib/auth/types';

interface WeeklyDigestProps {
  kidName: string;
  stats: UserStats | null;
  summaries: SessionSummary[];
}

interface WeekData {
  sessions: number;
  minutes: number;
  xp: number;
  subjects: string[];
  topDifficulties: string[];
  topStrengths: string[];
}

function getWeekData(summaries: SessionSummary[], weeksAgo: number): WeekData {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() - weeksAgo * 7);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const week = summaries.filter((s) => {
    const d = new Date(s.created_at);
    return d >= start && d < end;
  });

  const subjects = [...new Set(week.map((s) => s.subject))];
  const difficulties = week.flatMap((s) => s.difficulties || []);
  const strengths = week.flatMap((s) => s.strengths || []);

  // Count occurrences and get top 2
  const countTop = (arr: string[], n: number) => {
    const counts: Record<string, number> = {};
    arr.forEach((item) => { counts[item] = (counts[item] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
  };

  return {
    sessions: week.length,
    minutes: week.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
    xp: week.reduce((sum, s) => sum + (s.xp_earned || 0), 0),
    subjects,
    topDifficulties: countTop(difficulties, 2),
    topStrengths: countTop(strengths, 2),
  };
}

function TrendIcon({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return <Minus size={12} className="text-white/30" />;
  if (current > previous) return <TrendingUp size={12} className="text-emerald-400" />;
  if (current < previous) return <TrendingDown size={12} className="text-red-400" />;
  return <Minus size={12} className="text-white/30" />;
}

export function WeeklyDigest({ kidName, stats, summaries }: WeeklyDigestProps) {
  const [copied, setCopied] = useState(false);

  const { thisWeek, lastWeek } = useMemo(() => ({
    thisWeek: getWeekData(summaries, 0),
    lastWeek: getWeekData(summaries, 1),
  }), [summaries]);

  // Don't show if no data at all
  if (thisWeek.sessions === 0 && lastWeek.sessions === 0) return null;

  const level = stats ? getLevel(stats.total_xp) : 1;
  const levelTitle = getLevelTitle(level);

  const handleCopyReport = () => {
    const subjectNames = thisWeek.subjects.map((s) => getSubjectById(s)?.name || s).join(', ');
    const report = [
      `📊 Resumo semanal — ${kidName}`,
      `Nivel ${level} (${levelTitle}) · ${stats?.total_xp || 0} XP total`,
      '',
      `Esta semana:`,
      `  📚 ${thisWeek.sessions} sessoes`,
      `  ⏱️ ${thisWeek.minutes} minutos`,
      `  ✨ ${thisWeek.xp} XP ganhos`,
      thisWeek.subjects.length > 0 ? `  📖 Materias: ${subjectNames}` : '',
      `  🔥 Streak: ${stats?.current_streak || 0} dias`,
      '',
      thisWeek.topStrengths.length > 0 ? `💪 Pontos fortes: ${thisWeek.topStrengths.join(', ')}` : '',
      thisWeek.topDifficulties.length > 0 ? `📝 A melhorar: ${thisWeek.topDifficulties.join(', ')}` : '',
      '',
      `Gerado pelo Studdo — studdo.com.br`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      variants={fadeInUp('high')}
      initial="hidden"
      animate="visible"
      className="rounded-2xl p-5 mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))',
        border: '1px solid rgba(139,92,246,0.2)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-purple-400" />
          <h3 className="text-white font-bold text-sm">Resumo da semana</h3>
        </div>
        <button
          onClick={handleCopyReport}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          title="Copiar resumo"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? 'Copiado!' : 'Compartilhar'}
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <BookOpen size={12} className="text-blue-400" />
            <TrendIcon current={thisWeek.sessions} previous={lastWeek.sessions} />
          </div>
          <p className="text-white font-bold text-lg">{thisWeek.sessions}</p>
          <p className="text-white/30 text-[10px]">sessoes</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock size={12} className="text-emerald-400" />
            <TrendIcon current={thisWeek.minutes} previous={lastWeek.minutes} />
          </div>
          <p className="text-white font-bold text-lg">{thisWeek.minutes}</p>
          <p className="text-white/30 text-[10px]">minutos</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Sparkles size={12} className="text-amber-400" />
            <TrendIcon current={thisWeek.xp} previous={lastWeek.xp} />
          </div>
          <p className="text-white font-bold text-lg">{thisWeek.xp}</p>
          <p className="text-white/30 text-[10px]">XP ganhos</p>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-2">
        {thisWeek.subjects.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/30 text-xs">Materias:</span>
            {thisWeek.subjects.map((s) => {
              const info = getSubjectById(s);
              return (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: `${info?.color || '#8B5CF6'}20`, color: info?.color || '#8B5CF6' }}
                >
                  {info?.icon} {info?.name || s}
                </span>
              );
            })}
          </div>
        )}

        {thisWeek.topStrengths.length > 0 && (
          <p className="text-xs" style={{ color: 'rgba(16,185,129,0.8)' }}>
            💪 <span className="font-medium">Forte em:</span> {thisWeek.topStrengths.join(', ')}
          </p>
        )}

        {thisWeek.topDifficulties.length > 0 && (
          <p className="text-xs" style={{ color: 'rgba(245,158,11,0.8)' }}>
            📝 <span className="font-medium">Praticar mais:</span> {thisWeek.topDifficulties.join(', ')}
          </p>
        )}

        {stats && stats.current_streak >= 3 && (
          <p className="text-xs text-orange-400/80">
            <Flame size={12} className="inline mr-1" />
            <span className="font-medium">{stats.current_streak} dias seguidos</span> de estudo!
          </p>
        )}
      </div>
    </motion.div>
  );
}
