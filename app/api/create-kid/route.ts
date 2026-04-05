import { NextRequest } from 'next/server';
import { createRouteHandlerClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createKidSchema = z.object({
  kidName: z.string().min(1).max(100),
  kidUsername: z.string().min(3).max(30).regex(/^[a-z0-9._-]+$/, 'Username invalido'),
  kidPassword: z.string().min(6),
  kidAge: z.number().min(4).max(18).optional(),
  kidGrade: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify the caller is an authenticated parent
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('auth_id', user.id)
      .single();

    if (!profile || profile.user_type !== 'parent') {
      return Response.json({ error: 'Apenas pais podem criar contas de filhos' }, { status: 403 });
    }

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'JSON invalido' }, { status: 400 });
    }

    const parsed = createKidSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { kidName, kidUsername, kidPassword, kidAge, kidGrade } = parsed.data;
    const cleanUsername = kidUsername.toLowerCase().trim();
    const syntheticEmail = `${cleanUsername}@studdo.app`;

    // Check username uniqueness via admin client (bypasses RLS)
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existing) {
      return Response.json({ error: 'Este nome de usuario ja esta em uso' }, { status: 409 });
    }

    // Create auth user via Admin API
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email: syntheticEmail,
      password: kidPassword,
      email_confirm: true,
      user_metadata: {
        name: kidName,
        user_type: 'kid',
        username: cleanUsername,
      },
    });

    if (createError) {
      if (createError.message?.includes('already been registered')) {
        return Response.json({ error: 'Este nome de usuario ja esta em uso' }, { status: 409 });
      }
      console.error('Admin createUser error:', createError);
      return Response.json({ error: 'Erro ao criar conta' }, { status: 500 });
    }

    if (!newUser.user) {
      return Response.json({ error: 'Erro ao criar conta' }, { status: 500 });
    }

    // The handle_new_user trigger creates the profile automatically.
    // Update it with username, age, grade.
    const { data: kidProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('auth_id', newUser.user.id)
      .single();

    if (kidProfile) {
      await admin
        .from('profiles')
        .update({ username: cleanUsername, age: kidAge ?? null, grade: kidGrade ?? null })
        .eq('id', kidProfile.id);

      // Link kid to parent
      await admin
        .from('parent_kid_links')
        .insert({ id: crypto.randomUUID(), parent_id: profile.id, kid_id: kidProfile.id });

      // Create user_stats
      await admin
        .from('user_stats')
        .insert({ user_id: kidProfile.id });
    }

    return Response.json({
      success: true,
      kid_id: kidProfile?.id,
      username: cleanUsername,
    });
  } catch (error) {
    console.error('Create kid error:', error);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}
