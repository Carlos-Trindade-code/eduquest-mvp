'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { WelcomeFlow } from '@/components/onboarding/WelcomeFlow';
import { createClient } from '@/lib/supabase/client';
import { getInviteCode } from '@/lib/supabase/queries';

export default function OnboardingPage() {
  const { profile } = useAuth();
  const router = useRouter();
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
      onComplete={handleComplete}
    />
  );
}
