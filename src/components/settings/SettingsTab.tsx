import { TargetSettingsForm } from '@/components/settings/TargetSettingsForm'
import { NotificationSettingsForm } from '@/components/settings/NotificationSettingsForm'
import { WorkoutPlanBuilder } from '@/components/settings/WorkoutPlanBuilder'

export function SettingsTab() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Target Settings</h1>
      <TargetSettingsForm />
      <NotificationSettingsForm />
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Workout plan</h2>
        <WorkoutPlanBuilder />
      </div>
    </div>
  )
}
