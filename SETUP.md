# EduQuest MVP - Guia Completo de Setup

## Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

---

## Passo 1: Matar processos travados (se necessário)

```bash
killall node 2>/dev/null
```

---

## Passo 2: Instalar dependências

```bash
cd eduquest-mvp
npm install @supabase/supabase-js @supabase/ssr next-intl zustand recharts
```

Se travar ou der erro, tente:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm install @supabase/supabase-js @supabase/ssr next-intl zustand recharts
```

---

## Passo 3: Rodar o projeto

```bash
npm run dev
```

Abra http://localhost:3000 no navegador.

---

## O que já está pronto

### Banco de Dados (Supabase)
- Projeto: `eduquest` (gjckregnfklamhdfavyb)
- URL: https://gjckregnfklamhdfavyb.supabase.co
- 7 tabelas criadas: profiles, parent_kid_links, sessions, messages, user_stats, badges, study_goals
- Row Level Security (RLS) ativo em todas as tabelas
- Triggers automáticos:
  - Ao criar usuário → cria profile automaticamente
  - Ao criar profile → cria user_stats automaticamente
- Indexes de performance em sessions, messages, badges

### Credenciais (.env.local)
- ANTHROPIC_API_KEY ✅
- NEXT_PUBLIC_SUPABASE_URL ✅
- NEXT_PUBLIC_SUPABASE_ANON_KEY ✅

### Autenticação
- Login com email/senha (`/login`)
- Registro com escolha parent/kid (`/register`)
- Google OAuth (precisa configurar — veja Passo 4)
- Middleware protege rotas `/tutor` e `/parent/*`
- Hook `useAuth` com signUp, signIn, signInWithGoogle, signOut
- Callback OAuth em `/api/auth/callback`

### Rotas
| Rota | Descrição | Protegida |
|------|-----------|-----------|
| `/` | Landing page (redireciona se logado) | Não |
| `/login` | Login email/senha + Google | Não |
| `/register` | Registro parent ou kid | Não |
| `/tutor` | Chat com tutor IA (Socrático) | Sim |
| `/parent/dashboard` | Dashboard para pais | Sim |

### Funcionalidades implementadas
- **Tutor IA Socrático** — Claude com prompt adaptativo por idade (4-6, 7-9, 10-12, 13-15, 16-18)
- **Perfis comportamentais** — TDAH, ansiedade, superdotado (ajusta linguagem, timer, tentativas)
- **Upload de foto + OCR** — Envia foto do dever e Claude Vision extrai o texto
- **Gamificação** — XP (15 níveis), badges (13 tipos), streaks
- **Timer Pomodoro** — Ajustável por faixa etária (10-45 min)
- **Repetição espaçada** — Algoritmo SM-2 (Ebbinghaus)
- **Alertas para pais** — 7 tipos com ações recomendadas
- **Atividades recomendadas** — Para pais, por matéria e idade
- **i18n** — PT-BR e EN

---

## Passo 4 (Opcional): Habilitar Google OAuth

1. Acesse https://supabase.com/dashboard/project/gjckregnfklamhdfavyb/auth/providers
2. Ative o provider **Google**
3. No Google Cloud Console (https://console.cloud.google.com):
   - Crie um projeto OAuth
   - Adicione redirect URI: `https://gjckregnfklamhdfavyb.supabase.co/auth/v1/callback`
   - Copie Client ID e Client Secret
4. Cole as credenciais no Supabase

---

## Estrutura do Projeto

```
eduquest-mvp/
├── app/
│   ├── page.tsx                    # Landing page com redirect
│   ├── layout.tsx                  # Layout global
│   ├── globals.css                 # Estilos Tailwind
│   ├── login/page.tsx              # Página de login
│   ├── register/page.tsx           # Página de registro
│   ├── tutor/page.tsx              # Tutor IA (protegida)
│   ├── parent/dashboard/page.tsx   # Dashboard pais (protegida)
│   └── api/
│       ├── tutor/route.ts          # API do Claude (Socrático)
│       ├── ocr/route.ts            # API do Claude Vision (OCR)
│       └── auth/callback/route.ts  # OAuth callback
├── components/
│   ├── auth/                       # LoginForm, RegisterForm
│   ├── tutor/                      # ChatInterface, HomeworkSetup, PhotoUpload, etc.
│   ├── gamification/               # XPBar, StreakDisplay, BadgeCard
│   ├── parent/                     # AlertCard
│   └── layout/                     # Header
├── hooks/
│   ├── useAuth.ts                  # Autenticação Supabase
│   ├── useChatSession.ts           # Gerencia chat com Claude
│   └── usePomodoroTimer.ts         # Timer Pomodoro
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Supabase browser client
│   │   ├── server.ts               # Supabase server client
│   │   ├── middleware.ts            # Session refresh + route protection
│   │   └── queries.ts              # CRUD: profiles, sessions, messages, stats, badges
│   ├── auth/types.ts               # TypeScript types
│   ├── age/config.ts               # Configuração por faixa etária
│   ├── subjects/
│   │   ├── config.ts               # 7 matérias
│   │   └── prompts.ts              # System prompt evolutivo
│   ├── gamification/
│   │   ├── xp.ts                   # 15 níveis de XP
│   │   └── badges.ts               # 13 badges
│   ├── spaced-repetition/engine.ts # Algoritmo SM-2
│   ├── alerts/parent-alerts.ts     # 7 tipos de alertas
│   ├── activities/recommended.ts   # Atividades por matéria
│   └── i18n/
│       ├── config.ts               # Configuração i18n
│       └── translations/           # PT-BR e EN
├── middleware.ts                    # Next.js middleware (auth + routes)
├── supabase/migrations/
│   └── 001_initial_schema.sql      # Schema completo (já executado)
├── .env.local                      # Credenciais (já configurado)
└── package.json
```

---

## Problemas Comuns

### "Module not found: @supabase/ssr"
Rode: `npm install @supabase/supabase-js @supabase/ssr`

### Terminal travado
Rode em outro terminal: `killall node` e tente novamente

### Erro de SWC/platform
Delete `node_modules` e reinstale:
```bash
rm -rf node_modules .next package-lock.json
npm install
```

### Supabase "Invalid API key"
Verifique se `.env.local` tem as variáveis corretas e reinicie o dev server.
