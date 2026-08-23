import type { DayKey } from '@/lib/constants'

export interface WorkoutPlanItem {
  id: string
  day: DayKey
  exerciseId: string
  exerciseName: string
  order: number
  createdAt: number
}
