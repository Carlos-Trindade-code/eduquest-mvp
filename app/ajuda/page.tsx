'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Send,
  Loader2,
  Sparkles,
  MessageCircleQuestion,
  Lightbulb,
  Check,
  Home,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

const faqItems = [
  {
    question: 'O que é o Studdo?',
    answer:
      'O Studdo é uma plataforma educacional com tutor IA que usa o método socrático. Em vez de dar respostas prontas, o Edu (nosso tutor) faz perguntas que guiam você a descobrir as respostas sozinho.',
  },
  {
    question: 'Como funciona o método socrático?',
    answer:
      'Quando você envia um exercício, o Edu não dá a resposta direta — ele faz perguntas progressivas que te ajudam a pensar, raciocinar e chegar na resposta por conta própria.',
  },
  {
    question: 'Como ganho XP e badges?',
    answer:
      'Você ganha XP enviando mensagens (10 XP), completando sessões (50 XP), acertando respostas rápidas (100 XP) e mantendo sua sequência de estudo (25 XP/dia). Badges são desbloqueados ao atingir marcos como 7 dias de streak ou 50 sessões.',
  },
  {
    question: 'O que é o timer Pomodoro?',
    answer:
      'É um temporizador de 25 minutos de foco + 5 minutos de pausa, baseado na Técnica Pomodoro. Estudar com intervalos melhora a memorização em até 40%. Clique no relógio no topo da página do tutor para usar.',
  },
  {
    question: 'Como meu pai/mãe acompanha meu progresso?',
    answer:
      'Seus pais recebem um código de convite ao criar a conta. Quando você digita esse código, eles podem ver suas sessões, XP, badges e progresso em tempo real pelo dashboard.',
  },
  {
    question: 'Posso enviar foto da tarefa?',
    answer:
      'Sim! Na tela do tutor, clique em "Tirar foto" ou "Enviar foto" antes de começar. A IA lê o conteúdo automaticamente e o Edu pergunta sobre ele.',
  },
  {
    question: 'Como funciona o quiz?',
    answer:
      'O quiz gera perguntas automaticamente com IA. Escolha matéria, faixa etária e quantidade (5 ou 10). Você ganha 20 XP por acerto. Acesse pelo menu ou pela página inicial.',
  },
  {
    question: 'Meus dados estao seguros?',
    answer:
      'Sim! Usamos criptografia e controle de acesso em todas as tabelas. Cada usuário só acessa seus próprios dados. Pais só veem dados dos filhos vinculados.',
  },
  // FAQs para pais
  {
    question: 'Como conecto minha conta ao meu filho?',
    answer:
      'Ao criar sua conta como pai/mãe, você recebe automaticamente um código de convite (ex: EQ-A1B2). Compartilhe esse código com seu filho — ele digita ao criar a conta dele, e pronto! Vocês ficam conectados. Você também encontra o código no seu dashboard a qualquer momento.',
  },
  {
    question: 'O que vejo no dashboard de pais?',
    answer:
      'Você vê todas as sessões do seu filho, quanto tempo estudou, XP acumulado, streak de dias seguidos, badges conquistados e quais matérias mais praticou. Tudo atualizado em tempo real.',
  },
  {
    question: 'Posso acompanhar mais de um filho?',
    answer:
      'Sim! Seu código de convite funciona para todos os seus filhos. Cada um cria sua conta com o mesmo código e todos aparecem no seu dashboard.',
  },
  // FAQs para escolas
  {
    question: 'Como funciona o Studdo para escolas?',
    answer:
      'Professores podem criar turmas, enviar materiais e acompanhar o progresso de cada aluno. Os alunos usam o tutor IA para estudar e o professor vê tudo pelo dashboard. Visite a página Para Escolas para saber mais.',
  },
  {
    question: 'Quanto custa o plano para escolas?',
    answer:
      'O Studdo é gratuito para famílias. Para escolas, oferecemos planos personalizados conforme o número de alunos. Entre em contato pela página Para Escolas para receber uma proposta.',
  },
  {
    question: 'O Studdo está em conformidade com a LGPD?',
    answer:
      'Sim. Todos os dados são armazenados com criptografia, controle de acesso por perfil (RLS) e nunca compartilhados com terceiros. Alunos menores só tem dados visíveis para pais vinculados e professores da turma.',
  },
];

