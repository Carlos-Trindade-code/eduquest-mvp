'use client';

import { useState } from 'react';
import { Star, MessageSquare, Filter, ArrowUpDown } from 'lucide-react';
import type { UserFeedback, FeedbackStats } from '@/lib/auth/types';

interface FeedbackListProps {
  feedbacks: UserFeedback[];
  stats: FeedbackStats | null;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}
        />
      ))}
    </div>
  );
}

type SortOption = 'newest' | 'oldest' | 'lowest' | 'highest';

export function FeedbackList({ feedbacks, stats }: FeedbackListProps) {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('newest');

  const filtered = feedbacks
    .filter((f) => {
      if (filterRating !== null && f.rating !== filterRating) return false;
      if (filterSource !== null && f.source !== filterSource) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'lowest': return a.rating - b.rating;
        case 'highest': return b.rating - a.rating;
      }
    });

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4">
            <div className="text-white/40 text-xs mb-1">Total</div>
            <div className="text-white text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-white/40 text-xs mb-1">Média</div>
            <div className="text-yellow-400 text-2xl font-bold flex items-center gap-1">
              {stats.avg_rating ?? '—'}
              <Star size={16} className="fill-yellow-400" />
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-white/40 text-xs mb-1">Hoje</div>
            <div className="text-green-400 text-2xl font-bold">{stats.new_today}</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-white/40 text-xs mb-1">Pós-sessão</div>
            <div className="text-purple-400 text-2xl font-bold">{stats.by_source.post_session}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={14} className="text-white/40" />
        {[1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRating(filterRating === r ? null : r)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
              filterRating === r
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-white/5 text-white/40 hover:text-white'
            }`}
          >
            {r} <Star size={10} className={filterRating === r ? 'fill-yellow-300 text-yellow-300' : ''} />
          </button>
        ))}
        <button
          onClick={() => setFilterSource(filterSource === 'floating_button' ? null : 'floating_button')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterSource === 'floating_button'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-white/5 text-white/40 hover:text-white'
          }`}
        >
          Botão flutuante
        </button>
        <button
          onClick={() => setFilterSource(filterSource === 'post_session' ? null : 'post_session')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            filterSource === 'post_session'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-white/5 text-white/40 hover:text-white'
          }`}
        >
          Pós-sessão
        </button>

        <span className="w-px h-4 bg-white/10 mx-1" />
        <ArrowUpDown size={14} className="text-white/40" />
        {([
          ['newest', 'Recentes'],
          ['oldest', 'Antigos'],
          ['lowest', 'Pior nota'],
          ['highest', 'Melhor nota'],
        ] as [SortOption, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setSort(value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              sort === value
                ? 'bg-white/15 text-white border border-white/20'
                : 'bg-white/5 text-white/40 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 flex flex-col items-center gap-3 text-white/30">
          <MessageSquare size={32} />
          <p className="text-sm">Nenhum feedback encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f.id} className="glass rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-white font-medium text-sm">{f.user_name ?? 'Anônimo'}</p>
                  <p className="text-white/40 text-xs">{f.user_email ?? '—'}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StarDisplay rating={f.rating} />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    f.source === 'post_session'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {f.source === 'post_session' ? 'Pós-sessão' : 'Botão'}
                  </span>
                </div>
              </div>
              {f.comment && (
                <p className="mt-3 text-white/70 text-sm bg-white/5 rounded-lg px-3 py-2">
                  {f.comment}
                </p>
              )}
              <p className="mt-2 text-white/30 text-xs">
                {new Date(f.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
