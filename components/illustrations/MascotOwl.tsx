'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type MascotExpression =
  | 'neutral'
  | 'thinking'
  | 'encouraging'
  | 'celebrating'
  | 'waving'
  | 'reading';

interface MascotOwlProps {
  expression?: MascotExpression;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 48,
  md: 80,
  lg: 120,
  xl: 180,
};

const ariaLabels: Record<MascotExpression, string> = {
  neutral: 'Edu, a coruja mascote do Studdo',
  thinking: 'Edu esta pensando',
  encouraging: 'Edu esta te incentivando',
  celebrating: 'Edu esta comemorando',
  waving: 'Edu esta acenando para voce',
  reading: 'Edu esta lendo',
};

const eyeExpressions: Record<MascotExpression, { leftPupilY: number; rightPupilY: number; leftEyeScale: number; rightEyeScale: number; blinkRate: number }> = {
  neutral: { leftPupilY: 0, rightPupilY: 0, leftEyeScale: 1, rightEyeScale: 1, blinkRate: 4 },
  thinking: { leftPupilY: -2, rightPupilY: -2, leftEyeScale: 0.9, rightEyeScale: 1.1, blinkRate: 6 },
  encouraging: { leftPupilY: 1, rightPupilY: 1, leftEyeScale: 1.15, rightEyeScale: 1.15, blinkRate: 3 },
  celebrating: { leftPupilY: -1, rightPupilY: -1, leftEyeScale: 1.2, rightEyeScale: 1.2, blinkRate: 2 },
  waving: { leftPupilY: 0, rightPupilY: 0, leftEyeScale: 1.1, rightEyeScale: 1, blinkRate: 3 },
  reading: { leftPupilY: 3, rightPupilY: 3, leftEyeScale: 0.85, rightEyeScale: 0.85, blinkRate: 5 },
};

