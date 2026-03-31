'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, Clock, MessageSquare, Filter, CheckSquare, Square } from 'lucide-react';
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

const PAGE_SIZE = 20;

export function SuggestionsList({ suggestions, onUpdateStatus }: SuggestionsListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'read' | 'done'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusMessage, setStatusMessage] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});

  const handleUpdateWithFeedback = async (id: string, status: 'pending' | 'read' | 'done', notes?: string) => {
    try {
      await onUpdateStatus(id, status, notes);
      setStatusMessage((prev) => ({ ...prev, [id]: { type: 'success', text: 'Atualizado!' } }));
    } catch {
      setStatusMessage((prev) => ({ ...prev, [id]: { type: 'error', text: 'Erro ao atualizar' } }));
    }
    setTimeout(() => {
      setStatusMessage((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 3000);
  };

  const filtered = filter === 'all'
    ? suggestions
    : suggestions.filter((s) => s.status === filter);
  const paginated = filtered.slice(0, page * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  };

  const handleBulkAction = async (status: 'read' | 'done') => {
    setBulkLoading(true);
    for (const id of selectedIds) {
      await handleUpdateWithFeedback(id, status);
    }
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex items-center gap-2 mb-6">
        <Filter size={14} className="text-white/30" />
        {(['all', 'pending', 'read', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
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

      {/* Bulk actions toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <span className="text-purple-300 text-xs font-medium">{selectedIds.size} selecionada{selectedIds.size > 1 ? 's' : ''}</span>
          <button
            onClick={() => handleBulkAction('read')}
            disabled={bulkLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50"
          >
            <Eye size={12} />
            Marcar como lidas
          </button>
          <button
            onClick={() => handleBulkAction('done')}
            disabled={bulkLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
          >
            <Check size={12} />
            Marcar como concluidas
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-white/40 text-xs hover:text-white ml-auto"
          >
            Limpar
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors mb-1"
          >
            {selectedIds.size === filtered.length ? <CheckSquare size={14} /> : <Square size={14} />}
            {selectedIds.size === filtered.length ? 'Desmarcar todas' : 'Selecionar todas'}
          </button>
        )}
        {filtered.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <MessageSquare size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Nenhuma sugestao encontrada</p>
          </div>
        ) : (
          paginated.map((suggestion, i) => {
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
                    {/* Checkbox */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(suggestion.id); }}
                      className="mt-0.5 shrink-0 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {selectedIds.has(suggestion.id) ? <CheckSquare size={16} className="text-purple-400" /> : <Square size={16} />}
                    </button>
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
                        {statusMessage[suggestion.id] && (
                          <span className={`font-medium ${statusMessage[suggestion.id].type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {statusMessage[suggestion.id].text}
                          </span>
                        )}
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
                            onClick={() => handleUpdateWithFeedback(suggestion.id, 'read')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                          >
                            <Eye size={14} />
                            Marcar como lida
                          </button>
                        )}
                        {suggestion.status !== 'done' && (
                          <button
                            onClick={() => handleUpdateWithFeedback(suggestion.id, 'done')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors"
                          >
                            <Check size={14} />
                            Marcar como concluida
                          </button>
                        )}
                        {suggestion.status !== 'pending' && (
                          <button
                            onClick={() => handleUpdateWithFeedback(suggestion.id, 'pending')}
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

      {/* Pagination */}
      {filtered.length > 0 && (
        <p className="text-xs text-white/30 text-right mt-3">
          Exibindo {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
        </p>
      )}
      {filtered.length > page * PAGE_SIZE && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full py-2 mt-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm transition-colors"
        >
          Carregar mais ({filtered.length - page * PAGE_SIZE} restantes)
        </button>
      )}
    </div>
  );
}
