import { useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExercisePool } from '@/components/settings/ExercisePool'
import { SessionSection } from '@/components/settings/SessionSection'
import { useExercises } from '@/hooks/useExercises'
import { useSessions } from '@/hooks/useSessions'
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan'
import type { WorkoutSession } from '@/types/session'
import type { WorkoutPlanItem } from '@/types/workoutPlanItem'

type DragPayload =
  | { type: 'pool-item'; exerciseId: string; exerciseName: string }
  | { type: 'plan-item'; sessionId: string; exerciseId: string; exerciseName: string }

function groupBySession(
  items: WorkoutPlanItem[],
  sessions: WorkoutSession[],
): Map<string, WorkoutPlanItem[]> {
  const map = new Map<string, WorkoutPlanItem[]>()
  for (const session of sessions) map.set(session.id, [])
  for (const item of items) {
    map.get(item.sessionId)?.push(item)
  }
  for (const list of map.values()) list.sort((a, b) => a.order - b.order)
  return map
}

export function WorkoutPlanBuilder() {
  const { exercises, addExercise, deleteExercise } = useExercises()
  const { sessions, addSession, renameSession, deleteSession } = useSessions()
  const { planItems, addPlanItem, movePlanItem, reorderSession, removePlanItem } =
    useWorkoutPlan()
  const [activeDrag, setActiveDrag] = useState<DragPayload | null>(null)
  // Tracks add-session calls already sent but not yet reflected in
  // `sessions` (Firestore's onSnapshot round-trip hasn't caught up). Without
  // this, naming a new session "Session {sessions.length + 1}" races: two
  // quick clicks both read the same stale length and create two sessions
  // both named "Session 1".
  const pendingSessionCount = useRef(0)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const itemsBySession = groupBySession(planItems, sessions)

  function resolveTargetSession(overId: string, overData: unknown): string | null {
    const data = overData as { sessionId?: string } | undefined
    if (data?.sessionId) return data.sessionId
    if (overId.startsWith('session-')) return overId.slice(8)
    return null
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as DragPayload | undefined
    setActiveDrag(data ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null)
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current as DragPayload | undefined
    if (!activeData) return

    const targetSessionId = resolveTargetSession(String(over.id), over.data.current)
    if (!targetSessionId) return

    if (activeData.type === 'pool-item') {
      const order = itemsBySession.get(targetSessionId)?.length ?? 0
      await addPlanItem(
        targetSessionId,
        activeData.exerciseId,
        activeData.exerciseName,
        order,
      )
      return
    }

    const sourceSessionId = activeData.sessionId
    const itemId = String(active.id)

    if (sourceSessionId === targetSessionId) {
      const items = itemsBySession.get(targetSessionId) ?? []
      const oldIndex = items.findIndex((item) => item.id === itemId)
      const overIndex = items.findIndex((item) => item.id === over.id)
      const newIndex = overIndex === -1 ? items.length - 1 : overIndex
      if (oldIndex === -1 || oldIndex === newIndex) return
      const reordered = arrayMove(items, oldIndex, newIndex)
      await reorderSession(reordered.map((item) => item.id))
    } else {
      const targetItems = itemsBySession.get(targetSessionId) ?? []
      await movePlanItem(itemId, targetSessionId, targetItems.length)
    }
  }

  async function handleAddSession() {
    const nextNumber = sessions.length + pendingSessionCount.current + 1
    pendingSessionCount.current += 1
    try {
      await addSession(`Session ${nextNumber}`)
    } finally {
      pendingSessionCount.current -= 1
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4">
        <ExercisePool
          exercises={exercises}
          addExercise={addExercise}
          deleteExercise={deleteExercise}
        />
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Sessions</h3>
          <Button type="button" variant="outline" size="sm" onClick={handleAddSession}>
            <Plus className="size-4" />
            Add session
          </Button>
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add a session, then drag workouts onto it.
          </p>
        ) : (
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-3">
            {sessions.map((session) => (
              <SessionSection
                key={session.id}
                session={session}
                items={itemsBySession.get(session.id) ?? []}
                onRemoveItem={removePlanItem}
                onRename={renameSession}
                onDeleteSession={deleteSession}
              />
            ))}
          </div>
        )}
      </div>
      <DragOverlay>
        {activeDrag ? (
          <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
            {activeDrag.exerciseName}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
