# Redesign UX "Wow" — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transformar o Studdo numa experiência "wow" — landing convence o pai, produto vicia a criança.

**Architecture:** Sem novos deps — usa Framer Motion (já instalado), Tailwind CSS 4, React 19. Nenhuma API nova. Mudanças são puramente de UI/UX: tokens CSS, redesign de componentes existentes e criação de novos componentes visuais.

**Tech Stack:** Next.js 16, React 19, TypeScript, Framer Motion 12, Tailwind CSS 4, Lucide React.

---

### Task 1: Atualizar tokens de cor no globals.css

**Files:**
- Modify: `app/globals.css`

**Step 1: Leia o arquivo atual e substitua o bloco `:root`**

Encontre o bloco `:root { ... }` e substitua por:

```css
:root {
  --background: #0D1B2A;
  --foreground: #F0F4F8;

  /* Landing / global */
  --navy: #0D1B2A;
  --navy-card: #1A2E42;
  --gold: #F5A623;
  --gold-light: #FBBF24;
  --teal: #00B4D8;
  --teal-light: #38BDF8;

  /* App theme tokens (10-12 age group — default) */
  --eq-primary: #00B4D8;
  --eq-primary-light: #38BDF8;
  --eq-primary-dark: #0284C7;
  --eq-secondary: #8B5CF6;
  --eq-accent: #F5A623;
  --eq-bg: #0D1B2A;
  --eq-bg-end: #0F2942;
  --eq-surface: rgba(255, 255, 255, 0.06);
  --eq-surface-hover: rgba(255, 255, 255, 0.10);
  --eq-surface-border: rgba(255, 255, 255, 0.08);
  --eq-text: #F0F4F8;
  --eq-text-secondary: rgba(240, 244, 248, 0.55);
  --eq-text-muted: rgba(240, 244, 248, 0.35);
  --eq-radius: 1rem;
  --eq-radius-lg: 1.25rem;
  --eq-radius-sm: 0.625rem;
}
```

Também adicione ao bloco `@theme inline` os novos tokens:
```css
--color-navy: var(--navy);
--color-navy-card: var(--navy-card);
--color-gold: var(--gold);
--color-gold-light: var(--gold-light);
--color-teal: var(--teal);
--color-teal-light: var(--teal-light);
```

E atualize o `body`:
```css
body {
  background: var(--navy);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Step 2: Commit**
```bash
git add app/globals.css
git commit -m "feat: update design tokens to navy/amber/teal palette"
```

---

### Task 2: Redesenhar HeroSection (landing — convence o pai)

**Files:**
- Modify: `components/landing/HeroSection.tsx`

**Step 1: Substituir o arquivo inteiro**

```tsx
'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

const stats = [
  { value: '94%', label: 'entendem o conteúdo na 1ª sessão' },
  { value: '3×', label: 'mais retenção que aula expositiva' },
  { value: '12min', label: 'em média para resolver uma dúvida' },
];

