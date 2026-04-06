import { NextRequest } from 'next/server';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  // Google Cloud TTS — only active when GOOGLE_TTS_API_KEY is set
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'TTS não configurado. Use o navegador.' },
      { status: 501 }
    );
  }

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text || text.length > 3000) {
    return Response.json({ error: 'Texto inválido (max 3000 chars)' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'pt-BR',
            name: 'pt-BR-Wavenet-A', // Female, natural voice
            ssmlGender: 'FEMALE',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.95,
            pitch: 1.0,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('Google TTS error:', err);
      return Response.json({ error: 'Erro no TTS' }, { status: 502 });
    }

    const data = await res.json();
    const audioBuffer = Buffer.from(data.audioContent, 'base64');

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.length),
        'Cache-Control': 'public, max-age=86400', // Cache 24h
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return Response.json({ error: 'Erro no TTS' }, { status: 500 });
  }
}
