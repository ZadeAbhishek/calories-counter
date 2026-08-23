export const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Monday', short: 'Mon' },
  { key: 'tue', label: 'Tuesday', short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday', short: 'Thu' },
  { key: 'fri', label: 'Friday', short: 'Fri' },
  { key: 'sat', label: 'Saturday', short: 'Sat' },
  { key: 'sun', label: 'Sunday', short: 'Sun' },
] as const

export type DayKey = (typeof DAYS_OF_WEEK)[number]['key']

export const UNITS = {
  weight: 'kg',
  protein: 'g',
  calories: 'kcal',
} as const

export const TABS = [
  { key: 'gym', label: 'Gym' },
  { key: 'food', label: 'Food' },
  { key: 'settings', label: 'Target Settings' },
] as const

export type TabKey = (typeof TABS)[number]['key']

export const RANGE_OPTIONS = [
  { value: '15d', label: '15 days', days: 15 },
  { value: '30d', label: '30 days', days: 30 },
  { value: '2m', label: '2 months', days: 60 },
  { value: '3m', label: '3 months', days: 90 },
  { value: 'all', label: 'All time', days: null },
] as const

export type RangeOption = (typeof RANGE_OPTIONS)[number]['value']
