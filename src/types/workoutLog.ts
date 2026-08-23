export interface WorkoutSet {
  reps: number
  weight: number
}

export interface WorkoutLog {
  id: string
  date: string // YYYY-MM-DD
  exerciseId: string
  exerciseName: string
  sets: WorkoutSet[]
  notes: string | null
  createdAt: number
  updatedAt: number
}
