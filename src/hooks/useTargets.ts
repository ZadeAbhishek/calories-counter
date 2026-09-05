import { useEffect, useState } from 'react'
import { onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { targetsDocRef } from '@/firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import type { Targets } from '@/types/targets'

export function useTargets() {
  const { uid } = useAuth()
  const [targets, setTargets] = useState<Targets | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(targetsDocRef(uid), (snapshot) => {
      setTargets(snapshot.exists() ? snapshot.data() : null)
      setLoading(false)
    })
    return unsubscribe
  }, [uid])

  async function updateTargets(fields: {
    targetWeight: number | null
    targetProtein: number | null
    targetCalories: number | null
  }) {
    await setDoc(targetsDocRef(uid), { ...fields, updatedAt: serverTimestamp() })
  }

  return { targets, loading, updateTargets }
}
