import { GoogleGenAI } from '@google/genai';

// ============================================================
// AI Provider abstraction — supports Gemini (free) and Anthropic
// ============================================================

export type AIProvider = 'gemini' | 'anthropic';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GenerateOptions {
  systemPrompt: string;
  messages: ChatMessage[];
  maxTokens?: number;
}

function getProvider(): AIProvider {
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  throw new Error('Nenhuma API key configurada. Defina GEMINI_API_KEY ou ANTHROPIC_API_KEY no .env.local');
}

// ============================================================
// GEMINI
// ============================================================
async function generateWithGemini(options: GenerateOptions): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  // Convert all messages to Gemini Content format
  const contents = options.messages.map((m) => ({
    role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: m.content }],
  }));

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
    config: {
      systemInstruction: options.systemPrompt,
      maxOutputTokens: options.maxTokens || 1024,
      temperature: 0.7,
    },
    contents,
  });

  return response.text || 'Nao consegui responder. Tenta de novo!';
}

// ============================================================
// ANTHROPIC
// ============================================================
async function generateWithAnthropic(options: GenerateOptions): Promise<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: options.maxTokens || 1024,
    system: options.systemPrompt,
    messages: options.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock && 'text' in textBlock
    ? textBlock.text
    : 'Nao consegui responder. Tenta de novo!';
}

// ============================================================
// PUBLIC API
// ============================================================
export async function generateTutorResponse(options: GenerateOptions): Promise<string> {
  const provider = getProvider();

  switch (provider) {
    case 'gemini':
      return generateWithGemini(options);
    case 'anthropic':
      return generateWithAnthropic(options);
    default:
      throw new Error(`Provider desconhecido: ${provider}`);
  }
}

export function getCurrentProvider(): AIProvider {
  return getProvider();
}
