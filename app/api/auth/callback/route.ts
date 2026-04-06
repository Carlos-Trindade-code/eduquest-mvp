import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { safeRedirectPath } from '@/lib/auth/constants';
import { sendWelcomeEmail } from '@/lib/email/resend';

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

      // Send welcome email on first login (fire-and-forget)
      if (user?.email && user?.created_at) {
        const createdAt = new Date(user.created_at).getTime();
        const isNewUser = Date.now() - createdAt < 60_000; // created less than 1 min ago
        if (isNewUser) {
          const name = user.user_metadata?.name || user.email.split('@')[0];
          sendWelcomeEmail(user.email, name).catch(() => {});
        }
      }

      const roleDefault = userType === 'parent' ? '/parent/dashboard' : '/tutor';
      const destination = safeRedirectPath(rawRedirect, roleDefault);
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
