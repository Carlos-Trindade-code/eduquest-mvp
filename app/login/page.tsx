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
  const successMsg = searchParams.get('msg');

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
      initialSuccess={successMsg === 'account_created' ? 'Conta criada com sucesso! Faca login para continuar.' : successMsg === 'session_expired' ? 'Sua sessao expirou. Faca login novamente.' : undefined}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-app flex items-center justify-center px-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 animate-pulse" />
              <div className="h-7 w-48 bg-white/10 rounded-lg mx-auto mb-2 animate-pulse" />
              <div className="h-4 w-64 bg-white/5 rounded mx-auto animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
              <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
              <div className="h-12 bg-purple-500/20 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
