import { RANGE_OPTIONS, type RangeOption } from '@/lib/constants'

/** Local YYYY-MM-DD string. Never use `new Date(dateKey)` to parse these back
 * — that parses as UTC midnight and can land on the wrong day in negative
 * UTC-offset timezones. Always go through parseDateKey below instead. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatShortDate(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function addDays(dateKey: string, amount: number): string {
  const date = parseDateKey(dateKey)
  date.setDate(date.getDate() + amount)
  return toDateKey(date)
}

export function compareDateKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export function isWithinRange(dateKey: string, range: RangeOption): boolean {
  const option = RANGE_OPTIONS.find((candidate) => candidate.value === range)
  if (!option || option.days === null) return true
  const cutoff = addDays(todayKey(), -option.days)
  return compareDateKeys(dateKey, cutoff) >= 0
}
