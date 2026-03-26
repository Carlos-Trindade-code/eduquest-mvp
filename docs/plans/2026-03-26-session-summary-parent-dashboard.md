# Session Summary + Parent Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When a student finishes a study session, the AI generates a detailed summary (topics, strengths, difficulties, next-step suggestions). Parents see these summaries in an enhanced dashboard with timeline, filters, full chat transcripts, and AI-generated follow-up suggestions.

**Architecture:** New `session_summaries` table stores AI-generated summaries linked to sessions. A new API route `/api/session-summary` calls Gemini to analyze the full conversation. The parent dashboard gets a new "Sessoes" tab with timeline view, expandable session cards, and subject/date filters. The finish button moves to the header for constant visibility.

**Tech Stack:** Next.js 16 (App Router), Supabase (Postgres + RLS + RPCs), Google Gemini (`gemini-2.5-flash-lite`), Framer Motion, Recharts, Radix UI Tabs, Tailwind CSS 4.

---

### Task 1: Database Migration — `session_summaries` table + RPCs

**Files:**
- Create: `supabase/migrations/008_session_summaries.sql`

**Step 1: Write the migration SQL**

```sql
-- Migration 008: Session summaries for AI-generated post-session reports

-- 1. Table
CREATE TABLE IF NOT EXISTS session_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  kid_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  topics_covered TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  difficulties TEXT[] DEFAULT '{}',
  ai_suggestion TEXT,
  parent_tip TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id)
);

-- 2. RLS
ALTER TABLE session_summaries ENABLE ROW LEVEL SECURITY;

-- Kids can read their own summaries
CREATE POLICY "Kids read own summaries"
  ON session_summaries FOR SELECT
  USING (kid_id = auth.uid());

-- Parents can read their linked kids' summaries
CREATE POLICY "Parents read linked kids summaries"
  ON session_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_kid_links
      WHERE parent_id = auth.uid() AND kid_id = session_summaries.kid_id
    )
  );

-- Service role inserts (via API route)
CREATE POLICY "Service insert summaries"
  ON session_summaries FOR INSERT
  WITH CHECK (kid_id = auth.uid());

-- 3. RPC: Get kid session summaries (for parent dashboard)
CREATE OR REPLACE FUNCTION get_kid_session_summaries(
  p_kid_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_subject TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  session_id UUID,
  kid_id UUID,
  subject TEXT,
  duration_minutes INTEGER,
  message_count INTEGER,
  xp_earned INTEGER,
  topics_covered TEXT[],
  strengths TEXT[],
  difficulties TEXT[],
  ai_suggestion TEXT,
  parent_tip TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is parent of this kid
  IF NOT EXISTS (
    SELECT 1 FROM parent_kid_links
    WHERE parent_id = auth.uid() AND kid_id = p_kid_id
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
    SELECT ss.*
    FROM session_summaries ss
    WHERE ss.kid_id = p_kid_id
      AND (p_subject IS NULL OR ss.subject = p_subject)
    ORDER BY ss.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION get_kid_session_summaries(UUID, INTEGER, INTEGER, TEXT) TO authenticated;

-- 4. RPC: Get session messages for parent view
CREATE OR REPLACE FUNCTION get_session_messages_for_parent(p_session_id UUID)
RETURNS TABLE (
  id UUID,
  role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_kid_id UUID;
BEGIN
  SELECT s.kid_id INTO v_kid_id FROM sessions s WHERE s.id = p_session_id;

  IF NOT EXISTS (
    SELECT 1 FROM parent_kid_links
    WHERE parent_id = auth.uid() AND kid_id = v_kid_id
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
    SELECT m.id, m.role, m.content, m.created_at
    FROM messages m
    WHERE m.session_id = p_session_id
    ORDER BY m.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_session_messages_for_parent(UUID) TO authenticated;

-- 5. RPC: Parent dashboard stats (enhanced)
CREATE OR REPLACE FUNCTION get_kid_study_stats(p_kid_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM parent_kid_links
    WHERE parent_id = auth.uid() AND kid_id = p_kid_id
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT json_build_object(
    'total_sessions', (SELECT count(*) FROM sessions WHERE kid_id = p_kid_id AND ended_at IS NOT NULL),
    'total_minutes', (SELECT coalesce(sum(duration_minutes), 0) FROM sessions WHERE kid_id = p_kid_id),
    'total_xp', (SELECT coalesce(total_xp, 0) FROM user_stats WHERE user_id = p_kid_id),
    'current_streak', (SELECT coalesce(current_streak, 0) FROM user_stats WHERE user_id = p_kid_id),
    'subjects_studied', (SELECT count(DISTINCT subject) FROM sessions WHERE kid_id = p_kid_id),
    'avg_session_minutes', (SELECT coalesce(avg(duration_minutes)::int, 0) FROM sessions WHERE kid_id = p_kid_id WHERE duration_minutes > 0),
    'sessions_this_week', (SELECT count(*) FROM sessions WHERE kid_id = p_kid_id AND created_at >= now() - interval '7 days'),
    'top_difficulties', (
      SELECT coalesce(array_agg(DISTINCT d), '{}')
      FROM session_summaries ss, unnest(ss.difficulties) d
      WHERE ss.kid_id = p_kid_id AND ss.created_at >= now() - interval '30 days'
      LIMIT 5
    )
  )::jsonb INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_kid_study_stats(UUID) TO authenticated;
```

