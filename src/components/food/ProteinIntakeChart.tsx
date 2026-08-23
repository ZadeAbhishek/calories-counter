import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
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

export function ProteinIntakeChart({
  dailyLogs,
  targetProtein,
}: {
  dailyLogs: DailyLog[]
  targetProtein: number | null
}) {
  const data = useMemo(
    () =>
      dailyLogs
        .filter((log) => log.protein !== null)
        .slice()
        .sort((a, b) => compareDateKeys(a.date, b.date))
        .map((log) => ({
          label: formatShortDate(log.date),
          protein: log.protein,
        })),
    [dailyLogs],
  )

  return (
    <ChartCard
      title="Protein intake"
      isEmpty={data.length === 0}
      emptyMessage="Log your protein to see your trend."
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
            width={36}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload}
                label={label}
                formatter={(value) => `${value}${UNITS.protein}`}
              />
            )}
          />
          {targetProtein !== null && (
            <ReferenceLine
              y={targetProtein}
              stroke={CHART_COLORS.baseline}
              strokeDasharray="4 4"
              label={{
                value: `Goal ${targetProtein}${UNITS.protein}`,
                fontSize: 11,
                fill: CHART_COLORS.muted,
                position: 'insideTopRight',
              }}
            />
          )}
          <Bar
            dataKey="protein"
            name="Protein"
            fill={CHART_COLORS.accent}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
