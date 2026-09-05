import { useMemo, useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { todayKey } from '@/lib/dates'
import { UNITS } from '@/lib/constants'
import type { DailyLog, DailyLogFields } from '@/types/dailyLog'

type FieldKey = keyof DailyLogFields

const FIELD_LABELS: Record<FieldKey, string> = {
  weight: 'weight',
  calories: 'calories',
  protein: 'protein',
}

function FieldRow({
  field,
  label,
  value,
  onChange,
  onSaveField,
  disabled,
  placeholder,
  step,
}: {
  field: FieldKey
  label: string
  value: string
  onChange: (value: string) => void
  onSaveField: (field: FieldKey, value: string) => void
  disabled: boolean
  placeholder: string
  step: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`entry-${field}`}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={`entry-${field}`}
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          onClick={() => onSaveField(field, value)}
          aria-label={`Save ${FIELD_LABELS[field]} only`}
          title={`Save just ${FIELD_LABELS[field]}`}
        >
          <Check className="size-4" />
        </Button>
      </div>
    </div>
  )
}

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
  const [savingField, setSavingField] = useState<FieldKey | null>(null)
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

  async function handleSaveField(field: FieldKey, rawValue: string) {
    setSavingField(field)
    try {
      await upsertDailyLog(date, {
        [field]: rawValue === '' ? null : Number(rawValue),
      })
      toast.success(`Saved ${FIELD_LABELS[field]}`)
    } catch (error) {
      console.error(error)
      toast.error(`Could not save ${FIELD_LABELS[field]}`)
    } finally {
      setSavingField(null)
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

  const anyBusy = saving || clearing || savingField !== null

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

          <p className="text-xs text-muted-foreground">
            Tap the check next to a field to save just that value, or fill in
            what you have and use Save below for all of it at once.
          </p>

          <FieldRow
            field="weight"
            label={`Body weight (${UNITS.weight})`}
            value={weight}
            onChange={setWeight}
            onSaveField={handleSaveField}
            disabled={anyBusy}
            placeholder="e.g. 74.5"
            step="0.1"
          />
          <FieldRow
            field="calories"
            label={`Calories (${UNITS.calories})`}
            value={calories}
            onChange={setCalories}
            onSaveField={handleSaveField}
            disabled={anyBusy}
            placeholder="e.g. 2100"
            step="1"
          />
          <FieldRow
            field="protein"
            label={`Protein (${UNITS.protein})`}
            value={protein}
            onChange={setProtein}
            onSaveField={handleSaveField}
            disabled={anyBusy}
            placeholder="e.g. 140"
            step="1"
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={anyBusy} className="flex-1">
              {saving ? 'Saving...' : 'Save all'}
            </Button>
            {existingLog && (
              <Button
                type="button"
                variant="outline"
                disabled={anyBusy}
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
