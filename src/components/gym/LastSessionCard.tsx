import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatShortDate } from '@/lib/dates'
import { UNITS } from '@/lib/constants'
import type { WorkoutLog } from '@/types/workoutLog'

export function LastSessionCard({ workoutLogs }: { workoutLogs: WorkoutLog[] }) {
  // workoutLogs is already ordered by date desc, so the first entry's date
  // is the most recent session — collect every exercise logged that date.
  const lastDate = workoutLogs[0]?.date
  const lastSession = lastDate
    ? workoutLogs.filter((log) => log.date === lastDate)
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Last session</CardTitle>
      </CardHeader>
      <CardContent>
        {lastSession.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No workouts logged yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {formatShortDate(lastDate!)}
            </p>
            {lastSession.map((log) => (
              <div key={log.id} className="flex flex-col gap-1.5">
                <span className="font-medium">{log.exerciseName}</span>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