**Step 2: Apply migration to Supabase**

Run via Supabase MCP `apply_migration` or `execute_sql`.

**Step 3: Commit**

```bash
git add supabase/migrations/008_session_summaries.sql
git commit -m "feat: migration 008 — session_summaries table + parent RPCs"
```

---

### Task 2: Types + Query Functions

**Files:**
- Modify: `lib/auth/types.ts` (add new types)
- Modify: `lib/supabase/queries.ts` (add new query functions)

**Step 1: Add types to `lib/auth/types.ts`**

Add after existing types:

```typescript
export interface SessionSummary {
  id: string;
  session_id: string;
  kid_id: string;
  subject: string;
  duration_minutes: number;
  message_count: number;
  xp_earned: number;
  topics_covered: string[];
  strengths: string[];
  difficulties: string[];
  ai_suggestion: string | null;
  parent_tip: string | null;
  created_at: string;
}

export interface KidStudyStats {
  total_sessions: number;
  total_minutes: number;
  total_xp: number;
  current_streak: number;
  subjects_studied: number;
  avg_session_minutes: number;
  sessions_this_week: number;
  top_difficulties: string[];
}
```

**Step 2: Add query functions to `lib/supabase/queries.ts`**

```typescript
export async function saveSessionSummary(
  supabase: SupabaseClient,
  summary: Omit<SessionSummary, 'id' | 'created_at'>
) {
  return supabase.from('session_summaries').insert(summary).select().single();
}

export async function getKidSessionSummaries(
  supabase: SupabaseClient,
  kidId: string,
  options?: { limit?: number; offset?: number; subject?: string }
) {
  return supabase.rpc('get_kid_session_summaries', {
    p_kid_id: kidId,
    p_limit: options?.limit ?? 20,
    p_offset: options?.offset ?? 0,
    p_subject: options?.subject ?? null,
  });
}

export async function getSessionMessagesForParent(
  supabase: SupabaseClient,
  sessionId: string
) {
  return supabase.rpc('get_session_messages_for_parent', {
    p_session_id: sessionId,
  });
}

export async function getKidStudyStats(
  supabase: SupabaseClient,
  kidId: string
) {
  return supabase.rpc('get_kid_study_stats', { p_kid_id: kidId });
}
```

**Step 3: Commit**

```bash
git add lib/auth/types.ts lib/supabase/queries.ts
git commit -m "feat: types and queries for session summaries + parent stats"
```

---

### Task 3: API Route — `/api/session-summary`

**Files:**
- Create: `app/api/session-summary/route.ts`

**Step 1: Create the API route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GEMINI_KEY = process.env.GEMINI_API_KEY;

interface SummaryRequest {
  messages: { role: string; content: string }[];
  subject: string;
  ageGroup: string;
  durationMinutes: number;
  xpEarned: number;
}

const SYSTEM_PROMPT = `Você é o Edu, tutor IA do Studdo. Analise a conversa de estudo abaixo e gere um resumo estruturado em JSON.

Retorne APENAS um JSON válido (sem markdown, sem backticks) com esta estrutura:
{
  "topics_covered": ["tópico 1", "tópico 2"],
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "difficulties": ["dificuldade 1"],
  "ai_suggestion": "Sugestão para o aluno sobre o que estudar em seguida",
  "parent_tip": "Dica para os pais sobre como ajudar no acompanhamento"
}

Regras:
- topics_covered: liste os tópicos específicos estudados (max 5)
- strengths: o que o aluno demonstrou dominar (max 3)
- difficulties: onde o aluno teve dificuldade ou erro (max 3, pode ser vazio se nenhuma)
- ai_suggestion: frase curta e encorajadora para o aluno (max 2 frases)
- parent_tip: dica prática para os pais acompanharem o progresso (max 2 frases)
- Use linguagem simples e positiva
- Seja específico sobre os tópicos, não genérico`;

