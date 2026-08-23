import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function AddExerciseDialog({
  addExercise,
  triggerLabel = 'Add workout',
  onCreated,
}: {
  addExercise: (name: string, category: string | null) => Promise<string>
  triggerLabel?: string
  onCreated?: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    setSaving(true)
    try {
      const id = await addExercise(trimmedName, category.trim() || null)
      toast.success(`Added "${trimmedName}"`)
      onCreated?.(id)
      setName('')
      setCategory('')
      setOpen(false)
    } catch (error) {
      console.error(error)
      toast.error('Could not add exercise')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Plus className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add workout</DialogTitle>
          <DialogDescription>
            Create an exercise you can log sets against or add to your weekly
            plan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exerciseName">Name</Label>
            <Input
              id="exerciseName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Bench Press"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exerciseCategory">Category (optional)</Label>
            <Input
              id="exerciseCategory"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="e.g. Chest"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
