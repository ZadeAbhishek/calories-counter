import { useMemo, useState } from 'react'
import { DailyEntryForm } from '@/components/food/DailyEntryForm'
import { StreaksSummary } from '@/components/food/StreaksSummary'
import { WeightTrendChart } from '@/components/food/WeightTrendChart'
import { ProteinIntakeChart } from '@/components/food/ProteinIntakeChart'
import { CalorieDeficitChart } from '@/components/food/CalorieDeficitChart'
import { RangeSelector } from '@/components/charts/RangeSelector'
import { useDailyLogs } from '@/hooks/useDailyLogs'
import { useTargets } from '@/hooks/useTargets'
import { isWithinRange } from '@/lib/dates'
import type { RangeOption } from '@/lib/constants'

export function FoodTab() {
  const { dailyLogs, upsertDailyLog, deleteDailyLog } = useDailyLogs()
  const { targets } = useTargets()
  const [range, setRange] = useState<RangeOption>('30d')

  const rangedLogs = useMemo(
    () => dailyLogs.filter((log) => isWithinRange(log.date, range)),
    [dailyLogs, range],
  )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Food</h1>
      <StreaksSummary
        dailyLogs={dailyLogs}
        targetCalories={targets?.targetCalories ?? null}
      />
      <DailyEntryForm
        dailyLogs={dailyLogs}
        upsertDailyLog={upsertDailyLog}
        deleteDailyLog={deleteDailyLog}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Trends</h2>
        <RangeSelector value={range} onChange={setRange} />
      </div>
      <WeightTrendChart
        dailyLogs={rangedLogs}
        targetWeight={targets?.targetWeight ?? null}
      />
      <ProteinIntakeChart
        dailyLogs={rangedLogs}
        targetProtein={targets?.targetProtein ?? null}
      />
      <CalorieDeficitChart
        dailyLogs={rangedLogs}
        targetCalories={targets?.targetCalories ?? null}
      />
    </div>
  )
}
