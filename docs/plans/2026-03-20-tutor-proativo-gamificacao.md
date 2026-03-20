# Tutor Proativo + Gamificação Temática — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Tornar o tutor proativo (setup mínimo + IA começa direto), substituir o modal de badge por um toast não-bloqueante, e adicionar barra de progresso de "construção temática" por sessão.

**Architecture:** Novos dados em `lib/subjects/suggestions.ts` e `lib/gamification/builds.ts`. Dois novos componentes de UI (`BadgeToast`, `BuildProgress`). `HomeworkSetup` simplificado (sem textarea). `ChatInterface` orquestra tudo: peças da construção, sugestões de tema, e substitui `BadgeUnlockModal` por `BadgeToast`. Hook `useChatSession` ganha `sendMessageText` para envio programático.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Framer Motion 12, Tailwind CSS 4, Supabase, Google Gemini

---

## Contexto do Codebase

**Subject IDs usados em todo o sistema:** `math`, `portuguese`, `history`, `science`, `geography`, `english`, `other`
**AgeGroup type (de `lib/auth/types`):** `'4-6' | '7-9' | '10-12' | '13-15' | '16-18'`
**Arquivo central do tutor:** `components/tutor/ChatInterface.tsx` — orquestra `HomeworkSetup`, `useChatSession`, `BadgeUnlockModal`, `XPBar`
**Hook central:** `hooks/useChatSession.ts` — gerencia mensagens, `sendMessage`, `initSession`
**Bug já corrigido (não regredir):** `handleCloseBadgeModal` em `ChatInterface.tsx` é `useCallback` memoizado — não mudar para arrow function inline

---

## Task 1: Sugestões de Tema por Matéria e Idade

**Files:**
- Create: `lib/subjects/suggestions.ts`

**Step 1: Criar o arquivo**

```typescript
// lib/subjects/suggestions.ts
import type { AgeGroup } from '@/lib/auth/types';

const SUGGESTIONS: Record<string, Record<AgeGroup, string[]>> = {
  math: {
    '4-6':   ['Contar até 10', 'Formas geométricas', 'Mais e menos', 'Cores e números'],
    '7-9':   ['Tabuada', 'Frações simples', 'Medidas', 'Problemas de adição'],
    '10-12': ['Frações', 'Geometria', 'Equações', 'Porcentagem'],
    '13-15': ['Álgebra', 'Funções', 'Trigonometria', 'Estatística'],
    '16-18': ['Cálculo', 'Matrizes', 'Números complexos', 'Probabilidade'],
  },
  portuguese: {
    '4-6':   ['Letras do alfabeto', 'Rimas', 'Contar histórias', 'Vogais'],
    '7-9':   ['Leitura', 'Pontuação', 'Substantivos', 'Texto narrativo'],
    '10-12': ['Interpretação de texto', 'Ortografia', 'Verbos', 'Redação'],
    '13-15': ['Literatura brasileira', 'Gramática', 'Argumentação', 'Poesia'],
    '16-18': ['Análise literária', 'Redação ENEM', 'Linguística', 'Figuras de linguagem'],
  },
  history: {
    '4-6':   ['Minha família', 'Ontem e hoje', 'Profissões', 'Festas tradicionais'],
    '7-9':   ['Brasil colonial', 'Indígenas', 'Escravidão', 'Independência'],
    '10-12': ['Revolução Industrial', 'Guerras Mundiais', 'Brasil República', 'Ditadura militar'],
    '13-15': ['Guerra Fria', 'Nazismo', 'Colonialismo', 'Revolução Francesa'],
    '16-18': ['Geopolítica atual', 'Filosofia política', 'Historiografia', 'Revoluções sociais'],
  },
  science: {
    '4-6':   ['Animais', 'Plantas', 'Água', 'Sol e chuva'],
    '7-9':   ['Corpo humano', 'Ecossistemas', 'Estados da matéria', 'Sistema solar'],
    '10-12': ['Célula', 'Fotossíntese', 'Cadeia alimentar', 'Física básica'],
    '13-15': ['Genética', 'Evolução', 'Química orgânica', 'Termodinâmica'],
    '16-18': ['Bioquímica', 'Mecânica quântica', 'Ecologia avançada', 'Microbiologia'],
  },
  geography: {
    '4-6':   ['Minha cidade', 'Países', 'Rios e montanhas', 'Clima'],
    '7-9':   ['Regiões do Brasil', 'Continentes', 'Vegetação', 'Mapas'],
    '10-12': ['Geopolítica', 'Biomas', 'Urbanização', 'Globalização'],
    '13-15': ['Desenvolvimento econômico', 'Conflitos geopolíticos', 'Clima e ambiente', 'Migração'],
    '16-18': ['Geopolítica avançada', 'Sustentabilidade', 'Cartografia', 'Energia'],
  },
  english: {
    '4-6':   ['Cores', 'Animais', 'Números', 'Cumprimentos'],
    '7-9':   ['Presente simples', 'Vocabulário básico', 'Frases do dia a dia', 'Alphabet'],
    '10-12': ['Past tense', 'Present continuous', 'Phrasal verbs', 'Reading'],
    '13-15': ['Grammar advanced', 'Writing essays', 'Listening', 'Speaking'],
    '16-18': ['ENEM inglês', 'Redação em inglês', 'Vocabulário avançado', 'Literatura em inglês'],
  },
  other: {
    '4-6':   ['Pintura', 'Música', 'Corpo humano', 'Natureza'],
    '7-9':   ['Tecnologia', 'Arte', 'Educação física', 'Filosofia básica'],
    '10-12': ['Filosofia', 'Sociologia', 'Arte', 'Empreendedorismo'],
    '13-15': ['Filosofia', 'Sociologia', 'Inglês avançado', 'Empreendedorismo'],
    '16-18': ['Filosofia', 'Sociologia', 'Inglês avançado', 'Inovação'],
  },
};

export function getSuggestions(subject: string, ageGroup: AgeGroup): string[] {
  return SUGGESTIONS[subject]?.[ageGroup] ?? SUGGESTIONS.other[ageGroup];
}
```

