import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { z } from 'zod';

const schema = z.object({
  materialText: z.string().min(1).max(15000),
  subject: z.string().max(50).optional(),
  ageGroup: z.enum(['4-6', '7-9', '10-12', '13-15', '16-18']).default('10-12'),
});

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, { maxRequests: 5, windowMs: 60_000 });
    if (!rl.success) return rateLimitResponse();

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { materialText, subject, ageGroup } = parsed.data;

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'GEMINI_API_KEY não configurada' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const ageDesc: Record<string, string> = {
      '4-6': 'crianças de 4 a 6 anos (muito simples, visual, divertido)',
      '7-9': 'crianças de 7 a 9 anos (fundamental I, claro e objetivo)',
      '10-12': 'crianças de 10 a 12 anos (fundamental II)',
      '13-15': 'adolescentes de 13 a 15 anos',
      '16-18': 'jovens de 16 a 18 anos (nível vestibular)',
    };

    const prompt = `Você é um professor brasileiro criando um resumo de estudo para ${ageDesc[ageGroup] || 'crianças'}.

MATERIAL ORIGINAL:
${materialText.slice(0, 8000)}

INSTRUÇÕES:
1. Crie um resumo estruturado e didático do material acima.
2. Adapte a linguagem para a faixa etária.
3. Matéria: ${subject || 'geral'}
4. Idioma: Português brasileiro

RETORNE APENAS um JSON válido neste formato (sem markdown, sem explicação extra):
{
  "title": "Título do resumo",
  "sections": [
    {
      "heading": "Nome do tópico",
      "content": "Explicação clara e didática do tópico",
      "keyPoints": ["Ponto-chave 1", "Ponto-chave 2"]
    }
  ],
  "keyTerms": [
    { "term": "Termo importante", "definition": "Definição simples" }
  ],
  "tipToRemember": "Uma dica ou mnemônico para lembrar o conteúdo"
}`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\{[\s\S]*"sections"[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: 'Falha ao gerar resumo. Tente novamente.' }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    if (!result.sections || !Array.isArray(result.sections)) {
      return Response.json({ error: 'Formato inválido' }, { status: 500 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Generate summary error:', error);
    return Response.json({ error: 'Erro ao gerar resumo' }, { status: 500 });
  }
}
