import { lazy, Suspense, useState } from 'react'
import { AddSetForm } from '@/components/gym/AddSetForm'
import { ExerciseProgressChart } from '@/components/gym/ExerciseProgressChart'
import { LastSessionCard } from '@/components/gym/LastSessionCard'
import { SessionLoader } from '@/components/gym/SessionLoader'
import { WorkoutLogTable } from '@/components/gym/WorkoutLogTable'
import { Button } from '@/components/ui/button'
import { useExercises } from '@/hooks/useExercises'
import { useSessions } from '@/hooks/useSessions'
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs'
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan'
import { todayKey } from '@/lib/dates'
import type { WorkoutLog } from '@/types/workoutLog'

// Temporary feasibility spike for the voice workout buddy (see the Workout
// Buddy plan) — deliberately shipped to production too, not just dev,
// since testing on a real phone needs a real HTTPS origin (WebGPU and mic
// access aren't available over plain HTTP on a LAN dev server). Lazy-loaded
// so it costs nothing unless opened. Delete this along with the import once
// WorkoutBuddySession supersedes it.
const BuddySpikeScreen = lazy(() =>
  import('@/components/gym/dev/BuddySpikeScreen').then((m) => ({
    default: m.BuddySpikeScreen,
  })),
)

export function GymTab() {
  const { exercises, addExercise } = useExercises()
  const { workoutLogs, upsertWorkoutLog, deleteWorkoutLog } = useWorkoutLogs()
  const { sessions } = useSessions()
  const { planItems } = useWorkoutPlan()
  const [date, setDate] = useState(todayKey())
  const [exerciseId, setExerciseId] = useState('')
  const [spikeOpen, setSpikeOpen] = useState(false)

  function handleEdit(log: WorkoutLog) {
    setDate(log.date)
    setExerciseId(log.exerciseId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleLoadExercise(id: string) {
    setExerciseId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Gym</h1>
        <Button variant="outline" size="sm" onClick={() => setSpikeOpen(true)}>
          Buddy spike
        </Button>
      </div>
      {spikeOpen && (
        <Suspense fallback={null}>
          <BuddySpikeScreen onClose={() => setSpikeOpen(false)} />
        </Suspense>
      )}
      <LastSessionCard workoutLogs={workoutLogs} />
      <SessionLoader
        sessions={sessions}
        planItems={planItems}
        onSelectExercise={handleLoadExercise}
      />
      <AddSetForm
        exercises={exercises}
        workoutLogs={workoutLogs}
        addExercise={addExercise}
        upsertWorkoutLog={upsertWorkoutLog}
        date={date}
        onDateChange={setDate}
        exerciseId={exerciseId}
        onExerciseIdChange={setExerciseId}
      />
      <ExerciseProgressChart exercises={exercises} workoutLogs={workoutLogs} />
      <WorkoutLogTable
        workoutLogs={workoutLogs}
        onEdit={handleEdit}
        deleteWorkoutLog={deleteWorkoutLog}
      />
    </div>
  )
}
