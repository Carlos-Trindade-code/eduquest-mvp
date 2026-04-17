import { describe, it, expect } from 'vitest';
import {
  calculateNextReview,
  createNewReviewItem,
  isDueForReview,
  getDueItems,
  getReviewStatus,
  getReviewStats,
  type ReviewItem,
} from '@/lib/spaced-repetition/engine';

function makeItem(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    concept: 'frações',
    question: 'o que é?',
    subject: 'math',
    interval_days: 0,
    ease_factor: 2.5,
    review_count: 0,
    next_review: new Date(),
    last_review: null,
    ...overrides,
  };
}

describe('createNewReviewItem', () => {
  it('starts due now with zero reviews and default ease', () => {
    const item = createNewReviewItem('soma', 'qto é 2+2?', 'math');
    expect(item.review_count).toBe(0);
    expect(item.interval_days).toBe(0);
    expect(item.ease_factor).toBe(2.5);
    expect(item.last_review).toBeNull();
    expect(isDueForReview(item)).toBe(true);
  });
});

describe('calculateNextReview — correct answers', () => {
  it('follows the default interval ladder on the first 5 passes', () => {
    let item = makeItem();
    const expected = [1, 3, 7, 21, 60];
    for (const exp of expected) {
      item = calculateNextReview(item, 5);
      expect(item.interval_days).toBe(exp);
    }
  });

  it('uses ease_factor multiplier beyond the ladder', () => {
    const item = makeItem({ review_count: 5, interval_days: 60, ease_factor: 2.0 });
    const next = calculateNextReview(item, 5);
    expect(next.interval_days).toBe(120);
  });

  it('increments review_count on pass', () => {
    const item = makeItem({ review_count: 2 });
    const next = calculateNextReview(item, 4);
    expect(next.review_count).toBe(3);
  });

  it('updates last_review and schedules next_review in the future', () => {
    const before = Date.now();
    const next = calculateNextReview(makeItem(), 5);
    expect(next.last_review!.getTime()).toBeGreaterThanOrEqual(before);
    expect(next.next_review.getTime()).toBeGreaterThan(before);
  });
});

describe('calculateNextReview — wrong answers', () => {
  it('resets interval to 1 day on failure', () => {
    const item = makeItem({ interval_days: 21, review_count: 4 });
    const next = calculateNextReview(item, 1);
    expect(next.interval_days).toBe(1);
  });

  it('decreases ease_factor by 0.2 but floors at 1.3', () => {
    const soft = calculateNextReview(makeItem({ ease_factor: 2.5 }), 0);
    expect(soft.ease_factor).toBeCloseTo(2.3);

    const floored = calculateNextReview(makeItem({ ease_factor: 1.4 }), 0);
    expect(floored.ease_factor).toBe(1.3);
  });

  it('decreases review_count on failure but never below 0', () => {
    expect(calculateNextReview(makeItem({ review_count: 3 }), 2).review_count).toBe(2);
    expect(calculateNextReview(makeItem({ review_count: 0 }), 0).review_count).toBe(0);
  });
});

describe('isDueForReview / getDueItems', () => {
  it('returns true only for items whose next_review has passed', () => {
    const past = makeItem({ next_review: new Date(Date.now() - 1000) });
    const future = makeItem({ next_review: new Date(Date.now() + 60_000) });
    expect(isDueForReview(past)).toBe(true);
    expect(isDueForReview(future)).toBe(false);
  });

  it('returns due items sorted by next_review ascending', () => {
    const oldest = makeItem({ concept: 'a', next_review: new Date(Date.now() - 10_000) });
    const newer = makeItem({ concept: 'b', next_review: new Date(Date.now() - 1_000) });
    const future = makeItem({ concept: 'c', next_review: new Date(Date.now() + 10_000) });
    const due = getDueItems([newer, future, oldest]);
    expect(due.map((i) => i.concept)).toEqual(['a', 'b']);
  });
});

describe('getReviewStatus', () => {
  it('classifies items by review_count and interval', () => {
    expect(getReviewStatus(makeItem({ review_count: 0 }))).toBe('new');
    expect(getReviewStatus(makeItem({ review_count: 1, interval_days: 3 }))).toBe('learning');
    expect(getReviewStatus(makeItem({ review_count: 3, interval_days: 21 }))).toBe('review');
    expect(getReviewStatus(makeItem({ review_count: 5, interval_days: 120 }))).toBe('mastered');
  });
});

describe('getReviewStats', () => {
  it('counts items per status and reports due total', () => {
    const items = [
      makeItem({ review_count: 0, next_review: new Date(Date.now() - 1) }),
      makeItem({ review_count: 1, interval_days: 3, next_review: new Date(Date.now() + 1000) }),
      makeItem({ review_count: 4, interval_days: 60, next_review: new Date(Date.now() + 1000) }),
    ];
    const stats = getReviewStats(items);
    expect(stats.total).toBe(3);
    expect(stats.due).toBe(1);
    expect(stats.new).toBe(1);
    expect(stats.learning).toBe(1);
    expect(stats.mastered).toBe(1);
    expect(stats.review).toBe(0);
  });
});