export function MascotOwl({
  expression = 'neutral',
  size = 'md',
  animated = true,
  className,
}: MascotOwlProps) {
  const shouldReduceMotion = useReducedMotion();
  const s = sizeMap[size];
  const eyes = eyeExpressions[expression];
  const isAnimated = animated && !shouldReduceMotion;

  return (
    <motion.svg
      width={s}
      height={s}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('select-none', className)}
      role="img"
      aria-label={ariaLabels[expression]}
      animate={
        isAnimated
          ? {
              y: [0, -4, 0],
              transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }
          : undefined
      }
    >
      {/* Body */}
      <motion.ellipse
        cx="60"
        cy="72"
        rx="32"
        ry="36"
        fill="#D97706"
        initial={false}
        animate={
          expression === 'celebrating' && isAnimated
            ? { scale: [1, 1.03, 1], transition: { duration: 0.6, repeat: Infinity } }
            : { scale: 1 }
        }
        style={{ transformOrigin: '60px 72px' }}
      />
      {/* Body pattern (belly) */}
      <ellipse cx="60" cy="80" rx="20" ry="22" fill="#FBBF24" opacity="0.6" />

      {/* Left wing */}
      <motion.path
        d="M28 60 Q20 70 26 85 Q30 78 34 72 Z"
        fill="#B45309"
        animate={
          expression === 'waving' && isAnimated
            ? {
                rotate: [0, -15, 0, -15, 0],
                transition: { duration: 1.2, repeat: Infinity, repeatDelay: 1 },
              }
            : expression === 'celebrating' && isAnimated
              ? {
                  rotate: [0, -20, 10, -20, 0],
                  transition: { duration: 0.8, repeat: Infinity },
                }
              : { rotate: 0 }
        }
        style={{ transformOrigin: '30px 72px' }}
      />
      {/* Right wing */}
      <motion.path
        d="M92 60 Q100 70 94 85 Q90 78 86 72 Z"
        fill="#B45309"
        animate={
          expression === 'waving' && isAnimated
            ? {
                rotate: [0, 15, 0, 15, 0],
                transition: { duration: 1.2, repeat: Infinity, repeatDelay: 1, delay: 0.1 },
              }
            : expression === 'celebrating' && isAnimated
              ? {
                  rotate: [0, 20, -10, 20, 0],
                  transition: { duration: 0.8, repeat: Infinity, delay: 0.1 },
                }
              : { rotate: 0 }
        }
        style={{ transformOrigin: '90px 72px' }}
      />

      {/* Head */}
      <circle cx="60" cy="48" r="26" fill="#D97706" />
      {/* Face disc */}
      <circle cx="60" cy="50" r="20" fill="#FDE68A" opacity="0.35" />

      {/* Ear tufts */}
      <path d="M38 28 Q34 18 40 22 Q42 26 42 32 Z" fill="#92400E" />
      <path d="M82 28 Q86 18 80 22 Q78 26 78 32 Z" fill="#92400E" />

      {/* Graduation cap */}
      <motion.g
        animate={
          expression === 'celebrating' && isAnimated
            ? { y: [0, -3, 0], rotate: [-3, 3, -3], transition: { duration: 0.5, repeat: Infinity } }
            : { y: 0, rotate: 0 }
        }
        style={{ transformOrigin: '60px 22px' }}
      >
        <polygon points="60,10 40,22 60,18 80,22" fill="#4F46E5" />
        <rect x="42" y="18" width="36" height="5" rx="1" fill="#4338CA" />
        <line x1="74" y1="20" x2="80" y2="28" stroke="#4F46E5" strokeWidth="1.5" />
        <circle cx="80" cy="29" r="2" fill="#FBBF24" />
      </motion.g>

      {/* Left eye */}
      <motion.g
        animate={
          isAnimated
            ? {
                scaleY: eyes.leftEyeScale,
                transition: { duration: 0.3 },
              }
            : undefined
        }
        style={{ transformOrigin: '48px 48px' }}
      >
        <circle cx="48" cy="48" r="10" fill="white" />
        <motion.circle
          cx="48"
          cy={48 + eyes.leftPupilY}
          r="5"
          fill="#1E1B4B"
          animate={
            isAnimated
              ? {
                  scaleY: [1, 0.1, 1],
                  transition: {
                    duration: 0.15,
                    repeat: Infinity,
                    repeatDelay: eyes.blinkRate,
                  },
                }
              : undefined
          }
          style={{ transformOrigin: `48px ${48 + eyes.leftPupilY}px` }}
        />
        {/* Pupil highlight */}
        <circle cx="46" cy={46 + eyes.leftPupilY} r="2" fill="white" opacity="0.8" />
      </motion.g>

      {/* Right eye */}
      <motion.g
        animate={
          isAnimated
            ? {
                scaleY: eyes.rightEyeScale,
                transition: { duration: 0.3 },
              }
            : undefined
        }
        style={{ transformOrigin: '72px 48px' }}
      >
        <circle cx="72" cy="48" r="10" fill="white" />
        <motion.circle
          cx="72"
          cy={48 + eyes.rightPupilY}
          r="5"
          fill="#1E1B4B"
          animate={
            isAnimated
              ? {
                  scaleY: [1, 0.1, 1],
                  transition: {
                    duration: 0.15,
                    repeat: Infinity,
                    repeatDelay: eyes.blinkRate,
                    delay: 0.05,
                  },
                }
              : undefined
          }
          style={{ transformOrigin: `72px ${48 + eyes.rightPupilY}px` }}
        />
        <circle cx="70" cy={46 + eyes.rightPupilY} r="2" fill="white" opacity="0.8" />
      </motion.g>

      {/* Beak */}
      <motion.path
        d="M56 56 L60 64 L64 56 Z"
        fill="#F97316"
        animate={
          expression === 'encouraging' && isAnimated
            ? { scaleY: [1, 1.1, 1], transition: { duration: 0.8, repeat: Infinity } }
            : { scaleY: 1 }
        }
        style={{ transformOrigin: '60px 60px' }}
      />

      {/* Smile/mouth under beak for celebrating */}
      {expression === 'celebrating' && (
        <motion.path
          d="M54 63 Q60 68 66 63"
          stroke="#92400E"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Feet */}
      <path d="M48 104 L44 112 L48 110 L52 112 L48 104" fill="#F97316" />
      <path d="M72 104 L68 112 L72 110 L76 112 L72 104" fill="#F97316" />

      {/* Book for reading expression */}
      {expression === 'reading' && (
        <motion.g
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <rect x="40" y="88" width="40" height="6" rx="1" fill="#6366F1" />
          <rect x="40" y="88" width="20" height="6" rx="1" fill="#818CF8" />
          <line x1="60" y1="88" x2="60" y2="94" stroke="#4F46E5" strokeWidth="0.5" />
        </motion.g>
      )}

      {/* Thinking bubbles */}
      {expression === 'thinking' && isAnimated && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.circle
            cx="88"
            cy="30"
            r="3"
            fill="white"
            opacity="0.6"
            animate={{ y: [0, -3, 0], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle
            cx="94"
            cy="22"
            r="4"
            fill="white"
            opacity="0.5"
            animate={{ y: [0, -4, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <motion.circle
            cx="98"
            cy="13"
            r="5"
            fill="white"
            opacity="0.4"
            animate={{ y: [0, -5, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          />
        </motion.g>
      )}

      {/* Stars for celebrating */}
      {expression === 'celebrating' && isAnimated && (
        <motion.g>
          {[
            { cx: 20, cy: 20, size: 4, delay: 0 },
            { cx: 100, cy: 15, size: 3, delay: 0.2 },
            { cx: 15, cy: 65, size: 3, delay: 0.4 },
            { cx: 105, cy: 55, size: 4, delay: 0.3 },
          ].map((star, i) => (
            <motion.text
              key={i}
              x={star.cx}
              y={star.cy}
              fontSize={star.size * 3}
              textAnchor="middle"
              dominantBaseline="middle"
              animate={{
                scale: [0, 1.2, 1],
                opacity: [0, 1, 0.8],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: star.delay,
              }}
              style={{ transformOrigin: `${star.cx}px ${star.cy}px` }}
            >
              {'✨'}
            </motion.text>
          ))}
        </motion.g>
      )}
    </motion.svg>
  );
}
