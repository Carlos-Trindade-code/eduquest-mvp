import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile, Session, Message, UserStats, Badge } from '@/lib/auth/types';

// ==========================================
// PROFILE QUERIES
// ==========================================

export async function getProfile(supabase: SupabaseClient): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  return data;
}

export async function updateProfile(
  supabase: SupabaseClient,
  profileId: string,
  updates: Partial<Pick<Profile, 'name' | 'avatar_url' | 'language' | 'age' | 'grade'>>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', profileId)
    .select()
    .single();

  return { data, error };
}

// ==========================================
// SESSION QUERIES
// ==========================================

export async function createSession(
  supabase: SupabaseClient,
  kidId: string,
  subject: string,
  homeworkText: string
) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ kid_id: kidId, subject, homework_text: homeworkText })
    .select()
    .single();

  return { data: data as Session | null, error };
}

export async function endSession(
  supabase: SupabaseClient,
  sessionId: string,
  durationMinutes: number,
  xpEarned: number
) {
  const { data, error } = await supabase
    .from('sessions')
    .update({
      ended_at: new Date().toISOString(),
      duration_minutes: durationMinutes,
      xp_earned: xpEarned,
    })
    .eq('id', sessionId)
    .select()
    .single();

  return { data, error };
}

export async function getKidSessions(
  supabase: SupabaseClient,
  kidId: string,
  limit = 20
) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('kid_id', kidId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data: (data || []) as Session[], error };
}

// ==========================================
// MESSAGE QUERIES
// ==========================================

export async function saveMessage(
  supabase: SupabaseClient,
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ session_id: sessionId, role, content })
    .select()
    .single();

  return { data: data as Message | null, error };
}

export async function getSessionMessages(
  supabase: SupabaseClient,
  sessionId: string
) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  return { data: (data || []) as Message[], error };
}

// ==========================================
// STATS QUERIES
// ==========================================

export async function getUserStats(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data: data as UserStats | null, error };
}

export async function addXP(
  supabase: SupabaseClient,
  userId: string,
  xpAmount: number
) {
  // Get current stats
  const { data: stats } = await getUserStats(supabase, userId);
  if (!stats) return { error: new Error('No stats found') };

  const today = new Date().toISOString().split('T')[0];
  const lastDate = stats.last_session_date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Calculate streak
  let newStreak = stats.current_streak;
  if (lastDate !== today) {
    if (lastDate === yesterday) {
      newStreak += 1;
    } else if (lastDate !== today) {
      newStreak = 1;
    }
  }

  const { data, error } = await supabase
    .from('user_stats')
    .update({
      total_xp: stats.total_xp + xpAmount,
      current_streak: newStreak,
      longest_streak: Math.max(stats.longest_streak, newStreak),
      last_session_date: today,
      sessions_completed: stats.sessions_completed + 1,
    })
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}

// ==========================================
// BADGES QUERIES
// ==========================================

export async function getUserBadges(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  return { data: (data || []) as Badge[], error };
}

export async function awardBadge(
  supabase: SupabaseClient,
  userId: string,
  badgeType: string
) {
  const { data, error } = await supabase
    .from('badges')
    .upsert(
      { user_id: userId, badge_type: badgeType },
      { onConflict: 'user_id,badge_type' }
    )
    .select()
    .single();

  return { data, error };
}

// ==========================================
// INVITE CODE QUERIES
// ==========================================

export async function redeemInviteCode(
  supabase: SupabaseClient,
  code: string
) {
  const { data, error } = await supabase.rpc('redeem_invite_code', {
    code: code.toUpperCase(),
  });

  if (error) return { data: null, error };
  return {
    data: data as {
      success: boolean;
      error?: string;
      parent_name?: string;
      already_linked?: boolean;
    },
    error: null,
  };
}

export async function getInviteCode(
  supabase: SupabaseClient
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('invite_code')
    .eq('auth_id', user.id)
    .single();

  return data?.invite_code || null;
}

// ==========================================
// PARENT QUERIES
// ==========================================

export async function getLinkedKids(
  supabase: SupabaseClient,
  parentId: string
) {
  const { data, error } = await supabase
    .from('parent_kid_links')
    .select('kid_id, profiles!parent_kid_links_kid_id_fkey(*)')
    .eq('parent_id', parentId);

  return {
    data: data?.map((d) => d.profiles as unknown as Profile) || [],
    error,
  };
}

export async function linkKidToParent(
  supabase: SupabaseClient,
  parentId: string,
  kidId: string
) {
  const { data, error } = await supabase
    .from('parent_kid_links')
    .insert({ parent_id: parentId, kid_id: kidId })
    .select()
    .single();

  return { data, error };
}

// ==========================================
// ANALYTICS (for parent dashboard)
// ==========================================

export async function getKidAnalytics(
  supabase: SupabaseClient,
  kidId: string,
  days = 30
) {
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('kid_id', kidId)
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  const allSessions = (sessions || []) as Session[];

  // Sessions by subject
  const bySubject: Record<string, number> = {};
  let totalMinutes = 0;
  let totalXP = 0;

  allSessions.forEach((s) => {
    bySubject[s.subject] = (bySubject[s.subject] || 0) + 1;
    totalMinutes += s.duration_minutes || 0;
    totalXP += s.xp_earned || 0;
  });

  // Sessions by day (for chart)
  const byDay: Record<string, number> = {};
  allSessions.forEach((s) => {
    const day = s.created_at.split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;
  });

  return {
    totalSessions: allSessions.length,
    totalMinutes,
    totalXP,
    bySubject,
    byDay,
    sessions: allSessions,
  };
}