**Step 2: Verificar build**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```
Esperado: sem erros de TypeScript

**Step 3: Commit**

```bash
git add lib/subjects/suggestions.ts
git commit -m "feat: topic suggestions by subject and age group"
```

---

## Task 2: Definições de Construções Temáticas

**Files:**
- Create: `lib/gamification/builds.ts`

**Step 1: Criar o arquivo**

```typescript
// lib/gamification/builds.ts

export interface BuildDefinition {
  emoji: string;
  name: string;
  pieces: string[]; // exactly 6 items
  milestoneMessages: Record<number, string>;
}

export const TOTAL_PIECES = 6;

const BUILDS: Record<string, BuildDefinition> = {
  math: {
    emoji: '🚀',
    name: 'Foguete',
    pieces: ['motor', 'corpo', 'asas', 'cápsula', 'antena', 'chamas'],
    milestoneMessages: {
      1: 'O motor está pronto! 🔧',
      3: 'Metade do foguete! Continue! 🚀',
      6: 'Foguete completo! Decolagem! 🚀🔥',
    },
  },
  portuguese: {
    emoji: '📚',
    name: 'Biblioteca',
    pieces: ['estante', 'livros', 'mesa', 'lâmpada', 'globo', 'janela'],
    milestoneMessages: {
      1: 'Primeira estante montada! 📚',
      3: 'A biblioteca ganha vida! ✨',
      6: 'Biblioteca completa! Que acervo! 📚🌟',
    },
  },
  history: {
    emoji: '🏰',
    name: 'Castelo',
    pieces: ['base', 'muralhas', 'torre', 'portão', 'bandeira', 'brasão'],
    milestoneMessages: {
      1: 'A fundação está lançada! 🏗️',
      3: 'O castelo está crescendo! 🏰',
      6: 'Castelo erguido! Que reino! 🏰👑',
    },
  },
  science: {
    emoji: '🔬',
    name: 'Laboratório',
    pieces: ['bancada', 'microscópio', 'tubos', 'computador', 'quadro', 'planta'],
    milestoneMessages: {
      1: 'O laboratório começa! 🔬',
      3: 'Equipamentos chegando! 🧪',
      6: 'Laboratório completo! Hora dos experimentos! 🔬✨',
    },
  },
  geography: {
    emoji: '🌍',
    name: 'Planeta',
    pieces: ['continente', 'oceano', 'nuvem', 'cidade', 'lua', 'estrelas'],
    milestoneMessages: {
      1: 'O planeta toma forma! 🌍',
      3: 'Metade do mundo descoberto! 🗺️',
      6: 'Planeta completo! Que universo! 🌍⭐',
    },
  },
  english: {
    emoji: '🗺️',
    name: 'Mapa-Múndi',
    pieces: ['América', 'Europa', 'África', 'Ásia', 'Oceania', 'Antártica'],
    milestoneMessages: {
      1: 'First continent discovered! 🗺️',
      3: 'Half the world explored! 🌐',
      6: 'World map complete! Amazing! 🗺️🌟',
    },
  },
  other: {
    emoji: '🏠',
    name: 'Casa',
    pieces: ['base', 'paredes', 'telhado', 'janela', 'porta', 'jardim'],
    milestoneMessages: {
      1: 'A casa começa! 🏗️',
      3: 'As paredes estão de pé! 🏠',
      6: 'Casa construída! Bem-vindo! 🏠✨',
    },
  },
};

