'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface EventCount {
  event_type: string;
  count: number;
}

interface DailyActivity {
  day: string;
  count: number;
}

interface AnalyticsSummary {
  total_events: number;
  events_by_type: EventCount[] | null;
  daily_activity: DailyActivity[] | null;
}

function createSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  login: { label: 'Login', color: '#3B82F6' },
  register: { label: 'Registro', color: '#10B981' },
  session_started: { label: 'Sessao iniciada', color: '#8B5CF6' },
  session_ended: { label: 'Sessao finalizada', color: '#6366F1' },
  message_sent: { label: 'Mensagem enviada', color: '#06B6D4' },
  feedback_submitted: { label: 'Feedback enviado', color: '#F59E0B' },
  invite_code_redeemed: { label: 'Invite resgatado', color: '#EC4899' },
  onboarding_completed: { label: 'Onboarding completo', color: '#14B8A6' },
  page_view: { label: 'Page view', color: '#64748B' },
};

export function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(30);

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = createSupabase();
      const { data: result } = await supabase.rpc('get_analytics_summary', { days_back: daysBack });
      setData(result as AnalyticsSummary);
    } catch {
      // silent
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysBack]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-white/40">
        Nenhum dado de analytics disponivel
      </div>
    );
  }

  const maxCount = Math.max(...(data.events_by_type?.map((e) => e.count) ?? [1]));
  const maxDaily = Math.max(...(data.daily_activity?.map((d) => d.count) ?? [1]));

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <TrendingUp size={20} style={{ color: '#6366F1' }} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Analytics</h2>
            <p className="text-white/40 text-xs">{data.total_events} eventos nos ultimos {daysBack} dias</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDaysBack(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                daysBack === d
                  ? 'bg-purple-600 text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Events by type */}
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <MousePointerClick size={16} className="text-white/40" />
          <h3 className="text-white font-semibold text-sm">Eventos por tipo</h3>
        </div>

        {!data.events_by_type || data.events_by_type.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">Nenhum evento registrado ainda</p>
        ) : (
          <div className="space-y-3">
            {data.events_by_type.map((event, i) => {
              const config = EVENT_LABELS[event.event_type] ?? { label: event.event_type, color: '#64748B' };
              const width = Math.max((event.count / maxCount) * 100, 4);
              return (
                <motion.div
                  key={event.event_type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-xs">{config.label}</span>
                    <span className="text-white font-bold text-xs">{event.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: config.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily activity */}
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-white/40" />
          <h3 className="text-white font-semibold text-sm">Atividade diaria</h3>
        </div>

        {!data.daily_activity || data.daily_activity.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">Nenhuma atividade registrada</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {data.daily_activity.slice(0, 30).reverse().map((day, i) => {
              const height = Math.max((day.count / maxDaily) * 100, 4);
              const date = new Date(day.day);
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <motion.div
                  key={day.day}
                  className="flex-1 flex flex-col items-center gap-1 group relative"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.02 }}
                  style={{ transformOrigin: 'bottom' }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                    {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}: {day.count}
                  </div>
                  <div
                    className="w-full rounded-sm transition-colors"
                    style={{
                      height: `${height}%`,
                      backgroundColor: isToday ? '#8B5CF6' : 'rgba(139,92,246,0.3)',
                      minHeight: 2,
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
