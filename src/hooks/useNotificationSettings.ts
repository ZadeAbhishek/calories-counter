import { useEffect, useState } from 'react'
import { onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { notificationSettingsDocRef } from '@/firebase/firestore'
import type { NotificationSettings } from '@/types/notificationSettings'

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(notificationSettingsDocRef, (snapshot) => {
      setSettings(snapshot.exists() ? snapshot.data() : null)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function updateSettings(fields: {
    enabled: boolean
    time: string
    description: string
  }) {
    await setDoc(notificationSettingsDocRef, {
      ...fields,
      updatedAt: serverTimestamp(),
    })
  }

  return { settings, loading, updateSettings }
}
