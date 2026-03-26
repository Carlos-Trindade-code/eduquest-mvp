'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Filter } from 'lucide-react';
import { getSubjectById } from '@/lib/subjects/config';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import type { SessionSummary } from '@/lib/auth/types';

interface SessionTimelineProps {
  summaries: SessionSummary[];
  onSelectSession: (summary: SessionSummary) => void;
  selectedSessionId?: string;
}

type DateFilter = 'week' | 'month' | 'all';

export function SessionTimeline({ summaries, onSelectSession, selectedSessionId }: SessionTimelineProps) {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  // Get unique subjects from summaries
  const availableSubjects = useMemo(() => {
    const subjectIds = [...new Set(summaries.map((s) => s.subject))];
    return subjectIds.map((id) => {
      const sub = getSubjectById(id);
      return { id, name: sub?.name || id, icon: sub?.icon || '📚' };
    });
  }, [summaries]);

  // Filter summaries
  const filtered = useMemo(() => {
    let result = summaries;

    if (subjectFilter !== 'all') {
      result = result.filter((s) => s.subject === subjectFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (dateFilter === 'week') {
        cutoff.setDate(now.getDate() - 7);
      } else {
        cutoff.setMonth(now.getMonth() - 1);
      }
      result = result.filter((s) => new Date(s.created_at) >= cutoff);
    }

    return result;
  }, [summaries, subjectFilter, dateFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        {/* Subject filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter size={14} className="text-white/30 shrink-0" />
          <button
            onClick={() => setSubjectFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
              subjectFilter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            Todas
          </button>
          {availableSubjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSubjectFilter(sub.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                subjectFilter === sub.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{sub.icon}</span>
              {sub.name}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <div className="flex gap-2">
          {([
            { value: 'week' as DateFilter, label: 'Esta semana' },
            { value: 'month' as DateFilter, label: 'Este mes' },
            { value: 'all' as DateFilter, label: 'Todos' },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                dateFilter === opt.value
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session list */}
      {filtered.length === 0 ? (
        <div className="glass rounded-[var(--eq-radius)] p-8 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-white/40 text-sm">Nenhuma sessao encontrada com estes filtros</p>
        </div>
      ) : (
        <motion.div
          className="space-y-2"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((summary) => {
            const sub = getSubjectById(summary.subject);
            const date = new Date(summary.created_at);
            const isToday = new Date().toDateString() === date.toDateString();
            const isSelected = selectedSessionId === summary.id;

            return (
              <motion.button
                key={summary.id}
                variants={fadeInUp('low')}
                onClick={() => onSelectSession(summary)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-purple-600/15 border border-purple-500/30'
                    : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Subject icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{ background: `${sub?.color || '#8B5CF6'}15` }}
                  >
                    {sub?.icon || '📚'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium">{sub?.name || summary.subject}</span>
                      <span className="text-white/20 text-xs shrink-0">
                        {isToday
                          ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                          : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-2">
                      {summary.duration_minutes > 0 && (
                        <span className="flex items-center gap-1 text-white/30 text-xs">
                          <Clock size={10} />
                          {summary.duration_minutes}min
                        </span>
                      )}
                      {summary.xp_earned > 0 && (
                        <span className="flex items-center gap-1 text-amber-400/50 text-xs">
                          <Sparkles size={10} />
                          +{summary.xp_earned} XP
                        </span>
                      )}
                      <span className="text-white/20 text-xs">
                        {summary.message_count} mensagens
                      </span>
                    </div>

                    {/* Topic tags */}
                    {summary.topics_covered && summary.topics_covered.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {summary.topics_covered.slice(0, 4).map((topic, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-300/70"
                          >
                            {topic}
                          </span>
                        ))}
                        {summary.topics_covered.length > 4 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] text-white/25">
                            +{summary.topics_covered.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
