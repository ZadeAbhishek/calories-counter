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
import type { WorkoutPlanItem } from '@/types/workoutPlanItem'

export function useWorkoutPlan() {
  const [planItems, setPlanItems] = useState<WorkoutPlanItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(workoutPlanItemsCol, (snapshot) => {
      setPlanItems(snapshot.docs.map((docSnapshot) => docSnapshot.data()))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function addPlanItem(
    sessionId: string,
    exerciseId: string,
    exerciseName: string,
    order: number,
  ) {
    const ref = doc(workoutPlanItemsCol)
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
      doc(workoutPlanItemsCol, itemId),
      { sessionId: newSessionId, order },
      { merge: true },
    )
  }

  async function reorderSession(orderedItemIds: string[]) {
    const batch = writeBatch(db)
    orderedItemIds.forEach((id, index) => {
      batch.set(doc(workoutPlanItemsCol, id), { order: index }, { merge: true })
    })
    await batch.commit()
  }

  async function removePlanItem(itemId: string) {
    await deleteDoc(doc(workoutPlanItemsCol, itemId))
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
