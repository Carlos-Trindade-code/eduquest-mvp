import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile, Session, Message, UserStats, Badge, Suggestion, AdminMetrics, UserFeedback, FeedbackStats, SessionSummary, ParentTask, Material, GuidedActivity } from '@/lib/auth/types';
import { checkNewBadges } from '@/lib/gamification/badges';

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

  if (error) {
    const msg = error.message?.toLowerCase() || '';
    if (msg.includes('not found') || msg.includes('invalid')) {
      return {
        data: { success: false, error: 'Codigo nao encontrado. Verifique se digitou corretamente.' } as {
          success: boolean; error?: string; parent_name?: string; already_linked?: boolean;
        },
        error: null,
      };
    }
    return {
      data: { success: false, error: 'Algo deu errado. Tente novamente.' } as {
        success: boolean; error?: string; parent_name?: string; already_linked?: boolean;
      },
      error: null,
    };
  }

  // Handle RPC-level error responses
  if (data && !data.success) {
    const rpcError = (data.error || '').toLowerCase();
    let friendlyError = 'Algo deu errado. Tente novamente.';
    if (rpcError.includes('not found') || rpcError.includes('invalid') || rpcError.includes('nao encontr')) {
      friendlyError = 'Codigo nao encontrado. Verifique se digitou corretamente.';
    } else if (rpcError.includes('already') || rpcError.includes('ja') || data.already_linked) {
      friendlyError = 'Você já está conectado a este pai/mãe!';
    }
    return {
      data: { ...data, error: friendlyError } as {
        success: boolean; error?: string; parent_name?: string; already_linked?: boolean;
      },
      error: null,
    };
  }

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

// ==========================================
// SUGGESTIONS
// ==========================================

export async function submitSuggestion(
  supabase: SupabaseClient,
  data: { content: string; userName?: string; userEmail?: string }
) {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('suggestions')
    .insert({
      user_id: user?.id || null,
      user_name: data.userName || null,
      user_email: data.userEmail || null,
      content: data.content,
    });

  return { error };
}

// ==========================================
// ADMIN QUERIES
// ==========================================

export async function getAdminMetrics(
  supabase: SupabaseClient
): Promise<AdminMetrics | null> {
  const { data, error } = await supabase.rpc('get_admin_metrics');
  if (error) {
    console.error('Admin metrics error:', error);
    return null;
  }
  return data as AdminMetrics;
}

export async function getAllSuggestions(
  supabase: SupabaseClient
): Promise<Suggestion[]> {
  const { data, error } = await supabase.rpc('get_all_suggestions');
  if (error) {
    console.error('Get suggestions error:', error);
    return [];
  }
  return (data || []) as Suggestion[];
}

export async function getUserSuggestions(
  supabase: SupabaseClient,
  userId: string
): Promise<Suggestion[]> {
  const { data } = await supabase
    .from('suggestions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data || []) as Suggestion[];
}

export async function updateSuggestionStatus(
  supabase: SupabaseClient,
  suggestionId: string,
  status: 'pending' | 'read' | 'done',
  notes?: string
) {
  const { error } = await supabase.rpc('update_suggestion_status', {
    suggestion_id: suggestionId,
    new_status: status,
    notes: notes || null,
  });
  return { error };
}

export async function getAllProfiles(
  supabase: SupabaseClient
): Promise<Profile[]> {
  // Try RPC first (SECURITY DEFINER bypasses RLS — returns all profiles)
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_profiles');
  if (!rpcError && rpcData) {
    return rpcData as Profile[];
  }
  // Fallback: direct query (RLS applies — returns only own profile if RPC missing)
  console.warn('get_all_profiles RPC unavailable, falling back to direct query:', rpcError?.message);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Get all profiles error:', error);
    return [];
  }
  return (data || []) as Profile[];
}

// ==========================================
// BADGE AUTO-AWARD
// ==========================================

