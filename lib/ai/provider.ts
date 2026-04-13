import { GoogleGenAI } from '@google/genai';
import { getModelForTier, type PlanTier } from './tiers';

// ============================================================
// AI Provider abstraction — supports Gemini (free) and Anthropic
// ============================================================

export type AIProvider = 'gemini' | 'anthropic';

// Model fallback chain: if primary model hits rate limit, try next
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GenerateOptions {
  systemPrompt: string;
  messages: ChatMessage[];
  maxTokens?: number;
  planTier?: PlanTier;
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

function getProvider(): AIProvider {
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  throw new Error('Nenhuma API key configurada. Defina GEMINI_API_KEY ou ANTHROPIC_API_KEY no .env.local');
}

function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || GEMINI_MODELS[0];
}

function getModelFallbackChain(): string[] {
  const primary = getGeminiModel();
  // Put the configured model first, then add fallbacks
  const chain = [primary];
  for (const m of GEMINI_MODELS) {
    if (!chain.includes(m)) chain.push(m);
  }
  return chain;
}

function isRateLimitError(err: unknown): boolean {
  if (err instanceof Error) {
    return err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('quota');
  }
  return false;
}

// ============================================================
// GEMINI
// ============================================================

// Gemini requires the first message to be 'user', not 'model'.
// The greeting message added by initSession is 'assistant' (UI-only)
// and must be stripped before sending to the API.
function sanitizeMessagesForGemini(messages: ChatMessage[]) {
  // Drop leading assistant messages so first message is always 'user'
  let start = 0;
  while (start < messages.length && messages[start].role === 'assistant') {
    start++;
  }
  return messages.slice(start).map((m) => ({
    role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: m.content }],
  }));
}

async function generateWithGeminiModel(ai: GoogleGenAI, model: string, options: GenerateOptions): Promise<string> {
  const contents = sanitizeMessagesForGemini(options.messages);
  const effectiveModel = options.planTier ? getModelForTier(options.planTier) : model;

  const response = await ai.models.generateContent({
    model: effectiveModel,
    config: {
      systemInstruction: options.systemPrompt,
      maxOutputTokens: options.maxTokens || 1024,
      temperature: 0.7,
    },
    contents,
  });

  return response.text || 'Não consegui responder. Tenta de novo!';
}

async function generateWithGemini(options: GenerateOptions): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const models = getModelFallbackChain();

  for (let i = 0; i < models.length; i++) {
    try {
      return await generateWithGeminiModel(ai, models[i], options);
    } catch (err) {
      if (isRateLimitError(err) && i < models.length - 1) {
        console.warn(`[AI] ${models[i]} rate limited, trying ${models[i + 1]}...`);
        continue;
      }
      throw err;
    }
  }

  throw new RateLimitError('Todos os modelos estão com limite excedido. Tente novamente em alguns minutos.');
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
    : 'Não consegui responder. Tenta de novo!';
}

// ============================================================
// GEMINI STREAMING
// ============================================================
async function* streamWithGeminiModel(ai: GoogleGenAI, model: string, options: GenerateOptions): AsyncGenerator<string> {
  const contents = sanitizeMessagesForGemini(options.messages);

  const response = await ai.models.generateContentStream({
    model,
    config: {
      systemInstruction: options.systemPrompt,
      maxOutputTokens: options.maxTokens || 1024,
      temperature: 0.7,
    },
    contents,
  });

  for await (const chunk of response) {
    const text = chunk.text;
    if (text) yield text;
  }
}

async function* streamWithGemini(options: GenerateOptions): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const models = getModelFallbackChain();

  for (let i = 0; i < models.length; i++) {
    try {
      yield* streamWithGeminiModel(ai, models[i], options);
      return;
    } catch (err) {
      if (isRateLimitError(err) && i < models.length - 1) {
        console.warn(`[AI] ${models[i]} rate limited (stream), trying ${models[i + 1]}...`);
        continue;
      }
      throw err;
    }
  }

  throw new RateLimitError('Todos os modelos estão com limite excedido. Tente novamente em alguns minutos.');
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

export async function* streamTutorResponse(options: GenerateOptions): AsyncGenerator<string> {
  const provider = getProvider();

  switch (provider) {
    case 'gemini':
      yield* streamWithGemini(options);
      break;
    default:
      // Fallback: yield full response at once
      yield await generateTutorResponse(options);
  }
}

export function getCurrentProvider(): AIProvider {
  return getProvider();
}
