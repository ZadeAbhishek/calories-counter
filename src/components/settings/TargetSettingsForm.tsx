import { useEffect, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTargets } from '@/hooks/useTargets'
import { UNITS } from '@/lib/constants'

export function TargetSettingsForm() {
  const { targets, loading, updateTargets } = useTargets()
  const [weight, setWeight] = useState('')
  const [protein, setProtein] = useState('')
  const [calories, setCalories] = useState('')
  const [saving, setSaving] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (loading || initialized.current) return
    initialized.current = true
    setWeight(targets?.targetWeight?.toString() ?? '')
    setProtein(targets?.targetProtein?.toString() ?? '')
    setCalories(targets?.targetCalories?.toString() ?? '')
  }, [loading, targets])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      await updateTargets({
        targetWeight: weight === '' ? null : Number(weight),
        targetProtein: protein === '' ? null : Number(protein),
        targetCalories: calories === '' ? null : Number(calories),
      })
      toast.success('Goals saved')
    } catch (error) {
      console.error(error)
      toast.error('Could not save goals')
    } finally {
      setSaving(false)
    }
  }

  async function handleClear() {
    setSaving(true)
    try {
      await updateTargets({
        targetWeight: null,
        targetProtein: null,
        targetCalories: null,
      })
      setWeight('')
      setProtein('')
      setCalories('')
      toast.success('Goals cleared')
    } catch (error) {
      console.error(error)
      toast.error('Could not clear goals')
    } finally {
      setSaving(false)
    }
  }

  const hasAnyTarget = weight !== '' || protein !== '' || calories !== ''

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goals</CardTitle>
        <CardDescription>Used for your Food tab charts.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="targetWeight">
              Target weight ({UNITS.weight})
            </Label>
            <Input
              id="targetWeight"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="e.g. 75"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="targetProtein">
              Target protein ({UNITS.protein}/day)
            </Label>
            <Input
              id="targetProtein"
              type="number"
              inputMode="decimal"
              step="1"
              value={protein}
              onChange={(event) => setProtein(event.target.value)}
              placeholder="e.g. 150"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="targetCalories">
              Target calories ({UNITS.calories}/day)
            </Label>
            <Input
              id="targetCalories"
              type="number"
              inputMode="decimal"
              step="1"
              value={calories}
              onChange={(event) => setCalories(event.target.value)}
              placeholder="e.g. 2200"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving || loading} className="flex-1">
              {saving ? 'Saving...' : 'Save goals'}
            </Button>
            {hasAnyTarget && (
              <Button
                type="button"
                variant="outline"
                disabled={saving || loading}
                onClick={handleClear}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
