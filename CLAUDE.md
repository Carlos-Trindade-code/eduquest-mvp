# Studdo (ex-EduQuest) MVP — Guia Completo do Projeto

## Visao Geral
Studdo e uma plataforma educacional para criancas de 4-18 anos com tutor IA usando metodo socratico.
O sistema tem dois tipos de usuario: **pais** (parent) e **criancas** (kid), conectados por codigos de convite.

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
- O app roda na porta 8080 (PORT do Railway) — dominio configurado para 8080
- Arquivo `nixpacks.toml` presente mas Railway sobrescreve PORT

## Estrutura do Projeto

```
eduquest-mvp/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout raiz com metadata
│   ├── page.tsx                 # Landing page
│   ├── login/page.tsx           # Pagina de login
│   ├── register/page.tsx        # Pagina de registro (com redeem invite code)
│   ├── onboarding/page.tsx      # Onboarding pos-registro
│   ├── tutor/page.tsx           # Tutor IA (pagina principal para kids)
│   ├── parent/dashboard/page.tsx # Dashboard do pai
│   └── api/
│       ├── auth/callback/route.ts # OAuth callback com role-based redirect
│       ├── tutor/route.ts        # API do tutor IA (Gemini)
│       └── ocr/route.ts          # API de OCR para fotos
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx        # Form de login (com esqueci senha)
│   │   └── RegisterForm.tsx     # Form de registro (com invite code para kids)
│   ├── onboarding/
│   │   └── WelcomeFlow.tsx      # Onboarding diferenciado parent vs kid
│   ├── tutor/
│   │   ├── TutorChat.tsx        # Chat com tutor IA
│   │   ├── MessageBubble.tsx    # Bolha de mensagem
│   │   └── SubjectSelector.tsx  # Seletor de materia
│   ├── parent/
│   │   ├── InviteCodeCard.tsx   # Card com codigo de convite
│   │   ├── KidProgress.tsx      # Progresso do filho
│   │   └── ...                  # Outros componentes parent
│   ├── gamification/
│   │   ├── XPBar.tsx            # Barra de XP
│   │   ├── StreakCounter.tsx    # Contador de sequencia
│   │   └── AchievementBadge.tsx # Badge de conquista
│   └── ui/                      # Componentes UI reutilizaveis (shadcn-style)
├── hooks/
│   └── useAuth.ts               # Hook de autenticacao (login, register, logout, resetPassword)
├── lib/
│   ├── auth/types.ts            # Interface Profile com invite_code
│   └── supabase/
│       ├── client.ts            # Cliente Supabase (browser)
│       ├── server.ts            # Cliente Supabase (server)
│       ├── middleware.ts        # Middleware com role-based redirect
│       └── queries.ts           # Queries: getProfile, getLinkedKids, redeemInviteCode, getInviteCode, etc.
├── supabase/migrations/
│   ├── 001_initial_schema.sql   # Schema inicial (profiles, subjects, sessions, etc.)
│   └── 002_invite_codes.sql     # Sistema de invite codes
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

### Funcoes RPC (SECURITY DEFINER)
- `handle_new_user()`: Trigger que cria profile + gera invite code para parents
- `generate_invite_code()`: Gera codigo EQ-XXXX unico
- `redeem_invite_code(code)`: Kid usa codigo do pai para criar link

### RLS (Row Level Security)
- Ativado em todas as tabelas
- Policies para: leitura propria, leitura de filhos pelo pai, etc.

## Sistema de Invite Codes
1. Pai se registra → trigger gera `EQ-XXXX` automaticamente
2. Pai ve o codigo no onboarding e no dashboard
3. Kid se registra e insere o codigo → `redeem_invite_code()` cria o link
4. Pai ve o kid no dashboard

## Autenticacao
- Email + senha via Supabase Auth
- `user_metadata.user_type` define se e parent ou kid
- Middleware redireciona por role: parent→/parent/dashboard, kid→/tutor
- Esqueci senha via `resetPasswordForEmail()`

## Tutor IA (Gemini)
- Modelo: `gemini-2.5-flash-lite`
- System prompt com metodo socratico (nao da resposta direta, faz perguntas guiadas)
- Adaptado por faixa etaria e materia
- Suporta envio de fotos (OCR)
- API route: `/api/tutor`

## Gamificacao
- XP por interacao com tutor
- Niveis (1-100)
- Streak de dias consecutivos
- Achievements/badges
- Graficos de progresso (Recharts)

## Visual
- Tema dark com gradientes roxo/azul
- Glass morphism (cards com backdrop-blur)
- Animacoes suaves com Framer Motion
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

## Proximos Passos Sugeridos
1. **Pagamento**: Integrar Stripe para planos premium
2. **Dominio customizado**: Configurar dominio proprio no Railway
3. **Email templates**: Customizar emails do Supabase (confirmacao, reset senha)
4. **PWA**: Adicionar manifest.json para instalar como app
5. **Mais materias**: Expandir lista de disciplinas
6. **Relatorios**: Dashboard mais detalhado para pais
7. **Modo offline**: Service worker para funcionar sem internet
8. **Testes**: Adicionar Jest + React Testing Library
