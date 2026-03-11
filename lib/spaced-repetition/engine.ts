/**
 * Spaced Repetition Engine
 * Based on SM-2 algorithm (Ebbinghaus forgetting curve)
 *
 * Intervals: 1 day → 3 days → 7 days → 21 days → 60 days
 * Correct answer: interval increases
 * Wrong answer: interval decreases, concept is reinforced
 */

export interface ReviewItem {
  concept: string;
  question: string;
  subject: string;
  interval_days: number;
  ease_factor: number; // 1.3 to 2.5 (default 2.5)
  review_count: number;
  next_review: Date;
  last_review: Date | null;
}

// Quality of response (0-5 scale)
// 0 = complete blackout, 5 = perfect
export type ResponseQuality = 0 | 1 | 2 | 3 | 4 | 5;

const DEFAULT_INTERVALS = [1, 3, 7, 21, 60];
const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

export function calculateNextReview(
  item: ReviewItem,
  quality: ResponseQuality
): ReviewItem {
  const updated = { ...item };

  if (quality < 3) {
    // Failed — reset to short interval, decrease ease
    updated.interval_days = 1;
    updated.ease_factor = Math.max(
      MIN_EASE_FACTOR,
      item.ease_factor - 0.2
    );
    updated.review_count = Math.max(0, item.review_count - 1);
  } else {
    // Passed — increase interval
    updated.review_count = item.review_count + 1;

    if (updated.review_count <= DEFAULT_INTERVALS.length) {
      updated.interval_days = DEFAULT_INTERVALS[updated.review_count - 1];
    } else {
      updated.interval_days = Math.round(
        item.interval_days * item.ease_factor
      );
    }

    // Adjust ease factor
    updated.ease_factor = Math.max(
      MIN_EASE_FACTOR,
      item.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
  }

  // Calculate next review date
  const now = new Date();
  updated.next_review = new Date(
    now.getTime() + updated.interval_days * 24 * 60 * 60 * 1000
  );
  updated.last_review = now;

  return updated;
}

export function createNewReviewItem(
  concept: string,
  question: string,
  subject: string
): ReviewItem {
  return {
    concept,
    question,
    subject,
    interval_days: 0,
    ease_factor: DEFAULT_EASE_FACTOR,
    review_count: 0,
    next_review: new Date(), // Due now
    last_review: null,
  };
}

export function isDueForReview(item: ReviewItem): boolean {
  return new Date() >= new Date(item.next_review);
}

export function getDueItems(items: ReviewItem[]): ReviewItem[] {
  return items
    .filter(isDueForReview)
    .sort(
      (a, b) =>
        new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
    );
}

export function getReviewStatus(item: ReviewItem): 'new' | 'learning' | 'review' | 'mastered' {
  if (item.review_count === 0) return 'new';
  if (item.interval_days < 7) return 'learning';
  if (item.interval_days < 60) return 'review';
  return 'mastered';
}

// Generate review stats
export function getReviewStats(items: ReviewItem[]) {
  const due = items.filter(isDueForReview);
  const statusCounts = {
    new: 0,
    learning: 0,
    review: 0,
    mastered: 0,
  };

  items.forEach((item) => {
    statusCounts[getReviewStatus(item)]++;
  });

  return {
    total: items.length,
    due: due.length,
    ...statusCounts,
  };
}
