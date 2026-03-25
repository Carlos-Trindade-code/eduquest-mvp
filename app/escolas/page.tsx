'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  GraduationCap, Upload, BarChart3, Users, Shield, Zap,
  BookOpen, Brain, CheckCircle, ArrowRight, Sparkles, Send, School,
} from 'lucide-react';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { fadeInUp, staggerContainer } from '@/lib/design/animations';

const benefits = [
  {
    icon: Upload,
    title: 'Envie seus materiais',
    description: 'Upload de PDFs, apostilas e tarefas. A IA usa como base para guiar o aluno.',
    color: '#8B5CF6',
  },
  {
    icon: Brain,
    title: 'Metodo socratico',
    description: 'Nunca da respostas prontas. O aluno desenvolve raciocinio critico de verdade.',
    color: '#3B82F6',
  },
  {
    icon: BarChart3,
    title: 'Dashboard por turma',
    description: 'Veja o progresso de cada aluno: sessoes, acertos, tempo de estudo, materias.',
    color: '#10B981',
  },
  {
    icon: Zap,
    title: 'Quizzes automaticos',
    description: 'Gere provas e simulados baseados no seu material com um clique.',
    color: '#F59E0B',
  },
  {
    icon: Users,
    title: 'Turmas com codigo',
    description: 'Crie turmas e compartilhe um codigo. Alunos entram em segundos.',
    color: '#EC4899',
  },
  {
    icon: Shield,
    title: 'Seguro e privado',
    description: 'Dados protegidos, sem anuncios, ambiente 100% pedagogico.',
    color: '#06B6D4',
  },
];

const useCases = [
  { emoji: '📚', title: 'Para casa', desc: 'Aluno fotografa a tarefa e o Edu guia a resolucao passo a passo' },
  { emoji: '📝', title: 'Revisao para prova', desc: 'Professor envia o conteudo, a IA gera quiz personalizado' },
  { emoji: '🔬', title: 'Reforco escolar', desc: 'Alunos com dificuldade recebem atendimento adaptado ao nivel deles' },
  { emoji: '🏆', title: 'Gamificacao', desc: 'XP, badges e ranking motivam o estudo sem perder o foco no aprendizado' },
];

