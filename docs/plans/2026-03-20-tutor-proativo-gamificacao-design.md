# Tutor Proativo + Gamificação Temática — Design

> **Para Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans para criar o plano de implementação.

**Goal:** Tornar o tutor IA proativo (sem formulário longo) e a gamificação lúdica (construção temática por sessão).

**Architecture:** Substituir o `HomeworkSetup` por uma tela mínima (matéria + idade + foto opcional), mover a coleta de tema para dentro do chat via IA, e criar um sistema de progresso visual por sessão baseado em construções temáticas por matéria.

**Tech Stack:** Next.js App Router, React, Framer Motion, Gemini API, Supabase, Tailwind CSS 4

---

## Bug Crítico (já corrigido)

- **Causa**: `BadgeUnlockModal` recebia `onClose` como arrow function inline → `useEffect` do timer resetava a cada re-render → modal nunca fechava → bloqueava toda a UI
- **Fix**: `handleCloseBadgeModal` memoizado com `useCallback` em `ChatInterface.tsx`

---

## Seção 1 — Novo Fluxo de Entrada (Proativo)

### Setup mínimo
A tela de setup mostra apenas:
1. **Matéria** — grid de ícones (um toque)
2. **Faixa etária** — chips horizontais
3. **Foto opcional** — botão de upload (secundário)
4. **Botão "Começar"**

Sem campo de texto para tarefa. O aluno não precisa saber descrever o que quer estudar.

### Comportamento ao iniciar
- **Com foto**: A IA recebe o conteúdo via OCR e abre a sessão com perguntas sobre aquele conteúdo
- **Sem foto**: A IA abre com uma pergunta + 3–4 sugestões de temas baseadas na matéria e faixa etária

Exemplo (Matemática, 10–12 anos, sem foto):
> "Sobre Matemática, o que quer estudar hoje? Aqui vão algumas ideias:"
> [Frações] [Geometria] [Equações] [Porcentagem]

O aluno clica em uma sugestão ou digita livremente. A sessão começa a partir daí.

### Sugestões por matéria e faixa etária
Definidas em `lib/subjects/suggestions.ts` como `Record<Subject, Record<AgeGroup, string[]>>`.

---

## Seção 2 — Gamificação: Construção Temática

### Conceito
Cada sessão tem uma "obra" com 6 peças. Cada resposta do usuário ao Edu adiciona uma peça (independente de certo/errado — o esforço conta). Ao completar as 6 peças, a sessão termina com celebração.

### Progresso no chat
Barra compacta no topo do chat:
```
🚀 Foguete em construção...  ■■■□□□  3/6
```

A cada peça adicionada, uma mensagem curta é exibida:
- Peça 1: "Boa! A base está pronta!"
- Peça 3: "Metade! Continua assim!"
- Peça 6: "🎉 [Obra] concluída!"

### Mapa de construções por matéria
| Matéria | Obra | Emoji | 6 Peças |
|---|---|---|---|
| math | Foguete | 🚀 | motor, corpo, asas, cápsula, antena, chamas |
| history | Castelo | 🏰 | base, muralhas, torre, portão, bandeira, brasão |
| science/biology | Laboratório | 🔬 | bancada, microscópio, tubos, computador, quadro, planta |
| portuguese | Biblioteca | 📚 | estante, livros, mesa, lâmpada, globo, janela |
| geography | Planeta | 🌍 | continente, oceano, nuvem, cidade, lua, estrelas |
| physics | Circuito | ⚡ | bateria, fios, resistor, LED, switch, display |
| other | Casa | 🏠 | base, paredes, telhado, janela, porta, jardim |

### Armazenamento
- `sessionPieces: number` (0–6) no estado local de `ChatInterface`
- Incrementado em `handleXPEarned` (junto com XP)
- Exibido em novo componente `BuildProgress`

### Tela de conclusão
Ao atingir 6 peças, exibe `SessionSummary` com:
- A obra completa animada (emoji grande com efeito)
- XP ganho
- Badge temático da sessão (se aplicável)

---

## Seção 3 — Notificações Não-Bloqueantes

### Badge ganho → Toast no canto
Substitui o `BadgeUnlockModal` (modal central) por um toast no canto inferior direito:
- Aparece por 4 segundos e some automaticamente
- Sem backdrop, sem bloquear o chat
- Pode fechar clicando
- Componente: `BadgeToast` (novo, substitui `BadgeUnlockModal`)

### Level up → Modal no fim da sessão
- `LevelUpCelebration` só aparece junto com `SessionSummary`, não durante a sessão
- Mantém o botão "Continuar" existente

### Peça construída → Animação inline
- A barra `BuildProgress` anima a peça entrando (Framer Motion)
- Nenhuma interrupção do fluxo de chat

---

## Arquivos a Criar/Modificar

### Criar
- `lib/subjects/suggestions.ts` — sugestões de temas por matéria + idade
- `lib/gamification/builds.ts` — mapa de obras por matéria
- `components/gamification/BuildProgress.tsx` — barra de progresso temática
- `components/gamification/BadgeToast.tsx` — toast não-bloqueante (substitui BadgeUnlockModal)

### Modificar
- `components/tutor/HomeworkSetup.tsx` — remover campo de texto, manter matéria + idade + foto
- `components/tutor/ChatInterface.tsx` — integrar `BuildProgress`, `BadgeToast`, lógica de peças, já tem fix do `handleCloseBadgeModal`
- `hooks/useChatSession.ts` — suporte a greeting proativo (com/sem foto, com sugestões)
- `app/api/tutor/route.ts` — passar flag `hasPhoto` e sugestões ao system prompt
- `lib/subjects/prompts.ts` — adicionar instrução de abertura proativa com sugestões
