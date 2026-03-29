'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Lightbulb, MessageCircle, Clock, Sparkles } from 'lucide-react';
import { getSubjectById } from '@/lib/subjects/config';
import { getSessionMessagesForParent } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';
import { fadeInUp } from '@/lib/design/animations';
import type { SessionSummary, Message } from '@/lib/auth/types';

interface SessionDetailProps {
  summary: SessionSummary;
  onClose: () => void;
}

export function SessionDetail({ summary, onClose }: SessionDetailProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const sub = getSubjectById(summary.subject);
  const date = new Date(summary.created_at);

  useEffect(() => {
    loadMessages();
  }, [summary.session_id]);

  const loadMessages = async () => {
    setLoadingMessages(true);
    const supabase = createClient();
    const { data } = await getSessionMessagesForParent(supabase, summary.session_id);
    setMessages((data as Message[]) || []);
    setLoadingMessages(false);
  };

  return (
    <motion.div
      className="glass rounded-[var(--eq-radius)] p-5 space-y-4"
      variants={fadeInUp('medium')}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ background: `${sub?.color || '#8B5CF6'}15` }}
          >
            {sub?.icon || '📚'}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{sub?.name || summary.subject}</h3>
            <div className="flex items-center gap-3 text-xs text-white/30">
              <span>{date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {summary.duration_minutes}min
              </span>
              <span className="flex items-center gap-1">
                <Sparkles size={10} />
                +{summary.xp_earned} XP
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Topics */}
      {summary.topics_covered && summary.topics_covered.length > 0 && (
        <div>
          <p className="text-white/40 text-xs font-medium mb-2 uppercase tracking-wider">Tópicos</p>
          <div className="flex flex-wrap gap-1.5">
            {summary.topics_covered.map((topic, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-300/80"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {summary.strengths && summary.strengths.length > 0 && (
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} className="text-emerald-400" />
            <p className="text-emerald-400 text-xs font-semibold">Pontos Fortes</p>
          </div>
          <ul className="space-y-1">
            {summary.strengths.map((s, i) => (
              <li key={i} className="text-white/60 text-xs pl-5 relative before:content-[''] before:absolute before:left-1.5 before:top-1.5 before:w-1 before:h-1 before:rounded-full before:bg-emerald-500/50">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Difficulties */}
      {summary.difficulties && summary.difficulties.length > 0 && (
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <p className="text-amber-400 text-xs font-semibold">Pontos a Melhorar</p>
          </div>
          <ul className="space-y-1">
            {summary.difficulties.map((d, i) => (
              <li key={i} className="text-white/60 text-xs pl-5 relative before:content-[''] before:absolute before:left-1.5 before:top-1.5 before:w-1 before:h-1 before:rounded-full before:bg-amber-500/50">
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Suggestion */}
      {summary.ai_suggestion && (
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-purple-400" />
            <p className="text-purple-400 text-xs font-semibold">Sugestão da IA</p>
          </div>
          <p className="text-white/60 text-xs leading-relaxed">{summary.ai_suggestion}</p>
        </div>
      )}

      {/* Parent Tip */}
      {summary.parent_tip && (
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className="text-blue-400" />
            <p className="text-blue-400 text-xs font-semibold">Dica para os Pais</p>
          </div>
          <p className="text-white/60 text-xs leading-relaxed">{summary.parent_tip}</p>
        </div>
      )}

      {/* Chat transcript toggle */}
      <div>
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all w-full justify-center"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <MessageCircle size={14} />
          {showTranscript ? 'Ocultar conversa' : 'Ver conversa completa'}
          {showTranscript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-white/20 text-xs text-center py-4">
                    Nenhuma mensagem encontrada
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-purple-600/20 text-purple-100/80 rounded-br-md'
                            : 'bg-white/[0.04] text-white/60 rounded-bl-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
