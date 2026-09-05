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
import { dailyLogsCol } from '@/firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import type { DailyLog, DailyLogFields } from '@/types/dailyLog'

export function useDailyLogs() {
  const { uid } = useAuth()
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const logsQuery = query(dailyLogsCol(uid), orderBy('date'))
    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      setDailyLogs(snapshot.docs.map((docSnapshot) => docSnapshot.data()))
      setLoading(false)
    })
    return unsubscribe
  }, [uid])

  // Only writes the fields actually passed in `fields` (merge: true), so
  // e.g. saving today's weight never blanks out an already-logged protein
  // value for the same day.
  async function upsertDailyLog(date: string, fields: Partial<DailyLogFields>) {
    await setDoc(
      doc(dailyLogsCol(uid), date),
      { date, ...fields, updatedAt: serverTimestamp() },
      { merge: true },
    )
  }

  async function deleteDailyLog(date: string) {
    await deleteDoc(doc(dailyLogsCol(uid), date))
  }

  return { dailyLogs, loading, upsertDailyLog, deleteDailyLog }
}
