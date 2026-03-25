'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { getLinkedKids, getKidAnalytics, getUserStats, getUserBadges, getInviteCode } from '@/lib/supabase/queries';
import { XPBar } from '@/components/gamification/XPBar';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { SessionsChart } from '@/components/parent/charts/SessionsChart';
import { SubjectsChart } from '@/components/parent/charts/SubjectsChart';
import { badges as allBadges } from '@/lib/gamification/badges';
import { InviteCodeCard } from '@/components/parent/InviteCodeCard';
import { Sparkles, Users, BookOpen, Clock, Trophy, BarChart3, LogOut, Home, Shield, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import { cn } from '@/lib/utils';
import type { Profile, UserStats, Badge } from '@/lib/auth/types';
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
    const [statsResult, badgesResult, analyticsResult] = await Promise.all([
      getUserStats(supabase, kidId),
      getUserBadges(supabase, kidId),
      getKidAnalytics(supabase, kidId, 30),
    ]);
    setKidStats(statsResult.data);
    setKidBadges(badgesResult.data);
    setAnalytics(analyticsResult);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-app flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Carregando...</div>
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
              href="/tutor"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-all shadow-lg shadow-purple-600/20"
            >
              <GraduationCap size={15} />
              <span className="hidden sm:inline">Modo Estudo</span>
              <span className="sm:hidden">Estudar</span>
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
          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp('medium')} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<BookOpen size={20} />} label="Sessoes" value={analytics?.totalSessions || 0} color="#3B82F6" />
              <StatCard icon={<Clock size={20} />} label="Minutos" value={analytics?.totalMinutes || 0} color="#10B981" />
              <StatCard icon={<Trophy size={20} />} label="XP Total" value={kidStats?.total_xp || 0} color="#F59E0B" />
              <StatCard icon={<BarChart3 size={20} />} label="Streak" value={`${kidStats?.current_streak || 0} dias`} color="#F97316" />
            </motion.div>

            <motion.div variants={fadeInUp('medium')} className="grid md:grid-cols-2 gap-6">
              <div className="glass rounded-[var(--eq-radius)] p-5">
                <h3 className="text-[var(--eq-text)] font-semibold mb-4">Sessoes (30 dias)</h3>
                <SessionsChart
                  data={
                    analytics?.byDay
                      ? Object.entries(analytics.byDay).map(([date, sessions]) => ({
                          date: date.slice(5), // "MM-DD" apenas
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
        )}

        {kids.length === 0 && (
          <div className="max-w-lg mx-auto mt-4 space-y-6">
            {/* Welcome message */}
            <div className="text-center">
              <div className="text-5xl mb-3">👋</div>
              <h2 className="text-white text-xl font-bold mb-1">Ola, {profile?.name?.split(' ')[0]}!</h2>
              <p className="text-sm" style={{ color: 'rgba(240,244,248,0.5)' }}>
                Vincule seu filho para acompanhar o progresso dele
              </p>
            </div>

            {/* Step 1: invite code with share */}
            {inviteCode && <InviteCodeCard code={inviteCode} />}

            {/* Steps 2 & 3 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.12)' }}>
                <div className="text-2xl mb-2">📱</div>
                <p className="text-white text-sm font-semibold mb-1">Passo 2</p>
                <p className="text-xs" style={{ color: 'rgba(240,244,248,0.5)' }}>
                  Seu filho acessa <strong className="text-white/70">studdo.com.br</strong>, cria a conta e digita o codigo
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.12)' }}>
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-white text-sm font-semibold mb-1">Passo 3</p>
                <p className="text-xs" style={{ color: 'rgba(240,244,248,0.5)' }}>
                  Ele aparece aqui automaticamente e voce acompanha tudo em tempo real
                </p>
              </div>
            </div>

            {/* CTA: use tutor now */}
            <Link
              href="/tutor"
              className="block w-full rounded-2xl p-5 text-center transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.15))', border: '1px solid rgba(139,92,246,0.25)' }}
            >
              <GraduationCap size={28} className="text-purple-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm mb-1">Seu filho quer estudar agora?</p>
              <p className="text-xs mb-3" style={{ color: 'rgba(240,244,248,0.5)' }}>
                Clique aqui para abrir o tutor IA direto — sem precisar de conta separada
              </p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 text-white">
                <GraduationCap size={15} />
                Abrir Modo Estudo
              </span>
            </Link>

            {/* Quick links */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex flex-col gap-2">
                <Link
                  href="/tutorial"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <BookOpen size={16} className="text-blue-400" />
                  Veja como o tutor funciona
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <Home size={16} className="text-green-400" />
                  Voltar para a pagina inicial
                </Link>
              </div>
            </div>

            {/* Auto-refresh hint */}
            <p className="text-center text-xs" style={{ color: 'rgba(240,244,248,0.25)' }}>
              Esta pagina atualiza automaticamente quando seu filho criar a conta
            </p>
          </div>
        )}
      </main>
      <FeedbackButton />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <motion.div className="glass rounded-[var(--eq-radius)] p-4" whileHover={{ scale: 1.02, y: -2 }}>
      <div className="mb-2" style={{ color }}>{icon}</div>
      <div className="text-[var(--eq-text)] text-2xl font-bold">{value}</div>
      <div className="text-[var(--eq-text-secondary)] text-xs">{label}</div>
    </motion.div>
  );
}
