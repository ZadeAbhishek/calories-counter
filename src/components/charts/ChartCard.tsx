import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function ChartCard({
  title,
  subtitle,
  isEmpty,
  emptyMessage = 'Log a few days to see your trend.',
  controls,
  children,
}: {
  title: string
  subtitle?: ReactNode
  isEmpty: boolean
  emptyMessage?: string
  /** Always rendered, even in the empty state — e.g. an exercise picker
   * that's the way OUT of "no exercise selected yet". */
  controls?: ReactNode
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-[240px] items-center justify-center text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="h-[240px] w-full">{children}</div>
        )}
        {controls && <div className="mt-3 border-t pt-3">{controls}</div>}
      </CardContent>
    </Card>
  )
}
