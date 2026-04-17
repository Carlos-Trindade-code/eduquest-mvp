import { describe, it, expect } from 'vitest';
import { getLevel, getXpForNextLevel, getLevelTitle, LEVEL_THRESHOLDS } from '@/lib/gamification/xp';

describe('getLevel', () => {
  it('returns 1 for 0 XP', () => {
    expect(getLevel(0)).toBe(1);
  });

  it('returns 1 just below the level-2 threshold', () => {
    expect(getLevel(99)).toBe(1);
  });

  it('returns 2 exactly at the level-2 threshold', () => {
    expect(getLevel(100)).toBe(2);
  });

  it('returns the max defined level at its threshold', () => {
    const max = LEVEL_THRESHOLDS.length;
    expect(getLevel(LEVEL_THRESHOLDS[max - 1])).toBe(max);
  });

  it('caps at the highest defined level even with far-above XP', () => {
    expect(getLevel(999_999)).toBe(LEVEL_THRESHOLDS.length);
  });

  it('never returns below 1 for negative XP', () => {
    expect(getLevel(-50)).toBe(1);
  });
});

describe('getXpForNextLevel', () => {
  it('reports 0 progress at a level-start threshold', () => {
    const r = getXpForNextLevel(100); // exactly level 2 start
    expect(r.currentLevel).toBe(2);
    expect(r.xpInCurrentLevel).toBe(0);
    expect(r.progress).toBe(0);
  });

  it('reports partial progress inside a level', () => {
    const r = getXpForNextLevel(200); // midway through level 2 (100..300)
    expect(r.currentLevel).toBe(2);
    expect(r.xpInCurrentLevel).toBe(100);
    expect(r.xpNeededForNext).toBe(200);
    expect(r.progress).toBeCloseTo(0.5);
  });

  it('uses a synthetic +2000 bucket past the last defined threshold', () => {
    const top = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const r = getXpForNextLevel(top);
    expect(r.xpNeededForNext).toBe(2000);
    expect(r.xpInCurrentLevel).toBe(0);
  });
});

describe('getLevelTitle', () => {
  it('returns known titles for defined levels', () => {
    expect(getLevelTitle(1)).toBe('Iniciante');
    expect(getLevelTitle(10)).toBe('Gênio');
    expect(getLevelTitle(15)).toBe('Lenda do Saber');
  });

  it('falls back to "Nível N" for undefined levels', () => {
    expect(getLevelTitle(99)).toBe('Nível 99');
  });
});
