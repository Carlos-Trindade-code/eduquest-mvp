# Studdo (ex-EduQuest) MVP — Guia Completo do Projeto

## Visao Geral
Studdo e uma plataforma educacional para criancas de 4-18 anos com tutor IA usando metodo socratico.
O sistema tem tres tipos de usuario: **pais** (parent), **criancas** (kid) e **admin** (oculto).
Pais e criancas sao conectados por codigos de convite. O admin acessa dashboard oculto via email.

## Stack Tecnica
- **Framework**: Next.js 16.1.6 com React 19, TypeScript
- **Estilizacao**: Tailwind CSS 4
- **Animacoes**: Framer Motion 12
- **UI Components**: Radix UI (Avatar, Dialog, Progress, Tabs, Tooltip)
- **Auth + DB**: Supabase (PostgreSQL, Auth, RLS, RPC functions)
- **IA**: Google Gemini (`@google/genai` com modelo `gemini-2.5-flash-lite`)
- **Graficos**: Recharts
- **Deploy**: Railway (auto-deploy via GitHub push para branch `main`)

## URLs e Credenciais

### Producao
- **URL do app**: https://eduquest-mvp-production.up.railway.app
- **Dominio customizado**: www.studdo.com.br (pendente configuracao DNS)
- **Railway project**: tender-purpose (project ID: b786bbcb-a443-4a00-9f34-157056bd9542)
- **GitHub repo**: https://github.com/Carlos-Trindade-code/eduquest-mvp

