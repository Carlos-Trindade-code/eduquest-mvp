import { createRouteHandlerClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, userName, userEmail } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length < 5) {
      return Response.json(
        { error: 'Sugestao deve ter pelo menos 5 caracteres' },
        { status: 400 }
      );
    }

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
        { error: 'Erro ao salvar sugestao' },
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
