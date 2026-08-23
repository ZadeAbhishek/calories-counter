import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { CHART_COLORS } from '@/lib/chartColors'
import { rollingAverage } from '@/lib/metrics'
import { compareDateKeys, formatShortDate } from '@/lib/dates'
import { UNITS } from '@/lib/constants'
import type { DailyLog } from '@/types/dailyLog'

export function WeightTrendChart({
  dailyLogs,
  targetWeight,
}: {
  dailyLogs: DailyLog[]
  targetWeight: number | null
}) {
  const data = useMemo(() => {
    const entries = dailyLogs
      .filter((log) => log.weight !== null)
      .slice()
      .sort((a, b) => compareDateKeys(a.date, b.date))
    const averages = rollingAverage(
      entries.map((entry) => entry.weight as number),
      7,
    )
    return entries.map((entry, index) => ({
      label: formatShortDate(entry.date),
      weight: entry.weight,
      average: Math.round(averages[index] * 10) / 10,
    }))
  }, [dailyLogs])

  return (
    <ChartCard
      title="Weight trend"
      subtitle="Dots = daily weigh-ins, line = 7-day average"
      isEmpty={data.length === 0}
      emptyMessage="Log your weight to see your trend."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            width={36}
            domain={['auto', 'auto']}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload}
                label={label}
                formatter={(value) => `${value} ${UNITS.weight}`}
              />
            )}
          />
          {targetWeight !== null && (
            <ReferenceLine
              y={targetWeight}
              stroke={CHART_COLORS.baseline}
              strokeDasharray="4 4"
              label={{
                value: `Goal ${targetWeight}${UNITS.weight}`,
                fontSize: 11,
                fill: CHART_COLORS.muted,
                position: 'insideTopRight',
              }}
            />
          )}
          <Line
            dataKey="weight"
            name="Weigh-in"
            stroke="none"
            dot={{ r: 3, fill: CHART_COLORS.muted, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="average"
            name="7-day average"
            stroke={CHART_COLORS.accent}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
