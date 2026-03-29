'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fadeInUp } from '@/lib/design/animations';

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  sessions: number;
  isMe: boolean;
}

interface Props {
  kidId: string;
}

export function ClassmateLeaderboard({ kidId }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [kidId]);

  const loadLeaderboard = async () => {
    const supabase = createClient();

    // Get classrooms the kid is in
    const { data: memberships } = await supabase
      .from('classroom_members')
      .select('classroom_id')
      .eq('student_id', kidId);

    if (!memberships || memberships.length === 0) {
      setLoading(false);
      return;
    }

    const classroomIds = memberships.map((m) => m.classroom_id);

    // Get all members of those classrooms
    const { data: allMembers } = await supabase
      .from('classroom_members')
      .select('student_id, profiles(id, name)')
      .in('classroom_id', classroomIds);

    if (!allMembers || allMembers.length < 2) {
      setLoading(false);
      return;
    }

    // Dedupe student IDs
    const studentMap = new Map<string, string>();
    for (const m of allMembers as any[]) {
      if (m.profiles?.id && m.profiles?.name) {
        studentMap.set(m.profiles.id, m.profiles.name);
      }
    }

    const studentIds = [...studentMap.keys()];

    // Get user_stats for all students
    const { data: stats } = await supabase
      .from('user_stats')
      .select('user_id, total_xp, sessions_completed')
      .in('user_id', studentIds);

    if (!stats) {
      setLoading(false);
      return;
    }

    const board: LeaderboardEntry[] = studentIds.map((id) => {
      const stat = stats.find((s) => s.user_id === id);
      return {
        id,
        name: studentMap.get(id) || 'Aluno',
        xp: stat?.total_xp || 0,
        sessions: stat?.sessions_completed || 0,
        isMe: id === kidId,
      };
    }).sort((a, b) => b.xp - a.xp);

    setEntries(board);
    setLoading(false);
  };

  // Don't render if less than 2 students or loading
  if (loading || entries.length < 2) return null;

  const MEDALS = ['🥇', '🥈', '🥉'];
  const myRank = entries.findIndex((e) => e.isMe) + 1;
  const showEntries = expanded ? entries : entries.slice(0, 5);

  return (
    <motion.div
      variants={fadeInUp('medium')}
      initial="hidden"
      animate="visible"
      className="glass rounded-2xl p-4 mb-3"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-amber-400" />
          <span className="text-white font-bold text-sm">Ranking da turma</span>
          {myRank > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}
            >
              Voce: #{myRank}
            </span>
          )}
        </div>
        {entries.length > 5 && (
          expanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />
        )}
      </button>

      <div className="space-y-1.5">
        <AnimatePresence>
          {showEntries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                entry.isMe ? 'ring-1 ring-purple-500/40' : ''
              }`}
              style={{
                background: entry.isMe
                  ? 'rgba(139,92,246,0.1)'
                  : i < 3
                    ? 'rgba(255,255,255,0.03)'
                    : 'transparent',
              }}
            >
              {/* Rank */}
              <span className="w-6 text-center shrink-0">
                {i < 3 ? (
                  <span className="text-base">{MEDALS[i]}</span>
                ) : (
                  <span className="text-white/25 text-xs font-mono">{i + 1}</span>
                )}
              </span>

              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                  entry.isMe
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                    : 'bg-white/10'
                }`}
              >
                {entry.name.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${entry.isMe ? 'text-white' : 'text-white/60'}`}>
                  {entry.isMe ? `${entry.name} (voce)` : entry.name}
                </p>
              </div>

              {/* XP */}
              <div className="flex items-center gap-1 shrink-0">
                <Sparkles size={10} className={i === 0 ? 'text-amber-400' : 'text-white/20'} />
                <span className={`text-xs font-bold ${i === 0 ? 'text-amber-400' : entry.isMe ? 'text-purple-300' : 'text-white/40'}`}>
                  {entry.xp}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
