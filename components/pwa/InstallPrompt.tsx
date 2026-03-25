'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'studdo_install_dismissed';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed recently (7 days)
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 86400000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after a short delay so it doesn't interrupt immediately
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div
            className="rounded-2xl p-4 flex items-center gap-3 shadow-2xl backdrop-blur-xl"
            style={{ background: 'rgba(13,27,42,0.95)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
              <Download size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">Instalar Studdo</p>
              <p className="text-xs truncate" style={{ color: 'rgba(240,244,248,0.5)' }}>
                Acesse mais rapido direto da tela inicial
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white shrink-0 hover:bg-purple-500 transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-white/30 hover:text-white/60 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
