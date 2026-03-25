'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Clock, Sparkles, ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getKidSessions, getSessionMessages } from '@/lib/supabase/queries';
import { getSubjectById } from '@/lib/subjects/config';
import { useAuth } from '@/hooks/useAuth';
import type { Session, Message } from '@/lib/auth/types';

export function SessionHistory() {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
      >
        <History size={14} />
        Historico
      </button>

      <AnimatePresence>
        {open && (
          <SessionHistoryPanel
            profileId={profile.id}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function SessionHistoryPanel({ profileId, onClose }: { profileId: string; onClose: () => void }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = createClient();
    getKidSessions(supabase, profileId, 50).then(({ data }) => {
      setSessions(data);
      setLoading(false);
    });
  }, [profileId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0D1B2A] border-l border-white/10 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {selectedSession ? (
          <SessionDetail
            session={selectedSession}
            onBack={() => setSelectedSession(null)}
            onClose={onClose}
          />
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-[#0D1B2A]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <History size={18} className="text-purple-400" />
                <h2 className="text-white font-bold text-sm">Historico de Sessoes</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Sessions list */}
            <div className="p-4 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-20">
                  <BookOpen size={32} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm">Nenhuma sessao ainda</p>
                  <p className="text-white/25 text-xs mt-1">Suas sessoes de estudo aparecerao aqui</p>
                </div>
              ) : (
                sessions.map((session, i) => {
                  const subjectInfo = getSubjectById(session.subject);
                  const date = new Date(session.created_at);
                  const isToday = new Date().toDateString() === date.toDateString();
                  const isYesterday = new Date(Date.now() - 86400000).toDateString() === date.toDateString();
                  const dateLabel = isToday ? 'Hoje' : isYesterday ? 'Ontem' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                  return (
                    <motion.button
                      key={session.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedSession(session)}
                      className="w-full rounded-xl p-3.5 text-left transition-all hover:bg-white/5 group"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                          style={{ background: `${subjectInfo?.color || '#8B5CF6'}15` }}
                        >
                          {subjectInfo?.icon || '📚'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm font-medium truncate">
                              {subjectInfo?.name || session.subject}
                            </span>
                            <span className="text-white/25 text-xs shrink-0 ml-2">{dateLabel}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {session.duration_minutes != null && session.duration_minutes > 0 && (
                              <span className="text-white/30 text-xs flex items-center gap-1">
                                <Clock size={10} />
                                {session.duration_minutes}min
                              </span>
                            )}
                            {session.xp_earned > 0 && (
                              <span className="text-amber-400/50 text-xs flex items-center gap-1">
                                <Sparkles size={10} />
                                +{session.xp_earned} XP
                              </span>
                            )}
                            <span className="text-white/20 text-xs">
                              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-white/15 group-hover:text-white/40 transition-colors shrink-0" />
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function SessionDetail({ session, onBack, onClose }: { session: Session; onBack: () => void; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const subjectInfo = getSubjectById(session.subject);

  useEffect(() => {
    const supabase = createClient();
    getSessionMessages(supabase, session.id).then(({ data }) => {
      setMessages(data);
      setLoading(false);
    });
  }, [session.id]);

  const date = new Date(session.created_at);

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-[#0D1B2A]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${subjectInfo?.color || '#8B5CF6'}15` }}
          >
            {subjectInfo?.icon || '📚'}
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">{subjectInfo?.name || session.subject}</h3>
            <p className="text-white/30 text-xs">
              {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              {' · '}
              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              {session.duration_minutes ? ` · ${session.duration_minutes}min` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"
            />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-10">Nenhuma mensagem salva nesta sessao</p>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user' ? '#8B5CF6' : 'rgba(255,255,255,0.06)',
                  color: msg.role === 'user' ? '#FFFFFF' : 'rgba(240,244,248,0.8)',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : undefined,
                  borderBottomLeftRadius: msg.role === 'assistant' ? 4 : undefined,
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </>
  );
}
