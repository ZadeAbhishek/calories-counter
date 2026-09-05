import { useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkoutSession } from '@/types/session'
import type { WorkoutPlanItem } from '@/types/workoutPlanItem'

export function SessionLoader({
  sessions,
  planItems,
  onSelectExercise,
}: {
  sessions: WorkoutSession[]
  planItems: WorkoutPlanItem[]
  onSelectExercise: (exerciseId: string) => void
}) {
  const [sessionId, setSessionId] = useState('')

  const items = useMemo(
    () =>
      planItems
        .filter((item) => item.sessionId === sessionId)
        .sort((a, b) => a.order - b.order),
    [planItems, sessionId],
  )

  if (sessions.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Load a session</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Select value={sessionId} onValueChange={setSessionId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sessionId &&
          (items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No workouts in this session yet — add some in Target Settings.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectExercise(item.exerciseId)}
                >
                  {item.exerciseName}
                </Button>
              ))}
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
