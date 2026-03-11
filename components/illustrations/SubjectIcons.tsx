'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SubjectIconProps {
  subject: string;
  size?: number;
  animated?: boolean;
  className?: string;
}

export function SubjectIcon({ subject, size = 40, animated = true, className }: SubjectIconProps) {
  const shouldReduceMotion = useReducedMotion();
  const isAnimated = animated && !shouldReduceMotion;

  const icons: Record<string, React.ReactNode> = {
    math: <MathIcon size={size} animated={isAnimated} />,
    portugues: <PortugueseIcon size={size} animated={isAnimated} />,
    historia: <HistoryIcon size={size} animated={isAnimated} />,
    ciencias: <ScienceIcon size={size} animated={isAnimated} />,
    geografia: <GeographyIcon size={size} animated={isAnimated} />,
    ingles: <EnglishIcon size={size} animated={isAnimated} />,
    outros: <OtherIcon size={size} animated={isAnimated} />,
  };

  return (
    <span className={cn('inline-flex', className)}>
      {icons[subject] || icons.outros}
    </span>
  );
}

function MathIcon({ size, animated }: { size: number; animated: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#3B82F6" opacity="0.15" />
      <motion.g
        animate={animated ? { rotate: [0, 5, -5, 0] } : undefined}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '20px 20px' }}
      >
        {/* Plus */}
        <rect x="12" y="8" width="3" height="12" rx="1" fill="#3B82F6" />
        <rect x="8" y="12" width="12" height="3" rx="1" fill="#3B82F6" />
        {/* Equals */}
        <rect x="24" y="11" width="8" height="2.5" rx="1" fill="#60A5FA" />
        <rect x="24" y="15.5" width="8" height="2.5" rx="1" fill="#60A5FA" />
        {/* Pi symbol */}
        <text x="14" y="33" fontSize="12" fontWeight="bold" fill="#3B82F6" fontFamily="serif">
          {'π'}
        </text>
        {/* Small number */}
        <text x="26" y="32" fontSize="9" fontWeight="600" fill="#60A5FA">
          {'42'}
        </text>
      </motion.g>
    </svg>
  );
}

function PortugueseIcon({ size, animated }: { size: number; animated: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#10B981" opacity="0.15" />
      <motion.g
        animate={animated ? { y: [0, -2, 0] } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Book shape */}
        <path d="M10 10 Q20 8 20 10 L20 32 Q20 30 10 32 Z" fill="#10B981" />
        <path d="M30 10 Q20 8 20 10 L20 32 Q20 30 30 32 Z" fill="#059669" />
        {/* Lines on page */}
        <line x1="13" y1="15" x2="18" y2="15" stroke="#A7F3D0" strokeWidth="1" strokeLinecap="round" />
        <line x1="13" y1="19" x2="17" y2="19" stroke="#A7F3D0" strokeWidth="1" strokeLinecap="round" />
        <line x1="13" y1="23" x2="18" y2="23" stroke="#A7F3D0" strokeWidth="1" strokeLinecap="round" />
        {/* Pencil */}
        <motion.g
          animate={animated ? { rotate: [0, -5, 5, 0], x: [0, 1, -1, 0] } : undefined}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          style={{ transformOrigin: '30px 28px' }}
        >
          <rect x="28" y="14" width="3" height="16" rx="0.5" fill="#FBBF24" transform="rotate(15, 29.5, 22)" />
          <polygon points="27,29 29.5,33 32,29" fill="#F59E0B" transform="rotate(15, 29.5, 31)" />
        </motion.g>
      </motion.g>
    </svg>
  );
}

function HistoryIcon({ size, animated }: { size: number; animated: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#F59E0B" opacity="0.15" />
      <motion.g
        animate={animated ? { scale: [1, 1.03, 1] } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '20px 20px' }}
      >
        {/* Temple/columns */}
        <rect x="10" y="14" width="20" height="3" rx="1" fill="#F59E0B" />
        <polygon points="8,14 20,7 32,14" fill="#D97706" />
        <rect x="12" y="17" width="3" height="14" rx="0.5" fill="#F59E0B" />
        <rect x="18.5" y="17" width="3" height="14" rx="0.5" fill="#FBBF24" />
        <rect x="25" y="17" width="3" height="14" rx="0.5" fill="#F59E0B" />
        <rect x="9" y="31" width="22" height="3" rx="1" fill="#D97706" />
      </motion.g>
    </svg>
  );
}

