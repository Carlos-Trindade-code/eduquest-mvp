'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Send, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createParentTask, deleteParentTask } from '@/lib/supabase/queries';
import { subjects, getSubjectById } from '@/lib/subjects/config';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import type { ParentTask, SessionSummary } from '@/lib/auth/types';

interface TasksTabProps {
  kidId: string;
  parentId: string;
  tasks: ParentTask[];
  summaries: SessionSummary[];
  onTaskCreated: () => void;
  onTaskDeleted: () => void;
}

function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const statusConfig = {
  pending: { label: 'Pendente', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: 'rgb(245,158,11)' },
  in_progress: { label: 'Em andamento', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: 'rgb(59,130,246)' },
  completed: { label: 'Concluída', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: 'rgb(16,185,129)' },
};

export function TasksTab({ kidId, parentId, tasks, summaries, onTaskCreated, onTaskDeleted }: TasksTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    await createParentTask(supabase, parentId, kidId, selectedSubject, description.trim());
    setDescription('');
    setSelectedSubject(subjects[0].id);
    setShowForm(false);
    setSubmitting(false);
    onTaskCreated();
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    setDeletingId(taskId);
    const supabase = createClient();
    await deleteParentTask(supabase, taskId);
    setDeletingId(null);
    onTaskDeleted();
  };

  return (
    <motion.div
      className="space-y-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Create button */}
      <motion.div variants={fadeInUp('medium')}>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{
            background: showForm
              ? 'rgba(255,255,255,0.05)'
              : 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(99,102,241,0.8))',
            color: 'white',
            border: showForm ? '1px solid rgba(255,255,255,0.1)' : 'none',
          }}
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancelar' : 'Sugerir tarefa'}
        </button>
      </motion.div>

      {/* Inline form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="glass rounded-[var(--eq-radius)] p-5 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">Matéria</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id} className="bg-gray-900">
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs font-medium mb-1.5 block">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a tarefa para seu filho..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none transition-colors resize-none placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || !description.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(99,102,241,0.8))' }}
              >
                <Send size={14} />
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task list */}
      {tasks.length === 0 ? (
        <motion.div variants={fadeInUp('medium')} className="glass rounded-[var(--eq-radius)] p-8 text-center">
          <div className="text-5xl mb-3">📋</div>
          <h3 className="text-[var(--eq-text)] font-semibold mb-2">
            Nenhuma tarefa criada ainda
          </h3>
          <p className="text-[var(--eq-text-secondary)] text-sm">
            Sugira uma tarefa de estudo para seu filho!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const subjectInfo = getSubjectById(task.subject);
            const status = statusConfig[task.status];
            const matchingSummary = task.session_id
              ? summaries.find((s) => s.session_id === task.session_id)
              : null;

            return (
              <motion.div
                key={task.id}
                variants={fadeInUp('medium')}
                className="glass rounded-[var(--eq-radius-sm)] p-4"
                style={{ border: `1px solid ${status.border}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={{ background: `${subjectInfo?.color || '#8B5CF6'}15` }}
                    >
                      {subjectInfo?.icon || '📚'}
                    </div>
                    <div className="min-w-0">
                      <span className="text-white text-sm font-semibold">
                        {subjectInfo?.name || task.subject}
                      </span>
                      <p className="text-white/50 text-xs mt-0.5 line-clamp-2">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status badge */}
                    <span
                      className="px-2 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: status.bg, color: status.text, border: `1px solid ${status.border}` }}
                    >
                      {status.label}
                    </span>

                    {/* Delete button (pending only) */}
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(task.id)}
                        disabled={deletingId === task.id}
                        className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                        title="Excluir tarefa"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer: date + session link */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                  <span className="text-white/20 text-[10px]">{relativeDate(task.created_at)}</span>
                  {task.status === 'completed' && matchingSummary && (
                    <span className="flex items-center gap-1 text-emerald-400/40 text-[10px] font-medium">
                      Sessao concluida
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
