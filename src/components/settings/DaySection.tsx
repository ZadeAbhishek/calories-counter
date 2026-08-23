import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PlanItemCard } from '@/components/settings/PlanItemCard'
import { cn } from '@/lib/utils'
import type { DayKey } from '@/lib/constants'
import type { WorkoutPlanItem } from '@/types/workoutPlanItem'

export function DaySection({
  day,
  label,
  items,
  onRemove,
}: {
  day: DayKey
  label: string
  items: WorkoutPlanItem[]
  onRemove: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day}`,
    data: { type: 'day-container', day },
  })

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{label}</p>
      <div
        ref={setNodeRef}
        aria-label={`${label} workout list`}
        className={cn(
          'flex min-h-16 flex-col gap-1.5 rounded-lg border border-dashed border-border p-2 transition-colors',
          isOver && 'border-primary/50 bg-accent',
        )}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              Drop here
            </p>
          ) : (
            items.map((item) => (
              <PlanItemCard
                key={item.id}
                id={item.id}
                day={item.day}
                exerciseId={item.exerciseId}
                exerciseName={item.exerciseName}
                onRemove={() => onRemove(item.id)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
