'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, Trophy, BarChart3, Sparkles, Users, Copy, Check, Shield } from 'lucide-react';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import type { UserType } from '@/lib/auth/types';

interface WelcomeFlowProps {
  userName?: string;
  userType?: UserType;
  inviteCode?: string | null;
  onComplete: () => void;
}

interface Step {
  mascotExpression: 'celebrating' | 'thinking' | 'encouraging' | 'waving';
  title: string;
  subtitle: string;
  features: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; text: string; color: string }[];
  customContent?: React.ReactNode;
}

const kidSteps: Step[] = [
  {
    mascotExpression: 'celebrating',
    title: 'Bem-vindo ao Studdo!',
    subtitle: 'Sua jornada de aprendizado comeca agora',
    features: [
      { icon: Brain, text: 'Tutor IA que te guia sem dar respostas prontas', color: '#8B5CF6' },
      { icon: BookOpen, text: '7 materias cobrindo todo o curriculo escolar', color: '#3B82F6' },
      { icon: Trophy, text: 'Ganhe XP e conquistas enquanto aprende', color: '#F59E0B' },
    ],
    customContent: (
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1.1 }} transition={{ duration: 0.5 }} className="mt-4">
        <span className="text-purple-400 font-bold">Mini-desafio: Clique na coruja para ganhar seu primeiro badge!</span>
        <button className="cursor-pointer mt-2" onClick={() => alert('Parabéns! Você ganhou seu primeiro badge 🎉')}>
          <MascotOwl expression="waving" size="lg" animated />
        </button>
      </motion.div>
    ),
  },
  {
    mascotExpression: 'thinking',
    title: 'Como funciona?',
    subtitle: 'O Edu te ajuda a pensar, nao a copiar',
    features: [
      { icon: BookOpen, text: 'Envie sua tarefa por texto ou foto', color: '#10B981' },
      { icon: Brain, text: 'O Edu faz perguntas para guiar seu raciocinio', color: '#8B5CF6' },
      { icon: Sparkles, text: 'Voce descobre a resposta por conta propria!', color: '#F59E0B' },
    ],
    customContent: (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="mt-4">
        <span className="text-blue-400 font-bold">Mini-jogo: Qual dessas imagens é um mapa?</span>
        <div className="flex gap-4 mt-2">
          <img src="/images/mapa.png" alt="Imagem de um mapa, representando geografia" className="w-16 h-16 rounded-lg border border-blue-300 cursor-pointer" onClick={() => alert('Muito bem! Você acertou 🎉')} />
          <img src="/images/bola.png" alt="Imagem de uma bola, representando objeto esportivo" className="w-16 h-16 rounded-lg border border-blue-300 cursor-pointer" onClick={() => alert('Tente de novo!')} />
        </div>
      </motion.div>
    ),
  },
  {
    mascotExpression: 'encouraging',
    title: 'Pronto para comecar?',
    subtitle: 'Cada sessao te deixa mais perto da proxima conquista',
    features: [
      { icon: Trophy, text: 'Ganhe XP a cada resposta e suba de nivel', color: '#F59E0B' },
      { icon: BarChart3, text: 'Acompanhe seu progresso e mantenha o streak', color: '#3B82F6' },
      { icon: Sparkles, text: 'Desbloqueie badges e mostre suas conquistas', color: '#8B5CF6' },
    ],
    customContent: (
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="mt-4">
        <span className="text-green-400 font-bold">Trilha de estudo sugerida: Geografia → Matemática → Inglês</span>
        <div className="flex gap-2 mt-2">
          <span className="bg-purple-500/20 px-3 py-1 rounded-full text-purple-300">Geografia</span>
          <span className="bg-blue-500/20 px-3 py-1 rounded-full text-blue-300">Matemática</span>
          <span className="bg-pink-500/20 px-3 py-1 rounded-full text-pink-300">Inglês</span>
        </div>
      </motion.div>
    ),
  },
];

function buildParentSteps(inviteCode?: string | null): Step[] {
  return [
    {
      mascotExpression: 'celebrating',
      title: 'Bem-vindo ao Studdo!',
      subtitle: 'Acompanhe o aprendizado do seu filho de perto',
      features: [
        { icon: BarChart3, text: 'Dashboard com graficos de progresso e sessoes', color: '#3B82F6' },
        { icon: Shield, text: 'Ambiente seguro e pedagogico para seu filho', color: '#10B981' },
        { icon: Brain, text: 'Metodo socratico — sem dar respostas prontas', color: '#8B5CF6' },
      ],
    },
    {
      mascotExpression: 'waving',
      title: 'Vincule seu filho',
      subtitle: 'Compartilhe o codigo abaixo com seu filho',
      features: [
        { icon: Users, text: 'Seu filho digita o codigo ao criar a conta', color: '#8B5CF6' },
        { icon: Shield, text: 'Conexao segura — so quem tem o codigo vincula', color: '#10B981' },
        { icon: BarChart3, text: 'Voce vera o progresso dele no dashboard', color: '#3B82F6' },
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
        { icon: BarChart3, text: 'Veja sessoes, XP e streak do seu filho', color: '#3B82F6' },
        { icon: Trophy, text: 'Acompanhe conquistas e badges desbloqueados', color: '#F59E0B' },
        { icon: Sparkles, text: 'O codigo de convite tambem esta no dashboard', color: '#8B5CF6' },
      ],
    },
  ];
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
          Seu codigo de convite
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
            Codigo copiado!
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

export function WelcomeFlow({ userName, userType = 'kid', inviteCode, onComplete }: WelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const steps = userType === 'parent' ? buildParentSteps(inviteCode) : kidSteps;
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setDirection(1);
    setCurrentStep((s) => s + 1);
  };

  const lastButtonLabel = userType === 'parent' ? 'Ir para o Dashboard' : 'Comecar a estudar!';

  return (
    <div className="min-h-screen bg-gradient-app flex items-center justify-center px-4 py-8">
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

        {/* Action button */}
        <motion.button
          onClick={handleNext}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25"
          whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)' }}
          whileTap={{ scale: 0.98 }}
        >
          {isLast ? lastButtonLabel : 'Proximo'}
          <ArrowRight size={16} />
        </motion.button>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={onComplete}
            className="w-full py-2 text-white/30 hover:text-white/50 text-xs transition-colors mt-3"
          >
            Pular introducao
          </button>
        )}
      </div>
    </div>
  );
}
