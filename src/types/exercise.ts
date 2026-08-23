export interface Exercise {
  id: string
  name: string
  category: string | null
  createdAt: number
}

export type NewExercise = Omit<Exercise, 'id' | 'createdAt'>
