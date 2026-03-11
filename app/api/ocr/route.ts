import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return Response.json({ error: 'Nenhuma imagem enviada' }, { status: 400 });
    }

    // Convert to base64
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Determine media type
    const mimeType = imageFile.type || 'image/jpeg';
    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ] as const;
    const mediaType = supportedTypes.includes(mimeType as typeof supportedTypes[number])
      ? (mimeType as typeof supportedTypes[number])
      : 'image/jpeg';

    // Use Claude Vision to extract text
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
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

    const textBlock = response.content.find((block) => block.type === 'text');
    const text = textBlock && 'text' in textBlock ? textBlock.text : '';

    return Response.json({ text });
  } catch (error) {
    console.error('OCR error:', error);
    return Response.json(
      { error: 'Não consegui ler a imagem. Tente novamente.' },
      { status: 500 }
    );
  }
}