function ScienceIcon({ size, animated }: { size: number; animated: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#8B5CF6" opacity="0.15" />
      {/* Flask */}
      <path d="M16 8 L16 18 L10 32 Q9 34 11 35 L29 35 Q31 34 30 32 L24 18 L24 8 Z" fill="#8B5CF6" opacity="0.3" />
      <rect x="15" y="6" width="10" height="3" rx="1" fill="#8B5CF6" />
      <line x1="16" y1="8" x2="16" y2="18" stroke="#8B5CF6" strokeWidth="1.5" />
      <line x1="24" y1="8" x2="24" y2="18" stroke="#8B5CF6" strokeWidth="1.5" />
      {/* Liquid */}
      <path d="M12 28 Q14 25 20 27 Q26 29 28 26 L30 32 Q31 34 29 35 L11 35 Q9 34 10 32 Z" fill="#A78BFA" />
      {/* Bubbles */}
      <motion.circle
        cx="17"
        cy="30"
        r="1.5"
        fill="#C4B5FD"
        animate={animated ? { y: [0, -8], opacity: [1, 0] } : undefined}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
      />
      <motion.circle
        cx="22"
        cy="28"
        r="1"
        fill="#DDD6FE"
        animate={animated ? { y: [0, -10], opacity: [1, 0] } : undefined}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 0.5, delay: 0.7 }}
      />
      <motion.circle
        cx="20"
        cy="32"
        r="1.3"
        fill="#C4B5FD"
        animate={animated ? { y: [0, -6], opacity: [1, 0] } : undefined}
        transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.5, delay: 1 }}
      />
    </svg>
  );
}

function GeographyIcon({ size, animated }: { size: number; animated: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#06B6D4" opacity="0.15" />
      <motion.g
        animate={animated ? { rotate: [0, 360] } : undefined}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '20px 20px' }}
      >
        <circle cx="20" cy="20" r="14" fill="#06B6D4" />
        {/* Continents */}
        <path d="M14 12 Q16 10 20 12 Q22 14 18 16 Q14 14 14 12 Z" fill="#0E7490" />
        <path d="M22 14 Q26 13 28 16 Q27 20 24 18 Q22 16 22 14 Z" fill="#0E7490" />
        <path d="M12 20 Q14 18 16 20 Q18 24 14 26 Q10 24 12 20 Z" fill="#0E7490" />
        <path d="M22 22 Q26 20 28 24 Q26 28 22 26 Q20 24 22 22 Z" fill="#0E7490" />
        {/* Grid lines */}
        <ellipse cx="20" cy="20" rx="14" ry="6" fill="none" stroke="#67E8F9" strokeWidth="0.5" opacity="0.4" />
        <ellipse cx="20" cy="20" rx="6" ry="14" fill="none" stroke="#67E8F9" strokeWidth="0.5" opacity="0.4" />
      </motion.g>
    </svg>
  );
}

function EnglishIcon({ size, animated }: { size: number; animated: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#EF4444" opacity="0.15" />
      <motion.g
        animate={animated ? { y: [0, -2, 0] } : undefined}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Speech bubble */}
        <rect x="8" y="8" width="24" height="18" rx="4" fill="#EF4444" />
        <polygon points="14,26 18,26 12,32" fill="#EF4444" />
        {/* Text */}
        <text x="13" y="15" fontSize="5" fontWeight="bold" fill="white" fontFamily="sans-serif">
          {'Hello!'}
        </text>
        <text x="11" y="22" fontSize="4" fill="#FCA5A5" fontFamily="sans-serif">
          {'How are'}
        </text>
      </motion.g>
    </svg>
  );
}

function OtherIcon({ size, animated }: { size: number; animated: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#6B7280" opacity="0.15" />
      <motion.g
        animate={animated ? { scale: [1, 1.05, 1] } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '20px 20px' }}
      >
        {/* Stack of books */}
        <rect x="10" y="26" width="20" height="4" rx="1" fill="#6B7280" />
        <rect x="11" y="21" width="18" height="4" rx="1" fill="#9CA3AF" />
        <rect x="12" y="16" width="16" height="4" rx="1" fill="#6B7280" />
        {/* Star on top */}
        <motion.text
          x="20"
          y="14"
          fontSize="10"
          textAnchor="middle"
          animate={animated ? { rotate: [0, 360] } : undefined}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '20px 10px' }}
        >
          {'⭐'}
        </motion.text>
      </motion.g>
    </svg>
  );
}
