import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatShortDate } from '@/lib/dates'
import { UNITS } from '@/lib/constants'
import type { WorkoutLog } from '@/types/workoutLog'

function groupByDate(logs: WorkoutLog[]): [string, WorkoutLog[]][] {
  const map = new Map<string, WorkoutLog[]>()
  for (const log of logs) {
    const group = map.get(log.date)
    if (group) {
      group.push(log)
    } else {
      map.set(log.date, [log])
    }
  }
  return Array.from(map.entries())
}

export function WorkoutLogTable({
  workoutLogs,
  onEdit,
  deleteWorkoutLog,
}: {
  workoutLogs: WorkoutLog[]
  onEdit: (log: WorkoutLog) => void
  deleteWorkoutLog: (date: string, exerciseId: string) => Promise<void>
}) {
  if (workoutLogs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No workouts logged yet. Use the form above to log your first set.
      </p>
    )
  }

  async function handleDelete(log: WorkoutLog) {
    try {
      await deleteWorkoutLog(log.date, log.exerciseId)
      toast.success(`Deleted ${log.exerciseName}`)
    } catch (error) {
      console.error(error)
      toast.error('Could not delete entry')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {groupByDate(workoutLogs).map(([date, logs]) => (
        <Card key={date}>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {formatShortDate(date)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{log.exerciseName}</span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${log.exerciseName}`}
                      onClick={() => onEdit(log)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${log.exerciseName}`}
                      onClick={() => handleDelete(log)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {log.sets.map((set, index) => (
                    <Badge key={index} variant="secondary">
                      {set.reps} × {set.weight}
                      {UNITS.weight}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