function FAQItem({ item, isOpen, onClick }: {
  item: typeof faqItems[0];
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="text-white font-medium text-sm pr-4">{item.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={18} className="text-purple-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,244,248,0.6)' }}>
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AjudaPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionSent, setSuggestionSent] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const handleAskEdu = async () => {
    if (!aiQuestion.trim() || aiLoading) return;
    setAiLoading(true);
    setAiAnswer('');
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiQuestion.trim() }),
      });
      const data = await res.json();
      setAiAnswer(data.answer || 'Não consegui responder. Tente reformular a pergunta.');
    } catch {
      setAiAnswer('Erro ao conectar. Tente novamente.');
    }
    setAiLoading(false);
  };

  const handleSendSuggestion = async () => {
    if (!suggestion.trim() || suggestion.trim().length < 5) return;
    setSuggestionLoading(true);
    try {
      await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: suggestion.trim() }),
      });
      setSuggestionSent(true);
      setSuggestion('');
      setTimeout(() => setSuggestionSent(false), 4000);
    } catch {
      // silent
    }
    setSuggestionLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-app">
      {/* Header */}
      <header className="glass border-b border-white/5 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircleQuestion size={18} className="text-purple-400" />
            <span className="text-white font-bold">Ajuda</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        {/* Hero */}
        <motion.div
          className="text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUp('high')} className="mb-4">
            <MascotOwl expression="waving" size="lg" animated />
          </motion.div>
          <motion.h1 variants={fadeInUp('high')} className="text-white text-3xl font-extrabold mb-2">
            Como podemos ajudar?
          </motion.h1>
          <motion.p variants={fadeInUp('high')} className="text-sm" style={{ color: 'rgba(240,244,248,0.5)' }}>
            Encontre respostas, pergunte ao Edu ou envie uma sugestão
          </motion.p>
        </motion.div>

        {/* FAQ Accordion */}
        <section>
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            Perguntas Frequentes
          </h2>
          <div className="space-y-2">
            {faqItems.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </section>

        {/* Ask Edu AI */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
            <MessageCircleQuestion size={18} className="text-cyan-400" />
            Pergunte ao Edu
          </h2>
          <p className="text-xs mb-4" style={{ color: 'rgba(240,244,248,0.4)' }}>
            Não encontrou sua dúvida? Pergunte diretamente — o Edu responde na hora.
          </p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskEdu()}
              placeholder="Ex: Como funciona o streak?"
              className="flex-1 bg-white/5 text-white placeholder-white/40 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-cyan-500/50 text-sm"
            />
            <button
              onClick={handleAskEdu}
              disabled={!aiQuestion.trim() || aiLoading}
              className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition-colors shrink-0"
            >
              {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <AnimatePresence>
            {aiAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4"
              >
                <div className="flex items-start gap-2">
                  <MascotOwl expression="encouraging" size="sm" animated={false} />
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,244,248,0.8)' }}>
                    {aiAnswer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Suggestion Form */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-400" />
            Envie uma sugestão
          </h2>
          <p className="text-xs mb-4" style={{ color: 'rgba(240,244,248,0.4)' }}>
            Ideias, críticas, elogios — queremos ouvir você!
          </p>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="O que você gostaria de ver no Studdo?"
            rows={3}
            className="w-full bg-white/5 text-white placeholder-white/40 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-amber-500/50 text-sm resize-none mb-3"
          />
          <div className="flex items-center justify-between">
            <span className="text-white/20 text-xs">{suggestion.length}/500</span>
            {suggestionSent ? (
              <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                <Check size={14} />
                Enviado!
              </span>
            ) : (
              <button
                onClick={handleSendSuggestion}
                disabled={suggestion.trim().length < 5 || suggestionLoading}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                {suggestionLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Enviar
              </button>
            )}
          </div>
        </section>

        {/* Quick links */}
        <section className="grid grid-cols-2 gap-3">
          <Link
            href="/tutorial"
            className="glass rounded-xl p-4 text-center hover:bg-white/5 transition-colors"
          >
            <span className="text-2xl block mb-1">📖</span>
            <p className="text-white text-sm font-medium">Como Usar</p>
            <p className="text-white/40 text-xs">Tutorial completo</p>
          </Link>
          <Link
            href="/tutor"
            className="glass rounded-xl p-4 text-center hover:bg-white/5 transition-colors"
          >
            <span className="text-2xl block mb-1">🦉</span>
            <p className="text-white text-sm font-medium">Tutor IA</p>
            <p className="text-white/40 text-xs">Estudar agora</p>
          </Link>
        </section>
      </main>
      <FeedbackButton />
    </div>
  );
}
