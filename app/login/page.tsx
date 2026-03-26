'use client';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { safeRedirectPath } from '@/lib/auth/constants';

function LoginContent() {
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get('redirect'), '/tutor');
  const authError = searchParams.get('error');

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) throw new Error(error);
    // Read user type to route correctly
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userType = user?.user_metadata?.user_type;
    const destination = redirect || (userType === 'parent' ? '/parent/dashboard' : '/tutor');
    window.location.href = destination;
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  const handleForgotPassword = async (email: string) => {
    const { error } = await resetPassword(email);
    if (error) throw new Error(error);
  };

  return (
    <LoginForm
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      onForgotPassword={handleForgotPassword}
      initialError={authError === 'auth_callback_failed' ? 'Erro ao autenticar com Google. Tente novamente.' : undefined}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-app flex items-center justify-center">
          <div className="text-white animate-pulse">Carregando...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
