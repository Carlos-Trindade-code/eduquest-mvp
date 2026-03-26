'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Home } from 'lucide-react';
import { MascotOwl } from '@/components/illustrations/MascotOwl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-app flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MascotOwl expression="thinking" size="lg" animated />

        <h1 className="text-white text-2xl font-bold mt-6 mb-2">
          Ops, algo deu errado!
        </h1>
        <p className="text-white/50 text-sm mb-8">
          Nao se preocupe, isso acontece as vezes. Tente novamente ou volte para o inicio.
        </p>

        <div className="flex items-center justify-center gap-3">
          <motion.button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-purple-600/25"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw size={16} />
            Tentar novamente
          </motion.button>

          <motion.a
            href="/"
            className="flex items-center gap-2 px-5 py-3 bg-white/5 text-white/70 hover:text-white font-semibold rounded-xl text-sm border border-white/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home size={16} />
            Inicio
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
