import { useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { todayKey } from '@/lib/dates'
import { UNITS } from '@/lib/constants'
import type { DailyLog, DailyLogFields } from '@/types/dailyLog'

export function DailyEntryForm({
  dailyLogs,
  upsertDailyLog,
  deleteDailyLog,
}: {
  dailyLogs: DailyLog[]
  upsertDailyLog: (
    date: string,
    fields: Partial<DailyLogFields>,
  ) => Promise<void>
  deleteDailyLog: (date: string) => Promise<void>
}) {
  const [date, setDate] = useState(todayKey())
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)

  const existingLog = useMemo(
    () => dailyLogs.find((log) => log.date === date),
    [dailyLogs, date],
  )

  // Resynced during render, not in an effect, and keyed on whether a match
  // currently exists for this date rather than on the `existingLog` object:
  // useDailyLogs re-maps every doc to a new object on every snapshot, so
  // keying on the object would resync — and clobber whatever the user is
  // mid-typing — on any unrelated Firestore update (e.g. a gym log write
  // elsewhere). Including "found vs not" in the key still lets a match that
  // arrives late (Firestore's initial snapshot resolving after the user
  // has already picked a date) correctly backfill once.
  const selectionKey = `${date}|${existingLog ? 'found' : 'empty'}`
  const [syncedKey, setSyncedKey] = useState(selectionKey)
  if (syncedKey !== selectionKey) {
    setSyncedKey(selectionKey)
    setCalories(existingLog?.calories?.toString() ?? '')
    setProtein(existingLog?.protein?.toString() ?? '')
    setWeight(existingLog?.weight?.toString() ?? '')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      await upsertDailyLog(date, {
        calories: calories === '' ? null : Number(calories),
        protein: protein === '' ? null : Number(protein),
        weight: weight === '' ? null : Number(weight),
      })
      toast.success(`Saved ${date}`)
    } catch (error) {
      console.error(error)
      toast.error('Could not save entry')
    } finally {
      setSaving(false)
    }
  }

  async function handleClear() {
    setClearing(true)
    try {
      await deleteDailyLog(date)
      toast.success(`Cleared ${date}`)
    } catch (error) {
      console.error(error)
      toast.error('Could not clear entry')
    } finally {
      setClearing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log today</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entryDate">Date</Label>
            <Input
              id="entryDate"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              max={todayKey()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entryWeight">Body weight ({UNITS.weight})</Label>
            <Input
              id="entryWeight"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="e.g. 74.5"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entryCalories">Calories ({UNITS.calories})</Label>
            <Input
              id="entryCalories"
              type="number"
              inputMode="decimal"
              step="1"
              value={calories}
              onChange={(event) => setCalories(event.target.value)}
              placeholder="e.g. 2100"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entryProtein">Protein ({UNITS.protein})</Label>
            <Input
              id="entryProtein"
              type="number"
              inputMode="decimal"
              step="1"
              value={protein}
              onChange={(event) => setProtein(event.target.value)}
              placeholder="e.g. 140"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving || clearing} className="flex-1">
              {saving ? 'Saving...' : 'Save'}
            </Button>
            {existingLog && (
              <Button
                type="button"
                variant="outline"
                disabled={saving || clearing}
                onClick={handleClear}
              >
                {clearing ? 'Clearing...' : 'Clear this day'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
