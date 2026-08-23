import { useState } from 'react'
import { AddSetForm } from '@/components/gym/AddSetForm'
import { ExerciseProgressChart } from '@/components/gym/ExerciseProgressChart'
import { LastSessionCard } from '@/components/gym/LastSessionCard'
import { WorkoutLogTable } from '@/components/gym/WorkoutLogTable'
import { useExercises } from '@/hooks/useExercises'
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs'
import { todayKey } from '@/lib/dates'
import type { WorkoutLog } from '@/types/workoutLog'

export function GymTab() {
  const { exercises, addExercise } = useExercises()
  const { workoutLogs, upsertWorkoutLog, deleteWorkoutLog } = useWorkoutLogs()
  const [date, setDate] = useState(todayKey())
  const [exerciseId, setExerciseId] = useState('')

  function handleEdit(log: WorkoutLog) {
    setDate(log.date)
    setExerciseId(log.exerciseId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Gym</h1>
      <LastSessionCard workoutLogs={workoutLogs} />
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
