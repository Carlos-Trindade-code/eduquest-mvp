'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { School, X, Ticket, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics/track';

interface JoinClassroomProps {
  /** Render as inline form (for onboarding) vs button+modal (for header) */
  mode?: 'inline' | 'modal';
  onJoined?: (classroomName: string) => void;
}

export function JoinClassroom({ mode = 'modal', onJoined }: JoinClassroomProps) {
  const [open, setOpen] = useState(mode === 'inline');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [classroomName, setClassroomName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleJoin = async () => {
    if (code.length < 6) return;
    setStatus('loading');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('join_classroom', { classroom_code: code });
      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('not found') || msg.includes('invalid')) {
          setStatus('error');
          setErrorMsg('Turma não encontrada. Verifique se digitou o código corretamente.');
          return;
        }
        if (msg.includes('already') || msg.includes('ja')) {
          setStatus('error');
          setErrorMsg('Você já faz parte desta turma!');
          return;
        }
        setStatus('error');
        setErrorMsg('Algo deu errado. Tente novamente.');
        return;
      }
      if (!data?.success) {
        const rpcError = (data?.error || '').toLowerCase();
        let friendlyError = 'Algo deu errado. Tente novamente.';
        if (rpcError.includes('not found') || rpcError.includes('invalid') || rpcError.includes('nao encontr')) {
          friendlyError = 'Turma não encontrada. Verifique se digitou o código corretamente.';
        } else if (rpcError.includes('already') || rpcError.includes('ja')) {
          friendlyError = 'Você já faz parte desta turma!';
        }
        setStatus('error');
        setErrorMsg(friendlyError);
        return;
      }
      setClassroomName(data.classroom_name || '');
      setStatus('success');
      trackEvent('invite_code_redeemed', { type: 'classroom', code });
      setTimeout(() => {
        onJoined?.(data.classroom_name || '');
        if (mode === 'modal') setOpen(false);
      }, 1500);
    } catch {
      setStatus('error');
      setErrorMsg('Algo deu errado. Tente novamente.');
    }
  };

  const handleChange = (val: string) => {
    let v = val.toUpperCase();
    if (v.length > 0 && !v.startsWith('ST-') && !v.startsWith('ST') && !v.startsWith('S')) {
      v = 'ST-' + v;
    }
    if (v.length <= 7) setCode(v);
    if (status === 'error') setStatus('idle');
  };

  const formContent = (
    <>
      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-5 text-center"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <div className="text-4xl mb-2">✅</div>
          <p className="text-white font-bold text-sm">Entrou na turma{classroomName ? `: ${classroomName}` : ''}!</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(240,244,248,0.5)' }}>Os materiais do professor estarão disponíveis</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <School size={16} style={{ color: '#10B981' }} />
            <span className="text-sm font-semibold" style={{ color: '#10B981' }}>Código da turma (ST-XXXX)</span>
          </div>
          <div className="relative">
            <Ticket size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={code}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="ST-XXXX"
              maxLength={7}
              className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-green-500/50 text-sm uppercase tracking-widest font-mono text-center"
            />
          </div>
          {status === 'error' && (
            <p className="text-red-400 text-xs text-center">{errorMsg}</p>
          )}
          <motion.button
            onClick={handleJoin}
            disabled={code.length < 6 || status === 'loading'}
            className="w-full py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
            style={{ background: 'rgba(16,185,129,0.3)', color: 'white' }}
            whileHover={code.length >= 6 ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Entrando...</span>
            ) : 'Entrar na turma'}
          </motion.button>
          <p className="text-xs text-center" style={{ color: 'rgba(240,244,248,0.3)' }}>
            Este código é fornecido pelo seu professor
          </p>
        </div>
      )}
    </>
  );

  if (mode === 'inline') return formContent;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
      >
        <School size={16} />
        Entrar em turma
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: '#0F1D2E', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <School size={18} className="text-purple-400" />
                  Entrar em turma
                </h2>
                <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              {formContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
