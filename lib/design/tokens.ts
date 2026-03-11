import type { AgeGroup } from '@/lib/auth/types';

export interface AgeThemeTokens {
  // Colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundEnd: string;
  surface: string;
  surfaceHover: string;
  surfaceBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;

  // Typography
  fontSizeBase: string;
  fontSizeHeading: string;
  fontSizeSm: string;
  fontWeight: string;

  // Spacing & Sizing
  borderRadius: string;
  borderRadiusLg: string;
  borderRadiusSm: string;
  padding: string;
  paddingSm: string;
  gap: string;
  avatarSize: string;
  iconSize: string;

  // Animation
  animationDuration: number;
  animationIntensity: 'high' | 'medium' | 'low';
  springStiffness: number;
  springDamping: number;
  showMascot: boolean;
  showParticles: boolean;

  // Chat
  userBubbleColor: string;
  userBubbleText: string;
  assistantBubbleColor: string;
  assistantBubbleText: string;
  bubbleBorderRadius: string;
  bubbleMaxWidth: string;
  bubbleFontSize: string;

  // Gamification
  xpBarHeight: string;
  xpBarGradientFrom: string;
  xpBarGradientTo: string;
  streakColor: string;
  badgeSize: string;
}

const themes: Record<AgeGroup, AgeThemeTokens> = {
  '4-6': {
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',
    secondary: '#F472B6',
    accent: '#FBBF24',
    background: '#1E1046',
    backgroundEnd: '#3B0764',
    surface: 'rgba(255, 255, 255, 0.12)',
    surfaceHover: 'rgba(255, 255, 255, 0.18)',
    surfaceBorder: 'rgba(255, 255, 255, 0.15)',
    text: '#FFFFFF',
    textSecondary: '#C4B5FD',
    textMuted: 'rgba(255, 255, 255, 0.5)',

    fontSizeBase: '1.125rem',
    fontSizeHeading: '1.875rem',
    fontSizeSm: '1rem',
    fontWeight: '700',

    borderRadius: '1.5rem',
    borderRadiusLg: '2rem',
    borderRadiusSm: '1rem',
    padding: '1.5rem',
    paddingSm: '1rem',
    gap: '1rem',
    avatarSize: '3.5rem',
    iconSize: '1.75rem',

    animationDuration: 0.5,
    animationIntensity: 'high',
    springStiffness: 300,
    springDamping: 15,
    showMascot: true,
    showParticles: true,

    userBubbleColor: '#7C3AED',
    userBubbleText: '#FFFFFF',
    assistantBubbleColor: 'rgba(255, 255, 255, 0.15)',
    assistantBubbleText: '#FFFFFF',
    bubbleBorderRadius: '1.5rem',
    bubbleMaxWidth: '85%',
    bubbleFontSize: '1.125rem',

    xpBarHeight: '1rem',
    xpBarGradientFrom: '#FBBF24',
    xpBarGradientTo: '#F59E0B',
    streakColor: '#F97316',
    badgeSize: '5rem',
  },

  '7-9': {
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    secondary: '#10B981',
    accent: '#FBBF24',
    background: '#0F172A',
    backgroundEnd: '#1E3A5F',
    surface: 'rgba(255, 255, 255, 0.10)',
    surfaceHover: 'rgba(255, 255, 255, 0.15)',
    surfaceBorder: 'rgba(255, 255, 255, 0.12)',
    text: '#FFFFFF',
    textSecondary: '#93C5FD',
    textMuted: 'rgba(255, 255, 255, 0.45)',

    fontSizeBase: '1rem',
    fontSizeHeading: '1.5rem',
    fontSizeSm: '0.875rem',
    fontWeight: '600',

    borderRadius: '1.25rem',
    borderRadiusLg: '1.5rem',
    borderRadiusSm: '0.75rem',
    padding: '1.25rem',
    paddingSm: '0.875rem',
    gap: '0.875rem',
    avatarSize: '3rem',
    iconSize: '1.5rem',

    animationDuration: 0.4,
    animationIntensity: 'high',
    springStiffness: 350,
    springDamping: 18,
    showMascot: true,
    showParticles: true,

    userBubbleColor: '#2563EB',
    userBubbleText: '#FFFFFF',
    assistantBubbleColor: 'rgba(255, 255, 255, 0.12)',
    assistantBubbleText: '#FFFFFF',
    bubbleBorderRadius: '1.25rem',
    bubbleMaxWidth: '80%',
    bubbleFontSize: '1rem',

    xpBarHeight: '0.875rem',
    xpBarGradientFrom: '#FBBF24',
    xpBarGradientTo: '#F59E0B',
    streakColor: '#F97316',
    badgeSize: '4.5rem',
  },

  '10-12': {
    primary: '#14B8A6',
    primaryLight: '#2DD4BF',
    primaryDark: '#0D9488',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    background: '#0F172A',
    backgroundEnd: '#134E4A',
    surface: 'rgba(255, 255, 255, 0.08)',
    surfaceHover: 'rgba(255, 255, 255, 0.12)',
    surfaceBorder: 'rgba(255, 255, 255, 0.10)',
    text: '#FFFFFF',
    textSecondary: '#99F6E4',
    textMuted: 'rgba(255, 255, 255, 0.40)',

    fontSizeBase: '1rem',
    fontSizeHeading: '1.5rem',
    fontSizeSm: '0.875rem',
    fontWeight: '600',

    borderRadius: '1rem',
    borderRadiusLg: '1.25rem',
    borderRadiusSm: '0.625rem',
    padding: '1.25rem',
    paddingSm: '0.75rem',
    gap: '0.75rem',
    avatarSize: '2.5rem',
    iconSize: '1.25rem',

    animationDuration: 0.35,
    animationIntensity: 'medium',
    springStiffness: 400,
    springDamping: 22,
    showMascot: true,
    showParticles: false,

    userBubbleColor: '#0D9488',
    userBubbleText: '#FFFFFF',
    assistantBubbleColor: 'rgba(255, 255, 255, 0.10)',
    assistantBubbleText: '#FFFFFF',
    bubbleBorderRadius: '1rem',
    bubbleMaxWidth: '75%',
    bubbleFontSize: '1rem',

    xpBarHeight: '0.75rem',
    xpBarGradientFrom: '#F59E0B',
    xpBarGradientTo: '#D97706',
    streakColor: '#F97316',
    badgeSize: '4rem',
  },

  '13-15': {
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    secondary: '#EC4899',
    accent: '#F59E0B',
    background: '#0F0F1A',
    backgroundEnd: '#1A1A2E',
    surface: 'rgba(255, 255, 255, 0.06)',
    surfaceHover: 'rgba(255, 255, 255, 0.10)',
    surfaceBorder: 'rgba(255, 255, 255, 0.08)',
    text: '#F1F5F9',
    textSecondary: '#A5B4FC',
    textMuted: 'rgba(255, 255, 255, 0.35)',

    fontSizeBase: '0.9375rem',
    fontSizeHeading: '1.375rem',
    fontSizeSm: '0.8125rem',
    fontWeight: '500',

    borderRadius: '0.75rem',
    borderRadiusLg: '1rem',
    borderRadiusSm: '0.5rem',
    padding: '1rem',
    paddingSm: '0.625rem',
    gap: '0.625rem',
    avatarSize: '2.25rem',
    iconSize: '1.125rem',

    animationDuration: 0.25,
    animationIntensity: 'low',
    springStiffness: 500,
    springDamping: 28,
    showMascot: false,
    showParticles: false,

    userBubbleColor: '#4F46E5',
    userBubbleText: '#FFFFFF',
    assistantBubbleColor: 'rgba(255, 255, 255, 0.08)',
    assistantBubbleText: '#F1F5F9',
    bubbleBorderRadius: '0.75rem',
    bubbleMaxWidth: '72%',
    bubbleFontSize: '0.9375rem',

    xpBarHeight: '0.5rem',
    xpBarGradientFrom: '#F59E0B',
    xpBarGradientTo: '#D97706',
    streakColor: '#F97316',
    badgeSize: '3.5rem',
  },

  '16-18': {
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    secondary: '#06B6D4',
    accent: '#F59E0B',
    background: '#09090B',
    backgroundEnd: '#18181B',
    surface: 'rgba(255, 255, 255, 0.05)',
    surfaceHover: 'rgba(255, 255, 255, 0.08)',
    surfaceBorder: 'rgba(255, 255, 255, 0.07)',
    text: '#E4E4E7',
    textSecondary: '#A1A1AA',
    textMuted: 'rgba(255, 255, 255, 0.30)',

    fontSizeBase: '0.875rem',
    fontSizeHeading: '1.25rem',
    fontSizeSm: '0.8125rem',
    fontWeight: '500',

    borderRadius: '0.625rem',
    borderRadiusLg: '0.75rem',
    borderRadiusSm: '0.375rem',
    padding: '1rem',
    paddingSm: '0.5rem',
    gap: '0.5rem',
    avatarSize: '2rem',
    iconSize: '1rem',

    animationDuration: 0.2,
    animationIntensity: 'low',
    springStiffness: 600,
    springDamping: 30,
    showMascot: false,
    showParticles: false,

    userBubbleColor: '#4F46E5',
    userBubbleText: '#FFFFFF',
    assistantBubbleColor: 'rgba(255, 255, 255, 0.06)',
    assistantBubbleText: '#E4E4E7',
    bubbleBorderRadius: '0.625rem',
    bubbleMaxWidth: '70%',
    bubbleFontSize: '0.875rem',

    xpBarHeight: '0.375rem',
    xpBarGradientFrom: '#F59E0B',
    xpBarGradientTo: '#D97706',
    streakColor: '#F97316',
    badgeSize: '3rem',
  },
};

