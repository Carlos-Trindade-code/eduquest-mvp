'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  bounceIn,
  staggerContainerFn,
  staggerContainerSlowFn,
  chatMessageVariants,
} from '@/lib/design/animations';
import type { Variants } from 'framer-motion';

type Intensity = 'high' | 'medium' | 'low';

interface AnimationVariantFns {
  /** Whether the user prefers reduced motion */
  reduceMotion: boolean;
  fadeInUp: (intensity?: Intensity) => Variants;
  fadeIn: (intensity?: Intensity) => Variants;
  scaleIn: (intensity?: Intensity) => Variants;
  slideInLeft: (intensity?: Intensity) => Variants;
  slideInRight: (intensity?: Intensity) => Variants;
  bounceIn: (intensity?: Intensity) => Variants;
  staggerContainer: Variants;
  staggerContainerSlow: Variants;
  chatMessageVariants: (intensity: Intensity) => Variants;
}

/**
 * Hook that provides animation variant functions which automatically
 * respect the user's prefers-reduced-motion setting.
 *
 * Usage:
 * ```tsx
 * const { fadeInUp, scaleIn, staggerContainer } = useAnimationVariants();
 * ```
 */
export function useAnimationVariants(): AnimationVariantFns {
  const prefersReduced = useReducedMotion() ?? false;

  return useMemo(() => ({
    reduceMotion: prefersReduced,
    fadeInUp: (intensity: Intensity = 'medium') => fadeInUp(intensity, prefersReduced),
    fadeIn: (intensity: Intensity = 'medium') => fadeIn(intensity, prefersReduced),
    scaleIn: (intensity: Intensity = 'medium') => scaleIn(intensity, prefersReduced),
    slideInLeft: (intensity: Intensity = 'medium') => slideInLeft(intensity, prefersReduced),
    slideInRight: (intensity: Intensity = 'medium') => slideInRight(intensity, prefersReduced),
    bounceIn: (intensity: Intensity = 'high') => bounceIn(intensity, prefersReduced),
    staggerContainer: staggerContainerFn(prefersReduced),
    staggerContainerSlow: staggerContainerSlowFn(prefersReduced),
    chatMessageVariants: (intensity: Intensity) => chatMessageVariants(intensity, prefersReduced),
  }), [prefersReduced]);
}