### Supabase
- **Project**: eduquest (org: Carlos-Trindade-Mentoring)
- **Credenciais**: ver `.env.local` (nao commitar!)
- **Site URL configurado**: https://eduquest-mvp-production.up.railway.app
- **Redirect URLs**: producao/** e localhost:3000/**

### Variaveis de Ambiente (Railway + .env.local)
- `GEMINI_API_KEY` — chave da API Google Gemini (ver .env.local)
- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase (ver .env.local)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — chave publica Supabase (ver .env.local)
- Railway tambem gera automaticamente: PORT, RAILWAY_* vars
- **NUNCA commitar credenciais reais no repositorio!**

### Deploy
- Railway detecta automaticamente pushes na branch `main`
- Usa Nixpacks para build (nao Dockerfile)
- O app roda na porta 8080 (PORT do Railway)
- Arquivo `nixpacks.toml` presente mas Railway sobrescreve PORT

## Estrutura do Projeto

```
eduquest-mvp/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout raiz com metadata "Studdo"
│   ├── page.tsx                 # Landing page (Hero, Features, Ages, HowItWorks, FAQ, Footer)
│   ├── login/page.tsx           # Pagina de login
│   ├── register/page.tsx        # Pagina de registro (com redeem invite code)
│   ├── onboarding/page.tsx      # Onboarding pos-registro
│   ├── tutor/page.tsx           # Tutor IA (pagina principal para kids)
│   ├── tutorial/page.tsx        # Pagina interativa "Como Usar" com animacoes
│   ├── parent/dashboard/page.tsx # Dashboard do pai
│   ├── admin/page.tsx           # Dashboard admin (OCULTO — so carlostrindade@me.com)
│   └── api/
│       ├── auth/callback/route.ts # OAuth callback com role-based redirect
│       ├── tutor/route.ts        # API do tutor IA (Gemini)
│       ├── ocr/route.ts          # API de OCR para fotos (Gemini Vision)
│       ├── faq/route.ts          # API FAQ com IA (Gemini)
│       └── suggestions/route.ts  # API para salvar sugestoes
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx        # Form de login (com esqueci senha)
│   │   └── RegisterForm.tsx     # Form de registro (com invite code para kids)
│   ├── onboarding/
│   │   └── WelcomeFlow.tsx      # Onboarding diferenciado parent vs kid
│   ├── tutor/
│   │   ├── TutorChat.tsx        # Chat com tutor IA
│   │   ├── MessageBubble.tsx    # Bolha de mensagem
│   │   ├── SubjectSelector.tsx  # Seletor de materia
│   │   └── PomodoroTimer.tsx    # Timer Pomodoro integrado ao tutor
│   ├── parent/
│   │   ├── InviteCodeCard.tsx   # Card com codigo de convite
│   │   ├── KidProgress.tsx      # Progresso do filho
│   │   └── ...                  # Outros componentes parent
│   ├── gamification/
│   │   ├── XPBar.tsx            # Barra de XP
│   │   ├── StreakCounter.tsx    # Contador de sequencia
│   │   └── AchievementBadge.tsx # Badge de conquista
│   ├── landing/
│   │   ├── Navbar.tsx           # Navbar com links e marca "Studdo"
│   │   ├── HeroSection.tsx      # Hero com CTA
│   │   ├── FeaturesSection.tsx  # Secao de funcionalidades
│   │   ├── AgeGroupsSection.tsx # Faixas etarias
│   │   ├── HowItWorksSection.tsx # Como funciona
│   │   ├── FAQSection.tsx       # FAQ com IA + Sugestoes (NOVO)
│   │   └── Footer.tsx           # Rodape
│   ├── tutorial/
│   │   ├── TutorialPage.tsx     # Pagina tutorial interativa com 5 passos
│   │   ├── DemoChatSimulation.tsx # Simulacao de chat animado
│   │   └── XPAnimation.tsx      # Animacao de XP e badges
│   ├── admin/
│   │   ├── AdminDashboard.tsx   # Dashboard admin com Radix Tabs
│   │   ├── MetricsCards.tsx     # Cards de metricas (usuarios, sessoes, etc.)
│   │   ├── SuggestionsList.tsx  # Lista de sugestoes com gestao de status
│   │   └── UsersTable.tsx       # Tabela de todos os usuarios
│   ├── illustrations/
│   │   ├── MascotOwl.tsx        # Coruja mascote "Edu" com expressoes
│   │   └── HeroIllustration.tsx # Ilustracao do hero
│   ├── layout/
│   │   └── Header.tsx           # Header do tutor com marca "Studdo" e Pomodoro
│   └── ui/                      # Componentes UI reutilizaveis (shadcn-style)
├── hooks/
│   └── useAuth.ts               # Hook de autenticacao (login, register, logout, resetPassword)
├── lib/
│   ├── auth/types.ts            # Interfaces: Profile, UserType, Suggestion, AdminMetrics
│   ├── ai/provider.ts           # Provider Google Gemini (generateTutorResponse)
│   ├── design/animations.ts     # Animacoes Framer Motion reutilizaveis
│   ├── subjects/prompts.ts      # System prompts do tutor por materia e idade
│   ├── alerts/parent-alerts.ts  # Alertas inteligentes para pais
│   ├── i18n/translations/       # Traducoes pt-BR e en
│   └── supabase/
│       ├── client.ts            # Cliente Supabase (browser)
│       ├── server.ts            # Cliente Supabase (server) — createServerSupabaseClient
│       ├── middleware.ts        # Middleware com role-based redirect + protecao admin
│       └── queries.ts           # Queries: getProfile, getLinkedKids, redeemInviteCode, admin queries, etc.
├── supabase/migrations/
│   ├── 001_initial_schema.sql   # Schema inicial (profiles, subjects, sessions, etc.)
│   ├── 002_invite_codes.sql     # Sistema de invite codes
│   └── 003_faq_suggestions_admin.sql # Tabela suggestions + RPCs admin (EXECUTAR NO SUPABASE)
├── .env.example                 # Template de variaveis de ambiente
├── nixpacks.toml                # Config Nixpacks para Railway
├── next.config.ts               # Config Next.js
└── package.json                 # Dependencias
```

## Banco de Dados (Supabase PostgreSQL)

### Tabelas Principais
- **profiles**: auth_id, name, email, user_type (parent/kid), avatar_url, xp, level, streak_days, invite_code
- **subjects**: id, name, icon, color, description
- **tutor_sessions**: id, kid_id, subject_id, messages (JSONB), xp_earned, started_at, ended_at
- **parent_kid_links**: parent_id, kid_id (liga pais a filhos via invite code)
- **achievements**: id, name, description, icon, xp_reward, criteria
- **kid_achievements**: kid_id, achievement_id, unlocked_at
- **suggestions**: id, user_id, user_name, user_email, content, status (pending/read/done), admin_notes, created_at

### Funcoes RPC (SECURITY DEFINER)
- `handle_new_user()`: Trigger que cria profile + gera invite code para parents
- `generate_invite_code()`: Gera codigo EQ-XXXX unico
- `redeem_invite_code(code)`: Kid usa codigo do pai para criar link
- `get_admin_metrics()`: Retorna JSON com metricas globais (total_users, total_kids, total_parents, total_sessions, active_today, total_suggestions, pending_suggestions)
- `get_all_suggestions()`: Lista todas sugestoes (admin)
- `update_suggestion_status(suggestion_id, new_status, notes)`: Atualiza status de sugestao (admin)

### RLS (Row Level Security)
- Ativado em todas as tabelas
- Policies para: leitura propria, leitura de filhos pelo pai, etc.
- Suggestions: qualquer um pode INSERT, usuarios veem as proprias

### Migracao Pendente (003)
**IMPORTANTE**: O arquivo `supabase/migrations/003_faq_suggestions_admin.sql` precisa ser executado manualmente no Supabase SQL Editor para criar a tabela `suggestions` e as RPCs admin.

## Sistema de Invite Codes
1. Pai se registra → trigger gera `EQ-XXXX` automaticamente
2. Pai ve o codigo no onboarding e no dashboard
3. Kid se registra e insere o codigo → `redeem_invite_code()` cria o link
4. Pai ve o kid no dashboard

## Autenticacao
- Email + senha via Supabase Auth
- `user_metadata.user_type` define se e parent ou kid
- Middleware redireciona por role: parent→/parent/dashboard, kid→/tutor
- Rota `/admin` protegida por email hardcoded (`carlostrindade@me.com`) no middleware
- Esqueci senha via `resetPasswordForEmail()`

## Admin Dashboard (/admin)
- **OCULTO**: Nao aparece em nenhum menu, navbar ou link
- **Acesso**: somente `carlostrindade@me.com` (verificado no middleware + client-side)
- **Dupla protecao**: middleware bloqueia no servidor + componente verifica no cliente
- **3 abas** (Radix Tabs):
  - **Visao Geral**: Cards com metricas (total usuarios, kids, parents, sessoes, ativos hoje, sugestoes pendentes)
  - **Sugestoes**: Lista interativa com filtro por status, botoes marcar como lida/concluida, campo de notas
  - **Usuarios**: Tabela de todos os profiles com tipo, XP, nivel, streak, data de criacao

## FAQ + Sugestoes (Landing Page)
- **Secao FAQ** no final da landing page com 3 partes:
  - A) Accordion com 6 perguntas pre-definidas (animado)
  - B) "Pergunte ao Edu" — input + IA (Gemini) responde em tempo real
  - C) Formulario de sugestao — nome/email (opcional) + texto → salva no Supabase

## Tutorial Interativo (/tutorial)
- Pagina WOW com animacoes Framer Motion
- 5 passos interativos:
  1. Escolha de idade (cards animados)
  2. Escolha de materia (grid de disciplinas)
  3. Envio de tarefa (foto, upload, digitacao)
  4. Chat demo simulado (mensagens aparecem uma a uma)
  5. Gamificacao (XP bar animada + badge unlock com confetti)
- Secao bonus: Pomodoro (25min foco, 5min pausa)
- CTA final para criar conta

## Tutor IA (Gemini)
- Modelo: `gemini-2.5-flash-lite`
- System prompt com metodo socratico (nao da resposta direta, faz perguntas guiadas)
- Adaptado por faixa etaria e materia
- Suporta envio de fotos (OCR via Gemini Vision — migrado de Anthropic)
- Timer Pomodoro integrado (25min estudo / 5min pausa)
- API route: `/api/tutor`
- API OCR: `/api/ocr` (processa imagens com Gemini Vision)

## Gamificacao
- XP por interacao com tutor
- Niveis (1-100)
- Streak de dias consecutivos
- Achievements/badges
- Graficos de progresso (Recharts)

## Visual / Design System
- Tema dark com gradientes roxo/azul
- Glass morphism (cards com backdrop-blur)
- Animacoes suaves com Framer Motion
- Mascote: coruja "Edu" com 6 expressoes (celebrating, thinking, encouraging, waving, reading, sad)
- IMPORTANTE: usar `variants` prop no Framer Motion, NAO spread de variants (causa bug com atributo HTML `hidden`)

## Comandos Uteis
```bash
# Desenvolvimento local
npm run dev

# Build
npm run build

# Deploy (automatico via git push)
git add . && git commit -m "mensagem" && git push origin main

# Testar se producao esta online
curl -s -o /dev/null -w "%{http_code}" https://eduquest-mvp-production.up.railway.app/
```

## Historico de Implementacao

### Sessao 1: Base do MVP
- Setup Next.js 16 + Supabase + Tailwind CSS 4
- Sistema de auth (login, registro, esqueci senha)
- Tutor IA com Anthropic Claude (depois migrado para Gemini)
- Gamificacao (XP, niveis, streaks, badges)
- Dashboard pais (graficos, alertas, invite code)
- Landing page completa (Hero, Features, Ages, HowItWorks, Footer)
- Deploy Railway + config Supabase

### Sessao 2: Polimento + Features
- Correcao de bugs visuais e de auth
- Sistema de invite codes (EQ-XXXX)
- Migracao Anthropic → Google Gemini (tutor + OCR)
- Timer Pomodoro integrado ao chat
- Pagina tutorial interativa (/tutorial)
- Correcao de seguranca (credenciais expostas no git)

### Sessao 3: FAQ + Admin + Rebrand (atual)
- FAQ com IA na landing page (Gemini)
- Formulario de sugestoes (Supabase)
- Dashboard admin oculto (/admin) — email-locked
- Metricas, gestao de sugestoes, tabela de usuarios
- Rename EduQuest → Studdo em todo o codebase
- Migracao SQL 003 (suggestions + RPCs admin)

## Pendencias / Proximos Passos
1. **EXECUTAR SQL**: Rodar `003_faq_suggestions_admin.sql` no Supabase SQL Editor
2. **Dominio**: Configurar www.studdo.com.br no Railway + DNS no registro.br
3. **Pagamento**: Integrar Stripe para planos premium
4. **Email templates**: Customizar emails do Supabase
5. **PWA**: manifest.json para instalar como app
6. **Upload de material**: Aba para enviar PDFs/imagens com conteudo para estudo
7. **Prompt pos-estudo**: Perguntar "quer continuar avancando?" ao fim da sessao
8. **Testes**: Jest + React Testing Library
9. **Modo offline**: Service worker
