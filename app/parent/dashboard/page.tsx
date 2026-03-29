'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
import { StudyStatsCards } from '@/components/parent/StudyStatsCards';
import { WeeklyDigest } from '@/components/parent/WeeklyDigest';
import { SessionTimeline } from '@/components/parent/SessionTimeline';
import { SessionDetail } from '@/components/parent/SessionDetail';
import { TasksTab } from '@/components/parent/TasksTab';
import { MaterialsTab } from '@/components/parent/MaterialsTab';
import { StudyTogetherTab } from '@/components/parent/StudyTogetherTab';
import dynamic from 'next/dynamic';

const SessionsChart = dynamic(() => import('@/components/parent/charts/SessionsChart').then(m => m.SessionsChart), {
  loading: () => <div className="h-48 bg-white/5 rounded-xl animate-pulse" />,
});
const SubjectsChart = dynamic(() => import('@/components/parent/charts/SubjectsChart').then(m => m.SubjectsChart), {
  loading: () => <div className="h-48 bg-white/5 rounded-xl animate-pulse" />,
});
import { getSubjectById } from '@/lib/subjects/config';
import { badges as allBadges } from '@/lib/gamification/badges';
import { InviteCodeCard } from '@/components/parent/InviteCodeCard';
import { Sparkles, Users, BookOpen, Trophy, BarChart3, LogOut, Home, Shield, GraduationCap, ClipboardList, Bell, RefreshCw, Loader2, Plus, FolderOpen, Heart } from 'lucide-react';
import Link from 'next/link';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import type { Profile, UserStats, Badge, Session, SessionSummary, KidStudyStats, ParentTask } from '@/lib/auth/types';
import { AlertCard } from '@/components/parent/AlertCard';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import type { AlertSeverity } from '@/lib/auth/types';

function useRelativeTime(timestamp: number | null) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!timestamp) return;
    const interval = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, [timestamp]);
  if (!timestamp) return null;
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 10) return 'Atualizado agora';
  if (diff < 60) return `Atualizado há ${diff}s`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `Atualizado há ${mins}min`;
  return `Atualizado há ${Math.floor(mins / 60)}h`;
}

interface SimpleAlert {
  type: string;
  title: string;
  description: string;
  recommended_action: string;
  severity: AlertSeverity;
}

