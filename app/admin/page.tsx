'use client';

import { useEffect, useState } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ADMIN_EMAIL } from '@/lib/auth/constants';

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email === ADMIN_EMAIL) {
        setAuthorized(true);
      }
      setChecking(false);
    }
    checkAuth();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-app flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-app flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <Shield size={40} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-white font-bold text-xl mb-2">Acesso Negado</h1>
          <p className="text-white/50 text-sm">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
