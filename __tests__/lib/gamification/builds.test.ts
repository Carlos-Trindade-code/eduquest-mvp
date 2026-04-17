import { describe, it, expect } from 'vitest';
import { getBuildForSubject, TOTAL_PIECES } from '@/lib/gamification/builds';

describe('getBuildForSubject', () => {
  it('returns a specific build for known subjects', () => {
    expect(getBuildForSubject('math').name).toBe('Foguete');
    expect(getBuildForSubject('history').name).toBe('Castelo');
    expect(getBuildForSubject('english').name).toBe('Mapa-Múndi');
  });

  it('falls back to the "Casa" build for unknown subjects', () => {
    expect(getBuildForSubject('xyz').name).toBe('Casa');
    expect(getBuildForSubject('').name).toBe('Casa');
  });

  it('every build has exactly TOTAL_PIECES pieces', () => {
    for (const subject of ['math', 'portuguese', 'history', 'science', 'geography', 'english', 'other']) {
      expect(getBuildForSubject(subject).pieces).toHaveLength(TOTAL_PIECES);
    }
  });

  it('every build declares milestone messages for 1, 3, and 6', () => {
    const m = getBuildForSubject('math').milestoneMessages;
    expect(m[1]).toBeTruthy();
    expect(m[3]).toBeTruthy();
    expect(m[6]).toBeTruthy();
  });
});
