'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Flame, Trophy, Star, Zap, BookOpen,
  Calendar, Target, Sparkles, ChevronRight, Trash2, Share2,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { getUserStats, getUserBadges } from '@/lib/supabase/queries';
import { XPBar } from '@/components/gamification/XPBar';
import { StreakDisplay } from '@/components/gamification/StreakDisplay';
import { ClassmateLeaderboard } from '@/components/gamification/ClassmateLeaderboard';
import { BadgeCard } from '@/components/gamification/BadgeCard';
import { AgeThemeProvider } from '@/components/providers/AgeThemeProvider';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { getLevel, getLevelTitle } from '@/lib/gamification/xp';
import { badges as allBadges } from '@/lib/gamification/badges';
import { getSubjectById, subjects } from '@/lib/subjects/config';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import type { AgeGroup, UserStats, Badge } from '@/lib/auth/types';

interface SubjectStat {
  subject: string;
  count: number;
}

export default function PerfilPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ageGroup: AgeGroup = profile?.age_group || '10-12';

  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/login?redirect=/perfil');
      return;
    }
    if (!profile?.id) return;

    const supabase = createClient();

    Promise.all([
      getUserStats(supabase, profile.id),
      getUserBadges(supabase, profile.id),
      supabase
        .from('sessions')
        .select('subject')
        .eq('kid_id', profile.id)
        .not('ended_at', 'is', null),
    ]).then(([statsRes, badgesRes, sessionsRes]) => {
      setStats(statsRes.data);
      setEarnedBadges(badgesRes.data);

      // Count sessions per subject
      const counts: Record<string, number> = {};
      (sessionsRes.data || []).forEach((s: { subject: string }) => {
        counts[s.subject] = (counts[s.subject] || 0) + 1;
      });
      const sorted = Object.entries(counts)
        .map(([subject, count]) => ({ subject, count }))
        .sort((a, b) => b.count - a.count);
      setSubjectStats(sorted);

      setLoading(false);
    });
  }, [profile, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1E1046 0%, #3B0764 100%)' }}>
        <MascotOwl expression="thinking" size="lg" animated />
      </div>
    );
  }

  const level = stats ? getLevel(stats.total_xp) : 1;
  const levelTitle = getLevelTitle(level);
  const earnedBadgeIds = earnedBadges.map((b) => b.badge_type);

  const shareBadge = async (badgeName: string) => {
    const text = `🏆 Conquistei o badge "${badgeName}" no Studdo! Estou no nível ${level} (${levelTitle}). Vem estudar comigo! 🦉\n\nhttps://www.studdo.com.br`;
    if (navigator.share) {
      await navigator.share({ title: 'Studdo - Conquista!', text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };
  const totalSessions = stats?.sessions_completed || 0;

  return (
    <AgeThemeProvider ageGroup={ageGroup}>
      <div
        className="min-h-screen pb-8"
        style={{ background: 'linear-gradient(135deg, var(--eq-bg) 0%, var(--eq-bg-end) 100%)' }}
      >
        {/* Header */}
        <header className="glass border-b border-white/5 px-4 py-3 mb-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link
              href="/tutor"
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>
            <span className="text-white font-bold">Meu Perfil</span>
            <div className="w-16" />
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 space-y-5">
          {/* Profile card */}
          <motion.div
            className="glass rounded-2xl p-6 text-center"
            variants={fadeInUp('high')}
            initial="hidden"
            animate="visible"
          >
            {/* Avatar */}
            <motion.div
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/30 mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            >
              {profile?.name?.charAt(0).toUpperCase() || '?'}
            </motion.div>

            <h1 className="text-white text-xl font-extrabold">{profile?.name}</h1>
            <p className="text-white/40 text-sm mt-0.5">
              {levelTitle} — Nivel {level}
            </p>

            {/* Quick stats */}
            <div className="flex justify-center gap-6 mt-5">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-lg">
                  <Sparkles size={16} />
                  {stats?.total_xp || 0}
                </div>
                <p className="text-white/30 text-xs">XP Total</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-orange-400 font-bold text-lg">
                  <Flame size={16} />
                  {stats?.current_streak || 0}
                </div>
                <p className="text-white/30 text-xs">Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-cyan-400 font-bold text-lg">
                  <BookOpen size={16} />
                  {totalSessions}
                </div>
                <p className="text-white/30 text-xs">Sessoes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-purple-400 font-bold text-lg">
                  <Trophy size={16} />
                  {earnedBadges.length}
                </div>
                <p className="text-white/30 text-xs">Badges</p>
              </div>
            </div>
          </motion.div>

          {/* XP + Streak */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp('medium')}>
              <XPBar totalXp={stats?.total_xp || 0} />
            </motion.div>
            <motion.div variants={fadeInUp('medium')}>
              <StreakDisplay
                currentStreak={stats?.current_streak || 0}
                longestStreak={stats?.longest_streak || 0}
              />
            </motion.div>
          </motion.div>

          {/* Subjects studied */}
          {subjectStats.length > 0 && (
            <motion.div
              className="glass rounded-2xl p-4"
              variants={fadeInUp('medium')}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Target size={14} className="text-purple-400" />
                Materias estudadas
              </h2>
              <div className="space-y-2">
                {subjectStats.slice(0, 5).map((s) => {
                  const info = getSubjectById(s.subject);
                  const maxCount = subjectStats[0]?.count || 1;
                  const pct = Math.round((s.count / maxCount) * 100);
                  return (
                    <div key={s.subject} className="flex items-center gap-3">
                      <span className="text-base w-6 text-center shrink-0">{info?.icon || '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-white text-xs font-medium truncate">{info?.name || s.subject}</span>
                          <span className="text-white/30 text-xs shrink-0 ml-2">{s.count} sessoes</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: info?.color || '#8B5CF6' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Classroom Leaderboard */}
          {profile?.id && (
            <ClassmateLeaderboard kidId={profile.id} />
          )}

          {/* Badges */}
          <motion.div
            variants={fadeInUp('medium')}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Star size={14} className="text-amber-400" />
              Conquistas ({earnedBadges.length}/{allBadges.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allBadges.map((badge) => {
                const earned = earnedBadgeIds.includes(badge.id);
                const earnedData = earnedBadges.find((b) => b.badge_type === badge.id);
                return (
                  <div key={badge.id} className="relative">
                    <BadgeCard
                      icon={badge.icon}
                      name={badge.name}
                      description={badge.description}
                      earned={earned}
                      earnedAt={earnedData?.earned_at}
                      rarity={badge.rarity}
                    />
                    {earned && (
                      <button
                        onClick={() => shareBadge(badge.name)}
                        className="absolute top-2 right-2 text-white/30 hover:text-white/60 transition-colors p-1"
                        title="Compartilhar"
                      >
                        <Share2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/tutor"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 hover:opacity-90 transition-all"
            >
              <Zap size={16} />
              Continuar estudando
              <ChevronRight size={14} />
            </Link>
          </motion.div>

          {/* Delete account */}
          <div className="pt-6 border-t border-white/5">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 text-red-400/60 hover:text-red-400 text-xs transition-colors mx-auto"
            >
              <Trash2 size={12} />
              Excluir minha conta
            </button>
          </div>
        </div>

        {/* Delete confirmation modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setShowDeleteModal(false)}
            >
              <motion.div
                className="glass rounded-2xl p-6 max-w-sm w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                    <Trash2 size={20} className="text-red-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Excluir conta?</h3>
                  <p className="text-white/50 text-sm mt-2">
                    Todos os seus dados serao apagados permanentemente: sessoes, badges, XP, materiais e progresso. Esta acao nao pode ser desfeita.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      try {
                        const res = await fetch('/api/account/delete', { method: 'POST' });
                        if (res.ok) {
                          router.push('/?deleted=1');
                        } else {
                          alert('Erro ao excluir conta. Tente novamente.');
                        }
                      } catch {
                        alert('Erro ao excluir conta. Tente novamente.');
                      } finally {
                        setDeleting(false);
                      }
                    }}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Excluindo...' : 'Sim, excluir'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AgeThemeProvider>
  );
}