export function getThemeTokens(ageGroup: AgeGroup): AgeThemeTokens {
  return themes[ageGroup];
}

export function tokensToCSSVars(tokens: AgeThemeTokens): Record<string, string> {
  return {
    '--eq-primary': tokens.primary,
    '--eq-primary-light': tokens.primaryLight,
    '--eq-primary-dark': tokens.primaryDark,
    '--eq-secondary': tokens.secondary,
    '--eq-accent': tokens.accent,
    '--eq-bg': tokens.background,
    '--eq-bg-end': tokens.backgroundEnd,
    '--eq-surface': tokens.surface,
    '--eq-surface-hover': tokens.surfaceHover,
    '--eq-surface-border': tokens.surfaceBorder,
    '--eq-text': tokens.text,
    '--eq-text-secondary': tokens.textSecondary,
    '--eq-text-muted': tokens.textMuted,
    '--eq-font-size': tokens.fontSizeBase,
    '--eq-font-size-heading': tokens.fontSizeHeading,
    '--eq-font-size-sm': tokens.fontSizeSm,
    '--eq-font-weight': tokens.fontWeight,
    '--eq-radius': tokens.borderRadius,
    '--eq-radius-lg': tokens.borderRadiusLg,
    '--eq-radius-sm': tokens.borderRadiusSm,
    '--eq-padding': tokens.padding,
    '--eq-padding-sm': tokens.paddingSm,
    '--eq-gap': tokens.gap,
    '--eq-avatar-size': tokens.avatarSize,
    '--eq-icon-size': tokens.iconSize,
    '--eq-animation-duration': `${tokens.animationDuration}s`,
    '--eq-user-bubble': tokens.userBubbleColor,
    '--eq-user-bubble-text': tokens.userBubbleText,
    '--eq-assistant-bubble': tokens.assistantBubbleColor,
    '--eq-assistant-bubble-text': tokens.assistantBubbleText,
    '--eq-bubble-radius': tokens.bubbleBorderRadius,
    '--eq-bubble-max-width': tokens.bubbleMaxWidth,
    '--eq-bubble-font-size': tokens.bubbleFontSize,
    '--eq-xp-height': tokens.xpBarHeight,
    '--eq-xp-from': tokens.xpBarGradientFrom,
    '--eq-xp-to': tokens.xpBarGradientTo,
    '--eq-streak-color': tokens.streakColor,
    '--eq-badge-size': tokens.badgeSize,
  };
}
