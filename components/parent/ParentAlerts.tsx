'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, Clock, X } from 'lucide-react';
import { fadeInUp } from '@/lib/design/animations';
import type { SessionSummary, KidStudyStats } from '@/lib/auth/types';

interface ParentAlertsProps {
  kidName: string;
  kidId: string;
  sessions: SessionSummary[];
  stats: KidStudyStats | null;
  onNavigateToTasks?: () => void;
}

interface Alert {
  id: string;
  type: 'no-activity' | 'difficulty' | 'streak-risk' | 'congrats' | 'accuracy-high' | 'accuracy-low';
  severity: 'success' | 'warning' | 'info';
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: { label: string; action: () => void };
}

const DISMISSED_KEY = 'studdo_dismissed_alerts';

function getDismissedAlerts(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '{}');
  } catch {
    return {};
  }
}

function dismissAlert(alertKey: string) {
  const dismissed = getDismissedAlerts();
  dismissed[alertKey] = new Date().toISOString();
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
}

function isAlertDismissedToday(alertKey: string): boolean {
  const dismissed = getDismissedAlerts();
  const dismissedAt = dismissed[alertKey];
  if (!dismissedAt) return false;
  const today = new Date().toDateString();
  return new Date(dismissedAt).toDateString() === today;
}

function daysBetween(date1: Date, date2: Date): number {
  const ms = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const severityStyles = {
  success: {
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.2)',
    iconColor: '#10B981',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.2)',
    iconColor: '#F59E0B',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.08)',
    border: 'rgba(59, 130, 246, 0.2)',
    iconColor: '#3B82F6',
  },
};

export function ParentAlerts({ kidName, kidId, sessions, stats, onNavigateToTasks }: ParentAlertsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Load dismissed state on mount
  useEffect(() => {
    const dismissed = getDismissedAlerts();
    const todayDismissed = new Set<string>();
    Object.keys(dismissed).forEach((key) => {
      if (key.startsWith(kidId + ':') && isAlertDismissedToday(key)) {
        todayDismissed.add(key);
      }
    });
    setDismissedIds(todayDismissed);
  }, [kidId]);

  const alerts = useMemo(() => {
    const result: Alert[] = [];
    const now = new Date();
    const today = now.toDateString();

    // Sort sessions by date (most recent first)
    const sorted = [...sessions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const mostRecent = sorted[0];
    const lastSessionDate = mostRecent ? new Date(mostRecent.created_at) : null;
    const studiedToday = lastSessionDate ? lastSessionDate.toDateString() === today : false;

    // 1. "Parabens!" — studied today
    if (studiedToday) {
      result.push({
        id: `${kidId}:congrats`,
        type: 'congrats',
        severity: 'success',
        icon: <CheckCircle size={18} />,
        title: 'Parabens!',
        description: `${kidName} estudou hoje! 🎉`,
      });
    }

    // 2. "Sequencia em risco" — has streak > 0, last session was yesterday, hasn't studied today
    if (stats && stats.current_streak > 0 && !studiedToday && lastSessionDate) {
      const daysAgo = daysBetween(lastSessionDate, now);
      if (daysAgo === 1) {
        result.push({
          id: `${kidId}:streak-risk`,
          type: 'streak-risk',
          severity: 'warning',
          icon: <AlertTriangle size={18} />,
          title: 'Sequencia em risco!',
          description: `Sequencia de ${stats.current_streak} dias em risco! Lembre ${kidName} de estudar hoje.`,
        });
      }
    }

    // 3. "Sem atividade recente" — no session in last 3 days
    if (lastSessionDate) {
      const daysAgo = daysBetween(lastSessionDate, now);
      if (daysAgo >= 3) {
        result.push({
          id: `${kidId}:no-activity`,
          type: 'no-activity',
          severity: 'warning',
          icon: <Clock size={18} />,
          title: 'Sem atividade recente',
          description: `${kidName} não estuda há ${daysAgo} dias. Que tal sugerir uma sessão?`,
          cta: onNavigateToTasks
            ? { label: 'Criar tarefa', action: onNavigateToTasks }
            : undefined,
        });
      }
    } else if (sessions.length === 0 && stats && stats.total_sessions === 0) {
      // No sessions at all — skip, the dashboard already shows an empty state
    }

    // 4. "Dificuldade detectada" — most recent session has difficulties
    if (mostRecent && mostRecent.difficulties && mostRecent.difficulties.length > 0) {
      const topics = mostRecent.difficulties.slice(0, 3).join(', ');
      result.push({
        id: `${kidId}:difficulty`,
        type: 'difficulty',
        severity: 'info',
        icon: <Info size={18} />,
        title: 'Dificuldade detectada',
        description: `Na última sessão, ${kidName} teve dificuldade com: ${topics}. Considere criar uma tarefa de reforço.`,
        cta: onNavigateToTasks
          ? { label: 'Criar tarefa de reforço', action: onNavigateToTasks }
          : undefined,
      });
    }

    // 5. Accuracy-based alerts
    if (mostRecent && mostRecent.estimated_accuracy != null) {
      if (mostRecent.estimated_accuracy >= 80) {
        result.push({
          id: `${kidId}:accuracy-high`,
          type: 'accuracy-high',
          severity: 'success',
          icon: <CheckCircle size={18} />,
          title: 'Otimo aproveitamento!',
          description: `${kidName} teve ${mostRecent.estimated_accuracy}% de aproveitamento na ultima sessao. Excelente!`,
        });
      } else if (mostRecent.estimated_accuracy < 50) {
        result.push({
          id: `${kidId}:accuracy-low`,
          type: 'accuracy-low',
          severity: 'warning',
          icon: <AlertTriangle size={18} />,
          title: 'Aproveitamento baixo',
          description: `${kidName} teve ${mostRecent.estimated_accuracy}% de aproveitamento na ultima sessao. Considere reforcar o conteudo.`,
          cta: onNavigateToTasks
            ? { label: 'Criar tarefa de reforco', action: onNavigateToTasks }
            : undefined,
        });
      }
    }

    return result;
  }, [kidId, kidName, sessions, stats, onNavigateToTasks]);

  // Filter out dismissed alerts, limit to 3
  const visibleAlerts = alerts
    .filter((a) => !dismissedIds.has(a.id))
    .slice(0, 3);

  const handleDismiss = (alertId: string) => {
    dismissAlert(alertId);
    setDismissedIds((prev) => new Set([...prev, alertId]));
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <motion.div
      className="space-y-3"
      variants={fadeInUp('medium')}
    >
      <AnimatePresence mode="popLayout">
        {visibleAlerts.map((alert) => {
          const style = severityStyles[alert.severity];
          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="rounded-[var(--eq-radius)] p-4 backdrop-blur-xl"
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="shrink-0 mt-0.5" style={{ color: style.iconColor }}>
                  {alert.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-semibold">{alert.title}</h4>
                  <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{alert.description}</p>
                  {alert.cta && (
                    <button
                      onClick={alert.cta.action}
                      className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                      style={{
                        background: `${style.iconColor}20`,
                        color: style.iconColor,
                        border: `1px solid ${style.iconColor}30`,
                      }}
                    >
                      {alert.cta.label}
                    </button>
                  )}
                </div>

                {/* Dismiss button */}
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="shrink-0 p-1 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
                  title="Fechar"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
