import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';

function fakeRequest(ip = '1.2.3.4', path = '/api/test'): NextRequest {
  const headers = new Headers({ 'x-forwarded-for': ip });
  return {
    headers,
    url: `http://localhost${path}`,
  } as unknown as NextRequest;
}

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests up to maxRequests', () => {
    const req = fakeRequest('10.0.0.1', '/api/alpha');
    const r1 = rateLimit(req, { maxRequests: 3, windowMs: 60_000 });
    const r2 = rateLimit(req, { maxRequests: 3, windowMs: 60_000 });
    const r3 = rateLimit(req, { maxRequests: 3, windowMs: 60_000 });
    expect([r1, r2, r3].every((r) => r.success)).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('denies once the limit is reached', () => {
    const req = fakeRequest('10.0.0.2', '/api/beta');
    for (let i = 0; i < 2; i++) rateLimit(req, { maxRequests: 2, windowMs: 60_000 });
    const denied = rateLimit(req, { maxRequests: 2, windowMs: 60_000 });
    expect(denied.success).toBe(false);
    expect(denied.remaining).toBe(0);
  });

  it('isolates counts per IP', () => {
    const a = fakeRequest('10.0.0.3', '/api/c');
    const b = fakeRequest('10.0.0.4', '/api/c');
    rateLimit(a, { maxRequests: 1, windowMs: 60_000 });
    const bFirst = rateLimit(b, { maxRequests: 1, windowMs: 60_000 });
    expect(bFirst.success).toBe(true);
  });

  it('isolates counts per path', () => {
    const a = fakeRequest('10.0.0.5', '/api/x');
    const b = fakeRequest('10.0.0.5', '/api/y');
    rateLimit(a, { maxRequests: 1, windowMs: 60_000 });
    const bFirst = rateLimit(b, { maxRequests: 1, windowMs: 60_000 });
    expect(bFirst.success).toBe(true);
  });

  it('resets after the window expires', () => {
    const req = fakeRequest('10.0.0.6', '/api/d');
    rateLimit(req, { maxRequests: 1, windowMs: 1000 });
    const denied = rateLimit(req, { maxRequests: 1, windowMs: 1000 });
    expect(denied.success).toBe(false);

    vi.advanceTimersByTime(1500);
    const reopened = rateLimit(req, { maxRequests: 1, windowMs: 1000 });
    expect(reopened.success).toBe(true);
  });
});

describe('rateLimitResponse', () => {
  it('returns a 429 JSON response', async () => {
    const res = rateLimitResponse();
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/muitas requisi/i);
  });
});
