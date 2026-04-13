import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import mammoth from 'mammoth';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { getModelForTier } from '@/lib/ai/tiers';

const DOCX_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
];

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, { maxRequests: 10, windowMs: 60_000 });
    if (!rl.success) return rateLimitResponse();

    const supabase = createRouteHandlerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    // Auth is optional — guests can use OCR during trial

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return Response.json(
        { error: 'Nenhuma imagem enviada. Envie uma foto para extrair o texto.' },
        { status: 400 }
      );
    }

    const imageFile = formData.get('image') as File;

    if (!imageFile || imageFile.size === 0) {
      return Response.json(
        { error: 'Nenhuma imagem enviada. Envie uma foto para extrair o texto.' },
        { status: 400 }
      );
    }

    const mimeType = imageFile.type || 'application/octet-stream';

    // ---- DOCX / DOC: extract text with mammoth ----
    if (DOCX_TYPES.includes(mimeType) || imageFile.name?.endsWith('.docx') || imageFile.name?.endsWith('.doc')) {
      try {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value?.trim();
        if (text) {
          return Response.json({ text });
        }
        return Response.json(
          { error: 'O documento parece estar vazio ou não foi possível ler o conteúdo. Tente outro arquivo.' },
          { status: 400 }
        );
      } catch {
        return Response.json(
          { error: 'Não consegui ler o documento Word. Verifique se o arquivo não está corrompido ou tente outro formato.' },
          { status: 400 }
        );
      }
    }

    // ---- Validate image/PDF format ----
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return Response.json(
        { error: `Formato de arquivo não suportado (${mimeType}). Envie uma imagem (JPG, PNG, GIF, WebP) ou PDF.` },
        { status: 400 }
      );
    }

    // ---- Images & PDF: use Gemini Vision ----
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return Response.json(
        { error: 'Serviço de leitura de imagem temporariamente indisponível. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    // Convert to base64
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    if (!base64) {
      return Response.json(
        { error: 'Não foi possível processar a imagem. O arquivo pode estar vazio ou corrompido.' },
        { status: 400 }
      );
    }

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Use Gemini Vision to extract text
    const response = await ai.models.generateContent({
      model: getModelForTier(),
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
            {
              text: `Extraia o texto deste exercício escolar brasileiro.

REGRAS:
1. Extraia APENAS o texto do exercício/dever de casa.
2. Mantenha a formatação original (numeração, letras de alternativas, etc).
3. Se houver equações matemáticas, escreva-as de forma legível.
4. Se a imagem estiver borrada ou ilegível, diga o que conseguiu ler e indique o que ficou ilegível.
5. NÃO responda o exercício — apenas extraia o texto.
6. Se não for um exercício escolar, descreva brevemente o que vê na imagem.

Retorne APENAS o texto extraído, sem explicações adicionais.`,
            },
          ],
        },
      ],
    });

    const text = response.text || '';

    return Response.json({ text });
  } catch (error) {
    console.error('OCR error:', error);
    Sentry.captureException(error);
    return Response.json(
      { error: 'Ocorreu um erro no servidor ao processar a imagem. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
