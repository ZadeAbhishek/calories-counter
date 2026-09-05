import { useEffect, useState } from 'react'
import { onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { notificationSettingsDocRef } from '@/firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import type { NotificationSettings } from '@/types/notificationSettings'

export function useNotificationSettings() {
  const { uid } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(notificationSettingsDocRef(uid), (snapshot) => {
      setSettings(snapshot.exists() ? snapshot.data() : null)
      setLoading(false)
    })
    return unsubscribe
  }, [uid])

  async function updateSettings(fields: {
    enabled: boolean
    time: string
    description: string
  }) {
    await setDoc(notificationSettingsDocRef(uid), {
      ...fields,
      updatedAt: serverTimestamp(),
    })
  }

  return { settings, loading, updateSettings }
}