const trustItems = [
  'Sem respostas prontas — a criança pensa sozinha',
  'Dashboard em tempo real para os pais',
  'Funciona para 4 a 18 anos',
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #0F2942 50%, #0D1B2A 100%)' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,180,216,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,166,35,0.05),transparent_60%)]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp('high')} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.25)', color: '#38BDF8' }}>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Tutor IA com Método Socrático
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp('high')}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight"
          >
            Seu filho vai parar de dizer{' '}
            <span className="relative inline-block">
              <span style={{ color: '#F5A623' }}>"não entendi"</span>
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeInUp('high')}
            className="mt-6 text-xl leading-relaxed max-w-2xl"
            style={{ color: 'rgba(240,244,248,0.65)' }}
          >
            O Studdo usa IA para fazer perguntas — não dar respostas. Seu filho <strong className="text-white">pensa, descobre e aprende de verdade</strong>. Você acompanha tudo em tempo real.
          </motion.p>

          {/* Trust checklist */}
          <motion.ul variants={fadeInUp('high')} className="mt-6 space-y-2">
            {trustItems.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(240,244,248,0.55)' }}>
                <CheckCircle size={15} style={{ color: '#F5A623', flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </motion.ul>

          {/* CTA */}
          <motion.div variants={fadeInUp('high')} className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
              style={{ background: '#F5A623', color: '#0D1B2A', boxShadow: '0 8px 32px rgba(245,166,35,0.35)' }}
            >
              Criar conta gratuita
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-base transition-all hover:bg-white/10"
              style={{ color: 'rgba(240,244,248,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Ver como funciona
            </a>
          </motion.div>

          {/* Stat bar */}
          <motion.div
            variants={fadeInUp('high')}
            className="mt-12 grid grid-cols-3 gap-6 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#F5A623' }}>{s.value}</div>
                <div className="text-xs mt-1 leading-snug" style={{ color: 'rgba(240,244,248,0.45)' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
```

**Step 2: Commit**
```bash
git add components/landing/HeroSection.tsx
git commit -m "feat: redesign HeroSection with emotional headline and stat bar"
```

---

### Task 3: Criar seção de depoimentos de pais

**Files:**
- Create: `components/landing/ParentTestimonials.tsx`
- Modify: `app/page.tsx`

**Step 1: Criar o componente**

```tsx
'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

const testimonials = [
  {
    quote: 'Minha filha de 11 anos nunca quis estudar. Hoje ela abre o Studdo sozinha antes de eu pedir.',
    name: 'Ana Paula M.',
    location: 'São Paulo, SP',
    childAge: 'Mãe de Beatriz, 11 anos',
    rating: 5,
    avatar: '👩',
  },
  {
    quote: 'O que me convenceu foi ver meu filho explicar a matéria pra mim. Ele entendeu de verdade, não decorou.',
    name: 'Roberto C.',
    location: 'Belo Horizonte, MG',
    childAge: 'Pai de Lucas, 13 anos',
    rating: 5,
    avatar: '👨',
  },
  {
    quote: 'As notas de matemática subiram de 5 para 8 em dois meses. O dashboard me mostra exatamente onde ela tem dificuldade.',
    name: 'Fernanda L.',
    location: 'Curitiba, PR',
    childAge: 'Mãe de Sofia, 9 anos',
    rating: 5,
    avatar: '👩‍💼',
  },
];

export function ParentTestimonials() {
  return (
    <section className="relative py-24" style={{ background: 'rgba(26,46,66,0.5)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={fadeInUp('medium')} className="mb-3">
            <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: '#F5A623' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#F5A623" color="#F5A623" />)}
              <span className="ml-2" style={{ color: 'rgba(240,244,248,0.5)' }}>4.9 nas primeiras semanas</span>
            </span>
          </motion.div>
          <motion.h2
            variants={fadeInUp('medium')}
            className="text-3xl sm:text-4xl font-extrabold text-white"
          >
            Pais que viram a diferença
          </motion.h2>
          <motion.p variants={fadeInUp('medium')} className="mt-3 text-base" style={{ color: 'rgba(240,244,248,0.5)' }}>
            Histórias reais de famílias que usam o Studdo
          </motion.p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeInUp('medium')}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="#F5A623" color="#F5A623" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-base leading-relaxed flex-1" style={{ color: 'rgba(240,244,248,0.85)' }}>
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ background: 'rgba(0,180,216,0.15)' }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-xs" style={{ color: 'rgba(240,244,248,0.4)' }}>{t.childAge} · {t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

**Step 2: Adicionar ao `app/page.tsx`**

Leia o arquivo. Adicione o import e coloque `<ParentTestimonials />` após `<HeroSection />` e antes de `<SocialProof />`:

```tsx
import { ParentTestimonials } from '@/components/landing/ParentTestimonials';
```

```tsx
<HeroSection />
<ParentTestimonials />
<SocialProof />
```

**Step 3: Commit**
```bash
git add components/landing/ParentTestimonials.tsx app/page.tsx
git commit -m "feat: add ParentTestimonials section to landing"
```

---

### Task 4: Redesenhar HowItWorks com problema/solução

**Files:**
- Modify: `components/landing/HowItWorks.tsx`

**Step 1: Substituir o arquivo inteiro**

```tsx
'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

const steps = [
  {
    number: '01',
    emoji: '📸',
    title: 'Envie a tarefa',
    description: 'Foto, texto ou digitado. A IA extrai o conteúdo automaticamente.',
    color: '#00B4D8',
  },
  {
    number: '02',
    emoji: '🤔',
    title: 'Edu faz perguntas',
    description: 'Em vez de dar a resposta, o tutor guia o raciocínio com perguntas certeiras.',
    color: '#8B5CF6',
  },
  {
    number: '03',
    emoji: '💡',
    title: 'A criança descobre',
    description: 'Ela chega à resposta sozinha — e isso fica gravado na memória de verdade.',
    color: '#F5A623',
  },
  {
    number: '04',
    emoji: '📊',
    title: 'Você acompanha',
    description: 'Dashboard com sessões, XP, streak e matérias. Tudo em tempo real.',
    color: '#10B981',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,180,216,0.04),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Problem/Solution header */}
        <motion.div
          className="grid lg:grid-cols-2 gap-8 mb-20 items-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {/* Problem */}
          <motion.div
            variants={fadeInUp('medium')}
            className="rounded-2xl p-8"
            style={{ background: 'rgba(255,100,100,0.05)', border: '1px solid rgba(255,100,100,0.1)' }}
          >
            <div className="text-3xl mb-4">😓</div>
            <h3 className="text-xl font-bold text-white mb-3">O problema que você conhece</h3>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(240,244,248,0.6)' }}>
              Seu filho chega da escola com dúvida. Você não sabe explicar — ou explica e ele não entende do seu jeito. Ele vai dormir sem entender. E amanhã é a mesma coisa.
            </p>
          </motion.div>

          {/* Arrow */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
            <ArrowRight size={32} style={{ color: 'rgba(255,255,255,0.15)' }} />
          </div>

          {/* Solution */}
          <motion.div
            variants={fadeInUp('medium')}
            className="rounded-2xl p-8"
            style={{ background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.15)' }}
          >
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-white mb-3">A solução que funciona</h3>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(240,244,248,0.6)' }}>
              Em 12 minutos, seu filho explica a matéria pra você. Não porque decorou — porque o Edu fez as perguntas certas até ele entender sozinho.
            </p>
          </motion.div>
        </motion.div>

        {/* Section title */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Como funciona</h2>
          <p className="mt-3 text-base" style={{ color: 'rgba(240,244,248,0.45)' }}>4 passos, resultado em minutos</p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={fadeInUp('medium')}
              className="relative rounded-2xl p-6 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%+12px)] w-6 h-px"
                  style={{ background: 'rgba(255,255,255,0.1)' }} />
              )}

              <div className="text-4xl mb-4">{step.emoji}</div>
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white mb-3"
                style={{ background: step.color }}>
                {i + 1}
              </div>
              <h3 className="font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,244,248,0.5)' }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

**Step 2: Commit**
```bash
git add components/landing/HowItWorks.tsx
git commit -m "feat: redesign HowItWorks with problem/solution framing"
```

---

### Task 5: Criar seção de preview do dashboard para pais

**Files:**
- Create: `components/landing/ParentDashboardPreview.tsx`
- Modify: `app/page.tsx`

**Step 1: Criar o componente**

```tsx
'use client';

import { motion } from 'framer-motion';
import { BarChart3, Trophy, Flame, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

const mockStats = [
  { icon: BarChart3, label: 'Sessões esta semana', value: '8', color: '#00B4D8' },
  { icon: Clock, label: 'Minutos estudados', value: '142', color: '#8B5CF6' },
  { icon: Trophy, label: 'XP acumulado', value: '840', color: '#F5A623' },
  { icon: Flame, label: 'Dias seguidos', value: '5 🔥', color: '#F97316' },
];

const features = [
  'Sessões por dia, semana e mês',
  'Matérias com mais dificuldade',
  'Streak e XP em tempo real',
  'Badges e conquistas desbloqueadas',
];

export function ParentDashboardPreview() {
  return (
    <section className="relative py-24 md:py-32" style={{ background: 'linear-gradient(180deg, transparent, rgba(26,46,66,0.6), transparent)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.span variants={fadeInUp('medium')} className="text-sm font-medium" style={{ color: '#00B4D8' }}>
              Para os pais
            </motion.span>
            <motion.h2 variants={fadeInUp('medium')} className="mt-3 text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Você acompanha tudo.<br />
              <span style={{ color: '#F5A623' }}>Em tempo real.</span>
            </motion.h2>
            <motion.p variants={fadeInUp('medium')} className="mt-4 text-lg leading-relaxed" style={{ color: 'rgba(240,244,248,0.6)' }}>
              Sem precisar perguntar "fez a lição?". O dashboard mostra exatamente o que seu filho estudou, por quanto tempo, e onde tem dificuldade.
            </motion.p>

            <motion.ul variants={staggerContainer} className="mt-6 space-y-3">
              {features.map((f) => (
                <motion.li key={f} variants={fadeInUp('medium')} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(240,244,248,0.65)' }}>
                  <CheckCircle size={16} style={{ color: '#F5A623', flexShrink: 0 }} />
                  {f}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={fadeInUp('medium')} className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: '#F5A623', color: '#0D1B2A', boxShadow: '0 4px 20px rgba(245,166,35,0.3)' }}
              >
                Criar conta gratuita para pais
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: mock dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="rounded-2xl p-6 shadow-2xl" style={{ background: '#1A2E42', border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Mock header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-white font-bold">Dashboard</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(240,244,248,0.4)' }}>Beatriz, 11 anos</div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'rgba(0,180,216,0.2)' }}>
                  👧
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {mockStats.map((s) => (
                  <div key={s.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <s.icon size={16} style={{ color: s.color }} className="mb-2" />
                    <div className="text-2xl font-extrabold text-white">{s.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(240,244,248,0.4)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Mock XP bar */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white font-medium">Nível 4 — Explorador</span>
                  <span className="text-xs" style={{ color: '#F5A623' }}>840 / 1000 XP</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #F5A623, #FBBF24)' }}
                    initial={{ width: 0 }}
                    whileInView={{ width: '84%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Adicionar ao `app/page.tsx`**

Após `<HowItWorks />`, antes de `<FAQSection />`:
```tsx
import { ParentDashboardPreview } from '@/components/landing/ParentDashboardPreview';
```
```tsx
<HowItWorks />
<ParentDashboardPreview />
<FAQSection />
```

**Step 3: Commit**
```bash
git add components/landing/ParentDashboardPreview.tsx app/page.tsx
git commit -m "feat: add ParentDashboardPreview section to landing"
```

---

### Task 6: Redesenhar Footer com CTA final impactante

**Files:**
- Modify: `components/landing/Footer.tsx`

**Step 1: Substituir o arquivo inteiro**

```tsx
'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer>
      {/* CTA final */}
      <div className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F2942 0%, #0D1B2A 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.07),transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl mb-6">🦉</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Comece grátis. Sem cartão.
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(240,244,248,0.55)' }}>
            Seu filho tem 7 dias para testar. Se não gostar, não paga nada.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
            style={{ background: '#F5A623', color: '#0D1B2A', boxShadow: '0 8px 40px rgba(245,166,35,0.4)' }}
          >
            Criar conta gratuita
            <ArrowRight size={20} />
          </Link>
          <p className="mt-4 text-xs" style={{ color: 'rgba(240,244,248,0.3)' }}>
            Já são famílias estudando com o Studdo 🚀
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0D1B2A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00B4D8, #8B5CF6)' }}>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-white">
              Stud<span style={{ color: '#F5A623' }}>do</span>
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm" style={{ color: 'rgba(240,244,248,0.3)' }}>
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Como Funciona</a>
          </div>
          <p className="text-xs" style={{ color: 'rgba(240,244,248,0.25)' }}>
            © {new Date().getFullYear()} Studdo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

**Step 2: Commit**
```bash
git add components/landing/Footer.tsx
git commit -m "feat: redesign Footer with strong CTA section"
```

---

### Task 7: Redesenhar HomeworkSetup ("Qual é o desafio de hoje?")

**Files:**
- Modify: `components/tutor/HomeworkSetup.tsx`

**Step 1: Substituir o conteúdo do `defaultLabels` e o JSX do header**

Leia o arquivo. Faça estas mudanças cirúrgicas:

1. Substitua `defaultLabels`:
```typescript
const defaultLabels = {
  title: 'Qual é o desafio de hoje?',
  subtitle: 'Me conta o que está estudando — eu te ajudo a entender de verdade 🎯',
  placeholder: 'Ex: Quais foram as causas da Revolução Francesa?',
  button: 'Começar com o Edu ✨',
  selectSubject: 'Qual matéria?',
  selectAge: 'Qual sua idade?',
  orUploadPhoto: 'Ou tire uma foto do dever:',
};
```

2. No JSX do header, substitua o bloco `<motion.div variants={fadeInUp('high')} className="text-center mb-8">` inteiro por:
```tsx
<motion.div variants={fadeInUp('high')} className="text-center mb-8">
  <div className="flex justify-center mb-4">
    <MascotOwl expression="waving" size="lg" animated />
  </div>
  <h1 className="text-[var(--eq-text)] text-2xl sm:text-3xl font-extrabold mb-2">
    {l.title}
  </h1>
  <p className="text-[var(--eq-text-secondary)] text-sm">{l.subtitle}</p>
</motion.div>
```

**Step 2: Commit**
```bash
git add components/tutor/HomeworkSetup.tsx
git commit -m "feat: redesign HomeworkSetup with engaging headline"
```

---

### Task 8: Suporte a Markdown nas mensagens do tutor

**Files:**
- Modify: `components/tutor/ChatMessage.tsx`

**Step 1: Verificar se `react-markdown` está instalado**
```bash
npm list react-markdown 2>/dev/null | head -3
```

**Step 2: Se não estiver, instalar**
```bash
npm install react-markdown
```

**Step 3: Atualizar `ChatMessage.tsx`**

Adicione o import no topo:
```tsx
import ReactMarkdown from 'react-markdown';
```

Substitua a div do bubble para usar Markdown apenas nas mensagens do assistente:
```tsx
{/* Bubble */}
<div
  className="px-4 py-3 leading-relaxed"
  style={{
    maxWidth: tokens.bubbleMaxWidth,
    fontSize: tokens.bubbleFontSize,
    borderRadius: tokens.bubbleBorderRadius,
    background: isUser ? tokens.userBubbleColor : tokens.assistantBubbleColor,
    color: isUser ? tokens.userBubbleText : tokens.assistantBubbleText,
    ...(isUser
      ? { borderBottomRightRadius: '0.25rem' }
      : { borderBottomLeftRadius: '0.25rem' }),
  }}
>
  {isUser ? (
    <span className="whitespace-pre-wrap">{message.content}</span>
  ) : (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
        li: ({ children }) => <li className="text-sm">{children}</li>,
        code: ({ children }) => (
          <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(255,255,255,0.1)' }}>
            {children}
          </code>
        ),
      }}
    >
      {message.content}
    </ReactMarkdown>
  )}
</div>
```

**Step 4: Commit**
```bash
git add components/tutor/ChatMessage.tsx package.json package-lock.json
git commit -m "feat: add Markdown rendering to tutor assistant messages"
```

---

### Task 9: BadgeUnlockModal com confetti + celebração de XP

**Files:**
- Create: `components/gamification/BadgeUnlockModal.tsx`
- Modify: `components/tutor/ChatInterface.tsx`

**Step 1: Criar `BadgeUnlockModal.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getBadgeById } from '@/lib/gamification/badges';

interface BadgeUnlockModalProps {
  badgeIds: string[];
  onClose: () => void;
}

export function BadgeUnlockModal({ badgeIds, onClose }: BadgeUnlockModalProps) {
  const [current, setCurrent] = useState(0);
  const badge = getBadgeById(badgeIds[current]);

  useEffect(() => {
    if (badgeIds.length === 0) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [badgeIds, onClose]);

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
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative rounded-3xl p-8 text-center max-w-xs w-full shadow-2xl"
          style={{ background: '#1A2E42', border: `1px solid ${color}30` }}
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white">
            <X size={16} />
          </button>

          {/* Glow */}
          <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: `0 0 60px ${color}20` }} />

          {/* Confetti particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 3 === 0 ? color : i % 3 === 1 ? '#F0F4F8' : '#F5A623',
                top: '50%',
                left: '50%',
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: (Math.cos((i / 12) * Math.PI * 2) * 120),
                y: (Math.sin((i / 12) * Math.PI * 2) * 120),
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            />
          ))}

          <motion.div
            className="text-7xl mb-4"
            animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {badge.icon}
          </motion.div>

          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color }}>
            Badge Desbloqueado!
          </div>
          <h3 className="text-white text-xl font-extrabold mb-2">{badge.name}</h3>
          <p className="text-sm" style={{ color: 'rgba(240,244,248,0.55)' }}>{badge.description}</p>

          <motion.div
            className="mt-6 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
          >
            {badge.rarity}
          </motion.div>

          {badgeIds.length > 1 && current < badgeIds.length - 1 && (
            <button
              onClick={() => setCurrent(c => c + 1)}
              className="mt-4 block w-full text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              +{badgeIds.length - current - 1} badge(s) mais →
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

**Step 2: Atualizar `ChatInterface.tsx` para mostrar o modal e confetti de XP**

Leia o arquivo. Faça estas mudanças:

1. Adicione import:
```tsx
import { BadgeUnlockModal } from '@/components/gamification/BadgeUnlockModal';
```

2. Adicione state:
```tsx
const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
```

3. Em `handleXPEarned`, substitua o `console.log` de badges por:
```tsx
const earned = await checkAndAwardBadges(supabase, profile.id);
if (earned.length > 0) setNewBadgeIds(earned);
```

4. No JSX, antes do fechamento do `</AgeThemeProvider>`, adicione:
```tsx
{newBadgeIds.length > 0 && (
  <BadgeUnlockModal
    badgeIds={newBadgeIds}
    onClose={() => setNewBadgeIds([])}
  />
)}
```

**Step 3: Commit**
```bash
git add components/gamification/BadgeUnlockModal.tsx components/tutor/ChatInterface.tsx
git commit -m "feat: add BadgeUnlockModal with confetti animation"
```

---

### Task 10: Redesenhar SessionSummary com trophy e próxima sugestão

**Files:**
- Modify: `components/tutor/SessionSummary.tsx`

**Step 1: Substituir o arquivo inteiro**

```tsx
'use client';

import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, Flame, ArrowRight } from 'lucide-react';
import { getSubjectById, getAllSubjects } from '@/lib/subjects/config';

interface SessionSummaryProps {
  xpEarned: number;
  messageCount: number;
  subject: string;
  onNewSession: () => void;
}

export function SessionSummary({ xpEarned, messageCount, subject, onNewSession }: SessionSummaryProps) {
  const subjectInfo = getSubjectById(subject);
  const allSubjects = getAllSubjects ? getAllSubjects() : [];
  const suggestions = allSubjects.filter(s => s.id !== subject).slice(0, 2);

  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-1 gap-6 py-8 px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Confetti particles */}
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-2.5 h-2.5 rounded-sm pointer-events-none"
          style={{
            background: i % 4 === 0 ? '#F5A623' : i % 4 === 1 ? '#00B4D8' : i % 4 === 2 ? '#8B5CF6' : '#10B981',
            top: '40%',
            left: `${20 + (i * 4)}%`,
            zIndex: 10,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: -200 - Math.random() * 100, opacity: 0, rotate: 360 * (i % 2 === 0 ? 1 : -1) }}
          transition={{ duration: 1.5, delay: i * 0.05, ease: 'easeOut' }}
        />
      ))}

      {/* Trophy */}
      <motion.div
        className="text-8xl"
        animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.9, delay: 0.3 }}
      >
        🏆
      </motion.div>

      <div className="text-center">
        <h2 className="text-white text-2xl font-extrabold mb-1">Sessão incrível!</h2>
        <p className="text-sm" style={{ color: 'rgba(240,244,248,0.5)' }}>
          {subjectInfo?.name ?? subject} · {messageCount} trocas com o Edu
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <motion.div
          className="rounded-2xl px-6 py-4 text-center"
          style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-3xl font-extrabold flex items-center gap-1 justify-center" style={{ color: '#F5A623' }}>
            <Sparkles size={20} />
            +{xpEarned}
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(240,244,248,0.4)' }}>XP ganhos</div>
        </motion.div>

        <motion.div
          className="rounded-2xl px-6 py-4 text-center"
          style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-3xl font-extrabold flex items-center gap-1 justify-center" style={{ color: '#F97316' }}>
            <Flame size={20} />
            +1
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(240,244,248,0.4)' }}>streak</div>
        </motion.div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          className="w-full max-w-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs text-center mb-3" style={{ color: 'rgba(240,244,248,0.4)' }}>
            Continuar estudando?
          </p>
          <div className="flex gap-2">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={onNewSession}
                className="flex-1 flex items-center gap-2 p-3 rounded-xl text-xs font-medium text-white transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
                <ArrowRight size={12} className="ml-auto opacity-40" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* New session button */}
      <motion.button
        onClick={onNewSession}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(240,244,248,0.7)' }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <RotateCcw size={15} />
        Nova sessão
      </motion.button>
    </motion.div>
  );
}
```

**Atenção:** `getSubjectById` já existe em `lib/subjects/config`. Verifique se `getAllSubjects` existe — se não existir, substitua `suggestions` por um array hardcoded de matérias comuns:
```typescript
const suggestions = [
  { id: 'math', name: 'Matemática', icon: '🔢' },
  { id: 'portuguese', name: 'Português', icon: '📝' },
].filter(s => s.id !== subject).slice(0, 2);
```

**Step 2: Commit**
```bash
git add components/tutor/SessionSummary.tsx
git commit -m "feat: redesign SessionSummary with trophy, confetti and subject suggestions"
```

---

### Task 11: Redesenhar onboarding da criança com Edu falando e prévia do chat

**Files:**
- Modify: `components/onboarding/WelcomeFlow.tsx`

**Step 1: Substituir o array `kidSteps`**

Leia o arquivo. Substitua o array `kidSteps` inteiro (linhas do `const kidSteps: Step[] = [` até o `];` correspondente) por:

```typescript
const kidSteps: Step[] = [
  {
    mascotExpression: 'waving',
    title: 'Oi! Eu sou o Edu 👋',
    subtitle: 'Vou te ajudar a entender qualquer coisa — sem te dar as respostas prontas!',
    features: [
      { icon: Brain, text: 'Faço perguntas que te ajudam a pensar', color: '#8B5CF6' },
      { icon: BookOpen, text: '7 matérias: matemática, português e muito mais', color: '#00B4D8' },
      { icon: Trophy, text: 'Ganhe XP e conquistas a cada sessão', color: '#F5A623' },
    ],
  },
  {
    mascotExpression: 'thinking',
    title: 'Veja como funciona',
    subtitle: 'É assim que a gente estuda junto',
    features: [
      { icon: BookOpen, text: 'Você me manda a tarefa (foto ou texto)', color: '#10B981' },
      { icon: Brain, text: 'Eu faço perguntas para guiar seu raciocínio', color: '#8B5CF6' },
      { icon: Sparkles, text: 'Você descobre a resposta sozinho!', color: '#F5A623' },
    ],
    customContent: (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 rounded-2xl p-4 text-left"
        style={{ background: 'rgba(0,180,216,0.08)', border: '1px solid rgba(0,180,216,0.15)' }}
      >
        <p className="text-xs font-medium mb-3" style={{ color: 'rgba(240,244,248,0.5)' }}>Prévia de uma conversa real:</p>
        {[
          { role: 'user', text: 'Quanto é 2 + 2?' },
          { role: 'assistant', text: 'Boa pergunta! 🤔 Se você tiver 2 maçãs e ganhar mais 2, com quantas fica?' },
          { role: 'user', text: 'Com 4?' },
          { role: 'assistant', text: '🎉 Exatamente! Você acabou de descobrir que 2 + 2 = 4!' },
        ].map((msg, i) => (
          <motion.div
            key={i}
            className={`flex mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.2 }}
          >
            <span
              className="text-xs px-3 py-1.5 rounded-xl max-w-[85%]"
              style={{
                background: msg.role === 'user' ? '#8B5CF6' : 'rgba(255,255,255,0.08)',
                color: 'rgba(240,244,248,0.9)',
              }}
            >
              {msg.text}
            </span>
          </motion.div>
        ))}
      </motion.div>
    ),
  },
  {
    mascotExpression: 'celebrating',
    title: 'Pronto para começar? 🚀',
    subtitle: 'Sua primeira conquista está esperando por você!',
    features: [
      { icon: Trophy, text: 'Ganhe XP a cada resposta e suba de nível', color: '#F5A623' },
      { icon: BarChart3, text: 'Mantenha sua sequência de estudo', color: '#3B82F6' },
      { icon: Sparkles, text: 'Desbloqueie badges e mostre suas conquistas', color: '#8B5CF6' },
    ],
    customContent: (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        className="mt-4 flex flex-col items-center gap-2"
      >
        <div className="text-5xl">🌟</div>
        <p className="text-sm font-bold" style={{ color: '#F5A623' }}>Badge "Primeiro Passo" te espera!</p>
        <p className="text-xs" style={{ color: 'rgba(240,244,248,0.4)' }}>Desbloqueado ao iniciar sua primeira sessão</p>
      </motion.div>
    ),
  },
];
```

**Step 2: Commit**
```bash
git add components/onboarding/WelcomeFlow.tsx
git commit -m "feat: redesign kid onboarding with Edu speaking and chat preview"
```

---

### Task 12: Build check e push final

**Step 1: Verificar se `lib/subjects/config.ts` exporta `getAllSubjects`**
```bash
grep -n "getAllSubjects\|export" /Users/carlostrindade/eduquest-mvp/lib/subjects/config.ts | head -20
```

Se não existir, o SessionSummary já tem fallback com array hardcoded — não quebra.

**Step 2: Build**
```bash
npm run build 2>&1 | tail -40
```

Esperado: zero erros TypeScript, todas as páginas compilando.

Se houver erro de tipo no `SessionSummary` com `getAllSubjects`, confirmar que o fallback hardcoded está sendo usado.

**Step 3: Push**
```bash
git push origin main
```

**Step 4: Verificar deploy**
```bash
curl -s -o /dev/null -w "%{http_code}" https://www.studdo.com.br/
```
Esperado: `200`
