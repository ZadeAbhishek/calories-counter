import { useEffect, useState } from 'react'
import {
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { sessionsCol, workoutPlanItemsCol } from '@/firebase/firestore'
import type { WorkoutSession } from '@/types/session'

export function useSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionsQuery = query(sessionsCol, orderBy('order'))
    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      setSessions(snapshot.docs.map((docSnapshot) => docSnapshot.data()))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function addSession(name: string) {
    const ref = doc(sessionsCol)
    await setDoc(ref, {
      id: ref.id,
      name,
      order: sessions.length,
      createdAt: serverTimestamp(),
    })
    return ref.id
  }

  async function renameSession(id: string, name: string) {
    await setDoc(doc(sessionsCol, id), { name }, { merge: true })
  }

  // Firestore has no cascading deletes: remove the session and every plan
  // item that placed an exercise into it in one atomic batch, so a deleted
  // session never leaves orphaned items behind.
  async function deleteSession(id: string) {
    const itemsQuery = query(workoutPlanItemsCol, where('sessionId', '==', id))
    const itemDocs = await getDocs(itemsQuery)
    const batch = writeBatch(db)
    batch.delete(doc(sessionsCol, id))
    itemDocs.forEach((itemDoc) => batch.delete(itemDoc.ref))
    await batch.commit()
  }

  return { sessions, loading, addSession, renameSession, deleteSession }
}