export function getBuildForSubject(subject: string): BuildDefinition {
  return BUILDS[subject] ?? BUILDS.other;
}
```

**Step 2: Verificar build**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```

**Step 3: Commit**

```bash
git add lib/gamification/builds.ts
git commit -m "feat: themed build definitions per subject"
```

---

## Task 3: BadgeToast — Notificação Não-Bloqueante

**Context:** O `BadgeUnlockModal` atual usa `fixed inset-0 z-50` com backdrop — bloqueia toda a UI. Substituir por um toast no canto inferior direito que some em 4s automaticamente.

**Files:**
- Create: `components/gamification/BadgeToast.tsx`

**Step 1: Criar o componente**

```tsx
// components/gamification/BadgeToast.tsx
'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBadgeById } from '@/lib/gamification/badges';

interface BadgeToastProps {
  badgeIds: string[];
  onClose: () => void;
}

export function BadgeToast({ badgeIds, onClose }: BadgeToastProps) {
  const badge = getBadgeById(badgeIds[0]);
  // Use ref to avoid restarting the timer when onClose reference changes
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (badgeIds.length === 0) return;
    const t = setTimeout(() => onCloseRef.current(), 4000);
    return () => clearTimeout(t);
  }, [badgeIds.length]); // only re-run when count changes, not on every render

  if (!badge || badgeIds.length === 0) return null;

  const rarityColors: Record<string, string> = {
    common: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F5A623',
  };
  const color = rarityColors[badge.rarity] || '#F5A623';

  return (
    <AnimatePresence>
      <motion.button
        onClick={onClose}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-left max-w-[240px]"
        style={{ background: '#1A2E42', border: `1px solid ${color}40` }}
        initial={{ opacity: 0, x: 80, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 80, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <span className="text-3xl leading-none">{badge.icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color }}>
            Badge Ganho!
          </p>
          <p className="text-white text-sm font-semibold truncate">{badge.name}</p>
        </div>
        {badgeIds.length > 1 && (
          <span className="text-xs shrink-0 ml-auto pl-2" style={{ color: 'rgba(240,244,248,0.4)' }}>
            +{badgeIds.length - 1}
          </span>
        )}
      </motion.button>
    </AnimatePresence>
  );
}
```

**Step 2: Verificar build**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```

**Step 3: Commit**

```bash
git add components/gamification/BadgeToast.tsx
git commit -m "feat: BadgeToast non-blocking corner notification"
```

---

## Task 4: BuildProgress — Barra de Progresso Temática

**Files:**
- Create: `components/gamification/BuildProgress.tsx`

**Step 1: Criar o componente**

```tsx
// components/gamification/BuildProgress.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { getBuildForSubject, TOTAL_PIECES } from '@/lib/gamification/builds';

interface BuildProgressProps {
  subject: string;
  pieces: number; // 0 to TOTAL_PIECES
  milestoneMessage?: string | null;
}

