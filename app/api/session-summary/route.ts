import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface SessionSummaryRequest {
  messages: { role: string; content: string }[];
  subject: string;
  ageGroup: string;
  durationMinutes: number;
  xpEarned: number;
}

interface SessionSummary {
  topics_covered: string[];
  strengths: string[];
  difficulties: string[];
  ai_suggestion: string;
  parent_tip: string;
}

const FALLBACK_SUMMARY: SessionSummary = {
  topics_covered: ['Sessao de estudo realizada'],
  strengths: ['Dedicacao ao estudo'],
  difficulties: [],
  ai_suggestion: 'Continue praticando! Cada sessao te deixa mais preparado.',
  parent_tip: 'Incentive seu filho a manter uma rotina regular de estudos.',
};

function buildAnalysisPrompt(
  subject: string,
  ageGroup: string,
  durationMinutes: number,
  xpEarned: number
): string {
  return `Voce e um analista educacional especializado em criancas e adolescentes.
Analise a conversa abaixo entre um aluno (faixa etaria: ${ageGroup}) e um tutor de ${subject}.
A sessao durou ${durationMinutes} minutos e o aluno ganhou ${xpEarned} XP.

Retorne APENAS um JSON valido (sem markdown, sem crases, sem explicacao) com esta estrutura exata:
{
  "topics_covered": ["topico1", "topico2"],
  "strengths": ["ponto forte 1"],
  "difficulties": ["dificuldade 1"],
  "ai_suggestion": "sugestao encorajadora para o aluno",
  "parent_tip": "dica pratica para os pais"
}

Regras:
- topics_covered: topicos especificos estudados (maximo 5)
- strengths: o que o aluno dominou bem (maximo 3)
- difficulties: onde o aluno teve dificuldade (maximo 3, pode ser array vazio se nao houve)
- ai_suggestion: sugestao encorajadora de proximo passo para o aluno (maximo 2 frases)
- parent_tip: dica pratica para os pais acompanharem (maximo 2 frases)
- Tudo em portugues (pt-BR), linguagem simples e positiva
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'API key nao configurada. Verifique o .env.local.' },
        { status: 500 }
      );
    }

    const body: SessionSummaryRequest = await request.json();
    const { messages, subject, ageGroup, durationMinutes, xpEarned } = body;

    if (!messages || messages.length === 0) {
      return Response.json(
        { error: 'Nenhuma mensagem fornecida para analise.' },
        { status: 400 }
      );
    }

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
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
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
