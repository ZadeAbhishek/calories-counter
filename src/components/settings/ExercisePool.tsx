import { useDraggable } from '@dnd-kit/core'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { AddExerciseDialog } from '@/components/gym/AddExerciseDialog'
import { cn } from '@/lib/utils'
import type { Exercise } from '@/types/exercise'

function PoolChip({
  exercise,
  onDelete,
}: {
  exercise: Exercise
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pool-${exercise.id}`,
    data: {
      type: 'pool-item',
      exerciseId: exercise.id,
      exerciseName: exercise.name,
    },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-label={`Drag ${exercise.name} to a day`}
      className={cn(
        'flex shrink-0 touch-none items-center gap-1 rounded-full border border-border bg-card py-1.5 pr-1.5 pl-3 text-sm whitespace-nowrap active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      {exercise.name}
      <button
        type="button"
        aria-label={`Delete ${exercise.name}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onDelete}
        className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function ExercisePool({
  exercises,
  addExercise,
  deleteExercise,
}: {
  exercises: Exercise[]
  addExercise: (name: string, category: string | null) => Promise<string>
  deleteExercise: (id: string) => Promise<void>
}) {
  async function handleDelete(exercise: Exercise) {
    try {
      await deleteExercise(exercise.id)
      toast.success(`Deleted "${exercise.name}"`)
    } catch (error) {
      console.error(error)
      toast.error('Could not delete exercise')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Your workouts</p>
        <AddExerciseDialog addExercise={addExercise} triggerLabel="Add workout" />
      </div>
      {exercises.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add a workout, then drag it onto a day below.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Drag a workout onto a day to add it to your plan. Tap the × to
            remove it from your list (past logs keep their history).
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {exercises.map((exercise) => (
              <PoolChip
                key={exercise.id}
                exercise={exercise}
                onDelete={() => handleDelete(exercise)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
