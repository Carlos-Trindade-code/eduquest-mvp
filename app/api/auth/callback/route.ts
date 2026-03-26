import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { safeRedirectPath } from '@/lib/auth/constants';

function getOrigin(request: Request): string {
  const headers = new Headers(request.headers);
  const forwardedHost = headers.get('x-forwarded-host');
  const host = forwardedHost || headers.get('host');
  const protocol = headers.get('x-forwarded-proto') || 'https';

  if (host) {
    return `${protocol}://${host}`;
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getOrigin(request);
  const code = searchParams.get('code');
  const rawRedirect = searchParams.get('redirect');

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Route by role (safe default), allow override only with validated path
      const { data: { user } } = await supabase.auth.getUser();
      const userType = user?.user_metadata?.user_type;
      const roleDefault = userType === 'parent' ? '/parent/dashboard' : '/tutor';
      const destination = safeRedirectPath(rawRedirect, roleDefault);
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
