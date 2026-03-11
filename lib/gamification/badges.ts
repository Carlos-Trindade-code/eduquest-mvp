export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  condition: (stats: BadgeCheckStats) => boolean;
}

export interface BadgeCheckStats {
  sessionsCompleted: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  totalMessages: number;
  subjectsStudied: string[];
}

export const badges: BadgeDefinition[] = [
  {
    id: 'first_session',
    name: 'Primeiro Passo',
    description: 'Complete sua primeira sessão de estudo',
    icon: '🌟',
    rarity: 'common',
    condition: (s) => s.sessionsCompleted >= 1,
  },
  {
    id: 'sessions_5',
    name: 'Estudante Dedicado',
    description: 'Complete 5 sessoes de estudo',
    icon: '📖',
    rarity: 'common',
    condition: (s) => s.sessionsCompleted >= 5,
  },
  {
    id: 'sessions_25',
    name: 'Maratonista do Saber',
    description: 'Complete 25 sessoes de estudo',
    icon: '🏆',
    rarity: 'rare',
    condition: (s) => s.sessionsCompleted >= 25,
  },
  {
    id: 'sessions_100',
    name: 'Centuriao',
    description: 'Complete 100 sessoes de estudo',
    icon: '👑',
    rarity: 'epic',
    condition: (s) => s.sessionsCompleted >= 100,
  },
  {
    id: 'streak_3',
    name: 'Fogo no Estudo',
    description: 'Estude 3 dias seguidos',
    icon: '🔥',
    rarity: 'common',
    condition: (s) => s.currentStreak >= 3,
  },
  {
    id: 'streak_7',
    name: 'Guerreiro da Semana',
    description: 'Estude 7 dias seguidos',
    icon: '⚔️',
    rarity: 'rare',
    condition: (s) => s.currentStreak >= 7,
  },
  {
    id: 'streak_30',
    name: 'Mestre do Mes',
    description: 'Estude 30 dias seguidos',
    icon: '🌙',
    rarity: 'legendary',
    condition: (s) => s.longestStreak >= 30,
  },
  {
    id: 'xp_1000',
    name: 'Mil XP',
    description: 'Acumule 1.000 pontos de experiencia',
    icon: '💎',
    rarity: 'common',
    condition: (s) => s.totalXp >= 1000,
  },
  {
    id: 'xp_5000',
    name: 'Cinco Mil XP',
    description: 'Acumule 5.000 pontos de experiencia',
    icon: '💰',
    rarity: 'rare',
    condition: (s) => s.totalXp >= 5000,
  },
  {
    id: 'multi_subject',
    name: 'Polimata',
    description: 'Estude 3 materias diferentes',
    icon: '🧠',
    rarity: 'common',
    condition: (s) => s.subjectsStudied.length >= 3,
  },
  {
    id: 'all_subjects',
    name: 'Mestre de Todas as Artes',
    description: 'Estude todas as materias disponiveis',
    icon: '🎓',
    rarity: 'epic',
    condition: (s) => s.subjectsStudied.length >= 6,
  },
  {
    id: 'messages_50',
    name: 'Conversador',
    description: 'Envie 50 mensagens ao tutor',
    icon: '💬',
    rarity: 'common',
    condition: (s) => s.totalMessages >= 50,
  },
  {
    id: 'messages_200',
    name: 'Debatedor',
    description: 'Envie 200 mensagens ao tutor',
    icon: '🗣️',
    rarity: 'rare',
    condition: (s) => s.totalMessages >= 200,
  },
];

export function checkNewBadges(
  stats: BadgeCheckStats,
  existingBadgeIds: string[]
): BadgeDefinition[] {
  return badges.filter(
    (badge) =>
      !existingBadgeIds.includes(badge.id) && badge.condition(stats)
  );
}

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return badges.find((b) => b.id === id);
}
