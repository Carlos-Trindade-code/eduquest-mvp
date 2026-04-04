'use client';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { redeemInviteCode } from '@/lib/supabase/queries';
import { safeRedirectPath } from '@/lib/auth/constants';

function RegisterContent() {
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get('redirect'), '');

  const handleRegister = async (data: {
    email: string;
    password: string;
    name: string;
    userType: 'parent' | 'kid' | 'teacher' | 'admin';
    age?: number;
    grade?: string;
    inviteCode?: string;
  }) => {
    // Reject 'admin' as user_type — admin is assigned internally, not via registration
    if (data.userType !== 'parent' && data.userType !== 'kid' && data.userType !== 'teacher') {
      throw new Error('Tipo de usuário inválido');
    }

    const { error } = await signUp(data.email, data.password, data.name, data.userType);
    if (error) throw new Error(error);

    // Auto-login after registration (works when email confirmation is disabled)
    const { error: signInError } = await signIn(data.email, data.password);
    if (signInError) {
      window.location.href = '/login?msg=account_created';
      return;
    }

    // If kid provided an invite code, try to redeem it
    let inviteCodeFailed = false;
    if (data.userType === 'kid' && data.inviteCode) {
      try {
        const supabase = createClient();
        await redeemInviteCode(supabase, data.inviteCode);
      } catch {
        inviteCodeFailed = true;
      }
    }

    // If there's a redirect param (e.g., guest came from /tutor), go there directly
    if (redirect) {
      window.location.href = redirect;
      return;
    }

    // Teachers go directly to their dashboard, others to onboarding
    const base = data.userType === 'teacher' ? '/professor' : '/onboarding';
    window.location.href = inviteCodeFailed ? `${base}?invite_error=1` : base;
  };

  const handleGoogleRegister = async () => {
    await signInWithGoogle();
  };

  return (
    <RegisterForm
      onRegister={handleRegister}
      onGoogleRegister={handleGoogleRegister}
    />
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen theme-light flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 animate-pulse" />
              <div className="h-7 w-56 bg-white/10 rounded-lg mx-auto mb-2 animate-pulse" />
              <div className="h-4 w-72 bg-white/5 rounded mx-auto animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
                <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
                <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
              </div>
              <div className="h-12 bg-purple-500/20 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
