import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { computeStreak } from '@/lib/streaks'
import { cn } from '@/lib/utils'
import type { DailyLog } from '@/types/dailyLog'

function StreakTile({
  label,
  count,
  hint,
}: {
  label: string
  count: number
  hint?: string
}) {
  const active = count > 0
  return (
    <div className="flex flex-1 flex-col items-center gap-1 px-2 py-3 text-center">
      <Flame
        className={cn(
          'size-6',
          active ? 'fill-orange-500 text-orange-500' : 'text-muted-foreground',
        )}
      />
      <span className="text-2xl font-semibold tabular-nums">{count}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  )
}

export function StreaksSummary({
  dailyLogs,
  targetCalories,
}: {
  dailyLogs: DailyLog[]
  targetCalories: number | null
}) {
  const trackingStreak = useMemo(() => {
    const dates = new Set(
      dailyLogs
        .filter(
          (log) =>
            log.calories !== null || log.protein !== null || log.weight !== null,
        )
        .map((log) => log.date),
    )
    return computeStreak(dates)
  }, [dailyLogs])

  const deficitStreak = useMemo(() => {
    if (targetCalories === null) return 0
    const dates = new Set(
      dailyLogs
        .filter(
          (log) => log.calories !== null && (log.calories as number) <= targetCalories,
        )
        .map((log) => log.date),
    )
    return computeStreak(dates)
  }, [dailyLogs, targetCalories])

  return (
    <Card>
      <CardContent className="flex divide-x divide-border p-0">
        <StreakTile label="Day tracking streak" count={trackingStreak} />
        <StreakTile
          label="Calorie target streak"
          count={deficitStreak}
          hint={targetCalories === null ? 'Set a calorie target' : undefined}
        />
      </CardContent>
    </Card>
  )
}
