import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { CHART_COLORS } from '@/lib/chartColors'
import { compareDateKeys, formatShortDate } from '@/lib/dates'
import { UNITS } from '@/lib/constants'
import type { DailyLog } from '@/types/dailyLog'

export function CalorieDeficitChart({
  dailyLogs,
  targetCalories,
}: {
  dailyLogs: DailyLog[]
  targetCalories: number | null
}) {
  const data = useMemo(() => {
    if (targetCalories === null) return []
    return dailyLogs
      .filter((log) => log.calories !== null)
      .slice()
      .sort((a, b) => compareDateKeys(a.date, b.date))
      .map((log) => ({
        label: formatShortDate(log.date),
        delta: (log.calories as number) - targetCalories,
      }))
  }, [dailyLogs, targetCalories])

  return (
    <ChartCard
      title="Calorie deficit"
      subtitle={
        <span className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: CHART_COLORS.divergingUnder }}
            />
            under target
          </span>
          <span className="inline-flex items-center gap-1">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: CHART_COLORS.divergingOver }}
            />
            over target
          </span>
        </span>
      }
      isEmpty={data.length === 0}
      emptyMessage={
        targetCalories === null
          ? 'Set a target calorie goal to see this chart.'
          : 'Log your calories to see your trend.'
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.gridline} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
            axisLine={{ stroke: CHART_COLORS.baseline }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload}
                label={label}
                formatter={(value) =>
                  `${value > 0 ? '+' : ''}${value} ${UNITS.calories}`
                }
              />
            )}
          />
          <ReferenceLine y={0} stroke={CHART_COLORS.baseline} />
          <Bar dataKey="delta" name="vs target" radius={[4, 4, 4, 4]} maxBarSize={24}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.delta > 0
                    ? CHART_COLORS.divergingOver
                    : CHART_COLORS.divergingUnder
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
