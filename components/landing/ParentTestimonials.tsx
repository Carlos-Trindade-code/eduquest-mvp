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
    <section className="relative py-24" style={{ background: 'rgba(99,102,241,0.03)' }}>
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
              <span className="ml-2" style={{ color: '#6B7280' }}>4.9 nas primeiras semanas</span>
            </span>
          </motion.div>
          <motion.h2
            variants={fadeInUp('medium')}
            className="text-3xl sm:text-4xl font-extrabold text-[#1E1B4B]"
          >
            Pais que viram a diferença
          </motion.h2>
          <motion.p variants={fadeInUp('medium')} className="mt-3 text-base" style={{ color: '#6B7280' }}>
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
              style={{ background: 'white', border: '1px solid rgba(99,102,241,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="#F5A623" color="#F5A623" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-base leading-relaxed flex-1" style={{ color: '#1E1B4B' }}>
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ background: 'rgba(99,102,241,0.08)' }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-[#1E1B4B] font-semibold text-sm">{t.name}</div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>{t.childAge} · {t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
