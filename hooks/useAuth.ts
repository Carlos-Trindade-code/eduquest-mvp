'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getProfile } from '@/lib/supabase/queries';
import { trackEvent } from '@/lib/analytics/track';
import type { Profile, UserType } from '@/lib/auth/types';
import type { User } from '@supabase/supabase-js';

function isEmail(value: string): boolean {
  return value.includes('@');
}

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, userType: UserType) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const wasLoggedIn = useRef(false);
  const supabase = createClient();

  const loadProfile = useCallback(async () => {
    const p = await getProfile(supabase);
    setProfile(p);
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      if (u) {
        wasLoggedIn.current = true;
        loadProfile();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        wasLoggedIn.current = true;
        loadProfile();
      } else {
        setProfile(null);
        // If user was previously logged in and session ended unexpectedly, redirect to login
        if (wasLoggedIn.current && event === 'SIGNED_OUT') {
          wasLoggedIn.current = false;
          // Only redirect if not already on login/register pages
          const path = window.location.pathname;
          if (path !== '/login' && path !== '/register' && path !== '/') {
            window.location.href = '/login?msg=session_expired';
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, loadProfile]);

  const translateError = (msg: string): string => {
    if (msg.includes('Invalid login credentials')) return 'Email ou senha incorretos';
    if (msg.includes('Email not confirmed')) return 'Email nao confirmado. Verifique sua caixa de entrada.';
    if (msg.includes('User already registered')) return 'Este email ja esta cadastrado. Tente fazer login.';
    if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres';
    if (msg.includes('Unable to validate email')) return 'Email invalido';
    if (msg.includes('Email rate limit exceeded')) return 'Muitas tentativas. Aguarde alguns minutos.';
    if (msg.includes('Signups not allowed')) return 'Cadastro desativado temporariamente.';
    return msg;
  };

  const signUp = useCallback(
    async (email: string, password: string, name: string, userType: UserType) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, user_type: userType },
        },
      });
      if (error) return { error: translateError(error.message) };
      // If identities is empty, user already exists but Supabase hides it
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { error: 'Este email ja esta cadastrado. Tente fazer login.' };
      }
      trackEvent('register', { user_type: userType });
      return { error: null };
    },
    [supabase]
  );

  const signIn = useCallback(
    async (emailOrUsername: string, password: string) => {
      // If it's not an email, convert username to synthetic email
      const email = isEmail(emailOrUsername)
        ? emailOrUsername
        : `${emailOrUsername.toLowerCase().trim()}@studdo.app`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        const msg = error.message;
        if (msg.includes('Invalid login credentials')) {
          return { error: isEmail(emailOrUsername) ? 'Email ou senha incorretos' : 'Usuário ou senha incorretos' };
        }
        return { error: translateError(msg) };
      }
      trackEvent('login');
      return { error: null };
    },
    [supabase]
  );

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) return { error: translateError(error.message) };
      return { error: null };
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
    resetPassword,
  };
}
