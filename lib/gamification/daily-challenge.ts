import type { AgeGroup } from '@/lib/auth/types';
import { getSuggestions } from '@/lib/subjects/suggestions';
import { subjects } from '@/lib/subjects/config';

export interface DailyChallenge {
  id: string;
  subject: string;
  subjectName: string;
  subjectIcon: string;
  topic: string;
  xpBonus: number;
}

const DAILY_XP_BONUS = 50;
const COMPLETED_KEY = 'studdo_daily_challenge';

export function getDailyChallenge(ageGroup: AgeGroup): DailyChallenge {
  const today = new Date().toISOString().slice(0, 10);
  const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);

  const available = subjects.filter((s) => s.id !== 'other');
  const subject = available[seed % available.length];
  const topics = getSuggestions(subject.id, ageGroup);
  const topic = topics[(seed * 7) % topics.length];

  return {
    id: today,
    subject: subject.id,
    subjectName: subject.name,
    subjectIcon: subject.icon,
    topic,
    xpBonus: DAILY_XP_BONUS,
  };
}

export function isDailyChallengeCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COMPLETED_KEY) === new Date().toISOString().slice(0, 10);
}

export function markDailyChallengeCompleted() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPLETED_KEY, new Date().toISOString().slice(0, 10));
}
