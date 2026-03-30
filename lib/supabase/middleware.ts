import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_EMAILS } from '@/lib/auth/constants';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const userType = user?.user_metadata?.user_type as string | undefined;

  // --- Admin route: only accessible by specific email ---
  if (pathname.startsWith('/admin')) {
    if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // --- Protected routes: redirect to login if not authenticated ---
  // Note: /tutor and /quiz are open for free trial (guest can try before registering)
  const protectedPaths = ['/dashboard', '/parent', '/professor', '/onboarding'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // --- Role enforcement: prevent cross-role access ---
  if (user && userType) {
    // Parents CAN access /tutor to preview — no redirect
    // Kids cannot access parent-only pages
    if (pathname.startsWith('/parent') && userType === 'kid') {
      const url = request.nextUrl.clone();
      url.pathname = '/tutor';
      return NextResponse.redirect(url);
    }
    // Teachers cannot access kid/parent pages; kids/parents cannot access teacher pages
    if (pathname.startsWith('/professor') && userType !== 'teacher') {
      const url = request.nextUrl.clone();
      url.pathname = userType === 'parent' ? '/parent/dashboard' : '/tutor';
      return NextResponse.redirect(url);
    }
  }

  // --- Auth pages: redirect already-authenticated users by role ---
  const authPaths = ['/login', '/register'];
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = userType === 'teacher' ? '/professor' : userType === 'parent' ? '/parent/dashboard' : '/tutor';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
