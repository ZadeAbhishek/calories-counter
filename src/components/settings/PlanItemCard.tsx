import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DayKey } from '@/lib/constants'

export function PlanItemCard({
  id,
  day,
  exerciseId,
  exerciseName,
  onRemove,
}: {
  id: string
  day: DayKey
  exerciseId: string
  exerciseName: string
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      data: { type: 'plan-item', day, exerciseId, exerciseName },
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-label={`${exerciseName}, drag to move`}
      className={cn(
        'flex touch-none items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-sm active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <GripVertical className="size-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate">{exerciseName}</span>
      <button
        type="button"
        aria-label={`Remove ${exerciseName}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onRemove}
        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
