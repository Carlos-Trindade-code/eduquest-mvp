'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import {
  getLinkedKids,
  getKidAnalytics,
  getUserStats,
  getUserBadges,
  getInviteCode,
  getKidSessions,
  getKidSessionSummaries,
  getKidStudyStats,
  getParentTasks,
} from '@/lib/supabase/queries';
import { XPBar } from '@/components/gamification/XPBar';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { SessionsChart } from '@/components/parent/charts/SessionsChart';
import { SubjectsChart } from '@/components/parent/charts/SubjectsChart';
import { StudyStatsCards } from '@/components/parent/StudyStatsCards';
import { SessionTimeline } from '@/components/parent/SessionTimeline';
import { SessionDetail } from '@/components/parent/SessionDetail';
import { TasksTab } from '@/components/parent/TasksTab';
import { getSubjectById } from '@/lib/subjects/config';
import { badges as allBadges } from '@/lib/gamification/badges';
import { InviteCodeCard } from '@/components/parent/InviteCodeCard';
import { Sparkles, Users, BookOpen, Trophy, BarChart3, LogOut, Home, Shield, GraduationCap, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import type { Profile, UserStats, Badge, Session, SessionSummary, KidStudyStats, ParentTask } from '@/lib/auth/types';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';

export default function ParentDashboard() {
  const { profile, loading: authLoading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };
  const [kids, setKids] = useState<Profile[]>([]);
  const [selectedKid, setSelectedKid] = useState<Profile | null>(null);
  const [kidStats, setKidStats] = useState<UserStats | null>(null);
  const [kidBadges, setKidBadges] = useState<Badge[]>([]);
  const [kidSessions, setKidSessions] = useState<Session[]>([]);
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);
  const [studyStats, setStudyStats] = useState<KidStudyStats | null>(null);
  const [parentTasks, setParentTasks] = useState<ParentTask[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);
  const [analytics, setAnalytics] = useState<{
    totalSessions: number;
    totalMinutes: number;
    totalXP: number;
    bySubject: Record<string, number>;
    byDay: Record<string, number>;
  } | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!profile) return;
    loadKids();
  }, [profile]);

  // Auto-refresh every 10s while no kids linked
  useEffect(() => {
    if (!profile || kids.length > 0) return;
    const interval = setInterval(loadKids, 10000);
    return () => clearInterval(interval);
  }, [profile, kids.length]);

  useEffect(() => {
    if (!selectedKid) return;
    loadKidData(selectedKid.id);
  }, [selectedKid]);

  const loadKids = async () => {
    if (!profile) return;
    const [{ data }, code] = await Promise.all([
      getLinkedKids(supabase, profile.id),
      getInviteCode(supabase),
    ]);
    setKids(data);
    setInviteCode(code);
    if (data.length > 0) setSelectedKid(data[0]);
    setLoading(false);
  };

  const loadKidData = async (kidId: string) => {
    const [statsResult, badgesResult, analyticsResult, sessionsResult, summariesResult, studyStatsResult, tasksResult] = await Promise.all([
      getUserStats(supabase, kidId),
      getUserBadges(supabase, kidId),
      getKidAnalytics(supabase, kidId, 30),
      getKidSessions(supabase, kidId, 10),
      getKidSessionSummaries(supabase, kidId),
      getKidStudyStats(supabase, kidId),
      getParentTasks(supabase, profile!.id, kidId),
    ]);
    setKidStats(statsResult.data);
    setKidBadges(badgesResult.data);
    setAnalytics(analyticsResult);
    setKidSessions(sessionsResult.data);
    setSummaries((summariesResult.data as SessionSummary[]) || []);
    setStudyStats((studyStatsResult.data as KidStudyStats) || null);
    setParentTasks(tasksResult.data);
    setSelectedSession(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-app flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-app">
      <header className="glass border-b border-white/5 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="text-white" size={16} />
              </div>
              <span className="text-white font-bold text-lg">Studdo</span>
            </div>
            <span className="text-[var(--eq-text-secondary)] text-sm ml-1">/ Dashboard</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/tutorial"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-all shadow-lg shadow-purple-600/20"
            >
              <GraduationCap size={15} />
              <span className="hidden sm:inline">Ver como funciona</span>
              <span className="sm:hidden">Tutorial</span>
            </Link>
            {profile?.email === 'carlostrindade@me.com' && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
              >
                <Shield size={14} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5">
              <Users size={14} className="text-[var(--eq-text-secondary)]" />
              <span className="text-[var(--eq-text-secondary)] text-sm hidden md:inline">{profile?.name}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/10"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </div>
      </header>
      {kids.length > 1 && (
        <div className="border-b border-white/5 bg-black/10">
          <div className="max-w-6xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
            {kids.map((kid) => (
              <button
                key={kid.id}
                onClick={() => setSelectedKid(kid)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                  selectedKid?.id === kid.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {kid.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {inviteCode && kids.length > 0 && (
          <div className="mb-6">
            <InviteCodeCard code={inviteCode} hasKids />
          </div>
        )}
        {selectedKid && (
          <Tabs.Root defaultValue="overview">
            <Tabs.List className="flex gap-1 mb-6 p-1 glass rounded-xl overflow-x-auto">
              <Tabs.Trigger
                value="overview"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white/50 hover:text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 size={15} />
                  Visao Geral
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="sessions"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white/50 hover:text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={15} />
                  Sessoes
                  {summaries.length > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                      {summaries.length}
                    </span>
                  )}
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="achievements"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white/50 hover:text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Trophy size={15} />
                  Conquistas
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="tasks"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white/50 hover:text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <ClipboardList size={15} />
                  Tarefas
                  {parentTasks.filter(t => t.status === 'pending').length > 0 && (
                    <span className="ml-1.5 w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                      {parentTasks.filter(t => t.status === 'pending').length}
                    </span>
                  )}
                </span>
              </Tabs.Trigger>
            </Tabs.List>

            {/* Tab 1: Visao Geral */}
            <Tabs.Content value="overview">
              <motion.div
                className="space-y-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Enhanced Stats Cards */}
                <StudyStatsCards stats={studyStats} />

                {/* Charts */}
                <motion.div variants={fadeInUp('medium')} className="grid md:grid-cols-2 gap-6">
                  <div className="glass rounded-[var(--eq-radius)] p-5">
                    <h3 className="text-[var(--eq-text)] font-semibold mb-4">Sessoes (30 dias)</h3>
                    <SessionsChart
                      data={
                        analytics?.byDay
                          ? Object.entries(analytics.byDay).map(([date, sessions]) => ({
                              date: date.slice(5),
                              sessions,
                            }))
                          : []
                      }
                    />
                  </div>
                  <div className="glass rounded-[var(--eq-radius)] p-5">
                    <h3 className="text-[var(--eq-text)] font-semibold mb-4">Materias Estudadas</h3>
                    {analytics && Object.keys(analytics.bySubject).length > 0 ? (
                      <SubjectsChart data={analytics.bySubject} />
                    ) : (
                      <div className="h-48 flex items-center justify-center text-white/30 text-sm">
                        Sem dados ainda
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* XP + Streak */}
                {kidStats && (
                  <motion.div variants={fadeInUp('medium')} className="grid md:grid-cols-2 gap-6">
                    <div className="glass rounded-[var(--eq-radius)] p-5">
                      <h3 className="text-[var(--eq-text)] font-semibold mb-3">Progresso XP</h3>
                      <XPBar totalXp={kidStats.total_xp} />
                    </div>
                    <div className="glass rounded-[var(--eq-radius)] p-5">
                      <h3 className="text-[var(--eq-text)] font-semibold mb-3">Sequencia de Estudo</h3>
                      <StreakDisplay currentStreak={kidStats.current_streak} longestStreak={kidStats.longest_streak} />
                    </div>
                  </motion.div>
                )}

                {analytics?.totalSessions === 0 && (
                  <motion.div variants={fadeInUp('medium')} className="glass rounded-[var(--eq-radius)] p-8 text-center">
                    <div className="text-5xl mb-3">📚</div>
                    <h3 className="text-[var(--eq-text)] font-semibold mb-2">
                      {selectedKid.name} ainda nao comecou a estudar
                    </h3>
                    <p className="text-[var(--eq-text-secondary)] text-sm">
                      As estatisticas aparecerao aqui apos as primeiras sessoes.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </Tabs.Content>

            {/* Tab 2: Sessoes */}
            <Tabs.Content value="sessions">
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {summaries.length === 0 && kidSessions.length === 0 ? (
                  <motion.div variants={fadeInUp('medium')} className="glass rounded-[var(--eq-radius)] p-8 text-center">
                    <div className="text-5xl mb-3">📭</div>
                    <h3 className="text-[var(--eq-text)] font-semibold mb-2">
                      Nenhuma sessao registrada ainda
                    </h3>
                    <p className="text-[var(--eq-text-secondary)] text-sm">
                      Quando {selectedKid.name} estudar com o Edu, as sessoes detalhadas aparecerao aqui.
                    </p>
                  </motion.div>
                ) : summaries.length > 0 ? (
                  <>
                    <SessionTimeline
                      summaries={summaries}
                      onSelectSession={setSelectedSession}
                      selectedSessionId={selectedSession?.id}
                    />
                    {selectedSession && (
                      <SessionDetail
                        summary={selectedSession}
                        onClose={() => setSelectedSession(null)}
                      />
                    )}
                  </>
                ) : (
                  /* Fallback: show old-style session list if no summaries but sessions exist */
                  <motion.div variants={fadeInUp('medium')} className="glass rounded-[var(--eq-radius)] p-5">
                    <h3 className="text-[var(--eq-text)] font-semibold mb-4">Sessoes Recentes</h3>
                    <div className="space-y-2">
                      {kidSessions.map((session) => {
                        const sub = getSubjectById(session.subject);
                        const date = new Date(session.created_at);
                        const isToday = new Date().toDateString() === date.toDateString();
                        return (
                          <div
                            key={session.id}
                            className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                              style={{ background: `${sub?.color || '#8B5CF6'}15` }}
                            >
                              {sub?.icon || '📚'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-white text-sm font-medium">{sub?.name || session.subject}</span>
                              <div className="flex items-center gap-3 mt-0.5">
                                {session.duration_minutes != null && session.duration_minutes > 0 && (
                                  <span className="text-white/25 text-xs">{session.duration_minutes}min</span>
                                )}
                                {session.xp_earned > 0 && (
                                  <span className="text-amber-400/40 text-xs">+{session.xp_earned} XP</span>
                                )}
                              </div>
                            </div>
                            <span className="text-white/20 text-xs shrink-0">
                              {isToday ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </Tabs.Content>

            {/* Tab 3: Conquistas */}
            <Tabs.Content value="achievements">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={fadeInUp('medium')}>
                  <div className="glass rounded-[var(--eq-radius)] p-5">
                    <h3 className="text-[var(--eq-text)] font-semibold mb-4">Conquistas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {allBadges.map((badgeDef) => {
                        const earned = kidBadges.find((b) => b.badge_type === badgeDef.id);
                        return (
                          <BadgeCard
                            key={badgeDef.id}
                            icon={badgeDef.icon}
                            name={badgeDef.name}
                            description={badgeDef.description}
                            earned={!!earned}
                            earnedAt={earned?.earned_at}
                            rarity={badgeDef.rarity}
                          />
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </Tabs.Content>

            {/* Tab 4: Tarefas */}
            <Tabs.Content value="tasks">
              <TasksTab
                kidId={selectedKid.id}
                parentId={profile!.id}
                tasks={parentTasks}
                summaries={summaries}
                onTaskCreated={() => loadKidData(selectedKid.id)}
                onTaskDeleted={() => loadKidData(selectedKid.id)}
              />
            </Tabs.Content>
          </Tabs.Root>
        )}

        {kids.length === 0 && (
          <div className="max-w-lg mx-auto mt-4 space-y-6">
            {/* Welcome message */}
            <div className="text-center">
              <div className="text-5xl mb-3">👋</div>
              <h2 className="text-white text-xl font-bold mb-1">Ola, {profile?.name?.split(' ')[0]}!</h2>
              <p className="text-sm" style={{ color: 'rgba(240,244,248,0.5)' }}>
                3 passos para vincular seu filho
              </p>
            </div>

            {/* Step 1: invite code with share */}
            <div>
              <p className="text-white/50 text-xs font-bold mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                Copie seu codigo de convite
              </p>
              {inviteCode && <InviteCodeCard code={inviteCode} />}
            </div>

            {/* Steps 2 & 3 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.12)' }}>
                <p className="text-white text-sm font-semibold mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  Filho cria conta
                </p>
                <p className="text-xs" style={{ color: 'rgba(240,244,248,0.5)' }}>
                  Acessa <strong className="text-white/70">studdo.com.br</strong> e digita o codigo
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.12)' }}>
                <p className="text-white text-sm font-semibold mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                  Pronto!
                </p>
                <p className="text-xs" style={{ color: 'rgba(240,244,248,0.5)' }}>
                  Ele aparece aqui e voce acompanha tudo em tempo real
                </p>
              </div>
            </div>

            {/* CTA: see how tutor works */}
            <Link
              href="/tutorial"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <GraduationCap size={18} className="text-purple-400 shrink-0" />
              <span>Veja como o tutor funciona</span>
            </Link>

            {/* Auto-refresh hint */}
            <p className="text-center text-xs flex items-center justify-center gap-1.5" style={{ color: 'rgba(240,244,248,0.4)' }}>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                ↻
              </motion.span>
              Atualiza automaticamente quando seu filho criar a conta
            </p>
          </div>
        )}
      </main>
      <FeedbackButton />
    </div>
  );
}
