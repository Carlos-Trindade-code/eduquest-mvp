import { generateTutorResponse } from '@/lib/ai/provider';
import { NextRequest } from 'next/server';

const FAQ_SYSTEM_PROMPT = `Voce e o assistente do Studdo (antes EduQuest), uma plataforma educacional com tutor IA para criancas de 4 a 18 anos.

Responda duvidas sobre a plataforma de forma curta, clara e amigavel. Informacoes sobre o Studdo:

- Tutor IA usa metodo socratico (guia o aluno a descobrir a resposta, sem dar pronta)
- 7 materias: Matematica, Portugues, Historia, Ciencias, Geografia, Ingles, Outro
- 5 faixas etarias: 4-6, 7-9, 10-12, 13-15, 16-18 anos
- Gamificacao: XP, niveis, streaks, badges/conquistas
- Pais acompanham progresso pelo dashboard
- Sistema de convite: pai recebe codigo EQ-XXXX, filho usa ao se cadastrar
- Upload de foto do dever com OCR (leitura automatica)
- Timer Pomodoro para estudo focado
- Gratis na fase beta

Se a pergunta nao for sobre o Studdo, responda educadamente que voce so pode ajudar com duvidas sobre a plataforma.

Responda em portugues do Brasil. Maximo 3 frases.`;

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return Response.json({ error: 'Pergunta invalida' }, { status: 400 });
    }

    const answer = await generateTutorResponse({
      systemPrompt: FAQ_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: question }],
      maxTokens: 256,
    });

    return Response.json({ answer });
  } catch (error) {
    console.error('FAQ error:', error);
    return Response.json(
      { error: 'Nao consegui responder. Tente novamente.' },
      { status: 500 }
    );
  }
}
