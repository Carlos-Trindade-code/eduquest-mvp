'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, Clock, MessageSquare, Filter } from 'lucide-react';
import type { Suggestion } from '@/lib/auth/types';

interface SuggestionsListProps {
  suggestions: Suggestion[];
  onUpdateStatus: (id: string, status: 'pending' | 'read' | 'done', notes?: string) => Promise<void>;
}

const statusConfig = {
  pending: { label: 'Pendente', color: '#F59E0B', icon: Clock },
  read: { label: 'Lida', color: '#3B82F6', icon: Eye },
  done: { label: 'Concluida', color: '#10B981', icon: Check },
};

export function SuggestionsList({ suggestions, onUpdateStatus }: SuggestionsListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'read' | 'done'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === 'all'
    ? suggestions
    : suggestions.filter((s) => s.status === filter);

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex items-center gap-2 mb-6">
        <Filter size={14} className="text-white/30" />
        {(['all', 'pending', 'read', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-white/50 hover:text-white'
            }`}
          >
            {f === 'all' ? 'Todas' : statusConfig[f].label}
            {f === 'pending' && suggestions.filter((s) => s.status === 'pending').length > 0 && (
              <span className="ml-1.5 px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">
                {suggestions.filter((s) => s.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <MessageSquare size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Nenhuma sugestao encontrada</p>
          </div>
        ) : (
          filtered.map((suggestion, i) => {
            const config = statusConfig[suggestion.status];
            const isExpanded = expandedId === suggestion.id;

            return (
              <motion.div
                key={suggestion.id}
                className="glass rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {/* Main row */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Status badge */}
                    <div
                      className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${config.color}15`,
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm line-clamp-2">{suggestion.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-white/30 text-xs">
                        {suggestion.user_name && <span>{suggestion.user_name}</span>}
                        {suggestion.user_email && <span>{suggestion.user_email}</span>}
                        <span>{new Date(suggestion.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded actions */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5"
                    >
                      <div className="p-4 flex flex-wrap gap-2">
                        {suggestion.status !== 'read' && (
                          <button
                            onClick={() => onUpdateStatus(suggestion.id, 'read')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                          >
                            <Eye size={14} />
                            Marcar como lida
                          </button>
                        )}
                        {suggestion.status !== 'done' && (
                          <button
                            onClick={() => onUpdateStatus(suggestion.id, 'done')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors"
                          >
                            <Check size={14} />
                            Marcar como concluida
                          </button>
                        )}
                        {suggestion.status !== 'pending' && (
                          <button
                            onClick={() => onUpdateStatus(suggestion.id, 'pending')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
                          >
                            <Clock size={14} />
                            Voltar para pendente
                          </button>
                        )}
                      </div>
                      {suggestion.admin_notes && (
                        <div className="px-4 pb-4">
                          <p className="text-white/30 text-xs">Notas: {suggestion.admin_notes}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
