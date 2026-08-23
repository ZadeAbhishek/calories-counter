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
import { exercisesCol } from '@/firebase/firestore'
import type { Exercise } from '@/types/exercise'

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const exercisesQuery = query(exercisesCol, orderBy('name'))
    const unsubscribe = onSnapshot(exercisesQuery, (snapshot) => {
      setExercises(snapshot.docs.map((docSnapshot) => docSnapshot.data()))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function addExercise(name: string, category: string | null = null) {
    // Pre-generate the doc ref client-side so we know its id up front,
    // instead of addDoc()'s auto-id plus a throwaway placeholder.
    const ref = doc(exercisesCol)
    await setDoc(ref, {
      id: ref.id,
      name,
      category,
      createdAt: serverTimestamp(),
    })
    return ref.id
  }

  async function deleteExercise(id: string) {
    await deleteDoc(doc(exercisesCol, id))
  }

  return { exercises, loading, addExercise, deleteExercise }
}
