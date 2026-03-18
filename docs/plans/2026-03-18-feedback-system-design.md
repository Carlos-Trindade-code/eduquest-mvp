# Sistema de Feedback — Design

**Data:** 2026-03-18
**Status:** Aprovado

## Visão Geral

Sistema para coletar avaliações e comentários dos usuários logados, com visualização exclusiva no painel admin (`/admin`), acessível apenas por `carlostrindade@me.com`.

## 1. Banco de Dados (Supabase)

### Nova tabela: `user_feedback`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid (PK) | Gerado automaticamente |
| `user_id` | uuid (FK profiles.auth_id) | Usuário que enviou |
| `rating` | int (1–5) | Avaliação por estrelas |
| `comment` | text | Comentário livre (opcional) |
| `source` | text | `floating_button` ou `post_session` |
| `created_at` | timestamptz | Data de criação |

### RLS
- `INSERT`: usuário autenticado pode inserir o próprio feedback
- `SELECT`: bloqueado para usuários comuns
- Admin acessa via RPC `get_all_feedback()` (SECURITY DEFINER)

### Novas RPCs
- `submit_feedback(rating, comment, source)` — insere feedback do usuário logado
- `get_all_feedback()` — retorna todos os feedbacks com nome/email do usuário (admin only)
- `get_feedback_stats()` — retorna contagens por rating e source

## 2. Botão Flutuante (`FeedbackButton`)

- Componente fixo no canto inferior direito (`fixed bottom-6 right-6`)
- Visível em todas as páginas logadas: `/tutor` e `/parent/dashboard`
- Abre modal com:
  - Rating interativo por estrelas (1–5, obrigatório)
  - Campo de comentário livre (opcional, max 500 chars)
  - Botão "Enviar" + botão "Cancelar"
- Após envio: animação de confirmação (checkmark verde), fecha modal automaticamente
- Não aparece em `/admin` nem em páginas públicas

## 3. Prompt Pós-Sessão (`PostSessionFeedback`)

- Aparece no tutor quando usuário encerra sessão de estudo
- Trigger: botão "Encerrar sessão" ou após 25min (fim do Pomodoro)
- UI: modal/drawer com contexto da matéria estudada ("Como foi sua sessão de Matemática?")
- Mesmo formulário do botão flutuante
- Opção "Agora não" para ignorar sem punição
- Não aparece mais de 1x por sessão

## 4. Nova Aba no Admin — "Feedback"

- Adicionada ao `AdminDashboard.tsx` como 4ª aba (Radix Tabs)
- Componente: `FeedbackList.tsx`
- Exibe tabela com colunas: Nome, Email, Rating (estrelas visuais), Comentário, Origem, Data
- Filtros: por rating (1–5) e por source (botão flutuante / pós-sessão)
- Badge na aba com contagem de feedbacks novos (últimas 24h)
- Ordenação: mais recentes primeiro

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/004_user_feedback.sql` | Criar |
| `components/feedback/FeedbackButton.tsx` | Criar |
| `components/feedback/FeedbackModal.tsx` | Criar |
| `components/feedback/PostSessionFeedback.tsx` | Criar |
| `components/admin/FeedbackList.tsx` | Criar |
| `components/admin/AdminDashboard.tsx` | Modificar (adicionar aba) |
| `app/tutor/page.tsx` | Modificar (adicionar FeedbackButton + PostSessionFeedback) |
| `app/parent/dashboard/page.tsx` | Modificar (adicionar FeedbackButton) |
| `lib/supabase/queries.ts` | Modificar (adicionar funções de feedback) |
