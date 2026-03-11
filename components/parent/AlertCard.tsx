'use client';
import { AlertTriangle, Info, TrendingUp, Bell } from 'lucide-react';
import type { AlertSeverity } from '@/lib/auth/types';

interface AlertCardProps {
  title: string;
  description: string;
  recommended_action: string;
  severity: AlertSeverity;
  created_at?: string;
  onDismiss?: () => void;
}

const severityConfig: Record<
  AlertSeverity,
  { bg: string; border: string; icon: typeof Info; iconColor: string; label: string }
> = {
  positive: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: TrendingUp,
    iconColor: 'text-emerald-400',
    label: 'Boa notícia',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: Info,
    iconColor: 'text-blue-400',
    label: 'Informação',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: Bell,
    iconColor: 'text-amber-400',
    label: 'Atenção',
  },
  attention: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: AlertTriangle,
    iconColor: 'text-red-400',
    label: 'Importante',
  },
};

export function AlertCard({
  title,
  description,
  recommended_action,
  severity,
  created_at,
  onDismiss,
}: AlertCardProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-xl p-4 transition-all hover:scale-[1.01]`}
    >
      <div className="flex items-start gap-3">
        <div className={`${config.iconColor} mt-0.5 shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.iconColor}`}
            >
              {config.label}
            </span>
            {created_at && (
              <span className="text-white/30 text-xs">
                {new Date(created_at).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
          <p className="text-indigo-200 text-xs mb-3">{description}</p>

          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-indigo-300 font-semibold mb-1">
              O que fazer:
            </p>
            <p className="text-white text-xs leading-relaxed">
              {recommended_action}
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-white/20 hover:text-white/50 text-xs shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
