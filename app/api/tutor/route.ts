import { NextRequest } from 'next/server';
import { buildSystemPrompt } from '@/lib/subjects/prompts';
import { generateTutorResponse, getCurrentProvider } from '@/lib/ai/provider';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import type { AgeGroup, BehavioralProfile } from '@/lib/auth/types';

interface TutorRequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
  homework: string;
  subject?: string;
  ageGroup?: AgeGroup;
  behavioralProfile?: BehavioralProfile;
  studentName?: string;
  age?: number;
  grade?: string;
  knownDifficulties?: string[];
  errorPatterns?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const body: TutorRequestBody = await request.json();
    const {
      messages,
      homework,
      subject = 'other',
      ageGroup = '10-12',
      behavioralProfile = 'default',
      studentName,
      age,
      grade,
      knownDifficulties,
      errorPatterns,
    } = body;

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
        ? 'API key nao configurada. Verifique o .env.local.'
        : 'Erro no tutor. Tente novamente.';

    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
