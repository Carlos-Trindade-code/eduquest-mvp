# Sistema de Feedback — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Coletar feedback dos usuários logados via botão flutuante e prompt pós-sessão, e exibir tudo numa aba exclusiva no painel admin.

**Architecture:** Nova tabela `user_feedback` no Supabase com RLS e RPCs admin-only. Componente flutuante compartilhado (`FeedbackModal`) reutilizado pelo botão fixo e pelo prompt pós-sessão no tutor. Aba "Feedback" adicionada ao `AdminDashboard` com `FeedbackList`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase (PostgreSQL + RLS + RPC), Framer Motion, Tailwind CSS 4, Radix UI, Lucide React.

---

### Task 1: SQL — Criar tabela e RPCs no Supabase

**Files:**
- Create: `supabase/migrations/004_user_feedback.sql`

**Step 1: Criar o arquivo de migração**

```sql
-- supabase/migrations/004_user_feedback.sql

-- Tabela de feedback dos usuários
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(auth_id) ON DELETE SET NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  source text NOT NULL CHECK (source IN ('floating_button', 'post_session')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode inserir o próprio feedback
CREATE POLICY "Users can insert own feedback"
  ON user_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Ninguém pode ler diretamente (somente via RPC admin)
CREATE POLICY "No direct select"
  ON user_feedback FOR SELECT
  TO authenticated
  USING (false);

-- RPC: enviar feedback (usuário logado)
CREATE OR REPLACE FUNCTION submit_feedback(
  p_rating int,
  p_comment text DEFAULT NULL,
  p_source text DEFAULT 'floating_button'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_feedback (user_id, rating, comment, source)
  VALUES (auth.uid(), p_rating, p_comment, p_source);
END;
$$;

-- RPC: listar todos os feedbacks (admin only — checar email no app)
CREATE OR REPLACE FUNCTION get_all_feedback()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  user_name text,
  user_email text,
  rating int,
  comment text,
  source text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.user_id,
    p.name AS user_name,
    p.email AS user_email,
    f.rating,
    f.comment,
    f.source,
    f.created_at
  FROM user_feedback f
  LEFT JOIN profiles p ON p.auth_id = f.user_id
  ORDER BY f.created_at DESC;
END;
$$;

-- RPC: stats de feedback (admin)
CREATE OR REPLACE FUNCTION get_feedback_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'avg_rating', ROUND(AVG(rating)::numeric, 1),
    'new_today', COUNT(*) FILTER (WHERE created_at >= now() - interval '24 hours'),
    'by_source', jsonb_build_object(
      'floating_button', COUNT(*) FILTER (WHERE source = 'floating_button'),
      'post_session', COUNT(*) FILTER (WHERE source = 'post_session')
    )
  )
  INTO result
  FROM user_feedback;
  RETURN result;
END;
$$;
```

**Step 2: Executar no Supabase SQL Editor**

Abrir [Supabase Dashboard](https://supabase.com) → projeto `eduquest` → SQL Editor → colar e rodar o conteúdo do arquivo acima.

Verificar: as tabelas e funções aparecem em Database → Tables e Functions.

**Step 3: Commit**

```bash
git add supabase/migrations/004_user_feedback.sql
git commit -m "feat: add user_feedback table with RLS and admin RPCs"
```

---

### Task 2: Types — Adicionar `UserFeedback` e `FeedbackStats`

**Files:**
- Modify: `lib/auth/types.ts`

**Step 1: Adicionar ao final do arquivo `lib/auth/types.ts`**

```typescript
export interface UserFeedback {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  rating: number;
  comment: string | null;
  source: 'floating_button' | 'post_session';
  created_at: string;
}

export interface FeedbackStats {
  total: number;
  avg_rating: number;
  new_today: number;
  by_source: {
    floating_button: number;
    post_session: number;
  };
}
```

**Step 2: Commit**

```bash
git add lib/auth/types.ts
git commit -m "feat: add UserFeedback and FeedbackStats types"
```

---

### Task 3: Queries — Funções Supabase para feedback

**Files:**
- Modify: `lib/supabase/queries.ts`

**Step 1: Adicionar ao final de `lib/supabase/queries.ts`**

```typescript
import type { UserFeedback, FeedbackStats } from '@/lib/auth/types';

// ==========================================
// FEEDBACK QUERIES
// ==========================================

export async function submitFeedback(
  supabase: SupabaseClient,
  rating: number,
  comment: string | null,
  source: 'floating_button' | 'post_session'
): Promise<{ error: Error | null }> {
  const { error } = await supabase.rpc('submit_feedback', {
    p_rating: rating,
    p_comment: comment,
    p_source: source,
  });
  return { error };
}

export async function getAllFeedback(supabase: SupabaseClient): Promise<UserFeedback[]> {
  const { data, error } = await supabase.rpc('get_all_feedback');
  if (error) {
    console.error('getAllFeedback error:', error);
    return [];
  }
  return (data as UserFeedback[]) || [];
}

export async function getFeedbackStats(supabase: SupabaseClient): Promise<FeedbackStats | null> {
  const { data, error } = await supabase.rpc('get_feedback_stats');
  if (error) {
    console.error('getFeedbackStats error:', error);
    return null;
  }
  return data as FeedbackStats;
}
```

**Step 2: Garantir que o import de `SupabaseClient` já existe no topo do arquivo** (já existe — não duplicar).

**Step 3: Commit**

```bash
git add lib/supabase/queries.ts
git commit -m "feat: add submitFeedback, getAllFeedback, getFeedbackStats queries"
```

---

### Task 4: Componente — `FeedbackModal` (formulário compartilhado)

**Files:**
- Create: `components/feedback/FeedbackModal.tsx`

**Step 1: Criar o arquivo**

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CheckCircle, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { submitFeedback } from '@/lib/supabase/queries';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: 'floating_button' | 'post_session';
  subjectContext?: string; // ex: "Matemática" — usado no prompt pós-sessão
}

function createSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function FeedbackModal({ isOpen, onClose, source, subjectContext }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const title = subjectContext
    ? `Como foi sua sessão de ${subjectContext}?`
    : 'Como está sendo sua experiência?';

  async function handleSubmit() {
    if (rating === 0) return;
    setLoading(true);
    const supabase = createSupabase();
    await submitFeedback(supabase, rating, comment.trim() || null, source);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setRating(0);
      setComment('');
      onClose();
    }, 1800);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-80 glass rounded-2xl p-6 shadow-2xl border border-white/10"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            {success ? (
              <motion.div
                className="flex flex-col items-center py-4 gap-3"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <CheckCircle size={40} className="text-green-400" />
                <p className="text-white font-semibold text-center">Obrigado pelo feedback!</p>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <p className="text-white font-semibold text-sm leading-snug pr-2">{title}</p>
                  <button onClick={onClose} className="text-white/40 hover:text-white shrink-0">
                    <X size={16} />
                  </button>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={
                          star <= (hovered || rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-white/20'
                        }
                      />
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder="Comentário opcional..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/80 text-sm placeholder:text-white/30 resize-none focus:outline-none focus:border-purple-500/50 mb-4"
                />

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 rounded-xl text-white/50 hover:text-white text-sm transition-colors"
                  >
                    Agora não
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || loading}
                    className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                    Enviar
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

**Step 2: Commit**

```bash
git add components/feedback/FeedbackModal.tsx
git commit -m "feat: add FeedbackModal shared component with star rating"
```

---

### Task 5: Componente — `FeedbackButton` (botão flutuante)

**Files:**
- Create: `components/feedback/FeedbackButton.tsx`

**Step 1: Criar o arquivo**

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

export function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-full shadow-lg shadow-purple-900/50 flex items-center justify-center text-white transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Enviar feedback"
      >
        <MessageSquarePlus size={20} />
      </motion.button>

      <FeedbackModal
        isOpen={open}
        onClose={() => setOpen(false)}
        source="floating_button"
      />
    </>
  );
}
```

**Step 2: Commit**

```bash
git add components/feedback/FeedbackButton.tsx
git commit -m "feat: add FeedbackButton floating component"
```

---

### Task 6: Componente — `PostSessionFeedback` (prompt pós-sessão)

**Files:**
- Create: `components/feedback/PostSessionFeedback.tsx`

**Step 1: Criar o arquivo**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { FeedbackModal } from './FeedbackModal';

interface PostSessionFeedbackProps {
  triggered: boolean;           // true quando a sessão é encerrada
  subjectContext?: string;      // nome da matéria estudada
  onDismiss: () => void;        // callback para resetar o trigger no pai
}

export function PostSessionFeedback({ triggered, subjectContext, onDismiss }: PostSessionFeedbackProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (triggered) {
      // Pequeno delay para dar tempo de transição
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [triggered]);

  function handleClose() {
    setOpen(false);
    onDismiss();
  }

  return (
    <FeedbackModal
      isOpen={open}
      onClose={handleClose}
      source="post_session"
      subjectContext={subjectContext}
    />
  );
}
```

**Step 2: Commit**

```bash
git add components/feedback/PostSessionFeedback.tsx
git commit -m "feat: add PostSessionFeedback component"
```

---

### Task 7: Integrar `FeedbackButton` nas páginas logadas

**Files:**
- Modify: `app/tutor/page.tsx`
- Modify: `app/parent/dashboard/page.tsx`

**Step 1: Adicionar ao `app/tutor/page.tsx`**

Adicionar import no topo:
```tsx
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
```

Adicionar antes do fechamento do `</div>` raiz:
```tsx
<FeedbackButton />
```

O arquivo final fica:
```tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/tutor/ChatInterface';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';

export default function TutorPage() {
  const [showBreak, setShowBreak] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-app flex flex-col">
      <Header onTimerComplete={() => setShowBreak(true)} />

      <AnimatePresence>
        {showBreak && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600/95 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-900/50 flex items-center gap-4 max-w-sm"
          >
            <Coffee size={24} className="shrink-0" />
            <div>
              <p className="font-bold text-sm">Hora da pausa!</p>
              <p className="text-emerald-100 text-xs mt-0.5">
                Voce estudou 25 minutos. Descanse 5 minutos e volte!
              </p>
            </div>
            <button
              onClick={() => setShowBreak(false)}
              className="shrink-0 text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-5 overflow-hidden">
        <ChatInterface />
      </main>

      <FeedbackButton />
    </div>
  );
}
```

