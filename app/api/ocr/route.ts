import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return Response.json({ error: 'Nenhuma imagem enviada' }, { status: 400 });
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'API key nao configurada. Defina GEMINI_API_KEY no .env.local' },
        { status: 500 }
      );
    }

    // Convert to base64
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Determine media type
    const mimeType = imageFile.type || 'image/jpeg';

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Use Gemini Vision to extract text
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
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
    return Response.json(
      { error: 'Não consegui ler a imagem. Tente novamente.' },
      { status: 500 }
    );
  }
}
