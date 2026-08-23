import { useEffect, useState } from 'react'
import {
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { workoutLogsCol } from '@/firebase/firestore'
import type { WorkoutLog, WorkoutSet } from '@/types/workoutLog'

function logId(date: string, exerciseId: string) {
  return `${date}_${exerciseId}`
}

export function useWorkoutLogs() {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const logsQuery = query(workoutLogsCol, orderBy('date', 'desc'))
    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      setWorkoutLogs(snapshot.docs.map((docSnapshot) => docSnapshot.data()))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function upsertWorkoutLog(params: {
    date: string
    exerciseId: string
    exerciseName: string
    sets: WorkoutSet[]
    notes?: string | null
    existingCreatedAt?: number
  }) {
    const id = logId(params.date, params.exerciseId)
    await setDoc(doc(workoutLogsCol, id), {
      id,
      date: params.date,
      exerciseId: params.exerciseId,
      exerciseName: params.exerciseName,
      sets: params.sets,
      notes: params.notes ?? null,
      createdAt: params.existingCreatedAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function deleteWorkoutLog(date: string, exerciseId: string) {
    await deleteDoc(doc(workoutLogsCol, logId(date, exerciseId)))
  }

  return { workoutLogs, loading, upsertWorkoutLog, deleteWorkoutLog }
}