function generateAlerts(
  stats: UserStats | null,
  sessionsThisWeek: number,
  totalSessions: number,
  kidName: string,
): SimpleAlert[] {
  const alerts: SimpleAlert[] = [];

  // Great streak
  if (stats && stats.current_streak >= 7) {
    alerts.push({
      type: 'great_streak',
      title: 'Sequência incrível de estudo!',
      description: `${kidName} está estudando há ${stats.current_streak} dias seguidos — essa regularidade é o maior preditor de sucesso acadêmico.`,
      recommended_action: 'Celebre esse esforço! Uma recompensa simbólica ou elogio específico ("estou orgulhoso da sua disciplina") reforça o hábito.',
      severity: 'positive',
    });
  }

  // Low engagement this week
  if (sessionsThisWeek < 2 && totalSessions > 5) {
    alerts.push({
      type: 'low_engagement',
      title: 'Poucas sessões esta semana',
      description: `${kidName} estudou menos que o habitual esta semana.`,
      recommended_action: 'Convide para uma sessão rápida de 10 minutos — sem pressão. Sessões curtas são melhores que nenhuma.',
      severity: 'info',
    });
  }

  // First sessions milestone
  if (totalSessions >= 1 && totalSessions <= 3) {
    alerts.push({
      type: 'first_sessions',
      title: 'Primeiros passos!',
      description: `${kidName} já completou ${totalSessions} ${totalSessions === 1 ? 'sessão' : 'sessões'} de estudo. O começo é o mais importante!`,
      recommended_action: 'Pergunte o que achou do Edu e se teve alguma dificuldade. O interesse inicial é precioso — incentive sem pressionar.',
      severity: 'positive',
    });
  }

  // No sessions yet
  if (totalSessions === 0) {
    alerts.push({
      type: 'no_sessions',
      title: `${kidName} ainda não começou`,
      description: 'Nenhuma sessão de estudo foi registrada ainda.',
      recommended_action: 'Sente junto e faça uma primeira sessão com o Edu. Mostrar que você também acha interessante motiva a criança.',
      severity: 'info',
    });
  }

  return alerts;
}

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const lastRefreshLabel = useRelativeTime(lastRefreshedAt);
  const selectedKidRef = useRef<Profile | null>(null);
  selectedKidRef.current = selectedKid;

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

  // Auto-refresh kid data every 30 seconds (only when tab is visible)
  useEffect(() => {
    if (!selectedKid) return;
    const refresh = () => {
      if (document.visibilityState === 'visible' && selectedKidRef.current) {
        silentRefresh(selectedKidRef.current.id);
      }
    };
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [selectedKid?.id]);

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
    setLastRefreshedAt(Date.now());
  };

  const silentRefresh = useCallback(async (kidId: string) => {
    setIsRefreshing(true);
    try {
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
      setLastRefreshedAt(Date.now());
    } finally {
      setIsRefreshing(false);
    }
  }, [profile]);

  const handleManualRefresh = () => {
    if (selectedKid && !isRefreshing) {
      silentRefresh(selectedKid.id);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-app">
        <header className="glass border-b border-white/5 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
              <div className="w-24 h-5 rounded bg-white/10 animate-pulse" />
            </div>
            <div className="w-20 h-8 rounded-lg bg-white/10 animate-pulse" />
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          {/* Tabs skeleton */}
          <div className="flex gap-2">
            {[80, 70, 90, 65].map((w, i) => (
              <div key={i} className="h-9 rounded-lg bg-white/5 animate-pulse" style={{ width: w }} />
            ))}
          </div>
          {/* Cards skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-5 space-y-3">
                <div className="w-16 h-3 rounded bg-white/10 animate-pulse" />
                <div className="w-12 h-7 rounded bg-white/10 animate-pulse" />
              </div>
            ))}
          </div>
          {/* Charts skeleton */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-5 h-56 animate-pulse" />
            <div className="glass rounded-xl p-5 h-56 animate-pulse" />
          </div>
        </div>
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
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            {/* Refresh indicator */}
            {lastRefreshLabel && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[var(--eq-text-secondary)] text-xs">{lastRefreshLabel}</span>
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-1 rounded-md text-[var(--eq-text-secondary)] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                  title="Atualizar dados"
                >
                  {isRefreshing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                </button>
              </div>
            )}
            <Tabs.List className="flex gap-1 mb-6 p-1 glass rounded-xl overflow-x-auto">
              <Tabs.Trigger
                value="overview"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white/50 hover:text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 size={15} />
                  Visão Geral
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="sessions"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white/50 hover:text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={15} />
                  Sessões
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
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white/50 hover:text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:shadow-sm relative"
              >
                <span className="flex items-center gap-2">
                  <ClipboardList size={15} />
                  Tarefas
                  {parentTasks.filter(t => t.status === 'pending').length > 0 ? (
                    <span className="ml-1.5 w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                      {parentTasks.filter(t => t.status === 'pending').length}
                    </span>
                  ) : parentTasks.length === 0 ? (
                    <span className="relative flex h-2.5 w-2.5 ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500" />
                    </span>
                  ) : null}
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="alerts"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white/50 hover:text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Bell size={15} />
                  Alertas
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="materials"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white/50 hover:text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <FolderOpen size={15} />
                  Materiais
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="study-together"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white/50 hover:text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Heart size={15} />
                  Estudar Juntos
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
                {/* Weekly Digest */}
                <WeeklyDigest
                  kidName={selectedKid?.name || 'Seu filho'}
                  stats={kidStats}
                  summaries={summaries}
                />

                {/* Enhanced Stats Cards */}
                <StudyStatsCards stats={studyStats} summaries={summaries} />

                {/* Charts */}
                <motion.div variants={fadeInUp('medium')} className="grid md:grid-cols-2 gap-6">
                  <div className="glass rounded-[var(--eq-radius)] p-5">
                    <h3 className="text-[var(--eq-text)] font-semibold mb-4">Sessões (30 dias)</h3>
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
                    <h3 className="text-[var(--eq-text)] font-semibold mb-4">Matérias Estudadas</h3>
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
                      <h3 className="text-[var(--eq-text)] font-semibold mb-3">Sequência de Estudo</h3>
                      <StreakDisplay currentStreak={kidStats.current_streak} longestStreak={kidStats.longest_streak} />
                    </div>
                  </motion.div>
                )}

                {analytics?.totalSessions === 0 && (
                  <motion.div variants={fadeInUp('medium')} className="glass rounded-[var(--eq-radius)] p-8 text-center">
                    <div className="text-5xl mb-3">📚</div>
                    <h3 className="text-[var(--eq-text)] font-semibold mb-2">
                      {selectedKid.name} ainda não começou a estudar
                    </h3>
                    <p className="text-[var(--eq-text-secondary)] text-sm">
                      As estatísticas aparecerão aqui após as primeiras sessões.
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* FAB: Sugerir tarefa */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                onClick={() => setActiveTab('tasks')}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-white text-sm font-semibold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-shadow"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={18} />
                Sugerir tarefa
              </motion.button>
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
                      Nenhuma sessão registrada ainda
                    </h3>
                    <p className="text-[var(--eq-text-secondary)] text-sm">
                      Quando {selectedKid.name} estudar com o Edu, as sessões detalhadas aparecerão aqui.
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
                    <h3 className="text-[var(--eq-text)] font-semibold mb-4">Sessões Recentes</h3>
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

            {/* Tab 5: Alertas */}
            <Tabs.Content value="alerts">
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {(() => {
                  const sessionsThisWeek = analytics?.byDay
                    ? Object.entries(analytics.byDay)
                        .filter(([date]) => {
                          const d = new Date(`2026-${date}`);
                          const now = new Date();
                          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                          return d >= weekAgo;
                        })
                        .reduce((sum, [, count]) => sum + count, 0)
                    : 0;
                  const alerts = generateAlerts(kidStats, sessionsThisWeek, analytics?.totalSessions ?? 0, selectedKid.name);
                  if (alerts.length === 0) {
                    return (
                      <motion.div variants={fadeInUp('medium')} className="glass rounded-[var(--eq-radius)] p-8 text-center">
                        <div className="text-5xl mb-3">🔔</div>
                        <h3 className="text-[var(--eq-text)] font-semibold mb-2">Tudo tranquilo!</h3>
                        <p className="text-[var(--eq-text-secondary)] text-sm">
                          Nenhum alerta no momento. Quando detectarmos algo relevante, avisamos aqui.
                        </p>
                      </motion.div>
                    );
                  }
                  return alerts.map((alert) => (
                    <motion.div key={alert.type} variants={fadeInUp('medium')}>
                      <AlertCard
                        title={alert.title}
                        description={alert.description}
                        recommended_action={alert.recommended_action}
                        severity={alert.severity}
                      />
                    </motion.div>
                  ));
                })()}
              </motion.div>
            </Tabs.Content>

            {/* Tab 6: Materiais */}
            <Tabs.Content value="materials">
              {selectedKid && profile && (
                <MaterialsTab
                  parentId={profile.id}
                  kidId={selectedKid.id}
                  kidName={selectedKid.name?.split(' ')[0] || 'filho'}
                />
              )}
            </Tabs.Content>

            {/* Tab 7: Estudar Juntos */}
            <Tabs.Content value="study-together">
              {selectedKid && profile && (
                <StudyTogetherTab
                  parentId={profile.id}
                  kidId={selectedKid.id}
                  kidName={selectedKid.name?.split(' ')[0] || 'filho'}
                />
              )}
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
                Copie seu código de convite
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
                  Acessa <strong className="text-white/70">studdo.com.br</strong> e digita o código
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.12)' }}>
                <p className="text-white text-sm font-semibold mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                  Pronto!
                </p>
                <p className="text-xs" style={{ color: 'rgba(240,244,248,0.5)' }}>
                  Ele aparece aqui e você acompanha tudo em tempo real
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
