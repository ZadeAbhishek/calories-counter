import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RANGE_OPTIONS, type RangeOption } from '@/lib/constants'

export function RangeSelector({
  value,
  onChange,
}: {
  value: RangeOption
  onChange: (value: RangeOption) => void
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as RangeOption)}>
      <SelectTrigger size="sm" className="w-[130px]" aria-label="Date range">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RANGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
