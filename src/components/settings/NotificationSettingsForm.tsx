import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useNotificationSettings } from '@/hooks/useNotificationSettings'

type PermissionState = NotificationPermission | 'unsupported'

export function NotificationSettingsForm() {
  const { settings, loading, updateSettings } = useNotificationSettings()
  const [enabled, setEnabled] = useState(false)
  const [time, setTime] = useState('20:00')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [permission, setPermission] = useState<PermissionState>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  )

  // Same render-time sync pattern as TargetSettingsForm, for the same
  // reason: an effect keyed only on `loading` can fire after the user has
  // already started editing (if they interact before the initial Firestore
  // snapshot arrives) and silently wipe out what they just typed.
  const [initialized, setInitialized] = useState(false)
  if (!loading && !initialized) {
    setInitialized(true)
    setEnabled(settings?.enabled ?? false)
    setTime(settings?.time ?? '20:00')
    setDescription(settings?.description ?? '')
  }

  function touch<T>(setter: (value: T) => void, value: T) {
    setInitialized(true)
    setter(value)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      if (enabled && permission === 'default') {
        const result = await Notification.requestPermission()
        setPermission(result)
        if (result !== 'granted') {
          toast.error('Notifications were not allowed, so the reminder won’t fire')
        }
      }
      await updateSettings({ enabled, time, description })
      toast.success('Reminder saved')
    } catch (error) {
      console.error(error)
      toast.error('Could not save reminder')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily reminder</CardTitle>
        <CardDescription>
          Best-effort: fires the next time you open the app after this time,
          if today isn&apos;t logged yet. On iOS this only works from the
          home-screen icon, not a Safari tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="reminderEnabled">Remind me</Label>
            <Switch
              id="reminderEnabled"
              checked={enabled}
              onCheckedChange={(value) => touch(setEnabled, value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reminderTime">Time</Label>
            <Input
              id="reminderTime"
              type="time"
              value={time}
              onChange={(event) => touch(setTime, event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reminderDescription">Message</Label>
            <Input
              id="reminderDescription"
              value={description}
              onChange={(event) => touch(setDescription, event.target.value)}
              placeholder="Log your food for today!"
            />
          </div>
          {permission === 'denied' && (
            <p className="text-xs text-destructive">
              Notifications are blocked for this site in your browser/OS
              settings — enable them there for reminders to fire.
            </p>
          )}
          {permission === 'unsupported' && (
            <p className="text-xs text-muted-foreground">
              This browser doesn&apos;t support notifications.
            </p>
          )}
          <Button type="submit" disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save reminder'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
