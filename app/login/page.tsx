'use client';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/tutor';

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) throw new Error(error);
    router.push(redirect);
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
