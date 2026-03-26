'use client';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, LogOut, BarChart3, Menu, X, Home, BookOpen, User, Zap, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PomodoroTimer } from '@/components/tutor/PomodoroTimer';
import { SessionHistory } from '@/components/tutor/SessionHistory';
import { JoinClassroom } from '@/components/classroom/JoinClassroom';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  appName?: string;
  timerLabels?: { start: string; pause: string };
  onTimerComplete?: () => void;
  onFinishSession?: () => void;
  showFinish?: boolean;
}

export function Header({
  appName = 'Studdo',
  timerLabels,
  onTimerComplete,
  onFinishSession,
  showFinish,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    window.location.href = '/login';
  };

  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Usuario';
  const displayEmail = user?.email || '';
  const userType = profile?.user_type;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black/20 shrink-0">
      {/* Logo + Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1 -ml-1"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            {menuOpen ? <X size={18} className="text-white/70" /> : <Menu size={18} className="text-white/70" />}
          </div>
          <Sparkles className="text-yellow-400" size={22} />
          <span className="text-white font-bold text-xl">{appName}</span>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
            >
              {/* User info */}
              {user && (
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{displayName}</p>
                      <p className="text-white/50 text-xs truncate">{displayEmail}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="py-1">
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
                >
                  <Home size={16} />
                  Inicio
                </button>

                {userType === 'kid' && (
                  <button
                    onClick={() => navigate('/tutor')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
                  >
                    <Sparkles size={16} />
                    Tutor IA
                  </button>
                )}

                {userType === 'parent' && (
                  <button
                    onClick={() => navigate('/parent/dashboard')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
                  >
                    <BarChart3 size={16} />
                    Dashboard
                  </button>
                )}

                <button
                  onClick={() => navigate('/quiz')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
                >
                  <Zap size={16} />
                  Quiz
                </button>

                {user && <JoinClassroom />}

                <button
                  onClick={() => navigate('/tutorial')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
                >
                  <BookOpen size={16} />
                  Como Usar
                </button>
              </div>

              {/* Logout */}
              {user && (
                <div className="border-t border-white/10 py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              )}

              {/* Not logged in */}
              {!user && (
                <div className="border-t border-white/10 py-1">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-sm transition-colors"
                  >
                    <User size={16} />
                    Entrar
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        {showFinish && (
          <motion.button
            onClick={onFinishSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#EF4444',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Square size={12} fill="currentColor" />
            Finalizar
          </motion.button>
        )}
        <SessionHistory />
        <PomodoroTimer onComplete={onTimerComplete} labels={timerLabels} />
      </div>
    </header>
  );
}
