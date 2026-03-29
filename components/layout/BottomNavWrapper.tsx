'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BottomNav } from './BottomNav';

// Pages where BottomNav should appear (kid-facing pages)
const KID_PAGES = ['/tutor', '/exam', '/materials', '/perfil', '/quiz', '/tutorial'];

export function BottomNavWrapper() {
  const pathname = usePathname();
  const [isKid, setIsKid] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.user_type === 'kid') {
        setIsKid(true);
      }
    });
  }, []);

  const shouldShow = isKid && KID_PAGES.some(p => pathname === p || pathname?.startsWith(p + '/'));

  if (!shouldShow) return null;

  return <BottomNav />;
}