export async function POST(request: NextRequest) {
  try {
    const body: SummaryRequest = await request.json();
    const { messages, subject, ageGroup, durationMinutes, xpEarned } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    if (!GEMINI_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
    }

    const conversationText = messages
      .map((m) => `${m.role === 'user' ? 'Aluno' : 'Edu'}: ${m.content}`)
      .join('\n');

    const prompt = `Matéria: ${subject}
Faixa etária: ${ageGroup}
Duração: ${durationMinutes} minutos
XP ganho: ${xpEarned}
Número de mensagens: ${messages.length}

Conversa:
${conversationText}`;

    const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
      },
    });

    const text = response.text?.trim() ?? '';

    // Parse JSON from response (handle potential markdown wrapping)
    let parsed;
    try {
      const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      // Fallback if AI returns invalid JSON
      parsed = {
        topics_covered: [subject],
        strengths: ['Dedicação ao estudo'],
        difficulties: [],
        ai_suggestion: 'Continue praticando! Você está no caminho certo.',
        parent_tip: `Seu filho estudou ${subject} por ${durationMinutes} minutos hoje.`,
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Session summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add app/api/session-summary/route.ts
git commit -m "feat: API route for AI-generated session summaries"
```

---

### Task 4: Finish Button in Header

**Files:**
- Modify: `components/layout/Header.tsx` (add finish button)
- Modify: `app/tutor/page.tsx` (pass finish callback to Header)
- Modify: `components/tutor/ChatInterface.tsx` (remove old finish button, expose finish via prop)

**Step 1: Add `onFinishSession` prop to Header**

In `components/layout/Header.tsx`, add a prop and render a finish button next to PomodoroTimer:

```typescript
// Add to Header props
interface HeaderProps {
  onTimerComplete?: () => void;
  onFinishSession?: () => void;
  showFinish?: boolean;
}
```

Add button in the header bar (next to Pomodoro):

```tsx
{showFinish && (
  <motion.button
    onClick={onFinishSession}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
    style={{
      background: 'rgba(239,68,68,0.15)',
      border: '1px solid rgba(239,68,68,0.3)',
      color: '#EF4444',
    }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Square size={12} fill="currentColor" />
    Finalizar
  </motion.button>
)}
```

**Step 2: Wire up in `app/tutor/page.tsx`**

Pass `onFinishSession` and `showFinish` from ChatInterface state up to Header. Use a ref or state lifted to TutorPage.

**Step 3: Remove old finish button from `ChatInterface.tsx`**

Remove the `messages.length > 6` conditional button block (lines 336-347).

**Step 4: Commit**

```bash
git add components/layout/Header.tsx app/tutor/page.tsx components/tutor/ChatInterface.tsx
git commit -m "feat: always-visible finish button in header"
```

---

### Task 5: Enhanced Session Summary with AI

**Files:**
- Modify: `components/tutor/SessionSummary.tsx` (major rewrite)
- Modify: `components/tutor/ChatInterface.tsx` (call summary API on finish)
- Modify: `hooks/useChatSession.ts` (expose messages for summary)

**Step 1: Update ChatInterface to generate summary on finish**

In `handleFinishSession`, after calling `finishSession()`:

```typescript
const handleFinishSession = async () => {
  const sessionData = await finishSession();
  setSessionMessageCount(messages.filter((m) => m.role === 'user').length);

  // Generate AI summary
  try {
    const res = await fetch('/api/session-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        subject,
        ageGroup,
        durationMinutes: sessionData?.durationMinutes ?? 0,
        xpEarned: sessionXp,
      }),
    });
    const summaryData = await res.json();
    setSummaryResult(summaryData);

    // Save to database
    if (profile?.id && sessionData?.sessionId) {
      const supabase = createClient();
      await saveSessionSummary(supabase, {
        session_id: sessionData.sessionId,
        kid_id: profile.id,
        subject,
        duration_minutes: sessionData.durationMinutes ?? 0,
        message_count: messages.length,
        xp_earned: sessionXp,
        topics_covered: summaryData.topics_covered ?? [],
        strengths: summaryData.strengths ?? [],
        difficulties: summaryData.difficulties ?? [],
        ai_suggestion: summaryData.ai_suggestion ?? null,
        parent_tip: summaryData.parent_tip ?? null,
      });
    }
  } catch {
    // Fallback — show summary without AI
    setSummaryResult(null);
  }

  if (isGuest) incrementTrialCount();
  setShowSummary(true);
};
```

**Step 2: Rewrite `SessionSummary.tsx`**

Enhanced version with:
- Loading state while AI generates summary
- Topics covered as tags
- Strengths (green) and difficulties (amber) lists
- AI suggestion card
- Keep existing XP/streak/confetti animations
- "Estudar outra matéria" + "Encerrar" buttons

```tsx
interface SessionSummaryProps {
  xpEarned: number;
  messageCount: number;
  subject: string;
  durationMinutes: number;
  summaryResult: {
    topics_covered: string[];
    strengths: string[];
    difficulties: string[];
    ai_suggestion: string;
    parent_tip: string;
  } | null;
  onNewSession: () => void;
  isGuest?: boolean;
}
```

**Step 3: Commit**

```bash
git add components/tutor/SessionSummary.tsx components/tutor/ChatInterface.tsx hooks/useChatSession.ts
git commit -m "feat: AI-generated session summary on finish"
```

---

### Task 6: Parent Dashboard — Session Timeline Component

**Files:**
- Create: `components/parent/SessionTimeline.tsx`

**Step 1: Build the timeline component**

A scrollable timeline of session cards showing:
- Subject icon + name
- Date/time
- Duration
- XP earned
- AI summary preview (topics as tags)
- Expand button → full details

**Step 2: Add subject filter bar**

Horizontal scrollable chips: "Todas", "Matematica", "Portugues", etc.

**Step 3: Add date range filter**

"Ultima semana", "Ultimo mes", "Todos"

**Step 4: Commit**

```bash
git add components/parent/SessionTimeline.tsx
git commit -m "feat: session timeline component for parent dashboard"
```

---

### Task 7: Parent Dashboard — Session Detail Expanded View

**Files:**
- Create: `components/parent/SessionDetail.tsx`

**Step 1: Build expandable detail view**

When parent clicks a session card, it expands to show:
- Full AI summary (topics, strengths, difficulties)
- AI suggestion for the student
- Parent tip (highlighted card)
- "Ver conversa completa" button
- Full chat transcript (collapsible, loads via `getSessionMessagesForParent`)

Messages rendered as:
- Student messages (right, purple bubble)
- Edu messages (left, dark bubble)

**Step 2: Commit**

```bash
git add components/parent/SessionDetail.tsx
git commit -m "feat: session detail view with chat transcript for parents"
```

---

### Task 8: Parent Dashboard — Enhanced Stats Cards + Charts

**Files:**
- Create: `components/parent/StudyStatsCards.tsx`
- Create: `components/parent/DifficultyChart.tsx`
- Modify: `components/parent/charts/SubjectsChart.tsx` (if needed)

**Step 1: Build enhanced stats cards**

6 stat cards in a 3x2 grid:
- Total sessoes
- Tempo total de estudo
- XP total
- Streak atual
- Materias estudadas
- Sessoes esta semana

**Step 2: Build difficulty radar/chart**

Using Recharts, show a simple bar chart of top difficulties across sessions (from `top_difficulties` in stats).

**Step 3: Commit**

```bash
git add components/parent/StudyStatsCards.tsx components/parent/DifficultyChart.tsx
git commit -m "feat: enhanced stats cards + difficulty chart for parents"
```

---

### Task 9: Parent Dashboard Page — Integrate Everything

**Files:**
- Modify: `app/parent/dashboard/page.tsx` (major update)

**Step 1: Restructure with Radix Tabs**

3 tabs:
- **Visao Geral** — Enhanced stats cards + existing charts (sessions/day, subjects)
- **Sessoes** — SessionTimeline with filters + SessionDetail expansion
- **Conquistas** — Existing badges section

**Step 2: Load new data**

```typescript
// Load session summaries for selected kid
const { data: summaries } = await getKidSessionSummaries(supabase, selectedKidId);
const { data: studyStats } = await getKidStudyStats(supabase, selectedKidId);
```

**Step 3: Add "new session" indicator**

Badge/dot on the "Sessoes" tab when there are summaries newer than last visit.

**Step 4: Commit**

```bash
git add app/parent/dashboard/page.tsx
git commit -m "feat: enhanced parent dashboard with session timeline + stats"
```

---

### Task 10: Apply SQL + Test Full Flow + Final Commit

**Step 1: Apply migration 008 to Supabase**

Via Supabase MCP `execute_sql` or `apply_migration`.

**Step 2: Test full flow**

1. Login as kid → start session → chat → click Finalizar
2. Verify AI summary appears with topics/strengths/difficulties
3. Verify summary saved in `session_summaries` table
4. Login as parent → go to dashboard → verify "Sessoes" tab shows timeline
5. Click a session → verify detail view + chat transcript
6. Verify stats cards show correct data

**Step 3: Build verification**

```bash
npm run build
```

**Step 4: Final commit + push**

```bash
git push origin main
```
