import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Brain, Gamepad2, BarChart3, Camera, Clock, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Como funciona o Studdo — Tutor IA com metodo socratico',
  description: 'Entenda como o Studdo usa inteligencia artificial e o metodo socratico para ajudar criancas de 4 a 18 anos a aprender de verdade, sem dar respostas prontas.',
  openGraph: {
    title: 'Como funciona o Studdo — Tutor IA com metodo socratico',
    description: 'Entenda como o Studdo usa IA e metodo socratico para ensinar criancas a pensar.',
  },
};

const steps = [
  {
    icon: Camera,
    title: 'Envie o dever de casa',
    description: 'Tire uma foto, faça upload ou digite a tarefa. O Edu lê tudo com OCR inteligente.',
    color: '#8B5CF6',
  },
  {
    icon: Brain,
    title: 'Método socrático em ação',
    description: 'Em vez de dar a resposta, o Edu faz perguntas que guiam o aluno a descobrir sozinho.',
    color: '#06B6D4',
  },
  {
    icon: Gamepad2,
    title: 'Gamificação motiva',
    description: 'XP, badges, streaks e leaderboard transformam estudo em desafio. Cada sessão conta.',
    color: '#F5A623',
  },
  {
    icon: BarChart3,
    title: 'Pais acompanham tudo',
    description: 'Dashboard com sessões, progresso, pontos fortes, dificuldades e dicas personalizadas.',
    color: '#10B981',
  },
  {
    icon: Clock,
    title: 'Timer Pomodoro integrado',
    description: '25 minutos de foco + 5 de pausa. Estudar com ritmo melhora a retenção.',
    color: '#F97316',
  },
  {
    icon: Shield,
    title: 'Seguro para crianças',
    description: 'O Edu só responde sobre educação. Sem distrações, sem conteúdo impróprio.',
    color: '#EC4899',
  },
];

const ageGroups = [
  { range: '4-6 anos', desc: 'Linguagem super simples, emojis, incentivo constante. Perguntas com alternativas visuais.' },
  { range: '7-9 anos', desc: 'Explicações com exemplos do dia a dia. Dicas passo a passo para resolver problemas.' },
  { range: '10-12 anos', desc: 'Raciocínio guiado, analogias, desafios intermediários. Método Feynman aplicado.' },
  { range: '13-15 anos', desc: 'Pensamento crítico, conexões entre matérias, preparação para provas.' },
  { range: '16-18 anos', desc: 'Nível vestibular/ENEM, argumentação, resolução de problemas complexos.' },
];

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1E1046 50%, #0D1B2A 100%)' }}>
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-lg">Studdo</Link>
          <Link
            href="/tutor"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 transition-colors"
          >
            Testar grátis
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Como o Studdo ensina<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              sem dar a resposta
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            O método socrático com IA guia a criança a pensar, raciocinar e descobrir — desenvolvendo autonomia intelectual de verdade.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-6 mb-20">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex gap-5 items-start p-5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${step.color}15`, color: step.color }}
              >
                <step.icon size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white/20 text-xs font-mono">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="text-white font-bold text-base">{step.title}</h3>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Age groups */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Adaptado para cada idade
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ageGroups.map((g) => (
              <div
                key={g.range}
                className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="text-purple-400 font-bold text-sm mb-1">{g.range}</div>
                <p className="text-white/50 text-xs leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Pronto para experimentar?</h2>
          <p className="text-white/50 mb-8">Grátis durante o beta. Sem cartão de crédito.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/tutor"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90"
              style={{ background: '#F5A623', color: '#0D1B2A' }}
            >
              Testar tutor grátis
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-base text-white/70 border border-white/15 hover:bg-white/5 transition-all"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-6 text-center">
        <p className="text-white/20 text-xs">
          Studdo — Tutor IA que ensina de verdade | <Link href="/privacidade" className="hover:text-white/40">Privacidade</Link> | <Link href="/termos" className="hover:text-white/40">Termos</Link>
        </p>
      </footer>
    </div>
  );
}
