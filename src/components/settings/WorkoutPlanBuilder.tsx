import { useState } from 'react'
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
import { ExercisePool } from '@/components/settings/ExercisePool'
import { DaySection } from '@/components/settings/DaySection'
import { useExercises } from '@/hooks/useExercises'
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan'
import { DAYS_OF_WEEK, type DayKey } from '@/lib/constants'
import type { WorkoutPlanItem } from '@/types/workoutPlanItem'

type DragPayload =
  | { type: 'pool-item'; exerciseId: string; exerciseName: string }
  | { type: 'plan-item'; day: DayKey; exerciseId: string; exerciseName: string }

function groupByDay(items: WorkoutPlanItem[]): Map<DayKey, WorkoutPlanItem[]> {
  const map = new Map<DayKey, WorkoutPlanItem[]>()
  for (const day of DAYS_OF_WEEK) map.set(day.key, [])
  for (const item of items) {
    map.get(item.day)?.push(item)
  }
  for (const list of map.values()) list.sort((a, b) => a.order - b.order)
  return map
}

export function WorkoutPlanBuilder() {
  const { exercises, addExercise, deleteExercise } = useExercises()
  const { planItems, addPlanItem, movePlanItem, reorderDay, removePlanItem } =
    useWorkoutPlan()
  const [activeDrag, setActiveDrag] = useState<DragPayload | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const itemsByDay = groupByDay(planItems)

  function resolveTargetDay(overId: string, overData: unknown): DayKey | null {
    const data = overData as { day?: DayKey } | undefined
    if (data?.day) return data.day
    if (overId.startsWith('day-')) return overId.slice(4) as DayKey
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

    const targetDay = resolveTargetDay(String(over.id), over.data.current)
    if (!targetDay) return

    if (activeData.type === 'pool-item') {
      const order = itemsByDay.get(targetDay)?.length ?? 0
      await addPlanItem(
        targetDay,
        activeData.exerciseId,
        activeData.exerciseName,
        order,
      )
      return
    }

    const sourceDay = activeData.day
    const itemId = String(active.id)

    if (sourceDay === targetDay) {
      const dayItems = itemsByDay.get(targetDay) ?? []
      const oldIndex = dayItems.findIndex((item) => item.id === itemId)
      const overIndex = dayItems.findIndex((item) => item.id === over.id)
      const newIndex = overIndex === -1 ? dayItems.length - 1 : overIndex
      if (oldIndex === -1 || oldIndex === newIndex) return
      const reordered = arrayMove(dayItems, oldIndex, newIndex)
      await reorderDay(reordered.map((item) => item.id))
    } else {
      const targetItems = itemsByDay.get(targetDay) ?? []
      await movePlanItem(itemId, targetDay, targetItems.length)
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
        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-3">
          {DAYS_OF_WEEK.map((day) => (
            <DaySection
              key={day.key}
              day={day.key}
              label={day.label}
              items={itemsByDay.get(day.key) ?? []}
              onRemove={removePlanItem}
            />
          ))}
        </div>
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
