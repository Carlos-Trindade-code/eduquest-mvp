import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';

// GET /api/trial?fp=HASH — returns current trial count for fingerprint
export async function GET(request: NextRequest) {
  const rl = rateLimit(request, { maxRequests: 30, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const fp = request.nextUrl.searchParams.get('fp');
  if (!fp || fp.length < 8 || fp.length > 128) {
    return Response.json({ error: 'Invalid fingerprint' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient(request);
  const { data, error } = await supabase.rpc('get_guest_trial_count', {
    fingerprint_hash: fp,
  });

  if (error) {
    console.error('Trial GET error:', error);
    return Response.json({ count: 0 });
  }

  return Response.json({ count: data ?? 0 });
}

// POST /api/trial — increments trial count, returns new count
export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { maxRequests: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  let body: { fingerprint?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const fp = body.fingerprint;
  if (!fp || typeof fp !== 'string' || fp.length < 8 || fp.length > 128) {
    return Response.json({ error: 'Invalid fingerprint' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient(request);
  const { data, error } = await supabase.rpc('increment_guest_trial', {
    fingerprint_hash: fp,
  });

  if (error) {
    console.error('Trial POST error:', error);
    return Response.json({ count: -1, error: 'Server error' }, { status: 500 });
  }

  return Response.json({ count: data ?? 1 });
}
