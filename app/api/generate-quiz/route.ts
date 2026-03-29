import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { materialText, subject, ageGroup, questionCount = 5 } = await request.json();

    if (!materialText) {
      return Response.json({ error: 'Texto do material obrigatório' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'GEMINI_API_KEY não configurada' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const ageDesc: Record<string, string> = {
      '4-6': 'crianças de 4 a 6 anos (pré-escola, muito simples, divertido)',
      '7-9': 'crianças de 7 a 9 anos (ensino fundamental I)',
      '10-12': 'crianças de 10 a 12 anos (ensino fundamental II)',
      '13-15': 'adolescentes de 13 a 15 anos (ensino médio)',
      '16-18': 'jovens de 16 a 18 anos (ensino médio/vestibular)',
    };

    const prompt = `Você é um professor brasileiro criando um quiz educativo para ${ageDesc[ageGroup] || 'crianças'}.

MATERIAL DE ESTUDO:
${materialText.slice(0, 4000)}

INSTRUCOES:
1. Crie exatamente ${questionCount} perguntas de múltipla escolha baseadas no material acima.
2. Cada pergunta deve ter 4 alternativas (A, B, C, D).
3. As perguntas devem ser adequadas para a faixa etária.
4. Inclua uma explicação breve para cada resposta correta.
5. Matéria: ${subject || 'geral'}
6. Idioma: Português brasileiro

RETORNE APENAS um JSON válido neste formato (sem markdown, sem explicação extra):
{
  "questions": [
    {
      "question": "Texto da pergunta?",
      "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
      "correctIndex": 0,
      "explanation": "Explicação breve de por que A é a resposta correta."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = response.text || '';

    // Extract JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*"questions"[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: 'Falha ao gerar quiz. Tente novamente.' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return Response.json({ error: 'Formato de quiz inválido' }, { status: 500 });
    }

    return Response.json(parsed);
  } catch (error) {
    console.error('Generate quiz error:', error);
    return Response.json({ error: 'Erro ao gerar quiz' }, { status: 500 });
  }
}
