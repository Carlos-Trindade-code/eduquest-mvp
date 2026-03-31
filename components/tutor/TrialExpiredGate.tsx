// components/tutor/TrialExpiredGate.tsx
'use client';

import { motion } from 'framer-motion';

export function TrialExpiredGate() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 py-12 px-4 text-center">
      <motion.div
        className="text-6xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        🦉
      </motion.div>
      <div>
        <h2 className="text-white text-2xl font-extrabold mb-2">O Edu adorou estudar com você!</h2>
        <p className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(240,244,248,0.5)' }}>
          Crie uma conta gratuita em 30 segundos para continuar. Sem cartão de crédito, sem pegadinha.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href="/register?redirect=/tutor"
          className="w-full py-3.5 font-bold rounded-xl text-sm text-center shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
          style={{ background: '#F5A623', color: '#0D1B2A', boxShadow: '0 8px 30px rgba(245,166,35,0.3)' }}
        >
          Criar conta gratuita
          <span className="text-xs opacity-70">→</span>
        </a>
        <a
          href="/login?redirect=/tutor"
          className="w-full py-3 rounded-xl text-sm text-center font-medium transition-all text-white/50 hover:text-white hover:bg-white/5"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Já tenho conta — Entrar
        </a>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {['🏆 XP e Níveis', '🔥 Streak diário', '📊 Dashboard pais', '🎯 Badges'].map((item) => (
          <span key={item} className="text-xs px-2.5 py-1 rounded-full" style={{ color: 'rgba(240,244,248,0.5)', background: 'rgba(255,255,255,0.03)' }}>{item}</span>
        ))}
      </div>
    </div>
  );
}