export async function checkAndAwardBadges(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  // Busca stats e badges atuais em paralelo
  const [statsResult, badgesResult] = await Promise.all([
    getUserStats(supabase, userId),
    getUserBadges(supabase, userId),
  ]);

  if (!statsResult.data) return [];

  const stats = statsResult.data;
  const existingBadgeIds = (badgesResult.data || []).map((b) => b.badge_type);

  // Busca sessões para contagem de mensagens e matérias
  const { data: sessionRows } = await supabase
    .from('sessions')
    .select('id, subject')
    .eq('kid_id', userId);

  const sessionIds = (sessionRows || []).map((s: { id: string; subject: string }) => s.id);

  const { data: messages } = sessionIds.length > 0
    ? await supabase.from('messages').select('session_id').in('session_id', sessionIds)
    : { data: [] };

  const subjectsStudied = [
    ...new Set((sessionRows || []).map((s: { id: string; subject: string }) => s.subject)),
  ];

  const badgeStats = {
    sessionsCompleted: stats.sessions_completed,
    totalXp: stats.total_xp,
    currentStreak: stats.current_streak,
    longestStreak: stats.longest_streak,
    totalMessages: (messages || []).length,
    subjectsStudied,
  };

  const newBadges = checkNewBadges(badgeStats, existingBadgeIds);

  // Concede novos badges
  await Promise.all(newBadges.map((b) => awardBadge(supabase, userId, b.id)));

  return newBadges.map((b) => b.id);
}

// ==========================================
// FEEDBACK QUERIES
// ==========================================

export async function submitFeedback(
  supabase: SupabaseClient,
  rating: number,
  comment: string | null,
  source: 'floating_button' | 'post_session'
): Promise<{ error: Error | null }> {
  const { error } = await supabase.rpc('submit_feedback', {
    p_rating: rating,
    p_comment: comment,
    p_source: source,
  });
  return { error };
}

export async function getAllFeedback(supabase: SupabaseClient): Promise<UserFeedback[]> {
  const { data, error } = await supabase.rpc('get_all_feedback');
  if (error) {
    console.error('getAllFeedback error:', error);
    return [];
  }
  return (data as UserFeedback[]) || [];
}

export async function getFeedbackStats(supabase: SupabaseClient): Promise<FeedbackStats | null> {
  const { data, error } = await supabase.rpc('get_feedback_stats');
  if (error) {
    console.error('getFeedbackStats error:', error);
    return null;
  }
  return data as FeedbackStats;
}

// ==========================================
// SESSION SUMMARIES + PARENT STATS
// ==========================================

export async function saveSessionSummary(
  supabase: SupabaseClient,
  summary: Omit<SessionSummary, 'id' | 'created_at'>
) {
  return supabase.from('session_summaries').insert(summary).select().single();
}

export async function getKidSessionSummaries(
  supabase: SupabaseClient,
  kidId: string,
  options?: { limit?: number; offset?: number; subject?: string }
) {
  return supabase.rpc('get_kid_session_summaries', {
    p_kid_id: kidId,
    p_limit: options?.limit ?? 20,
    p_offset: options?.offset ?? 0,
    p_subject: options?.subject ?? null,
  });
}

export async function getSessionMessagesForParent(
  supabase: SupabaseClient,
  sessionId: string
) {
  return supabase.rpc('get_session_messages_for_parent', {
    p_session_id: sessionId,
  });
}

export async function getKidStudyStats(
  supabase: SupabaseClient,
  kidId: string
) {
  return supabase.rpc('get_kid_study_stats', { p_kid_id: kidId });
}

// ==========================================
// PARENT TASKS
// ==========================================

export async function createParentTask(
  supabase: SupabaseClient,
  parentId: string,
  kidId: string,
  subject: string,
  description: string
) {
  const { data, error } = await supabase
    .from('parent_tasks')
    .insert({ parent_id: parentId, kid_id: kidId, subject, description })
    .select()
    .single();
  return { data: data as ParentTask | null, error };
}

export async function getParentTasks(
  supabase: SupabaseClient,
  parentId: string,
  kidId: string
) {
  const { data, error } = await supabase
    .from('parent_tasks')
    .select('*')
    .eq('parent_id', parentId)
    .eq('kid_id', kidId)
    .order('created_at', { ascending: false });
  return { data: (data || []) as ParentTask[], error };
}

