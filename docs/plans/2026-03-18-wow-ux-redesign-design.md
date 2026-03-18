# Redesign UX "Wow" — Design Doc

**Data:** 2026-03-18
**Status:** Aprovado
**Objetivo:** Landing convence o pai. Produto vicia a criança.

---

## 1. Nova Identidade Visual

### Paleta
| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-primary` | `#0D1B2A` | Fundo principal (navy profundo) |
| `--bg-card` | `#1A2E42` | Cards, glass, modais |
| `--accent-gold` | `#F5A623` | XP, conquistas, CTAs principais |
| `--accent-teal` | `#00B4D8` | IA, tecnologia, links |
| `--text-primary` | `#F0F4F8` | Texto principal |
| `--text-secondary` | `rgba(240,244,248,0.55)` | Texto secundário |

### Tipografia
- Hero/títulos: Inter Extrabold (peso 800) — mais impacto
- Stats destacados: tamanho gigante (4-6xl) com cor âmbar
- Body: Inter Regular — legível, clean

### Mascote Edu
- Mantém coruja, ganha mais personalidade no produto
- Expressões por contexto: thinking (loading), celebrating (XP), waving (onboarding), encouraging (durante chat)
- Aparece com balão de pensamento animado enquanto carrega resposta

### Tom de voz
- **Landing (pai):** direto, confiante, orientado a resultados
- **Produto (criança):** divertido, encorajador, nunca condescendente

---

## 2. Landing Page — Convence o Pai

### Hero (redesign completo)
- **Headline:** *"Seu filho vai parar de dizer 'não entendi nada da aula'"*
- **Sub:** *"O Studdo usa o método socrático com IA — o tutor faz perguntas, não dá respostas. Seu filho pensa, descobre, aprende de verdade."*
- **Stat bar animada** abaixo do CTA (contadores animados):
  - "94% das crianças entendem o conteúdo na primeira sessão"
  - "3× mais retenção que aula expositiva"
  - "Em média 12 min para resolver uma dúvida"
- **Visual:** mockup do chat em celular + dashboard no notebook, lado a lado
- **CTA único e claro:** "Criar conta gratuita" (sem duplicação)

### Nova seção: Prova Social de Pais
- 3 depoimentos com foto, nome, cidade, idade do filho
- Exemplo: *"Minha filha de 11 anos nunca quis estudar. Hoje ela abre o Studdo sozinha."* — Ana Paula, SP
- Badge: "4.9★ nas primeiras semanas"

### Como Funciona (redesign)
- Lado esquerdo: problema real do pai (*"Seu filho chega com dúvida. Você não sabe explicar. Ele vai dormir sem entender."*)
- Lado direito: solução em 3 passos animados com preview real do chat

### Nova seção: Dashboard para Pais
- Preview animado do dashboard: gráficos, streak, badges
- Copy: *"Você acompanha tudo. Sessões, tempo estudado, matérias, conquistas."*
- CTA: "Criar conta gratuita para pais"

### CTA Final
- Headline: *"Comece grátis. Sem cartão."*
- Sub: *"Seu filho tem 7 dias para testar. Se não gostar, não paga nada."*

---

## 3. Produto — Vicia a Criança

### Onboarding da Criança (redesign)
- **Passo 1:** Edu fala diretamente com animação de entrada: *"Oi! Eu sou o Edu. Vou te ajudar a entender qualquer coisa — sem te dar as respostas prontas 😄"*
- **Passo 2:** Criança escolhe a primeira matéria interativamente (cards com ícones grandes, não texto)
- **Passo 3:** Mini-prévia animada do chat real — 3 mensagens aparecem uma a uma
- **Passo 4:** Badge de boas-vindas "Primeiro Passo 🌟" desbloqueado com confetti

### Chat (polimento visual)
- Mensagens do Edu renderizam **Markdown** (negrito, listas, emojis)
- Avatar de Edu pulsante com balão animado enquanto "pensa" (loading)
- **Celebração de XP:** confetti + "+XP" grande dourado flutuando
- Streak counter com 🔥 visível no header durante chat
- Botão "Encerrar sessão" com ícone de troféu, mais visível

### SessionSummary (redesign)
- Animação de troféu + confetti ao abrir
- Mostra: XP ganho, streak atualizado, badge novo se desbloqueado
- Sugere próxima matéria com CTA "Continuar estudando →"

### HomeworkSetup (redesign)
- Headline: *"Qual é o desafio de hoje?"* em vez de formulário frio
- Cards de matéria grandes com ícones coloridos
- Ao selecionar matéria: Edu aparece com expressão animada

### Badge Unlock (novo modal)
- Modal full com confetti, ícone grande do badge, nome e descrição
- Substitui o `console.log` atual

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `app/globals.css` | Atualizar tokens de cor (navy, âmbar, teal) |
| `components/landing/HeroSection.tsx` | Redesenhar headline, stats animadas, visual |
| `components/landing/SocialProof.tsx` | Adicionar depoimentos de pais |
| `components/landing/HowItWorks.tsx` | Layout dois-colunas com problema/solução |
| `components/landing/ParentDashboardPreview.tsx` | Nova seção (criar) |
| `components/landing/Footer.tsx` | CTA final com "Sem cartão" |
| `components/onboarding/WelcomeFlow.tsx` | Redesenhar fluxo kid com prévia do chat |
| `components/tutor/MessageBubble.tsx` | Suporte a Markdown nas mensagens |
| `components/tutor/ChatInterface.tsx` | Confetti XP, streak no header, botão troféu |
| `components/tutor/SessionSummary.tsx` | Animação troféu, badge unlock, próxima matéria |
| `components/tutor/HomeworkSetup.tsx` | Cards grandes, headline "Qual é o desafio?" |
| `components/gamification/BadgeUnlockModal.tsx` | Novo modal com confetti (criar) |
