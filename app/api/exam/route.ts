import { NextRequest, NextResponse } from 'next/server';
import { generateTutorResponse } from '@/lib/ai/provider';
import type { AgeGroup } from '@/lib/auth/types';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { examSchema } from '@/lib/api/schemas';

function getAgeLabel(ageGroup: AgeGroup): string {
  const labels: Record<AgeGroup, string> = {
    '4-6': 'pré-escola (4-6 anos)',
    '7-9': '1º ao 3º ano (7-9 anos)',
    '10-12': '4º ao 6º ano (10-12 anos)',
    '13-15': '7º ao 9º ano (13-15 anos)',
    '16-18': 'ensino médio (16-18 anos)',
  };
  return labels[ageGroup];
}

function getSubjectName(id: string): string {
  const names: Record<string, string> = {
    math: 'Matemática',
    portuguese: 'Português',
    history: 'História',
    science: 'Ciências',
    geography: 'Geografia',
    english: 'Inglês',
    other: 'Geral',
  };
  return names[id] || id;
}

function buildExamPrompt(req: { topic: string; subject: string; ageGroup: AgeGroup; questionCount: number; fileContent?: string }): string {
  const ageLabel = getAgeLabel(req.ageGroup);
  const subjectName = getSubjectName(req.subject);

  return `Você é um professor especialista em criar provas escolares para crianças e adolescentes brasileiros.

TAREFA: Gerar uma prova de ${subjectName} sobre "${req.topic}" para aluno de ${ageLabel}.

${req.fileContent ? `CONTEÚDO DE REFERÊNCIA (material enviado pelo aluno):\n---\n${req.fileContent}\n---\nUse este material como base para as questões. As questões devem cobrir os tópicos presentes no material.` : ''}

REGRAS:
- Gere exatamente ${req.questionCount} questões
- Nível de dificuldade ADEQUADO para ${ageLabel}
- Para 4-6 anos: perguntas muito simples, com figuras descritas, múltipla escolha com 3 alternativas (A, B, C)
- Para 7-9 anos: perguntas simples, múltipla escolha com 4 alternativas (A, B, C, D)
- Para 10-12 anos: mix de múltipla escolha (4 alternativas) e 1-2 dissertativas curtas
- Para 13-15 anos: mix equilibrado de múltipla escolha (5 alternativas A-E) e dissertativas
- Para 16-18 anos: questões elaboradas, estilo vestibular/ENEM, com texto-base quando apropriado

FORMATO DE RESPOSTA — JSON VÁLIDO (sem markdown, sem \`\`\`):
{
  "title": "Título da prova",
  "subject": "${subjectName}",
  "ageGroup": "${req.ageGroup}",
  "instructions": "Instruções para o aluno (adequadas à idade)",
  "questions": [
    {
      "number": 1,
      "type": "multiple_choice" ou "essay",
      "text": "Enunciado da questão (pode incluir texto-base)",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."] ou null para dissertativas,
      "correctAnswer": "A" ou "Resposta esperada para dissertativa",
      "explanation": "Explicação DIDÁTICA da resposta, adequada para a faixa etária. Para crianças menores, use linguagem simples e encorajadora. Para maiores, seja mais técnico."
    }
  ]
}

IMPORTANTE:
- Responda APENAS com o JSON, sem texto antes ou depois
- As explicações do gabarito devem ser pedagógicas e encorajadoras
- Use linguagem adequada à idade em TODO o conteúdo
- Questões devem ser variadas em dificuldade (fácil, média, difícil)
- Para múltipla escolha, as alternativas devem ser plausíveis (distratores reais)`;
}

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, { maxRequests: 5, windowMs: 60_000 });
    if (!rl.success) return rateLimitResponse();

    const parsed = examSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const examInput = { ...parsed.data };

    if (!examInput.topic && !examInput.fileContent) {
      examInput.topic = getSubjectName(examInput.subject);
    }

    const systemPrompt = buildExamPrompt(examInput);

    const userMessage = examInput.fileContent
      ? `Gere a prova baseada no tema "${examInput.topic || 'conteúdo do material'}" usando o material de referência fornecido.`
      : `Gere a prova sobre o tema: "${examInput.topic}"`;

    const response = await generateTutorResponse({
      systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      maxTokens: 4096,
    });

    // Parse JSON response — try to extract JSON if wrapped in markdown
    let examResult;
    try {
      examResult = JSON.parse(response);
    } catch {
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        examResult = JSON.parse(jsonMatch[1].trim());
      } else {
        const objectMatch = response.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          examResult = JSON.parse(objectMatch[0]);
        } else {
          throw new Error('Resposta da IA não é JSON válido');
        }
      }
    }

    return NextResponse.json({ exam: examResult });
  } catch (error) {
    console.error('Exam generation error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar prova. Tente novamente.' },
      { status: 500 }
    );
  }
}