export function BuildProgress({ subject, pieces, milestoneMessage }: BuildProgressProps) {
  const build = getBuildForSubject(subject);

  return (
    <div className="flex flex-col gap-1 mb-3 px-1">
      <div className="flex items-center gap-2">
        <span className="text-base leading-none shrink-0">{build.emoji}</span>
        <div className="flex gap-1 flex-1">
          {Array.from({ length: TOTAL_PIECES }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 h-2 rounded-full"
              style={{
                background:
                  i < pieces
                    ? 'linear-gradient(90deg, #8B5CF6, #A78BFA)'
                    : 'rgba(255,255,255,0.08)',
              }}
              initial={i === pieces - 1 ? { scale: 1.6, opacity: 0.5 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            />
          ))}
        </div>
        <span
          className="text-xs shrink-0 tabular-nums"
          style={{ color: 'rgba(240,244,248,0.35)' }}
        >
          {pieces}/{TOTAL_PIECES}
        </span>
      </div>

      <AnimatePresence>
        {milestoneMessage && (
          <motion.p
            className="text-xs text-center font-semibold"
            style={{ color: '#F5A623' }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            {milestoneMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 2: Verificar build**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```

**Step 3: Commit**

```bash
git add components/gamification/BuildProgress.tsx
git commit -m "feat: BuildProgress themed session progress bar"
```

---

## Task 5: Simplificar HomeworkSetup

**Context:** Remover o `<textarea>` (homework text). O aluno agora escolhe apenas matéria + idade + foto opcional. O `onStart` continua igual mas `homework` virá vazio (sem foto) ou como texto OCR (com foto).

**Files:**
- Modify: `components/tutor/HomeworkSetup.tsx`

**Step 1: Substituir o arquivo completo**

```tsx
// components/tutor/HomeworkSetup.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { SubjectSelector } from './SubjectSelector';
import { AgeGroupSelector } from './AgeGroupSelector';
import { PhotoUpload } from './PhotoUpload';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';
import type { AgeGroup, BehavioralProfile } from '@/lib/auth/types';

interface HomeworkSetupProps {
  onStart: (config: {
    homework: string;
    subject: string;
    ageGroup: AgeGroup;
    behavioralProfile: BehavioralProfile;
  }) => void;
}

export function HomeworkSetup({ onStart }: HomeworkSetupProps) {
  const [subject, setSubject] = useState('math');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('10-12');
  const [photoText, setPhotoText] = useState('');
  const [behavioralProfile] = useState<BehavioralProfile>('default');

  return (
    <motion.div
      className="glass p-6 sm:p-8 mt-4 sm:mt-6 rounded-[var(--eq-radius-lg)]"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeInUp('high')} className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <MascotOwl expression="waving" size="lg" animated />
        </div>
        <h1 className="text-[var(--eq-text)] text-2xl sm:text-3xl font-extrabold mb-2">
          O que vamos estudar?
        </h1>
        <p className="text-[var(--eq-text-secondary)] text-sm">
          Escolha a matéria e sua idade — o Edu faz o resto ✨
        </p>
      </motion.div>

      {/* Subject */}
      <motion.div variants={fadeInUp('medium')}>
        <SubjectSelector selected={subject} onSelect={setSubject} label="Qual matéria?" />
      </motion.div>

      {/* Age Group */}
      <motion.div variants={fadeInUp('medium')}>
        <AgeGroupSelector selected={ageGroup} onSelect={setAgeGroup} label="Qual sua idade?" />
      </motion.div>

      {/* Photo Upload — optional */}
      <motion.div variants={fadeInUp('medium')} className="mb-1">
        <p className="text-[var(--eq-text-secondary)] text-sm mb-2 font-medium">
          Tem foto da tarefa? (opcional)
        </p>
        <PhotoUpload onTextExtracted={setPhotoText} />
        {photoText && (
          <p className="text-xs mt-1.5" style={{ color: 'rgba(240,244,248,0.4)' }}>
            ✓ Foto lida — o Edu vai perguntar sobre ela
          </p>
        )}
      </motion.div>

      {/* Submit */}
      <motion.div variants={fadeInUp('medium')}>
        <Button
          onClick={() => onStart({ homework: photoText, subject, ageGroup, behavioralProfile })}
          variant="primary"
          size="lg"
          rounded="lg"
          className="w-full mt-4 gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Começar com o Edu ✨
        </Button>
      </motion.div>
    </motion.div>
  );
}
```

**Step 2: Verificar build**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```

**Step 3: Commit**

```bash
git add components/tutor/HomeworkSetup.tsx
git commit -m "feat: simplify HomeworkSetup — subject + age + optional photo only"
```

---

## Task 6: Atualizar System Prompt para Modo Proativo

**Context:** Quando `homework` é vazio (sem foto), o AI precisa saber que está em modo proativo e deve perguntar ao aluno o que quer estudar, já começando com método socrático assim que o aluno responder.

**Files:**
- Modify: `lib/subjects/prompts.ts` (linhas 242-245)

**Step 1: Substituir o bloco do homework no final de `buildSystemPrompt`**

Localizar este trecho em `lib/subjects/prompts.ts`:
```typescript
  // Current homework
  if (ctx.homework) {
    parts.push(`\nDEVER DE CASA ATUAL: "${ctx.homework}"`);
  }
```

Substituir por:
```typescript
  // Current homework / proactive mode
  if (ctx.homework) {
    parts.push(`\nDEVER DE CASA / TEMA: "${ctx.homework}"`);
  } else {
    parts.push(`\nMODO PROATIVO: O aluno ainda não escolheu um tema específico. Quando ele indicar o tema na primeira mensagem, comece imediatamente a explorar com perguntas socráticas. Não confirme nem repita — já faça a primeira pergunta de exploração.`);
  }
```

**Step 2: Verificar build**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```

**Step 3: Commit**

```bash
git add lib/subjects/prompts.ts
git commit -m "feat: proactive mode instruction in system prompt"
```

---

## Task 7: Adicionar sendMessageText ao useChatSession

**Context:** Quando o aluno clica em uma sugestão de tema (chip), precisamos enviar a mensagem programaticamente sem depender do estado `input`. O hook precisa de uma função que aceite texto diretamente.

**Files:**
- Modify: `hooks/useChatSession.ts`

**Step 1: Adicionar `sendMessageText` e expô-lo no return**

Localizar o tipo de retorno do hook:
```typescript
interface UseChatSessionReturn {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  sessionXp: number;
  setInput: (value: string) => void;
  sendMessage: () => Promise<void>;
  initSession: (homework: string, greeting: string) => void;
  resetSession: () => void;
  finishSession: () => Promise<void>;
}
```

Substituir por:
```typescript
interface UseChatSessionReturn {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  sessionXp: number;
  setInput: (value: string) => void;
  sendMessage: () => Promise<void>;
  sendMessageText: (text: string) => Promise<void>;
  initSession: (homework: string, greeting: string) => void;
  resetSession: () => void;
  finishSession: () => Promise<void>;
}
```

Após a função `sendMessage`, adicionar `sendMessageText` (antes do `return`):

```typescript
  const sendMessageText = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    if (sessionIdRef.current) {
      const supabase = createClient();
      saveMessage(supabase, sessionIdRef.current, 'user', text).catch(() => {});
    }

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          homework,
          subject,
          ageGroup,
          behavioralProfile,
        }),
      });
      const data = await res.json();
      const assistantMsg = data.message || data.error || 'Ops! Tenta de novo!';
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMsg }]);

      if (sessionIdRef.current) {
        const supabase = createClient();
        saveMessage(supabase, sessionIdRef.current, 'assistant', assistantMsg).catch(() => {});
      }

      const xp = XP_REWARDS.MESSAGE_SENT;
      setSessionXp((prev) => prev + xp);
      onXPEarned?.(xp);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ops! Tenta de novo!' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, homework, subject, ageGroup, behavioralProfile, onXPEarned]);
