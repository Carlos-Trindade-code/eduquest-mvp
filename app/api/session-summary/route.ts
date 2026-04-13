import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { sessionSummarySchema } from '@/lib/api/schemas';
import { getModelForTier } from '@/lib/ai/tiers';

interface SessionSummary {
  topics_covered: string[];
  strengths: string[];
  difficulties: string[];
  ai_suggestion: string;
  parent_tip: string;
  estimated_accuracy: number | null;
  correct_concepts: number | null;
  struggled_concepts: number | null;
}

const FALLBACK_SUMMARY: SessionSummary = {
  topics_covered: ['Sessão de estudo realizada'],
  strengths: ['Dedicação ao estudo'],
  difficulties: [],
  ai_suggestion: 'Continue praticando! Cada sessão te deixa mais preparado.',
  parent_tip: 'Incentive seu filho a manter uma rotina regular de estudos.',
  estimated_accuracy: null,
  correct_concepts: null,
  struggled_concepts: null,
};

function buildAnalysisPrompt(
  subject: string,
  ageGroup: string,
  durationMinutes: number,
  xpEarned: number
): string {
  return `Você é um analista educacional especializado em crianças e adolescentes.
Analise a conversa abaixo entre um aluno (faixa etária: ${ageGroup}) e um tutor de ${subject}.
A sessão durou ${durationMinutes} minutos e o aluno ganhou ${xpEarned} XP.

Retorne APENAS um JSON válido (sem markdown, sem crases, sem explicação) com esta estrutura exata:
{
  "topics_covered": ["topico1", "topico2"],
  "strengths": ["ponto forte 1"],
  "difficulties": ["dificuldade 1"],
  "ai_suggestion": "sugestão encorajadora para o aluno",
  "parent_tip": "dica prática para os pais",
  "estimated_accuracy": 75,
  "correct_concepts": 3,
  "struggled_concepts": 1
}

Regras:
- topics_covered: tópicos específicos estudados (máximo 5)
- strengths: o que o aluno dominou bem (máximo 3)
- difficulties: onde o aluno teve dificuldade (máximo 3, pode ser array vazio se não houve)
- ai_suggestion: sugestão encorajadora de próximo passo para o aluno (máximo 2 frases)
- parent_tip: dica prática para os pais acompanharem (máximo 2 frases)
- estimated_accuracy: porcentagem estimada de acertos (0-100), baseada nas respostas do aluno
- correct_concepts: número de conceitos que o aluno demonstrou domínio
- struggled_concepts: número de conceitos em que o aluno teve dificuldade
- Tudo em português (pt-BR), linguagem simples e positiva
- RETORNE APENAS O JSON, nada mais`;
}

function parseJsonResponse(text: string): SessionSummary | null {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // ignore
  }

  // Try extracting from markdown code block
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch {
      // ignore
    }
  }

  // Try finding JSON object in the text
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      // ignore
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, { maxRequests: 10, windowMs: 60_000 });
    if (!rl.success) return rateLimitResponse();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'API key não configurada. Verifique o .env.local.' },
        { status: 500 }
      );
    }

    const parsed = sessionSummarySchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { messages, subject, ageGroup, durationMinutes, xpEarned } = parsed.data;

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = buildAnalysisPrompt(
      subject,
      ageGroup,
      durationMinutes,
      xpEarned
    );

    // Format conversation as a single user message for analysis
    const conversationText = messages
      .map((m) => `${m.role === 'user' ? 'Aluno' : 'Tutor'}: ${m.content}`)
      .join('\n');

    const response = await ai.models.generateContent({
      model: getModelForTier(),
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 1024,
        temperature: 0.3,
      },
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: conversationText }],
        },
      ],
    });

    const responseText = response.text || '';
    const summary = parseJsonResponse(responseText);

    if (!summary) {
      console.error(
        'Failed to parse session summary JSON:',
        responseText.substring(0, 500)
      );
      return Response.json({ summary: FALLBACK_SUMMARY });
    }

    return Response.json({ summary });
  } catch (error) {
    console.error('Session summary API error:', error);

    return Response.json({ summary: FALLBACK_SUMMARY });
  }
}
