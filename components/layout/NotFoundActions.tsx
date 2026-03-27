'use client';

import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function NotFoundActions() {
  const { user, profile } = useAuth();

  if (user) {
    const dashboardPath =
      profile?.user_type === 'parent' ? '/parent/dashboard' :
      profile?.user_type === 'teacher' ? '/professor' :
      '/tutor';

    return (
      <Link
        href={dashboardPath}
        className="flex items-center gap-2 px-5 py-3 bg-white/5 text-white/70 hover:text-white font-semibold rounded-xl text-sm border border-white/10 transition-colors"
      >
        <LayoutDashboard size={16} />
        Meu painel
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center gap-2 px-5 py-3 bg-white/5 text-white/70 hover:text-white font-semibold rounded-xl text-sm border border-white/10 transition-colors"
    >
      <ArrowLeft size={16} />
      Fazer login
    </Link>
  );
}