export async function getKidPendingTasks(
  supabase: SupabaseClient,
  kidId: string
) {
  const { data, error } = await supabase
    .from('parent_tasks')
    .select('*')
    .eq('kid_id', kidId)
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: true });
  return { data: (data || []) as ParentTask[], error };
}

export async function completeParentTask(
  supabase: SupabaseClient,
  taskId: string,
  sessionId: string
) {
  const { data, error } = await supabase
    .from('parent_tasks')
    .update({
      status: 'completed' as const,
      session_id: sessionId,
      completed_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single();
  return { data: data as ParentTask | null, error };
}

export async function deleteParentTask(
  supabase: SupabaseClient,
  taskId: string
) {
  const { error } = await supabase
    .from('parent_tasks')
    .delete()
    .eq('id', taskId);
  return { error };
}

// ==========================================
// TEACHER / PROFESSOR ANALYTICS
// ==========================================

export interface StudentAnalytics {
  kidId: string;
  totalSessions: number;
  totalXP: number;
  lastSessionDate: string | null;
  totalMinutes: number;
  favoriteSubject: string | null;
}

export interface ClassroomStatsResult {
  totalSessions: number;
  averageXP: number;
  mostActiveStudent: { id: string; name: string; sessions: number } | null;
  mostStudiedSubject: string | null;
  studentsActiveThisWeek: number;
}

export async function getStudentAnalytics(
  supabase: SupabaseClient,
  kidIds: string[]
): Promise<StudentAnalytics[]> {
  if (kidIds.length === 0) return [];

  const { data: sessions } = await supabase
    .from('sessions')
    .select('kid_id, subject, duration_minutes, xp_earned, created_at')
    .in('kid_id', kidIds);

  const allSessions = (sessions || []) as Array<{
    kid_id: string;
    subject: string;
    duration_minutes: number | null;
    xp_earned: number;
    created_at: string;
  }>;

  const byKid: Record<string, typeof allSessions> = {};
  for (const s of allSessions) {
    if (!byKid[s.kid_id]) byKid[s.kid_id] = [];
    byKid[s.kid_id].push(s);
  }

  return kidIds.map((kidId) => {
    const kidSessions = byKid[kidId] || [];
    const totalSessions = kidSessions.length;
    const totalXP = kidSessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0);
    const totalMinutes = kidSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

    let lastSessionDate: string | null = null;
    if (kidSessions.length > 0) {
      lastSessionDate = kidSessions.reduce((latest, s) =>
        s.created_at > latest ? s.created_at : latest, kidSessions[0].created_at);
    }

    const subjectCount: Record<string, number> = {};
    for (const s of kidSessions) {
      subjectCount[s.subject] = (subjectCount[s.subject] || 0) + 1;
    }
    let favoriteSubject: string | null = null;
    let maxCount = 0;
    for (const [sub, count] of Object.entries(subjectCount)) {
      if (count > maxCount) { maxCount = count; favoriteSubject = sub; }
    }

    return { kidId, totalSessions, totalXP, lastSessionDate, totalMinutes, favoriteSubject };
  });
}

export async function getClassroomStats(
  supabase: SupabaseClient,
  studentIds: string[],
  studentNames: Record<string, string>
): Promise<ClassroomStatsResult> {
  if (studentIds.length === 0) {
    return { totalSessions: 0, averageXP: 0, mostActiveStudent: null, mostStudiedSubject: null, studentsActiveThisWeek: 0 };
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('kid_id, subject, xp_earned, created_at')
    .in('kid_id', studentIds);

  const allSessions = (sessions || []) as Array<{
    kid_id: string;
    subject: string;
    xp_earned: number;
    created_at: string;
  }>;

  const totalSessions = allSessions.length;
  const totalXP = allSessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0);
  const averageXP = studentIds.length > 0 ? Math.round(totalXP / studentIds.length) : 0;

  const sessionsByKid: Record<string, number> = {};
  for (const s of allSessions) {
    sessionsByKid[s.kid_id] = (sessionsByKid[s.kid_id] || 0) + 1;
  }
  let mostActiveStudent: ClassroomStatsResult['mostActiveStudent'] = null;
  let maxSessions = 0;
  for (const [kidId, count] of Object.entries(sessionsByKid)) {
    if (count > maxSessions) {
      maxSessions = count;
      mostActiveStudent = { id: kidId, name: studentNames[kidId] || 'Aluno', sessions: count };
    }
  }

  const subjectCount: Record<string, number> = {};
  for (const s of allSessions) {
    subjectCount[s.subject] = (subjectCount[s.subject] || 0) + 1;
  }
  let mostStudiedSubject: string | null = null;
  let maxSubjectCount = 0;
  for (const [sub, count] of Object.entries(subjectCount)) {
    if (count > maxSubjectCount) { maxSubjectCount = count; mostStudiedSubject = sub; }
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const activeThisWeek = new Set(
    allSessions.filter((s) => s.created_at >= oneWeekAgo).map((s) => s.kid_id)
  );
  const studentsActiveThisWeek = activeThisWeek.size;

  return { totalSessions, averageXP, mostActiveStudent, mostStudiedSubject, studentsActiveThisWeek };
}

// ==========================================
// MATERIALS LIBRARY
// ==========================================

export async function createMaterial(
  supabase: SupabaseClient,
  data: Omit<Material, 'id' | 'created_at' | 'updated_at' | 'tags'> & { tags?: string[] }
) {
  const { data: result, error } = await supabase
    .from('materials')
    .insert({ ...data, tags: data.tags || [] })
    .select()
    .single();
  return { data: result as Material | null, error };
}

export async function getMaterials(
  supabase: SupabaseClient,
  ownerId: string,
  options?: { subject?: string; kidId?: string; limit?: number }
) {
  let query = supabase
    .from('materials')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (options?.subject) query = query.eq('subject', options.subject);
  if (options?.kidId) query = query.eq('kid_id', options.kidId);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  return { data: (data || []) as Material[], error };
}

export async function getKidMaterials(
  supabase: SupabaseClient,
  kidId: string,
  options?: { subject?: string }
) {
  let query = supabase
    .from('materials')
    .select('*')
    .or(`owner_id.eq.${kidId},kid_id.eq.${kidId}`)
    .order('created_at', { ascending: false });

  if (options?.subject) query = query.eq('subject', options.subject);

  const { data, error } = await query;
  return { data: (data || []) as Material[], error };
}

export async function deleteMaterialRecord(
  supabase: SupabaseClient,
  materialId: string
) {
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', materialId);
  return { error };
}

// ==========================================
// GUIDED ACTIVITIES (Study Together)
// ==========================================

export async function createGuidedActivity(
  supabase: SupabaseClient,
  data: Omit<GuidedActivity, 'id' | 'kid_score' | 'xp_earned' | 'started_at' | 'completed_at' | 'created_at'>
) {
  const { data: result, error } = await supabase
    .from('guided_activities')
    .insert(data)
    .select()
    .single();
  return { data: result as GuidedActivity | null, error };
}

export async function getParentActivities(
  supabase: SupabaseClient,
  parentId: string,
  kidId: string
) {
  const { data, error } = await supabase
    .from('guided_activities')
    .select('*')
    .eq('parent_id', parentId)
    .eq('kid_id', kidId)
    .order('created_at', { ascending: false });
  return { data: (data || []) as GuidedActivity[], error };
}

export async function getKidActivities(
  supabase: SupabaseClient,
  kidId: string,
  statusFilter?: string[]
) {
  let query = supabase
    .from('guided_activities')
    .select('*')
    .eq('kid_id', kidId)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter.length > 0) {
    query = query.in('status', statusFilter);
  }

  const { data, error } = await query;
  return { data: (data || []) as GuidedActivity[], error };
}

export async function updateActivityStatus(
  supabase: SupabaseClient,
  activityId: string,
  updates: {
    status: 'in_progress' | 'completed';
    kid_score?: number;
    xp_earned?: number;
    started_at?: string;
    completed_at?: string;
  }
) {
  const { data, error } = await supabase
    .from('guided_activities')
    .update(updates)
    .eq('id', activityId)
    .select()
    .single();
  return { data: data as GuidedActivity | null, error };
}

export async function deleteGuidedActivity(
  supabase: SupabaseClient,
  activityId: string
) {
  const { error } = await supabase
    .from('guided_activities')
    .delete()
    .eq('id', activityId);
  return { error };
}