```

Adicionar `sendMessageText` no objeto de retorno:
```typescript
  return {
    messages,
    input,
    loading,
    sessionXp,
    setInput,
    sendMessage,
    sendMessageText,
    initSession,
    resetSession,
    finishSession,
  };
```

**Também corrigir `sendMessage` existente** — substituir a linha:
```typescript
      const assistantMsg = data.message;
```
por:
```typescript
      const assistantMsg = data.message || data.error || 'Ops! Tenta de novo!';
```
(Isso garante que erros da API apareçam como mensagem em vez de `undefined`)

**Step 2: Verificar build**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```

**Step 3: Commit**

```bash
git add hooks/useChatSession.ts
git commit -m "feat: add sendMessageText to useChatSession + fix undefined message"
```

---

## Task 8: Atualizar ChatInterface — Orquestrar Tudo

**Context:** Este é o arquivo central. Precisa:
1. Substituir `BadgeUnlockModal` por `BadgeToast`
2. Adicionar `BuildProgress` com estado de peças
3. Adicionar sugestões de tema (chips clicáveis após greeting quando sem foto)
4. Ligar `sendMessageText` para os chips
5. Auto-finalizar sessão ao completar 6 peças

**Files:**
- Modify: `components/tutor/ChatInterface.tsx`

**Step 1: Substituir o arquivo completo**

