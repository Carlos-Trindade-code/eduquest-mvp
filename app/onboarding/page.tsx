'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { WelcomeFlow } from '@/components/onboarding/WelcomeFlow';
import { createClient } from '@/lib/supabase/client';
import { getInviteCode } from '@/lib/supabase/queries';

function OnboardingContent() {
  const { profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteError = searchParams.get('invite_error') === '1';
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.user_type === 'parent') {
      const supabase = createClient();
      getInviteCode(supabase).then((code) => setInviteCode(code));
    }
  }, [profile]);

  const handleComplete = () => {
    if (profile?.user_type === 'parent') {
      router.push('/parent/dashboard');
    } else {
      router.push('/tutor');
    }
  };

  return (
    <WelcomeFlow
      userName={profile?.name}
      userType={profile?.user_type}
      inviteCode={inviteCode}
      profileId={profile?.id}
      onComplete={handleComplete}
      inviteError={inviteError}
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-app flex items-center justify-center">
          <div className="text-white animate-pulse">Carregando...</div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
