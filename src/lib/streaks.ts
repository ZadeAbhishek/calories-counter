import { addDays, todayKey } from '@/lib/dates'

/**
 * Current consecutive-day streak ending at today, Snapchat-style: a streak
 * doesn't break just because today hasn't happened yet (it's still in
 * progress), but if the most recent qualifying day is before yesterday, the
 * streak is over and this returns 0.
 */
export function computeStreak(
  qualifyingDates: ReadonlySet<string>,
  today: string = todayKey(),
): number {
  const yesterday = addDays(today, -1)
  let cursor: string
  if (qualifyingDates.has(today)) {
    cursor = today
  } else if (qualifyingDates.has(yesterday)) {
    cursor = yesterday
  } else {
    return 0
  }

  let count = 0
  while (qualifyingDates.has(cursor)) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}
