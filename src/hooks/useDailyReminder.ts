import { useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { dailyLogsCol } from '@/firebase/firestore'
import { useNotificationSettings } from '@/hooks/useNotificationSettings'
import { todayKey } from '@/lib/dates'

const LAST_SHOWN_KEY = 'fitness-tracker:reminder-last-shown'

function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

/**
 * Best-effort daily reminder: no server, no push — checked whenever the app
 * is open or comes back into view. If the configured time has passed today,
 * notification permission is granted, and today has no logged entry yet,
 * fire one notification and remember not to repeat it until tomorrow. This
 * cannot wake the app from fully closed; it only catches you the next time
 * you actually open it.
 */
export function useDailyReminder() {
  const { settings } = useNotificationSettings()

  useEffect(() => {
    if (!settings?.enabled) return
    const reminderMinutes = parseTimeToMinutes(settings.time)
    if (reminderMinutes === null) return

    async function checkAndNotify() {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
        return
      }

      const today = todayKey()
      if (localStorage.getItem(LAST_SHOWN_KEY) === today) return
      if (minutesSinceMidnight(new Date()) < reminderMinutes!) return

      const snapshot = await getDoc(doc(dailyLogsCol, today))
      const log = snapshot.exists() ? snapshot.data() : null
      const loggedToday =
        !!log && (log.calories !== null || log.protein !== null || log.weight !== null)
      if (loggedToday) return

      const body = settings!.description || 'Log your food for today!'
      const registration = await navigator.serviceWorker?.getRegistration()
      if (registration) {
        await registration.showNotification('Fitness Tracker', {
          body,
          icon: `${import.meta.env.BASE_URL}pwa-192.png`,
        })
      } else {
        new Notification('Fitness Tracker', { body })
      }
      localStorage.setItem(LAST_SHOWN_KEY, today)
    }

    checkAndNotify()

    function handleVisibility() {
      if (document.visibilityState === 'visible') checkAndNotify()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [settings])
}
