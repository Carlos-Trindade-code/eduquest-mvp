'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Trophy, BarChart3, Sparkles, Users, Copy, Check, Shield, School } from 'lucide-react';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { createClient } from '@/lib/supabase/client';
import { updateProfile, redeemInviteCode } from '@/lib/supabase/queries';
import { trackEvent } from '@/lib/analytics/track';
import { JoinClassroom } from '@/components/classroom/JoinClassroom';
import { Link2, Ticket } from 'lucide-react';
import type { UserType } from '@/lib/auth/types';

interface WelcomeFlowProps {
  userName?: string;
  userType?: UserType;
  inviteCode?: string | null;
  profileId?: string;
  onComplete: () => void;
  inviteError?: boolean;
}

interface Step {
  mascotExpression: 'celebrating' | 'thinking' | 'encouraging' | 'waving';
  title: string;
  subtitle: string;
  features: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; text: string; color: string }[];
  customContent?: React.ReactNode;
}

function buildKidSteps(profileId?: string, onAgeSelected?: () => void, onInviteLinked?: () => void, onClassroomJoined?: () => void): Step[] {
  return [
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
          { role: 'user', text: 'Quais as causas da Revolução Francesa?' },
          { role: 'assistant', text: 'Boa pergunta! 🤔 Como você acha que era a vida de um camponês na França em 1789?' },
          { role: 'user', text: 'Difícil... trabalhavam muito e não tinham dinheiro?' },
          { role: 'assistant', text: '🎉 Isso! E enquanto o povo passava fome, quem vivia em palácios? Pense nisso!' },
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
    mascotExpression: 'thinking',
    title: 'Qual a sua idade?',
    subtitle: 'Isso me ajuda a falar do jeito certo com você',
    features: [],
    customContent: (
      <AgeSelector profileId={profileId} onSelected={() => onAgeSelected?.()} />
    ),
  },
  {
    mascotExpression: 'encouraging',
    title: 'Tem um código do seu pai/mãe?',
    subtitle: 'Vincule sua conta para eles acompanharem seu progresso',
    features: [
      { icon: Link2, text: 'Seu pai/mãe vê suas conquistas e XP', color: '#10B981' },
      { icon: Shield, text: 'Conexão segura — só com o código', color: '#8B5CF6' },
    ],
    customContent: (
      <InviteCodeInput onLinked={() => onInviteLinked?.()} />
    ),
  },
  {
    mascotExpression: 'thinking',
    title: 'Tem código de turma?',
    subtitle: 'Se seu professor te deu um código, digite aqui',
    features: [
      { icon: School, text: 'Acesse materiais enviados pelo professor', color: '#F59E0B' },
      { icon: BookOpen, text: 'O tutor usa o conteúdo da aula como base', color: '#3B82F6' },
    ],
    customContent: (
      <JoinClassroom mode="inline" onJoined={() => onClassroomJoined?.()} />
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
}

function buildParentSteps(inviteCode?: string | null): Step[] {
  return [
    {
      mascotExpression: 'celebrating',
      title: 'Bem-vindo ao Studdo!',
      subtitle: 'Acompanhe o aprendizado do seu filho de perto',
      features: [
        { icon: BarChart3, text: 'Dashboard com gráficos de progresso e sessões', color: '#3B82F6' },
        { icon: Shield, text: 'Ambiente seguro e pedagógico para seu filho', color: '#10B981' },
        { icon: Brain, text: 'Método socrático — sem dar respostas prontas', color: '#8B5CF6' },
      ],
    },
    {
      mascotExpression: 'waving',
      title: 'Vincule seu filho',
      subtitle: 'Compartilhe o código abaixo com seu filho',
      features: [
        { icon: Users, text: 'Seu filho digita o código ao criar a conta', color: '#8B5CF6' },
        { icon: Shield, text: 'Conexão segura — só quem tem o código vincula', color: '#10B981' },
        { icon: BarChart3, text: 'Você verá o progresso dele no dashboard', color: '#3B82F6' },
      ],
      customContent: inviteCode ? (
        <InviteCodeDisplay code={inviteCode} />
      ) : undefined,
    },
    {
      mascotExpression: 'encouraging',
      title: 'Tudo pronto!',
      subtitle: 'Vamos para o seu dashboard',
      features: [
        { icon: BarChart3, text: 'Veja sessões, XP e streak do seu filho', color: '#3B82F6' },
        { icon: Trophy, text: 'Acompanhe conquistas e badges desbloqueados', color: '#F59E0B' },
        { icon: Sparkles, text: 'O código de convite também está no dashboard', color: '#8B5CF6' },
      ],
    },
  ];
}

const AGE_OPTIONS = [
  { label: '4–6 anos', emoji: '🧒', age: 5, grade: 'infantil' },
  { label: '7–9 anos', emoji: '📚', age: 8, grade: 'fundamental-1' },
  { label: '10–12 anos', emoji: '🔬', age: 11, grade: 'fundamental-2' },
  { label: '13–15 anos', emoji: '🎓', age: 14, grade: 'ensino-medio' },
  { label: '16–18 anos', emoji: '🚀', age: 17, grade: 'ensino-medio' },
];

function AgeSelector({ profileId, onSelected }: { profileId?: string; onSelected: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (option: typeof AGE_OPTIONS[number]) => {
    setSelected(option.age);
    if (profileId) {
      setSaving(true);
      try {
        const supabase = createClient();
        await updateProfile(supabase, profileId, { age: option.age, grade: option.grade });
      } catch {
        alert('Não foi possível salvar sua idade. Tente novamente.');
        setSelected(null);
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    setTimeout(onSelected, 400);
  };

  return (
    <div className="grid grid-cols-2 gap-3 mt-2">
      {AGE_OPTIONS.map((option, i) => (
        <motion.button
          key={option.age}
          onClick={() => handleSelect(option)}
          disabled={saving}
          className={`rounded-xl p-4 text-center transition-all ${
            option.age === selected ? 'ring-2 ring-purple-500' : ''
          }`}
          style={{
            background: option.age === selected ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${option.age === selected ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.08 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="text-2xl mb-1">{option.emoji}</div>
          <div className="text-white text-sm font-medium">{option.label}</div>
        </motion.button>
      ))}
    </div>
  );
}

function InviteCodeInput({ onLinked }: { onLinked: () => void }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [parentName, setParentName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (code.length < 7) return;
    setStatus('loading');
    try {
      const supabase = createClient();
      const { data, error } = await redeemInviteCode(supabase, code);
      if (error || !data?.success) {
        setStatus('error');
        setErrorMsg(data?.error || 'Algo deu errado. Tente novamente.');
        return;
      }
      setParentName(data.parent_name || '');
      setStatus('success');
      trackEvent('invite_code_redeemed');
      setTimeout(onLinked, 1500);
    } catch {
      setStatus('error');
      setErrorMsg('Algo deu errado. Tente novamente.');
    }
  };

  const handleChange = (val: string) => {
    let v = val.toUpperCase();
    if (v.length > 0 && !v.startsWith('EQ-') && !v.startsWith('EQ') && !v.startsWith('E')) {
      v = 'EQ-' + v;
    }
    if (v.length <= 7) setCode(v);
    if (status === 'error') setStatus('idle');
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-4 rounded-2xl p-5 text-center"
        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
      >
        <div className="text-4xl mb-2">✅</div>
        <p className="text-white font-bold text-sm">Vinculado{parentName ? ` com ${parentName}` : ''}!</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(240,244,248,0.5)' }}>Seu progresso será compartilhado</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-3"
    >
      <div className="rounded-2xl p-5" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} style={{ color: '#8B5CF6' }} />
          <span className="text-sm font-semibold" style={{ color: '#8B5CF6' }}>Código do pai/mãe (EQ-XXXX)</span>
        </div>
        <div className="relative">
          <Ticket size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={code}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="EQ-XXXX"
            maxLength={7}
            className="w-full bg-white/5 text-white placeholder-white/40 rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm uppercase tracking-widest font-mono text-center"
          />
        </div>
        {status === 'error' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-2 text-center">
            {errorMsg}
          </motion.p>
        )}
        <motion.button
          onClick={handleSubmit}
          disabled={code.length < 7 || status === 'loading'}
          className="w-full mt-3 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
          style={{ background: 'rgba(139,92,246,0.3)', color: 'white' }}
          whileHover={{ scale: code.length >= 7 ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
        >
          {status === 'loading' ? 'Vinculando...' : 'Vincular'}
        </motion.button>
      </div>
      <p className="text-xs text-center" style={{ color: 'rgba(240,244,248,0.3)' }}>
        Peça ao seu pai/mãe
      </p>
    </motion.div>
  );
}

function InviteCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = code;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      className="mt-6 mb-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="glass rounded-2xl p-5 border border-purple-500/20">
        <p className="text-white/50 text-xs uppercase tracking-wider mb-2 font-medium">
          Seu código de convite
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-white text-3xl font-mono font-bold tracking-[0.3em]">
            {code}
          </span>
          <motion.button
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? (
              <Check size={18} className="text-green-400" />
            ) : (
              <Copy size={18} className="text-purple-300" />
            )}
          </motion.button>
        </div>
        {copied && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-400 text-xs mt-2"
          >
            Código copiado!
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

export function WelcomeFlow({ userName, userType = 'kid', inviteCode, profileId, onComplete, inviteError }: WelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const isAgeStep = userType === 'kid' && currentStep === 2;
  const isInviteStep = userType === 'kid' && currentStep === 3;
  const isClassroomStep = userType === 'kid' && currentStep === 4;

  const advanceStep = () => {
    setDirection(1);
    setCurrentStep((s) => s + 1);
  };

  const steps = userType === 'parent' ? buildParentSteps(inviteCode) : buildKidSteps(profileId, advanceStep, advanceStep, advanceStep);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      trackEvent('onboarding_completed', { user_type: userType });
      onComplete();
      return;
    }
    setDirection(1);
    setCurrentStep((s) => s + 1);
  };

  const lastButtonLabel = userType === 'parent' ? 'Ir para o Dashboard' : 'Começar a estudar!';

  return (
    <div className="min-h-screen bg-gradient-app flex items-center justify-center px-4 py-8">
      {inviteError && (currentStep === 0 || isInviteStep) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm rounded-xl px-4 py-3 max-w-md text-center shadow-lg">
          {isInviteStep
            ? 'O código informado no registro não funcionou. Tente digitar novamente abaixo.'
            : 'Não conseguimos vincular o código do seu pai/mãe. Você pode tentar novamente depois nas configurações.'}
        </div>
      )}
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className="h-1.5 rounded-full"
              animate={{
                width: i === currentStep ? 32 : 8,
                backgroundColor: i <= currentStep ? '#8B5CF6' : 'rgba(255,255,255,0.15)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="text-center"
          >
            {/* Mascot */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              <MascotOwl expression={step.mascotExpression} size="xl" animated />
            </motion.div>

            {/* Title */}
            <h1 className="text-white text-2xl font-bold mb-2">
              {currentStep === 0 && userName
                ? `Bem-vindo${userType === 'parent' ? '' : ''}, ${userName}!`
                : step.title}
            </h1>
            <p className="text-[var(--eq-text-secondary)] text-sm mb-8">
              {step.subtitle}
            </p>

            {/* Custom content (invite code display) */}
            {step.customContent}

            {/* Feature cards */}
            <div className="space-y-3 mb-8">
              {step.features.map((feature, i) => (
                <motion.div
                  key={i}
                  className="glass rounded-xl p-4 flex items-center gap-4 text-left"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon size={20} style={{ color: feature.color }} />
                  </div>
                  <p className="text-white/80 text-sm">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action button (hidden on age step — auto-advances on selection) */}
        {!isAgeStep && !isInviteStep && !isClassroomStep && (
          <motion.button
            onClick={handleNext}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25"
            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            {isLast ? lastButtonLabel : 'Próximo'}
            <ArrowRight size={16} />
          </motion.button>
        )}

        {/* Skip for invite step */}
        {isInviteStep && (
          <button
            onClick={handleNext}
            className="w-full py-2 text-white/30 hover:text-white/50 text-xs transition-colors mt-3"
          >
            Não tenho código — pular
          </button>
        )}

        {/* Skip for classroom step */}
        {isClassroomStep && (
          <button
            onClick={handleNext}
            className="w-full py-2 text-white/30 hover:text-white/50 text-xs transition-colors mt-3"
          >
            Não tenho código de turma — pular
          </button>
        )}

        {/* Skip */}
        {!isLast && !isAgeStep && !isInviteStep && !isClassroomStep && (
          <button
            onClick={onComplete}
            className="w-full py-2 text-white/30 hover:text-white/50 text-xs transition-colors mt-3"
          >
            Pular introdução
          </button>
        )}
      </div>
    </div>
  );
}
