import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function rateLimit(
  request: NextRequest,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number }
): { success: boolean; remaining: number } {
  const ip = getClientIP(request);
  const url = new URL(request.url);
  const key = `${ip}:${url.pathname}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count };
}

export function rateLimitResponse() {
  return Response.json(
    { error: 'Muitas requisições. Aguarde um momento e tente novamente.' },
    { status: 429 }
  );
}
