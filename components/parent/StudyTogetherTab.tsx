'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, BookOpen, FileQuestion, PenLine, RotateCcw, Loader2, Trash2, ChevronDown, Send, MessageSquare } from 'lucide-react';
import { subjects, getSubjectById } from '@/lib/subjects/config';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import { createClient } from '@/lib/supabase/client';
import { getParentActivities, createGuidedActivity, deleteGuidedActivity } from '@/lib/supabase/queries';
import type { GuidedActivity, ActivityType, Material, QuizQuestion } from '@/lib/auth/types';

interface StudyTogetherTabProps {
  parentId: string;
  kidId: string;
  kidName: string;
}

const activityTypes: { id: ActivityType; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'quiz', label: 'Quiz', icon: <FileQuestion size={18} />, desc: 'Perguntas de multipla escolha' },
  { id: 'reading', label: 'Leitura guiada', icon: <BookOpen size={18} />, desc: 'Material + perguntas para refletir' },
  { id: 'exercise', label: 'Exercicio', icon: <PenLine size={18} />, desc: 'Instrucoes para praticar' },
  { id: 'review', label: 'Revisao', icon: <RotateCcw size={18} />, desc: 'Revisar conteudo estudado' },
];

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-300',
    in_progress: 'bg-blue-500/20 text-blue-300',
    completed: 'bg-green-500/20 text-green-300',
  };
  const labels: Record<string, string> = {
    pending: 'Pendente',
    in_progress: 'Em andamento',
    completed: 'Concluida',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[status] || ''}`}>
      {labels[status] || status}
    </span>
  );
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `Ha ${days} dias`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function StudyTogetherTab({ parentId, kidId, kidName }: StudyTogetherTabProps) {
  const [activities, setActivities] = useState<GuidedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  // Creator state
  const [actType, setActType] = useState<ActivityType>('quiz');
  const [actSubject, setActSubject] = useState('math');
  const [actTitle, setActTitle] = useState('');
  const [actInstructions, setActInstructions] = useState('');
  const [actParentNote, setActParentNote] = useState('');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);

  const supabase = createClient();

  const loadActivities = useCallback(async () => {
    setLoading(true);
    const { data } = await getParentActivities(supabase, parentId, kidId);
    setActivities(data);
    setLoading(false);
  }, [parentId, kidId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Load materials for kid
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/materials?kid_id=${kidId}`);
      const data = await res.json();
      setMaterials((data.materials || []).filter((m: Material) => m.content_text));
    }
    load();
  }, [kidId]);

  const toggleMaterial = (id: string) => {
    setSelectedMaterialIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const generateQuiz = async () => {
    const selectedMats = materials.filter(m => selectedMaterialIds.includes(m.id));
    const text = selectedMats.map(m => m.content_text).join('\n\n---\n\n');
    if (!text) return;

    setGeneratingQuiz(true);
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialText: text, subject: actSubject, ageGroup: '10-12', questionCount: 5 }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuizQuestions(data.questions);
      }
    } catch { /* ignore */ }
    setGeneratingQuiz(false);
  };

  const handleCreate = async () => {
    if (!actTitle.trim()) return;
    setCreating(true);
    try {
      const { data } = await createGuidedActivity(supabase, {
        parent_id: parentId,
        kid_id: kidId,
        title: actTitle,
        subject: actSubject,
        activity_type: actType,
        material_ids: selectedMaterialIds,
        questions: actType === 'quiz' ? quizQuestions : null,
        instructions: actInstructions || null,
        parent_note: actParentNote || null,
        status: 'pending',
      });
      if (data) {
        setActivities(prev => [data, ...prev]);
      }
      // Reset form
      setShowCreator(false);
      setActTitle('');
      setActInstructions('');
      setActParentNote('');
      setQuizQuestions(null);
      setSelectedMaterialIds([]);
    } catch { /* ignore */ }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    await deleteGuidedActivity(supabase, id);
    setActivities(prev => prev.filter(a => a.id !== id));
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
        <AnimatePresence mode="wait">
          {showCreator ? (
            <motion.div
              key="creator"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-semibold">Criar atividade para {kidName}</h3>
                <button onClick={() => setShowCreator(false)} className="text-white/40 hover:text-white/70 text-xs">
                  Fechar
                </button>
              </div>

              {/* Activity type selector */}
              <div className="grid grid-cols-2 gap-2">
                {activityTypes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActType(t.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl text-left transition-all ${
                      actType === t.id
                        ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                        : 'bg-white/5 border border-white/5 text-white/50 hover:text-white/70'
                    }`}
                  >
                    {t.icon}
                    <div>
                      <p className="text-xs font-medium">{t.label}</p>
                      <p className="text-[10px] text-white/30">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Subject */}
              <div className="flex flex-wrap gap-1.5">
                {subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActSubject(s.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      actSubject === s.id ? 'text-white' : 'bg-white/5 text-white/50'
                    }`}
                    style={actSubject === s.id ? { backgroundColor: s.color } : undefined}
                  >
                    {s.icon} {s.name}
                  </button>
                ))}
              </div>

              {/* Title */}
              <input
                type="text"
                value={actTitle}
                onChange={e => setActTitle(e.target.value)}
                placeholder="Titulo da atividade..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-400"
              />

              {/* Materials selector */}
              {materials.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs mb-1.5">Materiais (opcional)</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {materials.map(m => (
                      <button
                        key={m.id}
                        onClick={() => toggleMaterial(m.id)}
                        className={`w-full text-left rounded-lg p-2 text-xs transition-all ${
                          selectedMaterialIds.includes(m.id)
                            ? 'bg-purple-600/10 border border-purple-500/20 text-white'
                            : 'bg-white/[0.03] border border-white/5 text-white/50'
                        }`}
                      >
                        {m.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz generation */}
              {actType === 'quiz' && (
                <div className="space-y-2">
                  {selectedMaterialIds.length > 0 && !quizQuestions && (
                    <button
                      onClick={generateQuiz}
                      disabled={generatingQuiz}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {generatingQuiz ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Gerando quiz com IA...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Gerar quiz com IA
                        </>
                      )}
                    </button>
                  )}
                  {quizQuestions && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                      <p className="text-green-300 text-xs font-medium">
                        ✓ {quizQuestions.length} perguntas geradas!
                      </p>
                      <div className="mt-2 space-y-1">
                        {quizQuestions.map((q, i) => (
                          <p key={i} className="text-white/50 text-[11px] truncate">
                            {i + 1}. {q.question}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions (for non-quiz types) */}
              {actType !== 'quiz' && (
                <textarea
                  value={actInstructions}
                  onChange={e => setActInstructions(e.target.value)}
                  placeholder={actType === 'reading' ? 'Perguntas para reflexao...' : 'Instrucoes para o exercicio...'}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-400 min-h-[80px] resize-none"
                />
              )}

              {/* Parent note */}
              <div className="flex items-start gap-2">
                <MessageSquare size={14} className="text-white/30 mt-2 shrink-0" />
                <input
                  type="text"
                  value={actParentNote}
                  onChange={e => setActParentNote(e.target.value)}
                  placeholder="Mensagem de incentivo (opcional)..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleCreate}
                disabled={!actTitle.trim() || creating || (actType === 'quiz' && !quizQuestions)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Enviar para {kidName}
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="toggle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowCreator(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-purple-200 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all text-sm font-medium"
            >
              <Plus size={16} />
              Criar atividade para {kidName}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Activities list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-white/40" />
        </div>
      ) : activities.length === 0 ? (
        <motion.div variants={fadeInUp('medium')} className="flex flex-col items-center py-8 gap-2">
          <Sparkles size={32} className="text-white/20" />
          <p className="text-white/40 text-sm text-center">
            Crie atividades para estudar junto com {kidName}!
            <br />
            <span className="text-white/25 text-xs">Quiz, leitura guiada, exercicios e revisoes</span>
          </p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-2">
          {activities.map(a => {
            const subjectInfo = getSubjectById(a.subject);
            const typeInfo = activityTypes.find(t => t.id === a.activity_type);
            return (
              <motion.div
                key={a.id}
                variants={fadeInUp('medium')}
                className="glass rounded-xl p-3 group hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-300">
                    {typeInfo?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate">{a.title}</p>
                      {statusBadge(a.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {subjectInfo && (
                        <span className="text-[10px]" style={{ color: subjectInfo.color }}>
                          {subjectInfo.icon} {subjectInfo.name}
                        </span>
                      )}
                      <span className="text-white/25 text-[10px]">{typeInfo?.label}</span>
                      <span className="text-white/20 text-[10px]">{relativeDate(a.created_at)}</span>
                    </div>
                    {a.parent_note && (
                      <p className="text-white/30 text-[11px] mt-1 italic">💬 {a.parent_note}</p>
                    )}
                    {a.status === 'completed' && a.kid_score !== null && (
                      <p className="text-green-400/70 text-[11px] mt-1">
                        Nota: {a.kid_score}% · +{a.xp_earned} XP
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
