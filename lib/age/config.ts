import type { AgeGroup, BehavioralProfile } from '@/lib/auth/types';

export interface AgeConfig {
  ageGroup: AgeGroup;
  label: string;
  emoji: string;
  pomodoroMinutes: number;
  breakMinutes: number;
  maxAttempts: number;
  attemptsBeforeHint: number;
  attemptsBeforeReveal: number;
  sessionMaxMinutes: number;
  features: {
    feynmanMethod: boolean;
    explorerMode: boolean;
    debates: boolean;
    hotsQuestions: boolean;
    interleaving: boolean;
    productivityAnalysis: boolean;
    selfTracking: boolean;
  };
  uiTheme: {
    avatarSize: 'lg' | 'md' | 'sm';
    fontSize: 'lg' | 'md' | 'sm';
    animationLevel: 'high' | 'medium' | 'low';
    mascot: boolean;
    colorScheme: 'vibrant' | 'balanced' | 'modern';
  };
}

export const ageConfigs: Record<AgeGroup, AgeConfig> = {
  '4-6': {
    ageGroup: '4-6',
    label: 'Pré-escola',
    emoji: '🧒',
    pomodoroMinutes: 10,
    breakMinutes: 5,
    maxAttempts: 1,
    attemptsBeforeHint: 1,
    attemptsBeforeReveal: 2,
    sessionMaxMinutes: 10,
    features: {
      feynmanMethod: false,
      explorerMode: false,
      debates: false,
      hotsQuestions: false,
      interleaving: false,
      productivityAnalysis: false,
      selfTracking: false,
    },
    uiTheme: {
      avatarSize: 'lg',
      fontSize: 'lg',
      animationLevel: 'high',
      mascot: true,
      colorScheme: 'vibrant',
    },
  },
  '7-9': {
    ageGroup: '7-9',
    label: '1º ao 3º ano',
    emoji: '📚',
    pomodoroMinutes: 15,
    breakMinutes: 5,
    maxAttempts: 2,
    attemptsBeforeHint: 2,
    attemptsBeforeReveal: 3,
    sessionMaxMinutes: 30,
    features: {
      feynmanMethod: false,
      explorerMode: false,
      debates: false,
      hotsQuestions: false,
      interleaving: false,
      productivityAnalysis: false,
      selfTracking: false,
    },
    uiTheme: {
      avatarSize: 'lg',
      fontSize: 'md',
      animationLevel: 'high',
      mascot: true,
      colorScheme: 'vibrant',
    },
  },
  '10-12': {
    ageGroup: '10-12',
    label: '4º ao 5º ano',
    emoji: '🔬',
    pomodoroMinutes: 20,
    breakMinutes: 5,
    maxAttempts: 3,
    attemptsBeforeHint: 2,
    attemptsBeforeReveal: 5,
    sessionMaxMinutes: 45,
    features: {
      feynmanMethod: true,
      explorerMode: true,
      debates: false,
      hotsQuestions: false,
      interleaving: false,
      productivityAnalysis: false,
      selfTracking: false,
    },
    uiTheme: {
      avatarSize: 'md',
      fontSize: 'md',
      animationLevel: 'medium',
      mascot: true,
      colorScheme: 'balanced',
    },
  },
  '13-15': {
    ageGroup: '13-15',
    label: '6º ao 8º ano',
    emoji: '🧠',
    pomodoroMinutes: 25,
    breakMinutes: 5,
    maxAttempts: 4,
    attemptsBeforeHint: 3,
    attemptsBeforeReveal: 6,
    sessionMaxMinutes: 60,
    features: {
      feynmanMethod: true,
      explorerMode: true,
      debates: true,
      hotsQuestions: true,
      interleaving: true,
      productivityAnalysis: true,
      selfTracking: false,
    },
    uiTheme: {
      avatarSize: 'sm',
      fontSize: 'sm',
      animationLevel: 'low',
      mascot: false,
      colorScheme: 'modern',
    },
  },
  '16-18': {
    ageGroup: '16-18',
    label: 'Ensino Médio',
    emoji: '🎓',
    pomodoroMinutes: 45,
    breakMinutes: 10,
    maxAttempts: 4,
    attemptsBeforeHint: 3,
    attemptsBeforeReveal: 7,
    sessionMaxMinutes: 90,
    features: {
      feynmanMethod: true,
      explorerMode: true,
      debates: true,
      hotsQuestions: true,
      interleaving: true,
      productivityAnalysis: true,
      selfTracking: true,
    },
    uiTheme: {
      avatarSize: 'sm',
      fontSize: 'sm',
      animationLevel: 'low',
      mascot: false,
      colorScheme: 'modern',
    },
  },
};

// Behavioral overrides
export function getAdjustedConfig(
  ageGroup: AgeGroup,
  profile: BehavioralProfile
): AgeConfig {
  const base = { ...ageConfigs[ageGroup] };

  switch (profile) {
    case 'tdah':
      base.maxAttempts = Math.min(base.maxAttempts, 2);
      base.pomodoroMinutes = Math.min(base.pomodoroMinutes, 15);
      base.breakMinutes = Math.max(base.breakMinutes, 5);
      base.sessionMaxMinutes = Math.min(base.sessionMaxMinutes, 30);
      break;
    case 'anxiety':
      base.maxAttempts = Math.min(base.maxAttempts, 2);
      base.attemptsBeforeHint = 1;
      break;
    case 'gifted':
      base.maxAttempts = base.maxAttempts + 2;
      base.features.explorerMode = true;
      base.features.hotsQuestions = true;
      break;
  }

  return base;
}

export function getAgeGroupFromAge(age: number): AgeGroup {
  if (age <= 6) return '4-6';
  if (age <= 9) return '7-9';
  if (age <= 12) return '10-12';
  if (age <= 15) return '13-15';
  return '16-18';
}
