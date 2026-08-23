import { useEffect, useState } from 'react'
import { subscribeToAuthReady } from '@/firebase/auth'

export function useAuthReady() {
  const [uid, setUid] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToAuthReady((user) => {
      setUid(user?.uid ?? null)
    })
    return unsubscribe
  }, [])

  return { ready: uid !== null, uid }
}
