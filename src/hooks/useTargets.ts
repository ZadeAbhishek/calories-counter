import { useEffect, useState } from 'react'
import { onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { targetsDocRef } from '@/firebase/firestore'
import type { Targets } from '@/types/targets'

export function useTargets() {
  const [targets, setTargets] = useState<Targets | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(targetsDocRef, (snapshot) => {
      setTargets(snapshot.exists() ? snapshot.data() : null)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function updateTargets(fields: {
    targetWeight: number | null
    targetProtein: number | null
    targetCalories: number | null
  }) {
    await setDoc(targetsDocRef, { ...fields, updatedAt: serverTimestamp() })
  }

  return { targets, loading, updateTargets }
}
