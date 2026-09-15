/**
 * Utility functions for real-time streak and date tracking.
 * Uses local calendar date (YYYY-MM-DD) to ensure accurate daily tracking.
 */

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDifference(pastDateStr: string, currentDateStr: string): number {
  if (!pastDateStr || !currentDateStr) return 999;
  const d1 = new Date(`${pastDateStr}T00:00:00`);
  const d2 = new Date(`${currentDateStr}T00:00:00`);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validates the user's streak upon opening the application based on real time.
 * - If last active today or yesterday, streak is maintained.
 * - If more than 1 day has passed without practice, the streak resets to 0.
 */
export function validateStreakOnLoad(streakDays: number, lastActiveDate: string): number {
  if (!lastActiveDate || streakDays <= 0) return 0;
  const today = getLocalDateString();
  const diff = getDaysDifference(lastActiveDate, today);

  if (diff <= 1 && diff >= 0) {
    return streakDays;
  }
  // Missed at least 1 full day (diff >= 2) or invalid date
  return 0;
}

/**
 * Increments or initializes the streak when a user solves a question or completes a session.
 */
export function updateStreakOnPractice(
  prevStreakDays: number,
  lastActiveDate: string
): { newStreak: number; newDate: string; isStreakIncremented: boolean } {
  const today = getLocalDateString();

  if (!lastActiveDate || prevStreakDays <= 0) {
    // First practice ever or starting fresh
    return { newStreak: 1, newDate: today, isStreakIncremented: true };
  }

  const diff = getDaysDifference(lastActiveDate, today);

  if (diff === 0) {
    // Already practiced today, keep current streak
    return { newStreak: Math.max(1, prevStreakDays), newDate: today, isStreakIncremented: false };
  } else if (diff === 1) {
    // Consecutive day! Increment streak by 1
    return { newStreak: prevStreakDays + 1, newDate: today, isStreakIncremented: true };
  } else {
    // More than 1 day skipped: restart streak at 1 today
    return { newStreak: 1, newDate: today, isStreakIncremented: true };
  }
}
