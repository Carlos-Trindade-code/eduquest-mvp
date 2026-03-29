import { NextRequest } from 'next/server';
import { buildSystemPrompt } from '@/lib/subjects/prompts';
import { generateTutorResponse, getCurrentProvider } from '@/lib/ai/provider';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { tutorSchema } from '@/lib/api/schemas';

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, { maxRequests: 20, windowMs: 60_000 });
    if (!rl.success) return rateLimitResponse();

    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    // Auth is optional — guests can use the trial (limited client-side)
    const parsed = tutorSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const {
      messages,
      homework,
      subject,
      ageGroup,
      behavioralProfile,
      studentName,
      age,
      grade,
      knownDifficulties,
      errorPatterns,
    } = parsed.data;

    // Build the full evolutionary system prompt
    const systemPrompt = buildSystemPrompt({
      studentName,
      age,
      ageGroup,
      grade,
      subject,
      behavioralProfile,
      knownDifficulties,
      errorPatterns,
      homework,
    });

    const message = await generateTutorResponse({
      systemPrompt,
      messages,
      maxTokens: 1024,
    });

    const provider = getCurrentProvider();

    return Response.json({ message, provider });
  } catch (error) {
    console.error('Tutor API error:', error);

    const errorMessage =
      error instanceof Error && error.message.includes('API key')
        ? 'API key não configurada. Verifique o .env.local.'
        : 'Erro no tutor. Tente novamente.';

    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
