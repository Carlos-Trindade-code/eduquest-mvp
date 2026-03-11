// XP rewards
export const XP_REWARDS = {
  MESSAGE_SENT: 10,
  SESSION_COMPLETED: 50,
  QUICK_CORRECT: 100,
  STREAK_BONUS: 25, // per day of streak
} as const;

// Level thresholds (XP needed for each level)
export const LEVEL_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  300, // Level 3
  600, // Level 4
  1000, // Level 5
  1500, // Level 6
  2200, // Level 7
  3000, // Level 8
  4000, // Level 9
  5200, // Level 10
  6500, // Level 11
  8000, // Level 12
  10000, // Level 13
  12500, // Level 14
  15500, // Level 15
];

export function getLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXpForNextLevel(totalXp: number): {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  progress: number; // 0-1
} {
  const currentLevel = getLevel(totalXp);
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextThreshold =
    LEVEL_THRESHOLDS[currentLevel] || currentThreshold + 2000;
  const xpInCurrentLevel = totalXp - currentThreshold;
  const xpNeededForNext = nextThreshold - currentThreshold;
  const progress = xpInCurrentLevel / xpNeededForNext;

  return { currentLevel, xpInCurrentLevel, xpNeededForNext, progress };
}

export function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: 'Iniciante',
    2: 'Explorador',
    3: 'Aprendiz',
    4: 'Estudante',
    5: 'Dedicado',
    6: 'Aplicado',
    7: 'Avançado',
    8: 'Expert',
    9: 'Mestre',
    10: 'Gênio',
    11: 'Lendário',
    12: 'Supremo',
    13: 'Iluminado',
    14: 'Transcendente',
    15: 'Lenda do Saber',
  };
  return titles[level] || `Nível ${level}`;
}
