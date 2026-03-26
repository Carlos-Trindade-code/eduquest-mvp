'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, GraduationCap, Users, Ticket, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { fadeInUp } from '@/lib/design/animations';
import type { UserType } from '@/lib/auth/types';

interface RegisterFormProps {
  onRegister?: (data: {
    email: string;
    password: string;
    name: string;
    userType: UserType;
    age?: number;
    grade?: string;
    inviteCode?: string;
  }) => Promise<void>;
  onGoogleRegister?: () => Promise<void>;
}

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export function RegisterForm({ onRegister, onGoogleRegister }: RegisterFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTypeSelect = (type: UserType) => {
    setUserType(type);
    setDirection(1);
    setStep(2);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas nao conferem');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onRegister?.({
        email,
        password,
        name,
        userType: userType!,
        age: age ? parseInt(age) : undefined,
        grade: grade || undefined,
        inviteCode: inviteCode || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const mascotExpression = step === 1 ? 'waving' as const : 'encouraging' as const;

  return (
    <div className="min-h-screen bg-gradient-app flex">
      {/* Left: Illustration */}
      <motion.div
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-indigo-600/20" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 text-center px-12">
          <motion.div
            key={mascotExpression}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <MascotOwl expression={mascotExpression} size="xl" animated />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8"
          >
            <h2 className="text-white text-2xl font-bold mb-2">
              Comece sua jornada!
            </h2>
            <p className="text-white/50 text-sm max-w-xs mx-auto">
              Milhares de estudantes ja aprendem de verdade com o Studdo.
            </p>
          </motion.div>

          {['🚀', '🎓', '✨', '📖'].map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              style={{
                top: `${20 + i * 18}%`,
                left: i % 2 === 0 ? '10%' : '85%',
              }}
              animate={{
                y: [0, -12, 0],
                rotate: [0, i % 2 === 0 ? 8 : -8, 0],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Logo */}
          <motion.div className="text-center mb-6" variants={fadeInUp('medium')} initial="hidden" animate="visible">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white text-lg font-black">S</span>
              </div>
              <span className="text-white font-bold text-2xl">Studdo</span>
            </Link>
            <h1 className="text-white text-xl font-bold">Crie sua conta</h1>
            <p className="text-[var(--eq-text-secondary)] text-sm mt-1">
              Comece sua jornada de aprendizado
            </p>
          </motion.div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-5 px-1">
            <div className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-purple-500' : 'bg-white/10'}`} />
            <div className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-purple-500' : 'bg-white/10'}`} />
          </div>

          {/* Mobile mascot */}
          <motion.div
            className="lg:hidden flex justify-center mb-5"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <MascotOwl expression={mascotExpression} size="md" animated />
          </motion.div>

          <div className="glass rounded-2xl p-6">
            <div role="alert" aria-live="polite">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2"
                  >
                    <span className="shrink-0">⚠️</span>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 ? (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-4"
                >
                  <p className="text-[var(--eq-text-secondary)] text-sm text-center mb-2">Quem e voce?</p>

                  <motion.button
                    onClick={() => handleTypeSelect('kid')}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border-2 border-transparent hover:border-purple-500/50 transition-all group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                      <GraduationCap size={24} className="text-amber-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-white font-semibold text-sm">Sou estudante</p>
                      <p className="text-[var(--eq-text-muted)] text-xs">Quero estudar com o tutor IA</p>
                    </div>
                    <ArrowRight size={16} className="text-white/20 group-hover:text-purple-400 transition-colors" />
                  </motion.button>

                  <motion.button
                    onClick={() => handleTypeSelect('parent')}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border-2 border-transparent hover:border-purple-500/50 transition-all group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center shrink-0">
                      <Users size={24} className="text-blue-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-white font-semibold text-sm">Sou pai/mae</p>
                      <p className="text-[var(--eq-text-muted)] text-xs">Quero acompanhar o progresso do meu filho</p>
                    </div>
                    <ArrowRight size={16} className="text-white/20 group-hover:text-purple-400 transition-colors" />
                  </motion.button>

                  <motion.button
                    onClick={() => handleTypeSelect('teacher')}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border-2 border-transparent hover:border-purple-500/50 transition-all group"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center shrink-0">
                      <BookOpen size={24} className="text-green-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-white font-semibold text-sm">Sou professor(a)</p>
                      <p className="text-[var(--eq-text-muted)] text-xs">Quero criar turmas e enviar materiais</p>
                    </div>
                    <ArrowRight size={16} className="text-white/20 group-hover:text-purple-400 transition-colors" />
                  </motion.button>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/8" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-[var(--eq-surface)] px-3 text-white/30">ou</span>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={onGoogleRegister}
                    className="w-full py-3 bg-white/5 text-white/80 font-semibold rounded-xl hover:bg-white/10 text-sm border border-white/10 flex items-center justify-center gap-2 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continuar com Google
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="step2"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-[var(--eq-text-secondary)] text-sm hover:text-white transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft size={14} />
                    Voltar
                  </button>

                  <div className="space-y-1.5">
                    <label htmlFor="register-name" className="text-[var(--eq-text-secondary)] text-sm font-medium block">Nome</label>
                    <div className="relative group">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        id="register-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={userType === 'kid' ? 'Seu nome ou apelido' : 'Seu nome'}
                        className="w-full bg-white/5 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="register-email" className="text-[var(--eq-text-secondary)] text-sm font-medium block">Email</label>
                    <div className="relative group">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full bg-white/5 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  {userType === 'kid' && (
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label htmlFor="register-age" className="text-[var(--eq-text-secondary)] text-sm font-medium block">Idade</label>
                          <input
                            id="register-age"
                            type="number"
                            min="4"
                            max="18"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="12"
                            className="w-full bg-white/5 text-white placeholder-white/50 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-sm transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="register-grade" className="text-[var(--eq-text-secondary)] text-sm font-medium block">Serie/Ano</label>
                          <input
                            id="register-grade"
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            placeholder="7o ano"
                            className="w-full bg-white/5 text-white placeholder-white/50 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-sm transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
                        <label htmlFor="register-invite-code" className="text-[var(--eq-text-secondary)] text-sm font-medium block">
                          Codigo de convite do seu pai/mae
                        </label>
                        <div className="relative group">
                          <Ticket size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                          <input
                            id="register-invite-code"
                            type="text"
                            value={inviteCode}
                            onChange={(e) => {
                              let val = e.target.value.toUpperCase();
                              // Auto-format: add EQ- prefix if user types without it
                              if (val.length > 0 && !val.startsWith('EQ-') && !val.startsWith('EQ') && !val.startsWith('E')) {
                                val = 'EQ-' + val;
                              }
                              // Limit to EQ-XXXX format (max 7 chars)
                              if (val.length <= 7) {
                                setInviteCode(val);
                              }
                            }}
                            placeholder="EQ-XXXX"
                            maxLength={7}
                            className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-sm transition-all uppercase tracking-widest font-mono"
                          />
                        </div>
                        <p className="text-white/50 text-xs pl-1">Se nao tiver agora, pode vincular depois no app</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="register-password" className="text-[var(--eq-text-secondary)] text-sm font-medium block">Senha</label>
                    <div className="relative group">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimo 6 caracteres"
                        className="w-full bg-white/5 text-white placeholder-white/50 rounded-xl pl-10 pr-12 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-sm transition-all"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-2"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="register-confirm-password" className="text-[var(--eq-text-secondary)] text-sm font-medium block">Confirmar senha</label>
                    <div className="relative group">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                      <input
                        id="register-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Digite a senha novamente"
                        className="w-full bg-white/5 text-white placeholder-white/50 rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 text-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || !email || !password || !name}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25"
                    whileHover={{ scale: 1.01, boxShadow: '0 8px 30px rgba(139, 92, 246, 0.35)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <>
                        Criar conta
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="text-center text-[var(--eq-text-secondary)] text-sm mt-5">
              Ja tem conta?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
