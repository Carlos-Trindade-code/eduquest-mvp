import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, { maxRequests: 3, windowMs: 60_000 });
    if (!rl.success) return rateLimitResponse();

    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Get the profile to find the internal ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return Response.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const profileId = profile.id;

    // Delete user data in order (respecting foreign keys)
    // 1. Guided activities
    await supabase.from('guided_activities').delete().or(`parent_id.eq.${profileId},kid_id.eq.${profileId}`);
    // 2. Parent tasks
    await supabase.from('parent_tasks').delete().or(`parent_id.eq.${profileId},kid_id.eq.${profileId}`);
    // 3. Session summaries
    await supabase.from('session_summaries').delete().eq('kid_id', profileId);
    // 4. Messages (via sessions)
    const { data: sessions } = await supabase.from('sessions').select('id').eq('kid_id', profileId);
    if (sessions?.length) {
      const sessionIds = sessions.map(s => s.id);
      await supabase.from('messages').delete().in('session_id', sessionIds);
    }
    // 5. Sessions
    await supabase.from('sessions').delete().eq('kid_id', profileId);
    // 6. Badges
    await supabase.from('badges').delete().eq('user_id', profileId);
    // 7. User stats
    await supabase.from('user_stats').delete().eq('user_id', profileId);
    // 8. Study goals
    await supabase.from('study_goals').delete().or(`parent_id.eq.${profileId},kid_id.eq.${profileId}`);
    // 9. Materials
    await supabase.from('materials').delete().eq('owner_id', profileId);
    // 10. Parent-kid links
    await supabase.from('parent_kid_links').delete().or(`parent_id.eq.${profileId},kid_id.eq.${profileId}`);
    // 11. Suggestions
    await supabase.from('suggestions').delete().eq('user_id', user.id);
    // 12. User feedback
    await supabase.from('user_feedback').delete().eq('user_id', user.id);
    // 13. Profile
    await supabase.from('profiles').delete().eq('id', profileId);

    // 14. Delete auth user (signs them out)
    // Note: Using the admin client would be ideal, but with RLS + anon key
    // we delete the profile data above, then sign out. The auth record
    // will be orphaned but harmless. For full deletion, use Supabase dashboard
    // or configure a service_role key.
    await supabase.auth.signOut();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Account delete error:', error);
    return Response.json({ error: 'Erro ao excluir conta. Tente novamente.' }, { status: 500 });
  }
}
