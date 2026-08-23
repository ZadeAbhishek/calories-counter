import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { RangeSelector } from '@/components/charts/RangeSelector'
import { CHART_COLORS } from '@/lib/chartColors'
import { computeMaxWeight, computeVolume } from '@/lib/metrics'
import { compareDateKeys, formatShortDate, isWithinRange } from '@/lib/dates'
import { UNITS, type RangeOption } from '@/lib/constants'
import type { Exercise } from '@/types/exercise'
import type { WorkoutLog } from '@/types/workoutLog'

type Metric = 'maxWeight' | 'volume'

export function ExerciseProgressChart({
  exercises,
  workoutLogs,
}: {
  exercises: Exercise[]
  workoutLogs: WorkoutLog[]
}) {
  const [exerciseId, setExerciseId] = useState('')
  const [metric, setMetric] = useState<Metric>('maxWeight')
  const [range, setRange] = useState<RangeOption>('30d')

  const data = useMemo(() => {
    return workoutLogs
      .filter((log) => log.exerciseId === exerciseId && isWithinRange(log.date, range))
      .slice()
      .sort((a, b) => compareDateKeys(a.date, b.date))
      .map((log) => ({
        date: log.date,
        label: formatShortDate(log.date),
        value:
          metric === 'maxWeight'
            ? computeMaxWeight(log.sets)
            : computeVolume(log.sets),
      }))
  }, [workoutLogs, exerciseId, metric, range])

  const unit = metric === 'maxWeight' ? UNITS.weight : `reps·${UNITS.weight}`

  const controls = (
    <div className="flex flex-col gap-2">
      <Select value={exerciseId} onValueChange={setExerciseId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose an exercise" />
        </SelectTrigger>
        <SelectContent>
          {exercises.map((exercise) => (
            <SelectItem key={exercise.id} value={exercise.id}>
              {exercise.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center justify-between gap-2">
        <Tabs value={metric} onValueChange={(value) => setMetric(value as Metric)}>
          <TabsList>
            <TabsTrigger value="maxWeight">Max weight</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>
        </Tabs>
        <RangeSelector value={range} onChange={setRange} />
      </div>
    </div>
  )

  return (
    <ChartCard
      title="Progress"
      isEmpty={!exerciseId || data.length === 0}
      emptyMessage={
        exerciseId
          ? 'No logged sets for this exercise yet.'
          : 'Pick an exercise to see your progress.'
      }
      controls={controls}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            vertical={false}
            stroke={CHART_COLORS.gridline}
          />
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
                formatter={(value) => `${value} ${unit}`}
              />
            )}
          />
          <Line
            type="monotone"
            dataKey="value"
            name={metric === 'maxWeight' ? 'Max weight' : 'Volume'}
            stroke={CHART_COLORS.accent}
            strokeWidth={2}
            dot={{ r: 4, fill: CHART_COLORS.accent }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
