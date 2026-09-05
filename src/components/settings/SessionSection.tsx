import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PlanItemCard } from '@/components/settings/PlanItemCard'
import { cn } from '@/lib/utils'
import type { WorkoutSession } from '@/types/session'
import type { WorkoutPlanItem } from '@/types/workoutPlanItem'

export function SessionSection({
  session,
  items,
  onRemoveItem,
  onRename,
  onDeleteSession,
}: {
  session: WorkoutSession
  items: WorkoutPlanItem[]
  onRemoveItem: (id: string) => void
  onRename: (id: string, name: string) => void
  onDeleteSession: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `session-${session.id}`,
    data: { type: 'session-container', sessionId: session.id },
  })
  // Local, uncontrolled-ish edit buffer: this component instance stays
  // mounted (keyed by session.id) for the session's lifetime, so this only
  // needs to seed once at mount, not resync against every unrelated
  // sessions-collection update the way the daily-log/target forms do.
  const [name, setName] = useState(session.name)

  function commitRename() {
    const trimmed = name.trim()
    if (trimmed && trimmed !== session.name) {
      onRename(session.id, trimmed)
    } else {
      setName(session.name)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={commitRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
          }}
          aria-label={`Rename ${session.name}`}
          className="h-8 flex-1 border-transparent bg-transparent px-1.5 text-sm font-medium shadow-none focus-visible:border-input"
        />
        <button
          type="button"
          onClick={() => onDeleteSession(session.id)}
          aria-label={`Delete ${session.name}`}
          className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <div
        ref={setNodeRef}
        aria-label={`${session.name} workout list`}
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
                sessionId={item.sessionId}
                exerciseId={item.exerciseId}
                exerciseName={item.exerciseName}
                onRemove={() => onRemoveItem(item.id)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
