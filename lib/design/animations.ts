import type { Variants, Transition } from 'framer-motion';

type Intensity = 'high' | 'medium' | 'low';

function getTransition(intensity: Intensity): Transition {
  switch (intensity) {
    case 'high':
      return { type: 'spring', stiffness: 300, damping: 15 };
    case 'medium':
      return { type: 'spring', stiffness: 400, damping: 22 };
    case 'low':
      return { duration: 0.2, ease: 'easeOut' };
  }
}

/** Minimal transition for reduced-motion: just a quick opacity fade */
const reducedTransition: Transition = { duration: 0.15, ease: 'easeOut' };

function reducedVariants(): Variants {
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: reducedTransition },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  };
}

export function fadeInUp(intensity: Intensity = 'medium', reduceMotion = false): Variants {
  if (reduceMotion) return reducedVariants();
  return {
    hidden: { opacity: 0, y: intensity === 'high' ? 30 : intensity === 'medium' ? 20 : 10 },
    visible: { opacity: 1, y: 0, transition: getTransition(intensity) },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
  };
}

export function fadeIn(intensity: Intensity = 'medium', reduceMotion = false): Variants {
  if (reduceMotion) return reducedVariants();
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: getTransition(intensity) },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };
}

export function scaleIn(intensity: Intensity = 'medium', reduceMotion = false): Variants {
  if (reduceMotion) return reducedVariants();
  return {
    hidden: { opacity: 0, scale: intensity === 'high' ? 0.5 : 0.85 },
    visible: { opacity: 1, scale: 1, transition: getTransition(intensity) },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
  };
}

export function slideInLeft(intensity: Intensity = 'medium', reduceMotion = false): Variants {
  if (reduceMotion) return reducedVariants();
  return {
    hidden: { opacity: 0, x: intensity === 'high' ? -50 : -25 },
    visible: { opacity: 1, x: 0, transition: getTransition(intensity) },
    exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
  };
}

export function slideInRight(intensity: Intensity = 'medium', reduceMotion = false): Variants {
  if (reduceMotion) return reducedVariants();
  return {
    hidden: { opacity: 0, x: intensity === 'high' ? 50 : 25 },
    visible: { opacity: 1, x: 0, transition: getTransition(intensity) },
    exit: { opacity: 0, x: 20, transition: { duration: 0.15 } },
  };
}

export function bounceIn(intensity: Intensity = 'high', reduceMotion = false): Variants {
  if (reduceMotion) return reducedVariants();
  return {
    hidden: { opacity: 0, scale: 0.3 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: intensity === 'high'
        ? { type: 'spring', stiffness: 500, damping: 12 }
        : intensity === 'medium'
          ? { type: 'spring', stiffness: 400, damping: 18 }
          : { duration: 0.25, ease: 'easeOut' },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.1 } },
  };
}

export function staggerContainerFn(reduceMotion = false): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0, delayChildren: 0 } },
    };
  }
  return staggerContainer;
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export function staggerContainerSlowFn(reduceMotion = false): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0, delayChildren: 0 } },
    };
  }
  return staggerContainerSlow;
}

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

// Chat message animation by age group
export function chatMessageVariants(intensity: Intensity, reduceMotion = false): Variants {
  if (reduceMotion) return reducedVariants();
  switch (intensity) {
    case 'high':
      return {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
          opacity: 1, y: 0, scale: 1,
          transition: { type: 'spring', stiffness: 350, damping: 18 },
        },
      };
    case 'medium':
      return {
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1, y: 0,
          transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      };
    case 'low':
      return {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.15 },
        },
      };
  }
}

// Floating/hovering effect for mascot
export const floatAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Pulse glow for badges
export const pulseGlow = {
  boxShadow: [
    '0 0 0 0 rgba(139, 92, 246, 0.4)',
    '0 0 20px 10px rgba(139, 92, 246, 0.2)',
    '0 0 0 0 rgba(139, 92, 246, 0)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// XP gain number floating up
export const xpFloatUp: Variants = {
  hidden: { opacity: 0, y: 0, scale: 0.5 },
  visible: {
    opacity: [0, 1, 1, 0],
    y: -50,
    scale: 1,
    transition: { duration: 1.5, ease: 'easeOut' },
  },
};

// Shimmer effect for XP bar
export const shimmer = {
  x: ['-100%', '200%'],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatDelay: 3,
    ease: 'linear',
  },
};
