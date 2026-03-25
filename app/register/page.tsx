'use client';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { redeemInviteCode } from '@/lib/supabase/queries';

function RegisterContent() {
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleRegister = async (data: {
    email: string;
    password: string;
    name: string;
    userType: 'parent' | 'kid' | 'teacher' | 'admin';
    age?: number;
    grade?: string;
    inviteCode?: string;
  }) => {
    const { error } = await signUp(data.email, data.password, data.name, data.userType);
    if (error) throw new Error(error);

    // Auto-login after registration (works when email confirmation is disabled)
    const { error: signInError } = await signIn(data.email, data.password);
    if (signInError) {
      window.location.href = '/login';
      return;
    }

    // If kid provided an invite code, try to redeem it
    if (data.userType === 'kid' && data.inviteCode) {
      try {
        const supabase = createClient();
        await redeemInviteCode(supabase, data.inviteCode);
      } catch {
        console.warn('Failed to redeem invite code, continuing without link');
      }
    }

    // Teachers go directly to their dashboard, others to onboarding
    window.location.href = data.userType === 'teacher' ? '/professor' : '/onboarding';
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
        <div className="min-h-screen bg-gradient-app flex items-center justify-center">
          <div className="text-white animate-pulse">Carregando...</div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
