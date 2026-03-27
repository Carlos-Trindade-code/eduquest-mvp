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
    question: 'O que e o Studdo?',
    answer:
      'O Studdo e uma plataforma educacional com tutor IA que usa o metodo socratico. Em vez de dar respostas prontas, o Edu (nosso tutor) faz perguntas que guiam voce a descobrir as respostas sozinho.',
  },
  {
    question: 'Como funciona o metodo socratico?',
    answer:
      'Quando voce envia um exercicio, o Edu nao da a resposta direta — ele faz perguntas progressivas que te ajudam a pensar, raciocinar e chegar na resposta por conta propria.',
  },
  {
    question: 'Como ganho XP e badges?',
    answer:
      'Voce ganha XP enviando mensagens (10 XP), completando sessoes (50 XP), acertando respostas rapidas (100 XP) e mantendo sua sequencia de estudo (25 XP/dia). Badges sao desbloqueados ao atingir marcos como 7 dias de streak ou 50 sessoes.',
  },
  {
    question: 'O que e o timer Pomodoro?',
    answer:
      'E um temporizador de 25 minutos de foco + 5 minutos de pausa, baseado na Tecnica Pomodoro. Estudar com intervalos melhora a memorizacao em ate 40%. Clique no relogio no topo da pagina do tutor para usar.',
  },
  {
    question: 'Como meu pai/mae acompanha meu progresso?',
    answer:
      'Seus pais recebem um codigo de convite ao criar a conta. Quando voce digita esse codigo, eles podem ver suas sessoes, XP, badges e progresso em tempo real pelo dashboard.',
  },
  {
    question: 'Posso enviar foto da tarefa?',
    answer:
      'Sim! Na tela do tutor, clique em "Tirar foto" ou "Enviar foto" antes de comecar. A IA le o conteudo automaticamente e o Edu pergunta sobre ele.',
  },
  {
    question: 'Como funciona o quiz?',
    answer:
      'O quiz gera perguntas automaticamente com IA. Escolha materia, faixa etaria e quantidade (5 ou 10). Voce ganha 20 XP por acerto. Acesse pelo menu ou pela pagina inicial.',
  },
  {
    question: 'Meus dados estao seguros?',
    answer:
      'Sim! Usamos criptografia e controle de acesso em todas as tabelas. Cada usuario so acessa seus proprios dados. Pais so veem dados dos filhos vinculados.',
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
      setAiAnswer(data.answer || 'Nao consegui responder. Tente reformular a pergunta.');
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
            Encontre respostas, pergunte ao Edu ou envie uma sugestao
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
            Nao encontrou sua duvida? Pergunte diretamente — o Edu responde na hora.
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
            Envie uma sugestao
          </h2>
          <p className="text-xs mb-4" style={{ color: 'rgba(240,244,248,0.4)' }}>
            Ideias, criticas, elogios — queremos ouvir voce!
          </p>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="O que voce gostaria de ver no Studdo?"
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
