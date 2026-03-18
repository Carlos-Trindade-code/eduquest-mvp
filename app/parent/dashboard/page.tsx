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
import { Sparkles, Users, BookOpen, Clock, Trophy, BarChart3 } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import { cn } from '@/lib/utils';
import type { Profile, UserStats, Badge } from '@/lib/auth/types';

export default function ParentDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const [kids, setKids] = useState<Profile[]>([]);
  const [selectedKid, setSelectedKid] = useState<Profile | null>(null);
  const [kidStats, setKidStats] = useState<UserStats | null>(null);
  const [kidBadges, setKidBadges] = useState<Badge[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalSessions: number;
    totalMinutes: number;
    totalXP: number;
    bySubject: Record<string, number>;
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="text-white" size={16} />
            </div>
            <span className="text-white font-bold text-lg">Studdo</span>
            <span className="text-[var(--eq-text-secondary)] text-sm ml-2">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[var(--eq-text-secondary)]" />
            <span className="text-[var(--eq-text-secondary)] text-sm">{profile?.name}</span>
          </div>
        </div>
      return (
        <main className="min-h-screen bg-gradient-app">
          <motion.div
            className="max-w-5xl mx-auto py-10 px-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* ...existing code... */}
            {selectedKid && (
              <div className="mt-8">
                <XPBar totalXp={kidStats?.total_xp || 0} />
                <StreakDisplay streakDays={kidStats?.streak_days || 0} />
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <SessionsChart analytics={analytics} />
                  <SubjectsChart analytics={analytics} />
                </div>
                <div className="mt-6 flex flex-wrap gap-4">
                  {kidBadges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>

                {/* Painel de feedback dos testes */}
                <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl px-6 py-5 text-blue-200">
                  <div className="font-bold text-lg mb-2">Feedback dos Testes</div>
                  <div className="mb-1">Última nota: <span className="font-semibold text-white">{kidStats?.last_exam_score || 'N/A'}</span></div>
                  <div className="mb-1">Domínio: <span className="font-semibold text-white">{kidStats?.last_exam_mastery || 'N/A'}</span></div>
                  <div className="mb-2">Principais dificuldades: <span className="text-white">{kidStats?.main_mistakes || 'N/A'}</span></div>
                  <div className="mt-2 text-purple-300 italic">{kidStats?.comfort_message || 'Continue incentivando seu filho! O aprendizado é uma jornada.'}</div>
                  <div className="mt-4 text-sm text-blue-300">Sugestão: acompanhe as matérias com maior dificuldade e celebre as conquistas!</div>
                </div>

                {/* Alertas proativos e sugestões de materiais */}
                <div className="mt-8">
                  <div className="font-bold text-lg mb-2 text-orange-300">Alertas e Recomendações</div>
                  {/* Exemplo de alerta visual */}
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-5 py-4 mb-4 flex flex-col gap-2">
                    <span className="font-semibold text-orange-200">Seu filho está repetindo o mesmo erro em matemática.</span>
                    <span className="text-orange-100 text-sm">Recomendação: Reserve 10 minutos para revisar frações juntos usando o Studdo no modo "Revisão Focada".</span>
                    <span className="text-orange-100 text-sm">Sugestão de material: <a href="https://www.youtube.com/watch?v=video-matematica" target="_blank" className="underline text-blue-200">Vídeo: Frações para crianças</a> | <a href="/materiais/frações-jogo.pdf" target="_blank" className="underline text-blue-200">Jogo PDF: Frações Divertidas</a></span>
                  </div>
                  {/* Outros alertas podem ser renderizados dinamicamente conforme analytics */}
                </div>
              </div>
            )}
            {/* ...existing code... */}
          </motion.div>
        </main>
      );

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
                <SessionsChart data={[]} />
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
          <div className="glass rounded-[var(--eq-radius)] p-8 text-center">
            <div className="text-5xl mb-3">📚</div>
            <h3 className="text-[var(--eq-text)] font-semibold mb-2">Nenhum filho vinculado ainda</h3>
            <p className="text-[var(--eq-text-secondary)] text-sm">
              Use o codigo de convite acima para vincular o perfil do seu filho.
              <br />
              As estatisticas aparecerao aqui apos o vinculo.
            </p>
          </div>
        )}
      </main>
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
