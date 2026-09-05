import { useEffect, useState } from 'react'
import {
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { workoutPlanItemsCol } from '@/firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import type { WorkoutPlanItem } from '@/types/workoutPlanItem'

export function useWorkoutPlan() {
  const { uid } = useAuth()
  const [planItems, setPlanItems] = useState<WorkoutPlanItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(workoutPlanItemsCol(uid), (snapshot) => {
      setPlanItems(snapshot.docs.map((docSnapshot) => docSnapshot.data()))
      setLoading(false)
    })
    return unsubscribe
  }, [uid])

  async function addPlanItem(
    sessionId: string,
    exerciseId: string,
    exerciseName: string,
    order: number,
  ) {
    const ref = doc(workoutPlanItemsCol(uid))
    await setDoc(ref, {
      id: ref.id,
      sessionId,
      exerciseId,
      exerciseName,
      order,
      createdAt: serverTimestamp(),
    })
  }

  async function movePlanItem(
    itemId: string,
    newSessionId: string,
    order: number,
  ) {
    await setDoc(
      doc(workoutPlanItemsCol(uid), itemId),
      { sessionId: newSessionId, order },
      { merge: true },
    )
  }

  async function reorderSession(orderedItemIds: string[]) {
    const batch = writeBatch(db)
    orderedItemIds.forEach((id, index) => {
      batch.set(doc(workoutPlanItemsCol(uid), id), { order: index }, { merge: true })
    })
    await batch.commit()
  }

  async function removePlanItem(itemId: string) {
    await deleteDoc(doc(workoutPlanItemsCol(uid), itemId))
  }

  return {
    planItems,
    loading,
    addPlanItem,
    movePlanItem,
    reorderSession,
    removePlanItem,
  }
}
