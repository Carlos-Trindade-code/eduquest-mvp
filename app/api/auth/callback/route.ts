import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getOrigin(request: Request): string {
  const headers = new Headers(request.headers);
  const forwardedHost = headers.get('x-forwarded-host');
  const host = forwardedHost || headers.get('host');
  const protocol = headers.get('x-forwarded-proto') || 'https';

  if (host) {
    return `${protocol}://${host}`;
  }

  // Fallback to request URL origin
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getOrigin(request);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect');

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If explicit redirect provided, use it
      if (redirect) {
        return NextResponse.redirect(`${origin}${redirect}`);
      }

      // Otherwise, route by role
      const { data: { user } } = await supabase.auth.getUser();
      const userType = user?.user_metadata?.user_type;
      const destination = userType === 'parent' ? '/parent/dashboard' : '/tutor';
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Something went wrong — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
