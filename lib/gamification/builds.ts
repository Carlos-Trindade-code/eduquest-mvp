// lib/gamification/builds.ts

export interface BuildDefinition {
  emoji: string;
  name: string;
  pieces: string[]; // exactly 6 items
  milestoneMessages: Record<number, string>;
}

export const TOTAL_PIECES = 6;

const BUILDS: Record<string, BuildDefinition> = {
  math: {
    emoji: '🚀',
    name: 'Foguete',
    pieces: ['motor', 'corpo', 'asas', 'cápsula', 'antena', 'chamas'],
    milestoneMessages: {
      1: 'O motor está pronto! 🔧',
      3: 'Metade do foguete! Continue! 🚀',
      6: 'Foguete completo! Decolagem! 🚀🔥',
    },
  },
  portuguese: {
    emoji: '📚',
    name: 'Biblioteca',
    pieces: ['estante', 'livros', 'mesa', 'lâmpada', 'globo', 'janela'],
    milestoneMessages: {
      1: 'Primeira estante montada! 📚',
      3: 'A biblioteca ganha vida! ✨',
      6: 'Biblioteca completa! Que acervo! 📚🌟',
    },
  },
  history: {
    emoji: '🏰',
    name: 'Castelo',
    pieces: ['base', 'muralhas', 'torre', 'portão', 'bandeira', 'brasão'],
    milestoneMessages: {
      1: 'A fundação está lançada! 🏗️',
      3: 'O castelo está crescendo! 🏰',
      6: 'Castelo erguido! Que reino! 🏰👑',
    },
  },
  science: {
    emoji: '🔬',
    name: 'Laboratório',
    pieces: ['bancada', 'microscópio', 'tubos', 'computador', 'quadro', 'planta'],
    milestoneMessages: {
      1: 'O laboratório começa! 🔬',
      3: 'Equipamentos chegando! 🧪',
      6: 'Laboratório completo! Hora dos experimentos! 🔬✨',
    },
  },
  geography: {
    emoji: '🌍',
    name: 'Planeta',
    pieces: ['continente', 'oceano', 'nuvem', 'cidade', 'lua', 'estrelas'],
    milestoneMessages: {
      1: 'O planeta toma forma! 🌍',
      3: 'Metade do mundo descoberto! 🗺️',
      6: 'Planeta completo! Que universo! 🌍⭐',
    },
  },
  english: {
    emoji: '🗺️',
    name: 'Mapa-Múndi',
    pieces: ['América', 'Europa', 'África', 'Ásia', 'Oceania', 'Antártica'],
    milestoneMessages: {
      1: 'First continent discovered! 🗺️',
      3: 'Half the world explored! 🌐',
      6: 'World map complete! Amazing! 🗺️🌟',
    },
  },
  other: {
    emoji: '🏠',
    name: 'Casa',
    pieces: ['base', 'paredes', 'telhado', 'janela', 'porta', 'jardim'],
    milestoneMessages: {
      1: 'A casa começa! 🏗️',
      3: 'As paredes estão de pé! 🏠',
      6: 'Casa construída! Bem-vindo! 🏠✨',
    },
  },
};

export function getBuildForSubject(subject: string): BuildDefinition {
  return BUILDS[subject] ?? BUILDS.other;
}