export default function EscolasPage() {
  const [form, setForm] = useState({
    schoolName: '', contactName: '', email: '', phone: '', role: 'professor', studentCount: '', message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.schoolName || !form.contactName || !form.email) {
      setError('Preencha escola, nome e email');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/school-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setSending(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-app">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Sparkles className="text-yellow-400" size={22} />
            <span className="text-white font-bold text-xl">Studdo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/tutor" className="text-white/50 hover:text-white text-sm transition-colors">
              Testar tutor
            </Link>
            <a
              href="#contato"
              className="px-4 py-2 rounded-lg text-sm font-bold bg-purple-600 text-white hover:bg-purple-500 transition-colors"
            >
              Fale conosco
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#A78BFA' }}>
              <School size={14} />
              Para Escolas e Professores
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Seu material didatico +{' '}
            <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #F5A623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              tutor IA
            </span>
          </motion.h1>

          <motion.p
            className="text-lg max-w-2xl mx-auto mb-8"
            style={{ color: 'rgba(240,244,248,0.6)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Envie apostilas, tarefas e provas. O Studdo transforma em sessoes de estudo
            interativas com metodo socratico — sem dar respostas prontas.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <a
              href="#contato"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90"
              style={{ background: '#F5A623', color: '#0D1B2A', boxShadow: '0 8px 32px rgba(245,166,35,0.35)' }}
            >
              Agendar demonstracao
              <ArrowRight size={18} />
            </a>
            <Link
              href="/tutor"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-base transition-all hover:bg-white/10"
              style={{ color: 'rgba(240,244,248,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              Testar como aluno
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-2xl font-extrabold text-white text-center mb-12"
            variants={fadeInUp('medium')}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            O que o Studdo oferece para sua escola
          </motion.h2>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                variants={fadeInUp('medium')}
                className="glass rounded-2xl p-6"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${b.color}15` }}
                >
                  <b.icon size={22} style={{ color: b.color }} />
                </div>
                <h3 className="text-white font-bold text-sm mb-2">{b.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,244,248,0.5)' }}>
                  {b.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 px-4" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-white text-center mb-4">Como escolas usam o Studdo</h2>
          <p className="text-sm text-center mb-10" style={{ color: 'rgba(240,244,248,0.4)' }}>
            Cenarios reais de uso em sala de aula e em casa
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="rounded-2xl p-5 flex gap-4"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="text-3xl shrink-0">{uc.emoji}</div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">{uc.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,244,248,0.5)' }}>{uc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <MascotOwl expression="encouraging" size="lg" animated />
          <h2 className="text-2xl font-extrabold text-white mt-4 mb-3">Por que o Studdo e diferente?</h2>
          <div className="space-y-3 text-left max-w-md mx-auto">
            {[
              'Nao da respostas prontas — o aluno pensa',
              'Adapta a linguagem de 4 a 18 anos',
              'Professor acompanha tudo em tempo real',
              'Funciona com qualquer materia e curriculo',
              'Gratuito para familias — plano escola sob consulta',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-green-400 shrink-0" />
                <span className="text-sm" style={{ color: 'rgba(240,244,248,0.7)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="contato" className="py-16 px-4" style={{ background: 'rgba(139,92,246,0.03)' }}>
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-extrabold text-white text-center mb-2">Fale com a gente</h2>
          <p className="text-sm text-center mb-8" style={{ color: 'rgba(240,244,248,0.4)' }}>
            Preencha o formulario e entraremos em contato para agendar uma demonstracao
          </p>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-8 text-center"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-white font-bold text-lg mb-1">Recebemos seu contato!</h3>
              <p className="text-sm" style={{ color: 'rgba(240,244,248,0.5)' }}>
                Entraremos em contato em ate 24 horas para agendar uma demonstracao.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs font-medium block mb-1.5">Nome da escola *</label>
                  <input
                    type="text"
                    value={form.schoolName}
                    onChange={(e) => updateField('schoolName', e.target.value)}
                    placeholder="Colegio Exemplo"
                    className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-medium block mb-1.5">Seu nome *</label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => updateField('contactName', e.target.value)}
                    placeholder="Maria Silva"
                    className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs font-medium block mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="maria@escola.com.br"
                    className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-medium block mb-1.5">Telefone/WhatsApp</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs font-medium block mb-1.5">Voce e</label>
                  <select
                    value={form.role}
                    onChange={(e) => updateField('role', e.target.value)}
                    className="w-full bg-white/5 text-white rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm appearance-none"
                  >
                    <option value="professor">Professor(a)</option>
                    <option value="coordenador">Coordenador(a)</option>
                    <option value="diretor">Diretor(a)</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/50 text-xs font-medium block mb-1.5">Numero de alunos</label>
                  <select
                    value={form.studentCount}
                    onChange={(e) => updateField('studentCount', e.target.value)}
                    className="w-full bg-white/5 text-white rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm appearance-none"
                  >
                    <option value="">Selecione</option>
                    <option value="1-50">1 a 50</option>
                    <option value="51-200">51 a 200</option>
                    <option value="201-500">201 a 500</option>
                    <option value="500+">Mais de 500</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/50 text-xs font-medium block mb-1.5">Mensagem (opcional)</label>
                <textarea
                  value={form.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  placeholder="Conte um pouco sobre como pretende usar o Studdo..."
                  rows={3}
                  className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm resize-none"
                />
              </div>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <motion.button
                type="submit"
                disabled={sending}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #4F46E5)', color: 'white', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}
                whileHover={!sending ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
              >
                {sending ? 'Enviando...' : (
                  <>
                    <Send size={16} />
                    Solicitar demonstracao
                  </>
                )}
              </motion.button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <Link href="/" className="text-white/30 text-xs hover:text-white/50 transition-colors">
          www.studdo.com.br
        </Link>
      </footer>
    </div>
  );
}
