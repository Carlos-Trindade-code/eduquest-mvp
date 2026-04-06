import { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { buildSystemPrompt } from '@/lib/subjects/prompts';
import { generateTutorResponse, streamTutorResponse, getCurrentProvider, RateLimitError } from '@/lib/ai/provider';
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
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Corpo da requisição inválido. Envie um JSON válido.' }, { status: 400 });
    }
    const parsed = tutorSchema.safeParse(body);
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

    const provider = getCurrentProvider();
    const streamRequested = request.headers.get('accept') === 'text/event-stream';

    if (streamRequested && provider === 'gemini') {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let fullText = '';
            for await (const chunk of streamTutorResponse({ systemPrompt, messages, maxTokens: 1024 })) {
              fullText += chunk;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, fullText })}\n\n`));
            controller.close();
          } catch (err) {
            const msg = err instanceof RateLimitError
              ? 'O Edu está descansando um pouquinho. Tente de novo em 1 minuto! ⏳'
              : 'Erro no tutor. Tente novamente.';
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Non-streaming fallback
    const message = await generateTutorResponse({
      systemPrompt,
      messages,
      maxTokens: 1024,
    });

    return Response.json({ message, provider });
  } catch (error) {
    console.error('Tutor API error:', error);
    if (!(error instanceof RateLimitError)) {
      Sentry.captureException(error);
    }

    if (error instanceof RateLimitError) {
      return Response.json(
        { error: 'O Edu está descansando um pouquinho. Tente de novo em 1 minuto! ⏳' },
        { status: 429 }
      );
    }

    const errorMessage =
      error instanceof Error && error.message.includes('API key')
        ? 'API key não configurada. Verifique o .env.local.'
        : 'Erro no tutor. Tente novamente.';

    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
