import { useMemo, useState, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddExerciseDialog } from '@/components/gym/AddExerciseDialog'
import { compareDateKeys, formatShortDate, todayKey } from '@/lib/dates'
import { UNITS } from '@/lib/constants'
import type { Exercise } from '@/types/exercise'
import type { WorkoutLog, WorkoutSet } from '@/types/workoutLog'

const EMPTY_SET: WorkoutSet = { reps: 0, weight: 0 }

export function AddSetForm({
  exercises,
  workoutLogs,
  addExercise,
  upsertWorkoutLog,
  date,
  onDateChange,
  exerciseId,
  onExerciseIdChange,
}: {
  exercises: Exercise[]
  workoutLogs: WorkoutLog[]
  addExercise: (name: string, category: string | null) => Promise<string>
  upsertWorkoutLog: (params: {
    date: string
    exerciseId: string
    exerciseName: string
    sets: WorkoutSet[]
    existingCreatedAt?: number
  }) => Promise<void>
  date: string
  onDateChange: (date: string) => void
  exerciseId: string
  onExerciseIdChange: (exerciseId: string) => void
}) {
  const [sets, setSets] = useState<WorkoutSet[]>([{ ...EMPTY_SET }])
  const [saving, setSaving] = useState(false)

  const existingLog = useMemo(
    () =>
      workoutLogs.find(
        (log) => log.date === date && log.exerciseId === exerciseId,
      ),
    [workoutLogs, date, exerciseId],
  )

  // If this date+exercise already has a logged entry, load its sets so Save
  // extends that entry instead of silently overwriting it. Resynced during
  // render (not in an effect) and keyed on whether a match currently exists
  // for this selection, not on the `existingLog` object itself:
  // useWorkoutLogs re-maps every doc to a new object on every snapshot, so
  // keying on the object would resync — and clobber whatever the user is
  // mid-typing — on any unrelated Firestore update. Including "found vs not"
  // in the key (rather than just date+exerciseId) still lets a match that
  // arrives late, e.g. Firestore's initial snapshot resolving after the
  // user has already picked a date/exercise, correctly backfill once.
  const selectionKey = `${date}|${exerciseId}|${existingLog ? 'found' : 'empty'}`
  const [syncedKey, setSyncedKey] = useState(selectionKey)
  if (syncedKey !== selectionKey) {
    setSyncedKey(selectionKey)
    setSets(
      existingLog && existingLog.sets.length > 0
        ? existingLog.sets.map((set) => ({ ...set }))
        : [{ ...EMPTY_SET }],
    )
  }

  // Most recent PRIOR entry for this exercise (excluding whatever date is
  // currently selected) — a quick "what did I lift last time" reference to
  // help decide today's weight, shown only once an exercise is picked.
  const lastPerformed = useMemo(() => {
    if (!exerciseId) return undefined
    return workoutLogs
      .filter((log) => log.exerciseId === exerciseId && log.date !== date)
      .slice()
      .sort((a, b) => compareDateKeys(b.date, a.date))[0]
  }, [workoutLogs, exerciseId, date])

  function updateSet(index: number, field: keyof WorkoutSet, value: number) {
    setSets((current) =>
      current.map((set, i) => (i === index ? { ...set, [field]: value } : set)),
    )
  }

  function addSetRow() {
    setSets((current) => [...current, { ...EMPTY_SET }])
  }

  function removeSetRow(index: number) {
    setSets((current) => current.filter((_, i) => i !== index))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const exercise = exercises.find((e) => e.id === exerciseId)
    if (!exercise) {
      toast.error('Pick an exercise first')
      return
    }
    const validSets = sets.filter((set) => set.reps > 0)
    if (validSets.length === 0) {
      toast.error('Add at least one set with reps')
      return
    }
    setSaving(true)
    try {
      await upsertWorkoutLog({
        date,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: validSets,
        existingCreatedAt: existingLog?.createdAt,
      })
      toast.success(`Logged ${exercise.name}`)
      onExerciseIdChange('')
    } catch (error) {
      console.error(error)
      toast.error('Could not save workout log')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="logDate">Date</Label>
            <Input
              id="logDate"
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              max={todayKey()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Exercise</Label>
            <div className="flex gap-2">
              <Select value={exerciseId} onValueChange={onExerciseIdChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AddExerciseDialog
                addExercise={addExercise}
                triggerLabel="New"
                onCreated={onExerciseIdChange}
              />
            </div>
            {existingLog ? (
              <p className="text-xs text-muted-foreground">
                Already logged on this date — editing that entry.
              </p>
            ) : (
              lastPerformed && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Last time ({formatShortDate(lastPerformed.date)}):</span>
                  {lastPerformed.sets.map((set, index) => (
                    <Badge key={index} variant="secondary">
                      {set.reps} × {set.weight}
                      {UNITS.weight}
                    </Badge>
                  ))}
                </div>
              )
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Sets</Label>
            {sets.map((set, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-5 text-xs text-muted-foreground">
                  {index + 1}
                </span>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Reps"
                  value={set.reps || ''}
                  onChange={(event) =>
                    updateSet(index, 'reps', Number(event.target.value))
                  }
                  className="flex-1"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.5"
                  placeholder="Weight (kg)"
                  value={set.weight || ''}
                  onChange={(event) =>
                    updateSet(index, 'weight', Number(event.target.value))
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeSetRow(index)}
                  aria-label="Remove set"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSetRow}
              className="self-start"
            >
              <Plus className="size-4" />
              Add set
            </Button>
          </div>

          <Button type="submit" disabled={saving || !exerciseId}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
