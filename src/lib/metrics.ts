import type { WorkoutSet } from '@/types/workoutLog'

export function computeMaxWeight(sets: WorkoutSet[]): number {
  return sets.reduce((max, set) => Math.max(max, set.weight), 0)
}

export function computeVolume(sets: WorkoutSet[]): number {
  return sets.reduce((total, set) => total + set.reps * set.weight, 0)
}

/** Trailing moving average over the last `windowSize` entries (not a
 * calendar-day window) — simplest correct behavior for a personal log that
 * isn't necessarily filled in every single day. */
export function rollingAverage(values: number[], windowSize: number): number[] {
  return values.map((_, index) => {
    const start = Math.max(0, index - windowSize + 1)
    const window = values.slice(start, index + 1)
    const sum = window.reduce((total, value) => total + value, 0)
    return sum / window.length
  })
}
