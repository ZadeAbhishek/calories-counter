export interface DailyLog {
  date: string // YYYY-MM-DD, also the doc ID
  calories: number | null
  protein: number | null
  weight: number | null
  updatedAt: number
}

export type DailyLogFields = Pick<DailyLog, 'calories' | 'protein' | 'weight'>
