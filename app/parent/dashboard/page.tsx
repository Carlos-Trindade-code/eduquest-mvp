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
import { Sparkles, Users, BookOpen, Clock, Trophy, BarChart3, LogOut, Home, Shield } from 'lucide-react';
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
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="text-white" size={16} />
              </div>
              <span className="text-white font-bold text-lg">Studdo</span>
            </Link>
            <span className="text-[var(--eq-text-secondary)] text-sm ml-1">/ Dashboard</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Início</span>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sair</span>
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
        {inviteCode && (
          <div className="mb-6">
            <InviteCodeCard code={inviteCode} />
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
          <div className="glass rounded-[var(--eq-radius)] p-10 text-center max-w-md mx-auto mt-8">
            <div className="text-5xl mb-4">👋</div>
            <h3 className="text-[var(--eq-text)] font-semibold text-lg mb-2">Bem-vindo ao Studdo!</h3>
            <p className="text-[var(--eq-text-secondary)] text-sm mb-6">
              Para começar, seu filho precisa criar uma conta usando o código de convite acima.
              As sessões e estatísticas aparecerão aqui após o vínculo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/tutorial"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,244,248,0.7)' }}
              >
                <BookOpen size={15} />
                Ver como funciona
              </Link>
            </div>
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
