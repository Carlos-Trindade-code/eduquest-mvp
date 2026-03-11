import type { Subject } from '@/lib/auth/types';

export const subjects: Subject[] = [
  {
    id: 'math',
    name: 'Matemática',
    icon: '🔢',
    color: '#3B82F6',
    description: 'Álgebra, geometria, aritmética e mais',
  },
  {
    id: 'portuguese',
    name: 'Português',
    icon: '📝',
    color: '#10B981',
    description: 'Gramática, interpretação, redação',
  },
  {
    id: 'history',
    name: 'História',
    icon: '🏛️',
    color: '#F59E0B',
    description: 'História do Brasil e do mundo',
  },
  {
    id: 'science',
    name: 'Ciências',
    icon: '🔬',
    color: '#8B5CF6',
    description: 'Biologia, química, física',
  },
  {
    id: 'geography',
    name: 'Geografia',
    icon: '🌍',
    color: '#06B6D4',
    description: 'Geografia física e humana',
  },
  {
    id: 'english',
    name: 'Inglês',
    icon: '🇬🇧',
    color: '#EF4444',
    description: 'Gramática, vocabulário, conversação',
  },
  {
    id: 'other',
    name: 'Outro',
    icon: '📚',
    color: '#6B7280',
    description: 'Qualquer outra matéria',
  },
];

export function getSubjectById(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}
