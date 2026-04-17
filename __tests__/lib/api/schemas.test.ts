import { describe, it, expect } from 'vitest';
import {
  tutorSchema,
  faqSchema,
  generateQuizSchema,
  sessionSummarySchema,
  suggestionsSchema,
  schoolLeadSchema,
  examSchema,
  deleteMaterialSchema,
} from '@/lib/api/schemas';

describe('tutorSchema', () => {
  it('accepts a minimal valid payload with defaults applied', () => {
    const parsed = tutorSchema.parse({
      messages: [{ role: 'user', content: 'oi' }],
    });
    expect(parsed.ageGroup).toBe('10-12');
    expect(parsed.behavioralProfile).toBe('default');
    expect(parsed.homework).toBe('');
    expect(parsed.subject).toBe('other');
  });

  it('rejects empty messages array', () => {
    expect(() => tutorSchema.parse({ messages: [] })).toThrow();
  });

  it('rejects invalid ageGroup', () => {
    expect(() =>
      tutorSchema.parse({ messages: [{ role: 'user', content: 'x' }], ageGroup: '3-5' as never })
    ).toThrow();
  });

  it('rejects age outside 4–18', () => {
    expect(() =>
      tutorSchema.parse({ messages: [{ role: 'user', content: 'x' }], age: 20 })
    ).toThrow();
  });

  it('accepts difficultyLevel when provided', () => {
    const parsed = tutorSchema.parse({
      messages: [{ role: 'user', content: 'x' }],
      difficultyLevel: 'avancado',
    });
    expect(parsed.difficultyLevel).toBe('avancado');
  });
});

describe('faqSchema', () => {
  it('requires a non-empty question', () => {
    expect(() => faqSchema.parse({ question: '' })).toThrow();
    expect(faqSchema.parse({ question: 'o que é?' })).toEqual({ question: 'o que é?' });
  });

  it('caps question length at 500', () => {
    expect(() => faqSchema.parse({ question: 'a'.repeat(501) })).toThrow();
  });
});

describe('generateQuizSchema', () => {
  it('defaults questionCount to 5 and clamps range', () => {
    const parsed = generateQuizSchema.parse({ materialText: 'texto' });
    expect(parsed.questionCount).toBe(5);
  });

  it('rejects questionCount above 20', () => {
    expect(() =>
      generateQuizSchema.parse({ materialText: 't', questionCount: 30 })
    ).toThrow();
  });
});

describe('sessionSummarySchema', () => {
  it('applies defaults for missing optional fields', () => {
    const parsed = sessionSummarySchema.parse({
      messages: [{ role: 'user', content: 'x' }],
    });
    expect(parsed.subject).toBe('other');
    expect(parsed.durationMinutes).toBe(0);
    expect(parsed.xpEarned).toBe(0);
  });
});

describe('suggestionsSchema', () => {
  it('rejects content under 5 chars', () => {
    expect(() => suggestionsSchema.parse({ content: 'abc' })).toThrow();
  });

  it('accepts empty string email (optional-or-literal)', () => {
    const parsed = suggestionsSchema.parse({ content: 'meu feedback', userEmail: '' });
    expect(parsed.userEmail).toBe('');
  });

  it('rejects invalid email format', () => {
    expect(() =>
      suggestionsSchema.parse({ content: 'meu feedback', userEmail: 'not-an-email' })
    ).toThrow();
  });
});

describe('schoolLeadSchema', () => {
  it('requires schoolName, contactName, email', () => {
    expect(() => schoolLeadSchema.parse({ schoolName: 'X' })).toThrow();
  });

  it('accepts a full valid lead', () => {
    const parsed = schoolLeadSchema.parse({
      schoolName: 'Escola A',
      contactName: 'Maria',
      email: 'maria@escola.com',
    });
    expect(parsed.role).toBe('professor'); // default
  });
});

describe('examSchema', () => {
  it('defaults questionCount to 10', () => {
    const parsed = examSchema.parse({});
    expect(parsed.questionCount).toBe(10);
    expect(parsed.ageGroup).toBe('10-12');
  });
});

describe('deleteMaterialSchema', () => {
  it('requires a valid UUID', () => {
    expect(() => deleteMaterialSchema.parse({ materialId: 'not-uuid' })).toThrow();
    expect(
      deleteMaterialSchema.parse({ materialId: '550e8400-e29b-41d4-a716-446655440000' })
    ).toBeTruthy();
  });
});
