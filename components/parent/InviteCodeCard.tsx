'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Users, ArrowRight } from 'lucide-react';

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

  return (
    <motion.div
      className="glass rounded-[var(--eq-radius)] p-5 border border-purple-500/10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center shrink-0">
          <Users size={22} className="text-purple-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[var(--eq-text)] font-semibold text-sm mb-1">
            {hasKids ? 'Codigo de convite' : 'Vincule seu filho'}
          </h3>
          <p className="text-[var(--eq-text-secondary)] text-xs mb-3">
            {hasKids
              ? 'Compartilhe para vincular mais filhos'
              : 'Seu filho digita este codigo ao criar a conta no EduQuest'}
          </p>

          <div className="flex items-center gap-2">
            <div className="bg-white/5 rounded-xl px-4 py-2.5 border border-white/10 flex-1">
              <span className="text-white text-lg font-mono font-bold tracking-[0.25em]">
                {code}
              </span>
            </div>
            <motion.button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 transition-colors flex items-center gap-2 shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-400" />
                  <span className="text-green-400 text-xs font-medium">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={16} className="text-purple-300" />
                  <span className="text-purple-300 text-xs font-medium">Copiar</span>
                </>
              )}
            </motion.button>
          </div>

          {!hasKids && (
            <div className="mt-3 flex items-center gap-2 text-white/30">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold">1</span>
                Filho cria conta
              </div>
              <ArrowRight size={12} />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold">2</span>
                Digita o codigo
              </div>
              <ArrowRight size={12} />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold">3</span>
                Vinculado!
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
