'use client';

import { useState } from 'react';
import { Clock, Target, BookOpen, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { subjects } from '@/lib/subjects/config';
import type { Profile } from '@/lib/auth/types';

interface KidSettingsProps {
  kid: Profile;
  onUpdated?: () => void;
}

const TIME_OPTIONS = [
  { label: 'Sem limite', value: null },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hora', value: 60 },
  { label: '1h30', value: 90 },
  { label: '2 horas', value: 120 },
];

const GOAL_OPTIONS = [
  { label: 'Sem meta', value: null },
  { label: '3x/semana', value: 3 },
  { label: '5x/semana', value: 5 },
  { label: '7x/semana', value: 7 },
  { label: '10x/semana', value: 10 },
];

export function KidSettings({ kid, onUpdated }: KidSettingsProps) {
  const [timeLimit, setTimeLimit] = useState<number | null>(kid.daily_time_limit_minutes ?? null);
  const [sessionGoal, setSessionGoal] = useState<number | null>(kid.weekly_session_goal ?? null);
  const [subjectFocus, setSubjectFocus] = useState<string | null>(kid.weekly_subject_focus ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from('profiles').update({
      daily_time_limit_minutes: timeLimit,
      weekly_session_goal: sessionGoal,
      weekly_subject_focus: subjectFocus,
    }).eq('id', kid.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdated?.();
  };

  const hasChanges =
    timeLimit !== (kid.daily_time_limit_minutes ?? null) ||
    sessionGoal !== (kid.weekly_session_goal ?? null) ||
    subjectFocus !== (kid.weekly_subject_focus ?? null);

  return (
    <div className="glass rounded-2xl p-5 space-y-5">
      <h3 className="text-white font-bold text-sm flex items-center gap-2">
        <Target size={16} className="text-purple-400" />
        Configurações de {kid.name?.split(' ')[0]}
      </h3>

      {/* Daily time limit */}
      <div>
        <label className="text-white/50 text-xs font-medium flex items-center gap-1.5 mb-2">
          <Clock size={12} />
          Limite diário de estudo
        </label>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setTimeLimit(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                timeLimit === opt.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly session goal */}
      <div>
        <label className="text-white/50 text-xs font-medium flex items-center gap-1.5 mb-2">
          <Target size={12} />
          Meta semanal de sessões
        </label>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setSessionGoal(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sessionGoal === opt.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject focus */}
      <div>
        <label className="text-white/50 text-xs font-medium flex items-center gap-1.5 mb-2">
          <BookOpen size={12} />
          Matéria prioritária (opcional)
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubjectFocus(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              subjectFocus === null
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-white/50 hover:text-white'
            }`}
          >
            Qualquer
          </button>
          {subjects.filter(s => s.id !== 'other').map((s) => (
            <button
              key={s.id}
              onClick={() => setSubjectFocus(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                subjectFocus === s.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      )}
      {saved && (
        <p className="text-green-400 text-xs flex items-center gap-1 justify-center">
          <Check size={12} /> Salvo!
        </p>
      )}
    </div>
  );
}
