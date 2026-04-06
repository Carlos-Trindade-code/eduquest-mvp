import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { z } from 'zod';

const schema = z.object({
  materialText: z.string().min(1).max(15000),
  subject: z.string().max(50).optional(),
  ageGroup: z.enum(['4-6', '7-9', '10-12', '13-15', '16-18']).default('10-12'),
  exerciseCount: z.number().int().min(1).max(10).default(5),
});

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, { maxRequests: 5, windowMs: 60_000 });
    if (!rl.success) return rateLimitResponse();

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { materialText, subject, ageGroup, exerciseCount } = parsed.data;

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'GEMINI_API_KEY não configurada' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const ageDesc: Record<string, string> = {
      '4-6': 'crianças de 4 a 6 anos (muito simples, lúdico)',
      '7-9': 'crianças de 7 a 9 anos (fundamental I)',
      '10-12': 'crianças de 10 a 12 anos (fundamental II)',
      '13-15': 'adolescentes de 13 a 15 anos',
      '16-18': 'jovens de 16 a 18 anos (nível vestibular)',
    };

    const prompt = `Você é um professor brasileiro criando exercícios práticos para ${ageDesc[ageGroup] || 'crianças'}.

MATERIAL DE ESTUDO:
${materialText.slice(0, 8000)}

INSTRUÇÕES:
1. Crie exatamente ${exerciseCount} exercícios práticos baseados no material.
2. Varie os tipos: completar lacunas, verdadeiro/falso, resposta curta, associação, cálculos.
3. Ordene do mais fácil ao mais difícil.
4. Cada exercício deve ter resposta e explicação.
5. Matéria: ${subject || 'geral'}
6. Idioma: Português brasileiro

RETORNE APENAS um JSON válido neste formato (sem markdown, sem explicação extra):
{
  "exercises": [
    {
      "number": 1,
      "type": "fill_blank" | "true_false" | "short_answer" | "matching" | "calculation",
      "question": "Texto do exercício",
      "hint": "Dica opcional para ajudar",
      "answer": "Resposta correta",
      "explanation": "Explicação de como resolver"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*"exercises"[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: 'Falha ao gerar exercícios. Tente novamente.' }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    if (!result.exercises || !Array.isArray(result.exercises)) {
      return Response.json({ error: 'Formato inválido' }, { status: 500 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Generate exercises error:', error);
    return Response.json({ error: 'Erro ao gerar exercícios' }, { status: 500 });
  }
}
