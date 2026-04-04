'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Users, Copy, Check, Upload, Sparkles, LogOut, Shield,
  FileText, Loader2, X, Clock, Star,
  Activity, BarChart3, Zap, Download,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { getSubjectById, subjects } from '@/lib/subjects/config';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import { exportToCSV } from '@/lib/export/csv';
import {
  getStudentAnalytics,
  getClassroomStats,
  type StudentAnalytics,
  type ClassroomStatsResult,
} from '@/lib/supabase/queries';

interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade: string | null;
  code: string;
  created_at: string;
}

interface ClassroomMember {
  id: string;
  student_id: string;
  joined_at: string;
  profiles: { name: string; email: string } | null;
}

interface Material {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  content_text: string | null;
  created_at: string;
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return 'Nunca';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 14) return 'Há 1 semana';
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  return `Há ${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
}

function getActivityStatus(lastSessionDate: string | null): 'green' | 'yellow' | 'red' {
  if (!lastSessionDate) return 'red';
  const diffDays = Math.floor((Date.now() - new Date(lastSessionDate).getTime()) / 86400000);
  if (diffDays === 0) return 'green';
  if (diffDays < 7) return 'yellow';
  return 'red';
}

const ACTIVITY_DOT_COLORS: Record<string, string> = {
  green: 'bg-emerald-400 shadow-emerald-400/50',
  yellow: 'bg-yellow-400 shadow-yellow-400/50',
  red: 'bg-red-400/60 shadow-red-400/30',
};

export default function ProfessorPage() {
  const { profile, loading: authLoading, signOut } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentAnalytics, setStudentAnalytics] = useState<Record<string, StudentAnalytics>>({});
  const [classroomStats, setClassroomStats] = useState<ClassroomStatsResult | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [schoolStats, setSchoolStats] = useState<{ totalStudents: number; sessionsWeek: number; avgXP: number; topClassroom: string } | null>(null);

  const supabase = createClient();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (profile) loadClassrooms(); }, [profile]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (selectedClassroom) loadClassroomData(selectedClassroom.id); }, [selectedClassroom]);

  const loadClassrooms = async () => {
    if (!profile) return;
    const { data } = await supabase.from('classrooms').select('*').eq('teacher_id', profile.id).order('created_at', { ascending: false });
    setClassrooms((data || []) as Classroom[]);
    if (data && data.length > 0 && !selectedClassroom) setSelectedClassroom(data[0] as Classroom);
    setLoading(false);

    // Load school-wide stats
    if (data && data.length > 0) {
      const classroomIds = data.map((c: Classroom) => c.id);
      const { data: allMembers } = await supabase.from('classroom_members').select('student_id, classroom_id').in('classroom_id', classroomIds);
      const studentIds = [...new Set((allMembers || []).map((m: { student_id: string }) => m.student_id))];
      if (studentIds.length > 0) {
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const { data: sessions } = await supabase.from('sessions').select('kid_id, xp_earned, started_at').in('kid_id', studentIds).gte('started_at', weekAgo);
        const sessionsByClassroom: Record<string, number> = {};
        let totalXP = 0;
        for (const s of sessions || []) {
          totalXP += s.xp_earned || 0;
          const member = (allMembers || []).find((m: { student_id: string }) => m.student_id === s.kid_id);
          if (member) sessionsByClassroom[member.classroom_id] = (sessionsByClassroom[member.classroom_id] || 0) + 1;
        }
        const topId = Object.entries(sessionsByClassroom).sort((a, b) => b[1] - a[1])[0]?.[0];
        const topName = topId ? (data.find((c: Classroom) => c.id === topId)?.name || '—') : '—';
        setSchoolStats({
          totalStudents: studentIds.length,
          sessionsWeek: (sessions || []).length,
          avgXP: studentIds.length > 0 ? Math.round(totalXP / studentIds.length) : 0,
          topClassroom: topName,
        });
      }
    }
  };

  const loadClassroomData = async (classroomId: string) => {
    setAnalyticsLoading(true);
    const [membersRes, materialsRes] = await Promise.all([
      supabase.from('classroom_members').select('*, profiles(name, email)').eq('classroom_id', classroomId),
      supabase.from('classroom_materials').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false }),
    ]);
    const loadedMembers = (membersRes.data || []) as ClassroomMember[];
    setMembers(loadedMembers);
    setMaterials((materialsRes.data || []) as Material[]);
    const kidIds = loadedMembers.map((m) => m.student_id);
    if (kidIds.length > 0) {
      const nameMap: Record<string, string> = {};
      loadedMembers.forEach((m) => { nameMap[m.student_id] = m.profiles?.name || 'Aluno'; });
      const [analytics, stats] = await Promise.all([
        getStudentAnalytics(supabase, kidIds),
        getClassroomStats(supabase, kidIds, nameMap),
      ]);
      const analyticsMap: Record<string, StudentAnalytics> = {};
      analytics.forEach((a) => { analyticsMap[a.kidId] = a; });
      setStudentAnalytics(analyticsMap);
      setClassroomStats(stats);
    } else {
      setStudentAnalytics({});
      setClassroomStats(null);
    }
    setAnalyticsLoading(false);
  };

  const handleSignOut = async () => { await signOut(); window.location.href = '/login'; };

  if (authLoading || loading) {
    return (<div className="min-h-screen bg-gradient-app flex items-center justify-center" aria-live="polite"><div className="text-white text-lg animate-pulse" role="status">Carregando...</div></div>);
  }

  return (
    <div className="min-h-screen bg-gradient-app">
      <header className="glass border-b border-white/5 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-400" size={20} />
            <span className="text-white font-bold text-lg">Studdo</span>
            <span className="text-white/30 text-sm ml-1">/ Professor</span>
          </div>
          <div className="flex items-center gap-2">
            {profile?.email === 'carlostrindade@me.com' && (<Link href="/admin" className="px-3 py-1.5 rounded-lg text-sm text-purple-400 hover:bg-purple-500/10 transition-colors"><Shield size={14} /></Link>)}
            <span className="text-white/40 text-sm hidden sm:inline">{profile?.name}</span>
            <button onClick={handleSignOut} className="px-3 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/10"><LogOut size={14} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-xl font-bold">Minhas Turmas</h1>
          <motion.button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Plus size={16} />Nova turma
          </motion.button>
        </div>

        {/* School Overview */}
        {schoolStats && classrooms.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total de Alunos', value: schoolStats.totalStudents, color: '#8B5CF6' },
              { label: 'Sessões esta semana', value: schoolStats.sessionsWeek, color: '#3B82F6' },
              { label: 'XP médio/aluno', value: schoolStats.avgXP, color: '#10B981' },
              { label: 'Turma mais ativa', value: schoolStats.topClassroom, color: '#F59E0B' },
            ].map((card) => (
              <div key={card.label} className="glass rounded-xl p-4 text-center">
                <div className="text-xl font-bold" style={{ color: card.color }}>{card.value}</div>
                <div className="text-white/40 text-xs mt-1">{card.label}</div>
              </div>
            ))}
          </div>
        )}

        {classrooms.length === 0 ? (
          <EmptyState onCreateClick={() => setShowCreateModal(true)} />
        ) : (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <div className="space-y-2">
              {classrooms.map((c) => {
                const sub = getSubjectById(c.subject);
                const isSelected = selectedClassroom?.id === c.id;
                return (
                  <button key={c.id} onClick={() => setSelectedClassroom(c)} className={`w-full text-left rounded-xl p-3.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${isSelected ? 'ring-1 ring-purple-500/50' : ''}`} style={{ background: isSelected ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isSelected ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sub?.icon || '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{c.name}</p>
                        <p className="text-white/30 text-xs">{sub?.name || c.subject} · {c.code}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedClassroom && (
              <div className="space-y-6">
                <ClassroomHeader classroom={selectedClassroom} memberCount={members.length} />

                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2"><FileText size={16} className="text-purple-400" />Materiais ({materials.length})</h3>
                    <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition-colors"><Upload size={12} />Enviar material</button>
                  </div>
                  {materials.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-8">Nenhum material ainda. Envie PDFs, imagens ou textos.</p>
                  ) : (
                    <div className="space-y-2">
                      {materials.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <FileText size={16} className="text-white/30 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{m.title}</p>
                            {m.description && <p className="text-white/30 text-xs truncate">{m.description}</p>}
                          </div>
                          <span className="text-white/20 text-xs shrink-0">{new Date(m.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {classroomStats && members.length > 0 && (<ClassroomStatsSummary stats={classroomStats} totalStudents={members.length} />)}

                {/* Top performers ranking */}
                {members.length > 0 && Object.values(studentAnalytics).some((a) => a.totalXP > 0) && (
                  <TopPerformers members={members} analytics={studentAnalytics} />
                )}

                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Users size={16} className="text-blue-400" />Alunos ({members.length})</h3>
                    {members.length > 0 && Object.values(studentAnalytics).some((a) => a.totalSessions > 0) && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => exportToCSV(
                            members.map((m) => {
                              const a = studentAnalytics[m.student_id];
                              const favSub = a?.favoriteSubject ? getSubjectById(a.favoriteSubject) : null;
                              return {
                                Nome: m.profiles?.name || 'Aluno',
                                Sessoes: a?.totalSessions || 0,
                                XP_Total: a?.totalXP || 0,
                                Ultima_Atividade: a?.lastSessionDate ? formatRelativeDate(a.lastSessionDate) : 'Sem atividade',
                                Materia_Favorita: favSub ? favSub.name : '--',
                              };
                            }),
                            `alunos_${selectedClassroom.name.replace(/\s+/g, '_')}`
                          )}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                        >
                          <Download size={12} />Exportar CSV
                        </button>
                        <button
                          onClick={() => {
                            const lines = [
                              `📊 Relatório — ${selectedClassroom.name}`,
                              `Total: ${classroomStats?.totalSessions || 0} sessões · XP médio: ${classroomStats?.averageXP || 0}`,
                              '',
                              ...members.map((m) => {
                                const a = studentAnalytics[m.student_id];
                                return `${m.profiles?.name || 'Aluno'}: ${a?.totalSessions || 0} sessões, ${a?.totalXP || 0} XP, ${a?.totalMinutes || 0}min`;
                              }),
                              '',
                              `Gerado pelo Studdo — studdo.com.br`,
                            ];
                            navigator.clipboard.writeText(lines.join('\n'));
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                        >
                          <Copy size={12} />Copiar relatório
                        </button>
                        <button
                          onClick={() => window.open(`/api/classroom-report?classroomId=${selectedClassroom.id}`, '_blank')}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                        >
                          <FileText size={12} />Gerar PDF
                        </button>
                      </div>
                    )}
                  </div>
                  {members.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-8">Nenhum aluno ainda. Compartilhe o código da turma.</p>
                  ) : analyticsLoading ? (
                    <div className="flex items-center justify-center py-8 gap-2"><Loader2 size={16} className="animate-spin text-purple-400" /><span className="text-white/40 text-sm">Carregando analytics...</span></div>
                  ) : (
                    <StudentListSection members={members} analytics={studentAnalytics} classroomCode={selectedClassroom.code} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <AnimatePresence>{showCreateModal && (<CreateClassroomModal profileId={profile?.id || ''} onCreated={() => { setShowCreateModal(false); loadClassrooms(); }} onClose={() => setShowCreateModal(false)} />)}</AnimatePresence>
      <AnimatePresence>{showUploadModal && selectedClassroom && (<UploadMaterialModal classroomId={selectedClassroom.id} onUploaded={() => { setShowUploadModal(false); loadClassroomData(selectedClassroom.id); }} onClose={() => setShowUploadModal(false)} />)}</AnimatePresence>
      <FeedbackButton />
    </div>
  );
}

function TopPerformers({ members, analytics }: { members: ClassroomMember[]; analytics: Record<string, StudentAnalytics> }) {
  const MEDALS = ['🥇', '🥈', '🥉'];
  const ranked = members
    .map((m) => ({ ...m, xp: analytics[m.student_id]?.totalXP || 0, sessions: analytics[m.student_id]?.totalSessions || 0 }))
    .filter((m) => m.xp > 0)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 3);

  if (ranked.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-4">
        <Star size={16} className="text-yellow-400" />
        Destaque da turma
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {ranked.map((student, i) => (
          <div
            key={student.id}
            className="rounded-xl p-3 text-center"
            style={{
              background: i === 0 ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)'}`,
            }}
          >
            <span className="text-2xl block mb-1">{MEDALS[i]}</span>
            <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold mb-1">
              {(student.profiles?.name || '?').charAt(0).toUpperCase()}
            </div>
            <p className="text-white text-xs font-semibold truncate">{student.profiles?.name || 'Aluno'}</p>
            <p className="text-amber-400 text-[10px] font-bold">{student.xp} XP</p>
            <p className="text-white/25 text-[10px]">{student.sessions} sessões</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  const steps = [
    { icon: '1️⃣', title: 'Crie uma turma', desc: 'Escolha a matéria e dê um nome' },
    { icon: '2️⃣', title: 'Envie materiais', desc: 'PDFs, imagens ou textos viram base para a IA' },
    { icon: '3️⃣', title: 'Compartilhe o código', desc: 'Alunos entram com o código ST-XXXX' },
    { icon: '4️⃣', title: 'Acompanhe o progresso', desc: 'Veja sessões, XP e ranking dos alunos' },
  ];
  return (
    <div className="max-w-lg mx-auto py-12">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🏫</div>
        <h2 className="text-white text-xl font-bold mb-2">Bem-vindo ao Studdo para Professores</h2>
        <p className="text-sm" style={{ color: 'rgba(240,244,248,0.5)' }}>Configure sua turma em 4 passos simples</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {steps.map((step) => (
          <motion.div
            key={step.title}
            className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-xl block mb-2">{step.icon}</span>
            <p className="text-white text-sm font-semibold mb-0.5">{step.title}</p>
            <p className="text-white/40 text-xs">{step.desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="text-center">
        <motion.button onClick={onCreateClick} className="px-8 py-3.5 rounded-xl font-bold text-sm bg-purple-600 text-white shadow-lg shadow-purple-600/25" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Plus size={16} className="inline mr-2" />Criar minha primeira turma</motion.button>
      </div>
    </div>
  );
}

function ClassroomHeader({ classroom, memberCount }: { classroom: Classroom; memberCount: number }) {
  const [copied, setCopied] = useState(false);
  const sub = getSubjectById(classroom.subject);
  const handleCopy = async () => { await navigator.clipboard.writeText(classroom.code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${sub?.color || '#8B5CF6'}15` }}>{sub?.icon || '📚'}</div>
          <div><h2 className="text-white font-bold text-lg">{classroom.name}</h2><p className="text-white/40 text-xs">{sub?.name || classroom.subject} · {memberCount} aluno{memberCount !== 1 ? 's' : ''}</p></div>
        </div>
        <div className="rounded-xl px-4 py-2 text-center" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Código</p>
          <div className="flex items-center gap-2"><span className="text-white font-mono font-bold text-sm tracking-widest">{classroom.code}</span><button onClick={handleCopy} className="text-white/30 hover:text-white transition-colors">{copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}</button></div>
        </div>
      </div>
    </div>
  );
}

function ClassroomStatsSummary({ stats, totalStudents }: { stats: ClassroomStatsResult; totalStudents: number }) {
  const sub = stats.mostStudiedSubject ? getSubjectById(stats.mostStudiedSubject) : null;
  const activePercent = totalStudents > 0 ? Math.round((stats.studentsActiveThisWeek / totalStudents) * 100) : 0;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="rounded-xl p-3.5" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
        <div className="flex items-center gap-2 mb-1"><BarChart3 size={14} className="text-purple-400" /><span className="text-white/40 text-[10px] uppercase tracking-wider">Sessões</span></div>
        <p className="text-white font-bold text-lg">{stats.totalSessions}</p><p className="text-white/30 text-[10px]">total da turma</p>
      </div>
      <div className="rounded-xl p-3.5" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <div className="flex items-center gap-2 mb-1"><Zap size={14} className="text-blue-400" /><span className="text-white/40 text-[10px] uppercase tracking-wider">XP médio</span></div>
        <p className="text-white font-bold text-lg">{stats.averageXP}</p><p className="text-white/30 text-[10px]">por aluno</p>
      </div>
      <div className="rounded-xl p-3.5" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <div className="flex items-center gap-2 mb-1"><Activity size={14} className="text-emerald-400" /><span className="text-white/40 text-[10px] uppercase tracking-wider">Ativos</span></div>
        <p className="text-white font-bold text-lg">{activePercent}%</p><p className="text-white/30 text-[10px]">{stats.studentsActiveThisWeek} esta semana</p>
      </div>
      <div className="rounded-xl p-3.5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
        <div className="flex items-center gap-2 mb-1"><Star size={14} className="text-yellow-400" /><span className="text-white/40 text-[10px] uppercase tracking-wider">Matéria top</span></div>
        <p className="text-white font-bold text-sm truncate">{sub ? `${sub.icon} ${sub.name}` : '--'}</p><p className="text-white/30 text-[10px]">mais estudada</p>
      </div>
    </motion.div>
  );
}

function StudentListSection({ members, analytics, classroomCode }: { members: ClassroomMember[]; analytics: Record<string, StudentAnalytics>; classroomCode: string }) {
  const hasAnySessions = Object.values(analytics).some((a) => a.totalSessions > 0);
  if (!hasAnySessions && members.length > 0) {
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 px-4"><div className="text-3xl mb-3">📖</div><p className="text-white/50 text-sm mb-1">Seus alunos ainda não iniciaram sessões de estudo.</p><p className="text-white/30 text-xs">Compartilhe o código <span className="font-mono text-purple-400">{classroomCode}</span> para eles começarem!</p></motion.div>);
  }
  return (
    <div className="space-y-2">
      {members.map((m, i) => {
        const a = analytics[m.student_id];
        const status = getActivityStatus(a?.lastSessionDate || null);
        const favSub = a?.favoriteSubject ? getSubjectById(a.favoriteSubject) : null;
        return (
          <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.03 }} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{(m.profiles?.name || '?').charAt(0).toUpperCase()}</div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${ACTIVITY_DOT_COLORS[status]}`} style={{ borderColor: '#0F1D2E' }} title={status === 'green' ? 'Ativo hoje' : status === 'yellow' ? 'Ativo esta semana' : 'Inativo 7+ dias'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white text-sm font-medium truncate">{m.profiles?.name || 'Aluno'}</p>
                {a && a.totalSessions > 0 && (<span className="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/20 text-purple-300">{a.totalSessions} {a.totalSessions === 1 ? 'sessão' : 'sessões'}</span>)}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-white/30 text-xs">{a?.lastSessionDate ? formatRelativeDate(a.lastSessionDate) : 'Sem atividade'}</span>
                {favSub && <span className="text-white/20 text-[10px]">{favSub.icon} {favSub.name}</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              {a && a.totalXP > 0 ? (<>
                <div className="flex items-center gap-1 justify-end"><Zap size={12} className={a.totalXP >= 500 ? 'text-yellow-400' : a.totalXP >= 200 ? 'text-blue-400' : 'text-white/30'} /><span className={`text-xs font-semibold ${a.totalXP >= 500 ? 'text-yellow-400' : a.totalXP >= 200 ? 'text-blue-400' : 'text-white/40'}`}>{a.totalXP} XP</span></div>
                {a.totalMinutes > 0 && (<div className="flex items-center gap-1 justify-end mt-0.5"><Clock size={10} className="text-white/20" /><span className="text-white/20 text-[10px]">{a.totalMinutes}min</span></div>)}
              </>) : (<span className="text-white/15 text-xs">--</span>)}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function CreateClassroomModal({ profileId, onCreated, onClose }: { profileId: string; onCreated: () => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('math');
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const sb = createClient();
    const { data: code } = await sb.rpc('generate_classroom_code');
    await sb.from('classrooms').insert({ teacher_id: profileId, name: name.trim(), subject, code });
    setCreating(false);
    onCreated();
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="create-modal-title">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md rounded-2xl p-6" style={{ background: '#0F1D2E', border: '1px solid rgba(255,255,255,0.1)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5"><h2 id="create-modal-title" className="text-white font-bold text-lg">Nova turma</h2><button onClick={onClose} className="text-white/30 hover:text-white" aria-label="Fechar"><X size={18} /></button></div>
        <div className="space-y-4">
          <div><label className="text-white/50 text-xs font-medium block mb-1.5">Nome da turma</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: 5o Ano A - Matemática" className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm" /></div>
          <div><label className="text-white/50 text-xs font-medium block mb-1.5">Matéria principal</label><div className="grid grid-cols-4 gap-2">{subjects.filter(s => s.id !== 'other').map((s) => (<button key={s.id} onClick={() => setSubject(s.id)} className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all ${subject === s.id ? 'ring-1 ring-purple-500' : ''}`} style={{ background: subject === s.id ? `${s.color}15` : 'rgba(255,255,255,0.03)', border: `1px solid ${subject === s.id ? `${s.color}30` : 'rgba(255,255,255,0.05)'}` }}><span className="text-lg">{s.icon}</span><span className="text-white/60 truncate w-full text-center" style={{ fontSize: 10 }}>{s.name}</span></button>))}</div></div>
          <motion.button onClick={handleCreate} disabled={!name.trim() || creating} className="w-full py-3 rounded-xl font-bold text-sm bg-purple-600 text-white disabled:opacity-30 flex items-center justify-center gap-2" whileHover={name.trim() ? { scale: 1.02 } : {}} whileTap={{ scale: 0.98 }}>{creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{creating ? 'Criando...' : 'Criar turma'}</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function UploadMaterialModal({ classroomId, onUploaded, onClose }: { classroomId: string; onUploaded: () => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  const [contentText, setContentText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const handleUpload = async () => {
    if (!title.trim()) return;
    setUploading(true);
    const sb = createClient();
    let fileUrl = null; let fileType = null; let extractedText = contentText;
    if (file) {
      fileType = file.type; const ext = file.name.split('.').pop(); const path = `materials/${classroomId}/${Date.now()}.${ext}`;
      const { data: uploadData } = await sb.storage.from('materials').upload(path, file);
      if (uploadData) { const { data: urlData } = sb.storage.from('materials').getPublicUrl(path); fileUrl = urlData.publicUrl; }
      if (file.type.startsWith('image/') && !contentText) { try { const formData = new FormData(); formData.append('file', file); const res = await fetch('/api/ocr', { method: 'POST', body: formData }); const data = await res.json(); if (data.text) extractedText = data.text; } catch { /* non-critical */ } }
    }
    await sb.from('classroom_materials').insert({ classroom_id: classroomId, title: title.trim(), description: description.trim() || null, file_url: fileUrl, file_type: fileType, content_text: extractedText || null });
    setUploading(false); onUploaded();
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md rounded-2xl p-6" style={{ background: '#0F1D2E', border: '1px solid rgba(255,255,255,0.1)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5"><h2 id="upload-modal-title" className="text-white font-bold text-lg">Enviar material</h2><button onClick={onClose} className="text-white/30 hover:text-white" aria-label="Fechar"><X size={18} /></button></div>
        <div className="space-y-4">
          <div><label className="text-white/50 text-xs font-medium block mb-1.5">Título *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Lista de exercícios - Cap. 5" className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm" /></div>
          <div><label className="text-white/50 text-xs font-medium block mb-1.5">Descrição</label><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instruções para o aluno (opcional)" className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm" /></div>
          <div><label className="text-white/50 text-xs font-medium block mb-1.5">Arquivo (PDF ou imagem)</label><label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/30 cursor-pointer transition-colors"><Upload size={16} className="text-white/30" /><span className="text-white/40 text-sm">{file ? file.name : 'Clique para selecionar'}</span><input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" /></label></div>
          <div><label className="text-white/50 text-xs font-medium block mb-1.5">Ou cole o texto aqui</label><textarea value={contentText} onChange={(e) => setContentText(e.target.value)} placeholder="Cole o conteúdo da tarefa, exercício ou texto de estudo..." rows={4} className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm resize-none" /></div>
          <motion.button onClick={handleUpload} disabled={!title.trim() || uploading} className="w-full py-3 rounded-xl font-bold text-sm bg-purple-600 text-white disabled:opacity-30 flex items-center justify-center gap-2" whileHover={title.trim() ? { scale: 1.02 } : {}} whileTap={{ scale: 0.98 }}>{uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}{uploading ? 'Enviando...' : 'Enviar material'}</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
