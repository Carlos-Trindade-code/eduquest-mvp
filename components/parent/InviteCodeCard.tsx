'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, MessageCircle } from 'lucide-react';

interface InviteCodeCardProps {
  code: string;
  hasKids?: boolean;
}

export function InviteCodeCard({ code, hasKids = false }: InviteCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const input = document.createElement('input');
      input.value = code;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Oi! Criei uma conta no Studdo para você estudar com um tutor de IA. 🦉\n\nPara criar a sua conta:\n1. Acesse www.studdo.com.br\n2. Clique em "Criar conta"\n3. Use o código de convite: *${code}*\n\nÉ grátis!`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <motion.div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(139,92,246,0.8)' }}>
        {hasKids ? 'Código de convite' : '👋 Passo 1 — Convide seu filho'}
      </p>

      {/* Code display */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex-1 rounded-xl px-5 py-3 text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span className="text-white text-2xl font-mono font-bold tracking-[0.3em]">{code}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          style={{ background: '#25D366', color: 'white' }}
          whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
          whileTap={{ scale: 0.97 }}
        >
          <MessageCircle size={16} />
          Enviar por WhatsApp
        </motion.button>

        <motion.button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,244,248,0.6)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </motion.button>
      </div>

      {!hasKids && (
        <p className="text-xs mt-3 text-center" style={{ color: 'rgba(240,244,248,0.35)' }}>
          Seu filho usa este código ao criar a conta no Studdo
        </p>
      )}
    </motion.div>
  );
}