**Step 2: Adicionar ao `app/parent/dashboard/page.tsx`**

Adicionar import:
```tsx
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
```

Adicionar `<FeedbackButton />` antes do fechamento do `</div>` raiz da página.

**Step 3: Commit**

```bash
git add app/tutor/page.tsx app/parent/dashboard/page.tsx
git commit -m "feat: add FeedbackButton to tutor and parent dashboard pages"
```

---

### Task 8: Componente admin — `FeedbackList`

**Files:**
- Create: `components/admin/FeedbackList.tsx`

**Step 1: Criar o arquivo**

```tsx
'use client';

import { useState } from 'react';
import { Star, MessageSquare, Filter } from 'lucide-react';
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

export function FeedbackList({ feedbacks, stats }: FeedbackListProps) {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterSource, setFilterSource] = useState<string | null>(null);

  const filtered = feedbacks.filter((f) => {
    if (filterRating !== null && f.rating !== filterRating) return false;
    if (filterSource !== null && f.source !== filterSource) return false;
    return true;
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
```

**Step 2: Commit**

```bash
git add components/admin/FeedbackList.tsx
git commit -m "feat: add FeedbackList admin component"
```

---

### Task 9: Integrar aba "Feedback" no AdminDashboard

**Files:**
- Modify: `components/admin/AdminDashboard.tsx`

**Step 1: Adicionar imports**

No topo do arquivo, adicionar aos imports existentes:
```tsx
import { MessageSquare } from 'lucide-react'; // já pode existir — verificar
import { FeedbackList } from './FeedbackList';
import { getAllFeedback, getFeedbackStats } from '@/lib/supabase/queries';
import type { UserFeedback, FeedbackStats } from '@/lib/auth/types';
```

**Step 2: Adicionar state**

Dentro da função `AdminDashboard`, após os estados existentes:
```tsx
const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
```

**Step 3: Carregar dados no `loadData`**

Dentro do `Promise.all` existente, adicionar:
```tsx
const [metricsData, suggestionsData, profilesData, feedbacksData, feedbackStatsData] = await Promise.all([
  getAdminMetrics(supabase),
  getAllSuggestions(supabase),
  getAllProfiles(supabase),
  getAllFeedback(supabase),
  getFeedbackStats(supabase),
]);
setMetrics(metricsData);
setSuggestions(suggestionsData);
setProfiles(profilesData);
setFeedbacks(feedbacksData);
setFeedbackStats(feedbackStatsData);
```

**Step 4: Adicionar trigger da aba**

Na lista de `Tabs.Trigger`, após a aba "Usuarios":
```tsx
<Tabs.Trigger value="feedback" className={tabTriggerClass('feedback')}>
  <span className="flex items-center gap-2">
    <MessageSquare size={16} />
    Feedback
    {(feedbackStats?.new_today ?? 0) > 0 && (
      <span className="bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
        {feedbackStats!.new_today}
      </span>
    )}
  </span>
</Tabs.Trigger>
```

**Step 5: Adicionar conteúdo da aba**

Após o bloco `<Tabs.Content value="users">`, adicionar:
```tsx
<Tabs.Content value="feedback">
  <FeedbackList feedbacks={feedbacks} stats={feedbackStats} />
</Tabs.Content>
```

**Step 6: Commit**

```bash
git add components/admin/AdminDashboard.tsx
git commit -m "feat: add Feedback tab to AdminDashboard"
```

---

### Task 10: Commit geral + build check

**Step 1: Commitar changes anteriores ainda abertas (se houver)**

```bash
git add -A
git status
```

Verificar se há arquivos não commitados e fazer commit separado:
```bash
git commit -m "fix: cleanup uncommitted changes from previous session"
```

**Step 2: Rodar build para verificar**

```bash
npm run build
```

Esperado: sem erros de TypeScript ou build.

Se houver erros, corrigir antes de seguir.

**Step 3: Push para deploy**

```bash
git push origin main
```

Railway faz auto-deploy. Verificar em:
```bash
curl -s -o /dev/null -w "%{http_code}" https://eduquest-mvp-production.up.railway.app/
```

Esperado: `200`

---

## Checklist Final

- [ ] SQL executado no Supabase (Task 1)
- [ ] Types adicionados (Task 2)
- [ ] Queries adicionadas (Task 3)
- [ ] FeedbackModal criado (Task 4)
- [ ] FeedbackButton criado (Task 5)
- [ ] PostSessionFeedback criado (Task 6)
- [ ] FeedbackButton integrado no tutor e dashboard (Task 7)
- [ ] FeedbackList criado (Task 8)
- [ ] Aba Feedback no AdminDashboard (Task 9)
- [ ] Build OK + deploy (Task 10)
