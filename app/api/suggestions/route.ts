import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { suggestionsSchema } from '@/lib/api/schemas';

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, { maxRequests: 5, windowMs: 60_000 });
    if (!rl.success) return rateLimitResponse();

    const parsed = suggestionsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { content, userName, userEmail } = parsed.data;

    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('suggestions')
      .insert({
        user_id: user?.id || null,
        user_name: userName || null,
        user_email: userEmail || null,
        content: content.trim(),
      });

    if (error) {
      console.error('Suggestion insert error:', error);
      return Response.json(
        { error: 'Erro ao salvar sugestão' },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Suggestion error:', error);
    return Response.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}