```tsx
// components/tutor/ChatInterface.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCcw, Sparkles } from 'lucide-react';
import { HomeworkSetup } from './HomeworkSetup';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { SessionSummary } from './SessionSummary';
import { AgeThemeProvider } from '@/components/providers/AgeThemeProvider';
import { XPBar } from '@/components/gamification/XPBar';
import { BadgeToast } from '@/components/gamification/BadgeToast';
import { BuildProgress } from '@/components/gamification/BuildProgress';
import { useChatSession } from '@/hooks/useChatSession';
import { useAuth } from '@/hooks/useAuth';
import { getSubjectById } from '@/lib/subjects/config';
import { getSuggestions } from '@/lib/subjects/suggestions';
import { getBuildForSubject, TOTAL_PIECES } from '@/lib/gamification/builds';
import { SubjectIcon } from '@/components/illustrations/SubjectIcons';
import { createClient } from '@/lib/supabase/client';
import { getUserStats, addXP, checkAndAwardBadges } from '@/lib/supabase/queries';
import type { AgeGroup, BehavioralProfile } from '@/lib/auth/types';

export function ChatInterface() {
  const [homework, setHomework] = useState('');
  const [subject, setSubject] = useState('math');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('10-12');
  const [behavioralProfile] = useState<BehavioralProfile>('default');
  const [homeworkSet, setHomeworkSet] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionMessageCount, setSessionMessageCount] = useState(0);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sessionPieces, setSessionPieces] = useState(0);
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);
  const { profile } = useAuth();

  // Load XP from user_stats table
  useEffect(() => {
    if (profile?.id) {
      const supabase = createClient();
      getUserStats(supabase, profile.id).then(({ data }) => {
        if (data) setTotalXp(data.total_xp);
      });
    }
  }, [profile]);

  const handleCloseBadgeModal = useCallback(() => setNewBadgeIds([]), []);

  const handleXPEarned = useCallback(async (xp: number) => {
    setTotalXp((prev) => prev + xp);
    setXpGained(xp);
    setTimeout(() => setXpGained(null), 2000);

    // Increment build pieces
    setSessionPieces((prev) => {
      const next = Math.min(prev + 1, TOTAL_PIECES);
      // Show milestone message if defined
      const build = getBuildForSubject(subject);
      const msg = build.milestoneMessages[next] ?? null;
      if (msg) {
        setMilestoneMessage(msg);
        setTimeout(() => setMilestoneMessage(null), 3000);
      }
      return next;
    });

    // Persist XP
    if (profile?.id) {
      const supabase = createClient();
      await addXP(supabase, profile.id, xp);
      const earnedBadgeIds = await checkAndAwardBadges(supabase, profile.id);
      if (earnedBadgeIds.length > 0) setNewBadgeIds(earnedBadgeIds);
    }
  }, [profile, subject]);

  const {
    messages,
    input,
    loading,
    sessionXp,
    setInput,
    sendMessage,
    sendMessageText,
    initSession,
    resetSession,
    finishSession,
  } = useChatSession(homework, subject, ageGroup, behavioralProfile, handleXPEarned, profile?.id);

  // Auto-finish when build is complete
  useEffect(() => {
    if (sessionPieces >= TOTAL_PIECES && homeworkSet && !showSummary) {
      const timer = setTimeout(async () => {
        await finishSession();
        setSessionMessageCount(messages.filter((m) => m.role === 'user').length);
        setShowSummary(true);
      }, 3500); // wait for milestone animation
      return () => clearTimeout(timer);
    }
  }, [sessionPieces, homeworkSet, showSummary, finishSession, messages]);

  const handleStart = (config: {
    homework: string;
    subject: string;
    ageGroup: AgeGroup;
    behavioralProfile: BehavioralProfile;
  }) => {
    const subjectInfo = getSubjectById(config.subject);
    const subjectName = subjectInfo?.name ?? 'esta matéria';

    setHomework(config.homework);
    setSubject(config.subject);
    setAgeGroup(config.ageGroup);
    setHomeworkSet(true);
    setSessionPieces(0);
    setSuggestions([]);

    if (config.homework) {
      // Photo was uploaded — start with photo content
      initSession(
        config.homework,
        `Oi! 👋 Li o que está na foto. Vamos explorar esse conteúdo?\n\nPor onde você quer começar?`,
      );
    } else {
      // No photo — proactive: show topic suggestions
      const tips = getSuggestions(config.subject, config.ageGroup);
      setSuggestions(tips);
      initSession(
        '',
        `Oi! 👋 Sobre **${subjectName}**, o que quer estudar hoje?\n\nAqui vão algumas ideias:`,
      );
    }
  };

  const handleReset = () => {
    setHomeworkSet(false);
    setHomework('');
    setSubject('math');
    setShowSummary(false);
    setSessionMessageCount(0);
    setSessionPieces(0);
    setSuggestions([]);
    setMilestoneMessage(null);
    resetSession();
  };

  const handleFinishSession = async () => {
    await finishSession();
    setSessionMessageCount(messages.filter((m) => m.role === 'user').length);
    setShowSummary(true);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setSuggestions([]);
    await sendMessageText(suggestion);
  };

  const handleSend = () => {
    setSuggestions([]);
    sendMessage();
  };

  if (!homeworkSet) {
    return (
      <AgeThemeProvider ageGroup={ageGroup}>
        <HomeworkSetup onStart={handleStart} />
      </AgeThemeProvider>
    );
  }

  const subjectInfo = getSubjectById(subject);

  return (
    <AgeThemeProvider ageGroup={ageGroup}>
      {showSummary ? (
        <SessionSummary
          xpEarned={sessionXp}
          messageCount={sessionMessageCount}
          subject={subject}
          onNewSession={handleReset}
        />
      ) : (
        <>
          {/* XP Bar */}
          <div className="mb-2 relative">
            <XPBar totalXp={totalXp} compact />
            <AnimatePresence>
              {xpGained && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -5, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute right-0 top-0 flex items-center gap-1 text-amber-400 font-bold text-sm"
                >
                  <Sparkles size={14} />
                  +{xpGained} XP
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Build Progress */}
          <BuildProgress
            subject={subject}
            pieces={sessionPieces}
            milestoneMessage={milestoneMessage}
          />

          {/* Homework / subject banner */}
          <motion.div
            className="flex items-center gap-3 glass rounded-[var(--eq-radius-sm)] p-3 mb-3 shrink-0"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {subjectInfo ? (
              <SubjectIcon subject={subjectInfo.id} size={24} animated={false} />
            ) : (
              <BookOpen size={16} className="text-[var(--eq-accent)] shrink-0" />
            )}
            <p className="text-[var(--eq-text-secondary)] text-xs flex-1 line-clamp-2">
              {subjectInfo?.name ?? subject}
            </p>
            <button
              onClick={handleReset}
              className="text-[var(--eq-text-muted)] hover:text-[var(--eq-text)] text-xs shrink-0 transition-colors flex items-center gap-1"
            >
              <RotateCcw size={12} />
              trocar
            </button>
          </motion.div>

          <MessageList messages={messages} loading={loading} />

          {/* Topic suggestion chips — shown after greeting, cleared on first send */}
          <AnimatePresence>
            {suggestions.length > 0 && !loading && (
              <motion.div
                className="flex flex-wrap gap-2 my-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestionClick(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(139,92,246,0.12)',
                      border: '1px solid rgba(139,92,246,0.3)',
                      color: 'rgba(240,244,248,0.8)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2 mt-2">
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              disabled={loading}
              placeholder="Digite sua resposta..."
            />
            {messages.length > 2 && (
              <button
                onClick={handleFinishSession}
                className="text-white/20 hover:text-white/50 text-xs transition-colors text-center py-1"
              >
                Encerrar sessão
              </button>
            )}
          </div>
        </>
      )}

      {newBadgeIds.length > 0 && (
        <BadgeToast badgeIds={newBadgeIds} onClose={handleCloseBadgeModal} />
      )}
    </AgeThemeProvider>
  );
}
```

**Step 2: Verificar build completo**

```bash
npm run build 2>&1 | tail -30
```
Esperado: build passa sem erros TypeScript

**Step 3: Commit**

```bash
git add components/tutor/ChatInterface.tsx
git commit -m "feat: wire up BuildProgress, BadgeToast, topic suggestions in ChatInterface"
```

---

## Task 9: Build Final e Deploy

**Step 1: Build limpo**

```bash
npm run build 2>&1 | tail -20
```
Esperado: `✓ Compiled successfully` ou similar sem erros

**Step 2: Push para Railway**

```bash
git push origin main
```

**Step 3: Verificar produção (2-3min após push)**

```bash
curl -s -X POST https://eduquest-mvp-production.up.railway.app/api/tutor \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Frações"}],"homework":"","subject":"math","ageGroup":"10-12"}' \
  | python3 -m json.tool
```
Esperado: resposta JSON com `"message"` não vazio — o AI deve fazer uma pergunta socrática sobre frações.
