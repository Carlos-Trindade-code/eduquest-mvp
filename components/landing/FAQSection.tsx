'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  MessageCircleQuestion,
  Send,
  Lightbulb,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

// ============================================================
// Pre-defined FAQ items
// ============================================================
const faqItems = [
  {
    question: 'O que é o Studdo?',
    answer:
      'O Studdo é uma plataforma educacional com tutor IA que usa o método socrático. Em vez de dar respostas prontas, o Edu (nosso tutor) faz perguntas que guiam seu filho a descobrir as respostas sozinho, construindo entendimento real.',
  },
  {
    question: 'Como funciona o método socrático?',
    answer:
      'O método socrático é baseado em perguntas guiadas. Quando seu filho envia um exercício, o Edu não dá a resposta direta — ele faz perguntas progressivas que ajudam a criança a pensar, raciocinar e chegar na resposta por conta própria.',
  },
  {
    question: 'Quanto custa?',
    answer:
      'O Studdo é totalmente grátis! No futuro, teremos planos acessíveis com funcionalidades premium, mas todas as funcionalidades atuais continuarão disponíveis.',
  },
  {
    question: 'Para que idade serve?',
    answer:
      'O Studdo atende crianças e adolescentes de 4 a 18 anos, divididos em 5 faixas etárias (4-6, 7-9, 10-12, 13-15, 16-18). A linguagem, dificuldade e abordagem se adaptam automaticamente a cada faixa.',
  },
  {
    question: 'Como conecto meu filho à minha conta?',
    answer:
      'Ao se cadastrar como pai/mãe, você recebe um código de convite (EQ-XXXX). Compartilhe esse código com seu filho — ele digita ao criar a conta, e o vínculo é feito automaticamente. Você acompanha o progresso pelo dashboard.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer:
      'Sim! Usamos Supabase com Row Level Security (RLS) em todas as tabelas. Cada usuário só acessa seus próprios dados. Pais só veem dados dos filhos vinculados. Não compartilhamos informações com terceiros.',
  },
];

// ============================================================
// Accordion item
// ============================================================
function FAQItem({ item, isOpen, onClick }: {
  item: typeof faqItems[0];
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div className="glass rounded-xl overflow-hidden" layout>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="text-[#1E1B4B] font-medium text-sm pr-4">{item.question}</span>
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
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4 text-gray-500 text-sm leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================
// Main FAQ Section
// ============================================================
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // AI Q&A state
  const [aiQuestion, setAIQuestion] = useState('');
  const [aiAnswer, setAIAnswer] = useState('');
  const [aiLoading, setAILoading] = useState(false);

  // Suggestion state
  const [suggestion, setSuggestion] = useState('');
  const [suggName, setSuggName] = useState('');
  const [suggEmail, setSuggEmail] = useState('');
  const [suggLoading, setSuggLoading] = useState(false);
  const [suggSent, setSuggSent] = useState(false);

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || aiLoading) return;
    setAILoading(true);
    setAIAnswer('');
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiQuestion }),
      });
      const data = await res.json();
      setAIAnswer(data.answer || data.error || 'Erro ao responder.');
    } catch {
      setAIAnswer('Não consegui responder. Tente novamente.');
    } finally {
      setAILoading(false);
    }
  };

  const handleSendSuggestion = async () => {
    if (!suggestion.trim() || suggestion.trim().length < 5 || suggLoading) return;
    setSuggLoading(true);
    try {
      await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: suggestion,
          userName: suggName || undefined,
          userEmail: suggEmail || undefined,
        }),
      });
      setSuggSent(true);
      setSuggestion('');
      setSuggName('');
      setSuggEmail('');
      setTimeout(() => setSuggSent(false), 8000);
    } catch {
      // Silent fail for MVP
    } finally {
      setSuggLoading(false);
    }
  };

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.04),transparent_70%)]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.span variants={fadeInUp('medium')} className="text-sm font-medium text-purple-400">
            Dúvidas & Sugestões
          </motion.span>
          <motion.h2 variants={fadeInUp('medium')} className="mt-3 text-3xl sm:text-4xl font-bold text-[#1E1B4B]">
            Perguntas Frequentes
          </motion.h2>
        </motion.div>

        {/* ===== FAQ Accordion ===== */}
        <motion.div
          className="space-y-3 mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {faqItems.map((item, i) => (
            <motion.div key={i} variants={fadeInUp('medium')}>
              <FAQItem
                item={item}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* ===== Ask AI ===== */}
        <motion.div
          className="glass rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-4">
            <MascotOwl expression="thinking" size="sm" animated />
            <div>
              <h3 className="text-[#1E1B4B] font-bold text-lg flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                Pergunte ao Edu
              </h3>
              <p className="text-gray-400 text-xs">Nosso assistente IA responde suas dúvidas</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAIQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              placeholder="Ex: Como meu filho de 8 anos pode usar?"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#1E1B4B] text-sm placeholder:text-gray-400 focus:outline-none focus:border-purple-500/50"
            />
            <motion.button
              onClick={handleAskAI}
              disabled={aiLoading || !aiQuestion.trim()}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-xl text-white transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {aiLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <MessageCircleQuestion size={18} />
              )}
            </motion.button>
          </div>

          {/* AI Answer */}
          <AnimatePresence>
            {aiAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4"
              >
                <p className="text-[#1E1B4B] text-sm leading-relaxed">{aiAnswer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ===== Suggestion Form ===== */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={20} className="text-amber-400" />
            <h3 className="text-[#1E1B4B] font-bold text-lg">Envie uma Sugestão</h3>
          </div>
          <p className="text-gray-400 text-xs mb-4">
            Sua opinião nos ajuda a melhorar! Conte o que gostaria de ver no Studdo.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={suggName}
              onChange={(e) => setSuggName(e.target.value)}
              placeholder="Seu nome (opcional)"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[#1E1B4B] text-sm placeholder:text-gray-400 focus:outline-none focus:border-purple-500/50"
            />
            <input
              type="email"
              value={suggEmail}
              onChange={(e) => setSuggEmail(e.target.value)}
              placeholder="Seu email (opcional)"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[#1E1B4B] text-sm placeholder:text-gray-400 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Descreva sua sugestão aqui..."
            rows={3}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#1E1B4B] text-sm placeholder:text-gray-400 focus:outline-none focus:border-purple-500/50 resize-none mb-3"
          />

          <div className="flex items-center justify-between">
            <AnimatePresence>
              {suggSent && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-green-400 text-sm"
                >
                  <Check size={16} />
                  Obrigado pela sugestão! Vamos analisá-la com carinho. 💜
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleSendSuggestion}
              disabled={suggLoading || suggestion.trim().length < 5}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 rounded-xl text-gray-900 text-sm font-semibold transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {suggLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Enviar
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
